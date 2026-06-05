from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.companies.urls")),
    path("api/", include("apps.individuals.urls")),
    path("api/", include("apps.credit_records.urls")),
    path("api/", include("apps.directors.urls")),
    path("api/", include("apps.shareholding.urls")),
    path("api/", include("apps.reports.urls")),
    path("api/", include("apps.common.urls"))
]