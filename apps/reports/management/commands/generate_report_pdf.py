from django.core.management.base import BaseCommand
from apps.reports.models import Report
from apps.reports.GenerateReport import FincheckReportPDF


class Command(BaseCommand):
    help = "Generate PDF report for a given report ID"

    def add_arguments(self, parser):
        parser.add_argument("report_id", type=int)

    def handle(self, *args, **kwargs):
        report_id = kwargs["report_id"]
        report = Report.objects.filter(pk=report_id).first()

        if not report:
            self.stdout.write(self.style.ERROR("Report not found"))
            return

        if not report.snapshot:
            from apps.reports.serializers import ReportSerializer
            report.snapshot = ReportSerializer(report).data
            report.save(update_fields=["snapshot"])

        gen = FincheckReportPDF(report)
        result = gen.save_to_report(report)
        report.save(update_fields=["report_pdf"])

        self.stdout.write(self.style.SUCCESS(f"PDF generated: {result}"))
