from django.test import TestCase
from apps.reports.models import Report
from apps.reports.GenerateReport import FincheckReportPDF
from apps.reports.serializers import ReportSerializer


class GenTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.report = Report.objects.filter(pk=6).first()
        assert cls.report is not None, "Test report with pk=6 does not exist"

    def test_pdf_generation(self):
        if not self.report.snapshot:
            self.report.snapshot = ReportSerializer(self.report).data

        gen = FincheckReportPDF(self.report)
        result = gen.generate_bytes()

        self.assertIsNotNone(result)
        self.assertTrue(result[:4] == b"%PDF")
