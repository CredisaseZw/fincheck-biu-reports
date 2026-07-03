from django.core.management.base import BaseCommand
from django.db import transaction
from apps.companies.models import Company, CompanyOverview, CompanyStructure, CompanyOperations
from apps.individuals.models import Individuals, EmploymentInformation, NextOfKin


COMPANIES = [
    {
        "registration_number": "123456789",
        "registered_name": "Sunrise Foods Zimbabwe",
        "address_registered": "12 Julius Nyerere Way, Level 2, Zimbabwe, Harare, Harare Province, 00000",
        "address_operations": "45 Coventry Road, Unit 5, Zimbabwe, Harare, Harare Province, 00001",
        "refer_type": "biu",
        "trading_name": "Sunrise Foods",
        "email": "info@sunrisefoods.co.zw",
        "telephone_number": "+263242765432",
        "mobile_number": "+263772345678",
        "website": "https://sunrisefoods.co.zw",
        "is_company_verified": True,
        "is_active": True,
        "is_address_registered_verified": True,
        "overview": {
            "trading_status": "active",
            "date_of_registration": "2012-03-10",
            "legal_form": "llc",
            "condition": "good",
            "trend": "improving",
            "number_of_employees": 120,
            "last_financial_result": "450000.00",
            "net_asset_value": "1200000.00",
            "authorized_share_capital": "2000000.00",
            "issued_share_capital": "1500000.00",
        },
        "structure": {
            "holding_company": "Sunrise Holdings Ltd",
            "subsidiaries": "Sunrise Milling, Sunrise Logistics",
            "associated_companies": "Fresh Harvest Zambia",
            "divisions": "Production, Distribution, Sales",
            "branches": "Bulawayo, Mutare, Gweru",
        },
        "operations": {
            "industry": "Food Processing",
            "target_markets": "Retailers, Wholesalers",
            "operations_territories": "Zimbabwe, Zambia",
            "property_ownership": "Owned factory, leased warehouses",
            "operational_areas": "Harare, Bulawayo",
        },
    },
    {
        "registration_number": "123459",
        "registered_name": "TechNova Solutions Zimbabwe",
        "address_registered": "88 Samora Machel Avenue, Suite 10, Zimbabwe, Harare, Harare Province, 00002",
        "address_operations": "5 Borrowdale Road, Office 4, Zimbabwe, Harare, Harare Province, 00003",
        "refer_type": "fp3",
        "trading_name": "TechNova",
        "email": "contact@technova.co.zw",
        "telephone_number": "+263242334455",
        "mobile_number": "+263774567890",
        "website": "https://technova.co.zw",
        "is_company_verified": True,
        "is_active": True,
        "is_address_registered_verified": True,
        "overview": {
            "trading_status": "active",
            "date_of_registration": "2018-08-21",
            "legal_form": "plc",
            "condition": "good",
            "trend": "improving",
            "number_of_employees": 75,
            "last_financial_result": "850000.00",
            "net_asset_value": "2200000.00",
            "authorized_share_capital": "3000000.00",
            "issued_share_capital": "2500000.00",
        },
        "structure": {
            "holding_company": "TechNova Africa",
            "subsidiaries": "TechNova Cloud Services",
            "associated_companies": "Digital Edge Botswana",
            "divisions": "Software, Infrastructure, Support",
            "branches": "Bulawayo",
        },
        "operations": {
            "industry": "Information Technology",
            "target_markets": "SMEs, Government",
            "operations_territories": "Zimbabwe, Botswana",
            "property_ownership": "Leased offices",
            "operational_areas": "Harare, Bulawayo",
        },
    },
    {
        "registration_number": "456789",
        "registered_name": "GreenFields Agriculture Pvt Ltd",
        "address_registered": "22 Enterprise Road, Farm Block B, Zimbabwe, Harare, Harare Province, 00004",
        "address_operations": "Farm 18, Mazowe, Zimbabwe, Mazowe, Mashonaland Central, 00005",
        "refer_type": "rentsafe",
        "trading_name": "GreenFields",
        "email": "admin@greenfields.co.zw",
        "telephone_number": "+263242887766",
        "mobile_number": "+263773456789",
        "website": "https://greenfields.co.zw",
        "is_company_verified": True,
        "is_active": True,
        "is_address_registered_verified": True,
        "overview": {
            "trading_status": "active",
            "date_of_registration": "2009-01-14",
            "legal_form": "partnership",
            "condition": "good",
            "trend": "stable",
            "number_of_employees": 230,
            "last_financial_result": "650000.00",
            "net_asset_value": "3500000.00",
            "authorized_share_capital": "5000000.00",
            "issued_share_capital": "3200000.00",
        },
        "structure": {
            "holding_company": "GreenFields Group",
            "subsidiaries": "GreenFields Exports",
            "associated_companies": "Agri Supplies Zimbabwe",
            "divisions": "Crop Farming, Livestock",
            "branches": "Chegutu, Chinhoyi",
        },
        "operations": {
            "industry": "Agriculture",
            "target_markets": "Exporters, Food Manufacturers",
            "operations_territories": "Zimbabwe, Mozambique",
            "property_ownership": "Owned farms and storage facilities",
            "operational_areas": "Mashonaland West, Mashonaland Central",
        },
    },
    {
        "registration_number": "12345679",
        "registered_name": "UrbanBuild Construction Ltd",
        "address_registered": "14 Nelson Mandela Avenue, Floor 3, Zimbabwe, Harare, Harare Province, 00006",
        "address_operations": "67 Airport Road, Plot 9, Zimbabwe, Harare, Harare Province, 00007",
        "refer_type": "biu",
        "trading_name": "UrbanBuild",
        "email": "projects@urbanbuild.co.zw",
        "telephone_number": "+263242998877",
        "mobile_number": "+263775678901",
        "website": "https://urbanbuild.co.zw",
        "is_company_verified": True,
        "is_active": True,
        "is_address_registered_verified": True,
        "overview": {
            "trading_status": "active",
            "date_of_registration": "2015-11-05",
            "legal_form": "llc",
            "condition": "fair",
            "trend": "stable",
            "number_of_employees": 180,
            "last_financial_result": "1100000.00",
            "net_asset_value": "4700000.00",
            "authorized_share_capital": "6000000.00",
            "issued_share_capital": "4200000.00",
        },
        "structure": {
            "holding_company": "UrbanBuild Holdings",
            "subsidiaries": "UrbanBuild Civil Works",
            "associated_companies": "Mega Projects Africa",
            "divisions": "Commercial, Residential, Civil",
            "branches": "Bulawayo, Mutare",
        },
        "operations": {
            "industry": "Construction",
            "target_markets": "Government, Corporates",
            "operations_territories": "Zimbabwe",
            "property_ownership": "Owned headquarters",
            "operational_areas": "Harare, Bulawayo, Mutare",
        },
    },
    {   
        "registration_number": "123/789",
        "registered_name": "BlueWave Transport Services",
        "address_registered": "30 Lobengula Street, Warehouse 2, Zimbabwe, Bulawayo, Bulawayo Province, 00008",
        "address_operations": "Industrial Site, Belmont, Zimbabwe, Bulawayo, Bulawayo Province, 00009",
        "refer_type": "fp3",
        "trading_name": "BlueWave Transport",
        "email": "operations@bluewave.co.zw",
        "telephone_number": "+263292123456",
        "mobile_number": "+263778901234",
        "website": "https://bluewave.co.zw",
        "is_company_verified": True,
        "is_active": True,
        "is_address_registered_verified": True,
        "overview": {
            "trading_status": "active",
            "date_of_registration": "2016-05-18",
            "legal_form": "plc",
            "condition": "good",
            "trend": "improving",
            "number_of_employees": 95,
            "last_financial_result": "720000.00",
            "net_asset_value": "1800000.00",
            "authorized_share_capital": "2500000.00",
            "issued_share_capital": "2000000.00",
        },
        "structure": {
            "holding_company": "BlueWave Logistics Group",
            "subsidiaries": "BlueWave Freight",
            "associated_companies": "Cargo Connect Zambia",
            "divisions": "Freight, Courier, Warehousing",
            "branches": "Harare, Victoria Falls",
        },
        "operations": {
            "industry": "Transportation & Logistics",
            "target_markets": "Manufacturers, Retailers",
            "operations_territories": "Zimbabwe, Zambia, Botswana",
            "property_ownership": "Owned depot, leased warehouses",
            "operational_areas": "Bulawayo, Harare, Victoria Falls",
        },
    },
]

INDIVIDUALS = [
    {
        "full_name": "Tendai Moyo",
        "national_id": "63-112233-A-12",
        "date_of_birth": "1988-04-21",
        "gender": "Male",
        "marital_status": "married",
        "nationality": "Zimbabwean",
        "residential_address": "45 Borrowdale Road, Borrowdale, Zimbabwe, Harare, Harare Province, 00263",
        "refer_type": "biu",
        "mobile_number": "0772123456",
        "email": "tendai.moyo@example.com",
        "employment_information": {
            "employer": "CBZ Holdings",
            "position": "Branch Manager",
            "employment_status": "employed",
            "years_employed": 8,
            "monthly_income": "3200.00",
            "previous_employer": "Steward Bank",
        },
        "next_of_kin": {
            "name": "Rudo Moyo",
            "relationship": "Spouse",
            "contact_number": "0772987654",
        },
    },
    {
        "full_name": "Nyasha Chikore",
        "national_id": "08-445566-B-45",
        "date_of_birth": "1994-09-12",
        "gender": "Female",
        "marital_status": "single",
        "nationality": "Zimbabwean",
        "residential_address": "17 Fairbridge Park, Block 7, Zimbabwe, Mutare, Manicaland, 40000",
        "refer_type": "fp3",
        "mobile_number": "0773456789",
        "email": "nyasha.chikore@example.com",
        "employment_information": {
            "employer": "Mutare City Council",
            "position": "Accountant",
            "employment_status": "employed",
            "years_employed": 4,
            "monthly_income": "1800.00",
            "previous_employer": "Old Mutual Zimbabwe",
        },
        "next_of_kin": {
            "name": "Tatenda Chikore",
            "relationship": "Brother",
            "contact_number": "0773123456",
        },
    },
    {
        "full_name": "Blessing Ncube",
        "national_id": "12-778899-C-78",
        "date_of_birth": "1985-11-03",
        "gender": "Male",
        "marital_status": "divorced",
        "nationality": "Zimbabwean",
        "residential_address": "34 Hillside Road, Hillside, Zimbabwe, Bulawayo, Bulawayo Province, 00263",
        "refer_type": "rentsafe",
        "mobile_number": "0781234567",
        "email": "blessing.ncube@example.com",
        "employment_information": {
            "employer": "National Railways of Zimbabwe",
            "position": "Operations Supervisor",
            "employment_status": "employed",
            "years_employed": 12,
            "monthly_income": "2400.00",
            "previous_employer": "ZUPCO",
        },
        "next_of_kin": {
            "name": "Sipho Ncube",
            "relationship": "Sister",
            "contact_number": "0781765432",
        },
    },
    {
        "full_name": "Chipo Dube",
        "national_id": "22-334455-D-90",
        "date_of_birth": "1997-06-28",
        "gender": "Female",
        "marital_status": "single",
        "nationality": "Zimbabwean",
        "residential_address": "9 Ascot Extension, Block 5, Zimbabwe, Gweru, Midlands, 5000",
        "refer_type": "biu",
        "mobile_number": "0774567890",
        "email": "chipo.dube@example.com",
        "employment_information": {
            "employer": "Delta Corporation",
            "position": "Sales Representative",
            "employment_status": "employed",
            "years_employed": 3,
            "monthly_income": "1400.00",
            "previous_employer": "OK Zimbabwe",
        },
        "next_of_kin": {
            "name": "Patience Dube",
            "relationship": "Mother",
            "contact_number": "0774987654",
        },
    },
    {
        "full_name": "Farai Sibanda",
        "national_id": "15-556677-E-34",
        "date_of_birth": "1979-02-14",
        "gender": "Male",
        "marital_status": "widowed",
        "nationality": "Zimbabwean",
        "residential_address": "21 Victoria Falls Road, Plot 12, Zimbabwe, Hwange, Matabeleland North, 9000",
        "refer_type": "fp3",
        "mobile_number": "0782345678",
        "email": "farai.sibanda@example.com",
        "employment_information": {
            "employer": "Hwange Colliery Company",
            "position": "Mining Engineer",
            "employment_status": "employed",
            "years_employed": 15,
            "monthly_income": "4200.00",
            "previous_employer": "Mimosa Mining Company",
        },
        "next_of_kin": {
            "name": "Tariro Sibanda",
            "relationship": "Daughter",
            "contact_number": "0782987654",
        },
    },
]


class Command(BaseCommand):
    help = "Seed companies and individuals with sample data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--mode",
            type=str,
            choices=["companies", "individuals", "all"],
            default="all",
            help="What to seed: companies, individuals, or all (default: all)",
        )

    def _seed_companies(self):
        created = 0
        skipped = 0

        for data in COMPANIES:
            overview_data = data.pop("overview", None)
            structure_data = data.pop("structure", None)
            operations_data = data.pop("operations", None)

            if Company.objects.filter(registered_name=data["registered_name"]).exists():
                self.stdout.write(
                    self.style.WARNING(f"  {data['registered_name']} already exists.")
                )
                skipped += 1
                continue

            with transaction.atomic():
                company = Company.objects.create(**data)

                if overview_data:
                    CompanyOverview.objects.create(company=company, **overview_data)
                if structure_data:
                    CompanyStructure.objects.create(company=company, **structure_data)
                if operations_data:
                    CompanyOperations.objects.create(company=company, **operations_data)

            self.stdout.write(
                self.style.SUCCESS(f"  {company.registered_name} created.")
            )
            created += 1

        return created, skipped

    def _seed_individuals(self):
        created = 0
        skipped = 0

        for data in INDIVIDUALS:
            employment_data = data.pop("employment_information", None)
            next_of_kin_data = data.pop("next_of_kin", None)

            if Individuals.objects.filter(national_id=data["national_id"]).exists():
                self.stdout.write(
                    self.style.WARNING(f"  {data['full_name']} already exists.")
                )
                skipped += 1
                continue

            with transaction.atomic():
                individual = Individuals.objects.create(**data)

                if employment_data:
                    EmploymentInformation.objects.create(
                        individual=individual, **employment_data
                    )
                if next_of_kin_data:
                    NextOfKin.objects.create(
                        individual=individual, **next_of_kin_data
                    )

            self.stdout.write(
                self.style.SUCCESS(f"   {individual.full_name} created.")
            )
            created += 1

        return created, skipped

    def handle(self, *args, **options):
        mode = options["mode"]

        total_created = 0
        total_skipped = 0

        if mode in ("companies", "all"):
            self.stdout.write(self.style.HTTP_INFO("\n Seeding Companies..."))
            created, skipped = self._seed_companies()
            total_created += created
            total_skipped += skipped

        if mode in ("individuals", "all"):
            self.stdout.write(self.style.HTTP_INFO("\n Seeding Individuals..."))
            created, skipped = self._seed_individuals()
            total_created += created
            total_skipped += skipped

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Done! Created: {total_created} | Skipped: {total_skipped}"
            )
        )
