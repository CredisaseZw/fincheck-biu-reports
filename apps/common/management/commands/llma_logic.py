from django.conf import settings
import logging
from groq import BadRequestError, APIError
from langchain_core.exceptions import OutputParserException
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from .report_types import (
    ReportType,
    SYSTEM_PROMPT,
    detect_report_type,
    CompanyReportSchema,
    IndividualReportSchema,
)

logger = logging.getLogger(__name__)

class ExtractionError(Exception):
    """Raised when a report's markdown could not be turned into a validated
    schema instance, for any reason (Groq error, schema mismatch, etc.)."""

class EntityDataExtraction:
    def __init__(self, model: str = "openai/gpt-oss-20b"):
        self.llm = ChatGroq(
            model=model,
            temperature=0,
            api_key=settings.GROQ_API_KEY,
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{content}"),
        ])
        self._chains = {}

    def _get_chain(self, report_type: ReportType):
        if report_type not in self._chains:
            schema = (
                IndividualReportSchema
                if report_type == ReportType.INDIVIDUAL
                else CompanyReportSchema
            )
            structured_llm = self.llm.with_structured_output(
                schema,
                method="json_schema",
            )
            self._chains[report_type] = self.prompt | structured_llm
        return self._chains[report_type]

    def extract_markdown(self, 
            markdown: str, *, 
            source: str = "<unknown>",
            report_type: ReportType
        ):
        chain = self._get_chain(report_type)
        try:
            parsed = chain.invoke({"content": markdown})
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