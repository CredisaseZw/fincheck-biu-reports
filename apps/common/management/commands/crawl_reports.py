import logging
import os
import pymupdf4llm
from django.conf import settings
from django.core.management import BaseCommand
from .report_types import ClientFile, ReportType, detect_report_type
from .llma_logic import EntityDataExtraction, ExtractionError

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
        return pymupdf4llm.to_markdown(file)

    def crawl_files(self, report_type_filter:str):
        if not os.path.isdir(self.REPORTS_PARENT_FOLDER):
            logger.error("Reports folder does not exist: %s", self.REPORTS_PARENT_FOLDER)
            return

        years = sorted(os.listdir(self.REPORTS_PARENT_FOLDER))
        index = len(years) - 1
        while index >= 0:  # years, newest first
            year_path = os.path.join(self.REPORTS_PARENT_FOLDER, years[index])
            if not os.path.isdir(year_path):
                index -= 1
                continue

            months = sorted(os.listdir(year_path))
            _month_index = len(months) - 1
            while _month_index >= 0:  # months, newest first
                month_path = os.path.join(year_path, months[_month_index])
                if not os.path.isdir(month_path):
                    _month_index -= 1
                    continue

                for client in os.listdir(month_path):
                    client_path = os.path.join(month_path, client)
                    if not os.path.isdir(client_path):
                        continue
                    for file in os.listdir(client_path):
                        if file.lower().endswith(".pdf"):
                            _is_individual_name= "individual" in file.lower()
                            if report_type_filter == "individual" and not _is_individual_name:
                                continue
                            if report_type_filter == "company" and _is_individual_name:
                                continue

                            self.clients.append({
                                "file_name": file,
                                "path": os.path.join(client_path, file),
                                "month": months[_month_index],
                                "year": years[index],
                                "client": client,
                            })
                _month_index -= 1
            index -= 1

        logger.info("Found %d PDF report(s) to process", len(self.clients))

    def process_client_file(
            self, 
            client_file: ClientFile, *,
            dry_run: bool,
            report_type_filter:str) -> bool:
        source = client_file["file_name"]

        try:
            markdown = self.make_markdown(client_file["path"])
            report_type = detect_report_type(markdown)
            if report_type_filter != "all":
                if report_type_filter == "individual" and report_type != ReportType.INDIVIDUAL:
                    logger.exception("Failed to convert %s, %s is required", source, report_type_filter)
                    return False
                if report_type_filter == "company" and report_type != ReportType.COMPANY:
                    logger.exception("Failed to convert %s, %s is required", source, report_type_filter)
                    return False
                    
        except Exception:
            logger.exception("Failed to convert %s to markdown", source)
            return False

        try:
            print(report_type)
            parsed = self.entity_extractor.extract_markdown(
                markdown, 
                source=source,
                report_type=report_type
            )
        except ExtractionError:
            return False

        if dry_run:
            self.stdout.write(f"[DRY RUN] {source} -> {report_type.value}")
            self.stdout.write(str(parsed))
            return True

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
        print(targets)

        for client_file in targets:
            self.stdout.write(f"Processing {client_file['file_name']}...")
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