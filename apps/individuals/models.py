import re
from django.utils.translation import gettext_lazy as _
from django.db import models
from django.db.models import Max
from django.db import transaction
from apps.common.common_models import BaseModel, BaseModelWithClient
from django.contrib.contenttypes.fields import GenericRelation, GenericForeignKey
