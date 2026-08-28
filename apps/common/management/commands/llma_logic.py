from django.conf import settings
import logging
from groq import BadRequestError, APIError
from openai import LengthFinishReasonError
from pydantic import ValidationError
from langchain_core.exceptions import OutputParserException
from langchain_core.prompts import ChatPromptTemplate
from langchain_together import ChatTogether
#from langchain_groq import ChatGroq
from apps.common.report_types import (
    ReportType,
    SYSTEM_PROMPT,
    detect_report_type,
    CompanyReportSchema,
    IndividualReportSchema,
)

logger = logging.getLogger(__name__)

class ExtractionError(Exception):
    """Raised when a report's markdown could not be turned into a validated
    schema instance, for any reason (LLMA error, schema mismatch, etc.)."""

class EntityDataExtraction:
    def __init__(self, model: str = "openai/gpt-oss-120b", max_tokens: int = 80384):
        self.max_tokens = max_tokens
        self.llm = ChatTogether(
            model=model,
            temperature=0,
            api_key=settings.TOGETHER_API_KEY,
            max_tokens=max_tokens,
        )
        # self.llm = ChatGroq(
        #     model=model,
        #     temperature=0,
        #     api_key=settings.GROQ_API_KEY,
        # )

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{content}"),
        ])
        self._chains = {}

    def _get_chain(self, report_type: ReportType, max_tokens: int | None = None):
        cache_key = (report_type, max_tokens or self.max_tokens)
        if cache_key not in self._chains:
            schema = (
                IndividualReportSchema
                if report_type == ReportType.INDIVIDUAL
                else CompanyReportSchema
            )
            llm = self.llm
            if max_tokens and max_tokens != self.max_tokens:
                llm = self.llm.bind(max_tokens=max_tokens)
            structured_llm = llm.with_structured_output(
                schema,
                method="json_schema",
            )
            self._chains[cache_key] = self.prompt | structured_llm
        return self._chains[cache_key]

    def extract_markdown(
        self,
        markdown: str, *,
        source: str = "<unknown>",
        report_type: ReportType,
        retry_max_tokens: int = 90384,
    ):
        chain = self._get_chain(report_type)
        try:
            parsed = chain.invoke({"content": markdown})
        except (LengthFinishReasonError, ValidationError) as exc:
            logger.warning(
                "Truncated/invalid JSON for %s (%s), retrying with max_tokens=%d: %s",
                source, report_type.value, retry_max_tokens, exc,
            )
            try:
                retry_chain = self._get_chain(report_type, max_tokens=retry_max_tokens)
                parsed = retry_chain.invoke({"content": markdown})
            except (BadRequestError, APIError) as retry_exc:
                logger.error(
                    "Groq/Together API error on retry for %s (%s): %s",
                    source, report_type.value, retry_exc,
                )
                raise ExtractionError(f"API error on retry for {source}") from retry_exc
            except (LengthFinishReasonError, ValidationError, OutputParserException) as retry_exc:
                logger.error(
                    "Still failed after retry for %s (%s): %s",
                    source, report_type.value, retry_exc,
                )
                raise ExtractionError(
                    f"Response too long / invalid JSON even after retry on {source}"
                ) from retry_exc
        except (BadRequestError, APIError) as exc:
            logger.error(
                "Groq API error extracting %s (%s): %s",
                source, report_type.value, exc,
            )
            raise ExtractionError(f"Groq API error on {source}") from exc
        except OutputParserException as exc:
            logger.error(
                "Schema validation failed for %s (%s): %s",
                source, report_type.value, exc,
            )
            raise ExtractionError(f"Schema validation failed on {source}") from exc
        except Exception as exc:
            logger.exception(
                "Unexpected error extracting %s (%s)", source, report_type.value
            )
            raise ExtractionError(f"Unexpected error on {source}") from exc

        logger.info("Extracted %s as %s", source, report_type.value)
        return parsed