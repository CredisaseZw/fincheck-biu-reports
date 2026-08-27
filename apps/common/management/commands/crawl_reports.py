import logging
import os
import pymupdf4llm
import requests
from django.conf import settings
from django.core.management import BaseCommand
from apps.common.report_types import ClientFile, ReportType, detect_report_type
from .llma_logic import EntityDataExtraction, ExtractionError
import random
import time

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Crawl the REPORTS folder, extract each PDF via LLM, and save to the DB."
    REPORTS_PARENT_FOLDER = settings.BASE_DIR / "REPORTS"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Only process the first N files (dev/testing).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Extract and print results without saving to the DB.",
        )

        parser.add_argument(
            "--type",
            dest="report_type_filter",
            choices=["individual", "company", "all"],
            default="all",
            help="Only crawl this report type, based on filename (default: all).", )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.clients: list[ClientFile] = []
        self.entity_extractor = EntityDataExtraction()

    @staticmethod
    def make_markdown(file):
        try:
            markdown = pymupdf4llm.to_markdown(file)
            return markdown
        except Exception as e:
            print(f"Error making markdown: {e}")
            if os.path.exists(file):
                os.remove(file)
            return None

    @staticmethod
    def _sync_parsed_data(report_type: ReportType, parsed):
        endpoint = "http://127.0.0.1:5175" 
        #endpoint = "https://biu.credi-safe.com"    
        headers = {"Content-Type": "application/json"}
        body = {
            "report_type": report_type.value,
            "payload": parsed.model_dump(mode="json"),
        }

        try:
            response = requests.post(
                f"{endpoint}/api/ingest/",
                headers=headers,
                json=body,
                timeout=30,
            )
            response.raise_for_status()
        except requests.RequestException as e:
            logger.exception("Failed to sync %s to %s", report_type.value, endpoint)
            if hasattr(e, 'response') and e.response is not None:
                logger.error("Response body: %s", e.response.text)
            raise


        return response.json()

    def crawl_subfolder(self, folder_path: str, report_type_filter: str):
        entries = os.listdir(folder_path)
        for entry in entries:
            full_path = os.path.join(folder_path, entry)
            if os.path.isdir(full_path):
                self.crawl_subfolder(full_path, report_type_filter)
            elif os.path.isfile(full_path) and entry.lower().endswith(".pdf"):
                is_individual_name = "individual" in full_path.lower()
                if report_type_filter == ReportType.INDIVIDUAL.value and not is_individual_name:
                    continue
                if report_type_filter == ReportType.COMPANY.value and is_individual_name:
                    continue
                self.clients.append({
                    "file_name": entry,
                    "path": full_path,
                })

    def crawl_files(self, report_type_filter:str):
        if not os.path.isdir(self.REPORTS_PARENT_FOLDER):
            logger.error("Reports folder does not exist: %s", self.REPORTS_PARENT_FOLDER)
            return

        years = os.listdir(self.REPORTS_PARENT_FOLDER)
        for year in reversed(years):
            self.crawl_subfolder(
                os.path.join(self.REPORTS_PARENT_FOLDER, year), 
                report_type_filter
            )

    def process_client_file(
            self,
            client_file: ClientFile, *,
            dry_run: bool,
            report_type_filter: str) -> bool:
        source = client_file["file_name"]
        file_path  = client_file["path"]
        try:
            if os.path.exists(file_path):
                markdown = self.make_markdown(file_path)
                if not markdown:
                    return False
                
                report_type = detect_report_type(markdown)
                if report_type_filter != "all":
                    if report_type_filter == "individual" and report_type != ReportType.INDIVIDUAL:
                        logger.error("Skipping %s, %s is required", source, report_type_filter)
                        return False
                    if report_type_filter == "company" and report_type != ReportType.COMPANY:
                        logger.error("Skipping %s, %s is required", source, report_type_filter)
                        return False
            else:         
                logger.error("Skipping %s, %s does not exits", source, file_path)
                return False
        except Exception:
            logger.exception("Failed to convert %s to markdown", source)
            return False

        if dry_run:
            self.stdout.write(f"[DRY RUN] {source} -> {report_type.value} -> [{len(markdown)}]")
            self.stdout.write(markdown)
            return True

        parsed = None
        for attempt in range(4):
            try:
                parsed = self.entity_extractor.extract_markdown(
                    markdown,
                    source=source,
                    report_type=report_type,
                )
                break
            except ExtractionError as exc:
                is_rate_limited = "429" in str(exc.__cause__)
                if is_rate_limited and attempt < 3:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    logger.warning("Rate limited on %s, retrying in %.1fs", source, wait)
                    time.sleep(wait)
                    continue
                return False
        else:
            return False

        try:
            response = self._sync_parsed_data(report_type, parsed)
        except Exception as e:
            print(f"Some unforeseen error occurred: {e}")
            return False
        finally:
            time.sleep(1)

        if os.path.exists(file_path):
            os.remove(file_path) # in case it some fail we dont wanna waste tokens and all 
        return True
    
    def handle(self, *args, **options):
        limit = options.get("limit")
        dry_run = options.get("dry_run", False)
        report_type_filter = options.get("report_type_filter", "all")
        self.crawl_files(report_type_filter)

        targets = self.clients[:limit] if limit else self.clients
        if not targets:
            self.stdout.write(self.style.WARNING("No PDF reports found."))
            return

        succeeded = 0
        failed = 0

        for index, client_file in enumerate(targets):
            self.stdout.write(f"[{index + 1} / {len(targets)}] Processing {client_file['path']}...")
            ok = self.process_client_file(client_file, dry_run=dry_run, report_type_filter = report_type_filter)
            if ok:
                succeeded += 1
            else:
                failed += 1

        self.stdout.write(
            self.style.SUCCESS(f"Done. {succeeded} succeeded, {failed} failed.")
        )
        if failed:
            self.stdout.write(
                self.style.WARNING(
                    "Check the logs above / your configured log file for failure details."
                )
            )