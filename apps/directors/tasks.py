from celery import shared_task
from apps.directors.models import CompanyDirector
from apps.individuals.models import Individuals
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

@shared_task
def sync_director_to_individual_task(director_id):
    try:
        director = CompanyDirector.objects.get(id=director_id)
        if not director.national_id:
            logger.warning(f"Director {director_id} has no national_id, skipping individual sync.")
            return

        individual = Individuals.objects.filter(national_id=director.national_id).first()

        mobile_number = director.mobile_phone_number or ""
        email = director.email
        gender = director.gender or ""
        
        if individual:
            new_address = director.address_latest
            if new_address and new_address.strip():
                if not individual.residential_address:
                    individual.residential_address = new_address
                elif new_address.strip().lower() not in (individual.residential_address or "").lower():
                    individual.residential_address = f"{individual.residential_address} | {new_address}"
            
            if director.full_name:
                individual.full_name = director.full_name
            if director.dob:
                individual.date_of_birth = director.dob
            if gender:
                individual.gender = gender
            if mobile_number:
                individual.mobile_number = mobile_number
            if email:
                individual.email = email
            
            try:
                individual.save()
                logger.info(f"Updated individual {individual.id} for director {director_id}")
            except IntegrityError as e:
                logger.error(f"IntegrityError updating individual for director {director_id}: {str(e)}")
        else:
            try:
                individual = Individuals.objects.create(
                    national_id=director.national_id,
                    full_name=director.full_name,
                    date_of_birth=director.dob,
                    gender=gender,
                    mobile_number=mobile_number,
                    email=email,
                    residential_address=director.address_latest
                )
                logger.info(f"Created individual {individual.id} for director {director_id}")
            except IntegrityError as e:
                logger.error(f"IntegrityError creating individual for director {director_id}: {str(e)}")

    except CompanyDirector.DoesNotExist:
        logger.error(f"CompanyDirector with id {director_id} does not exist.")
    except Exception as e:
        logger.error(f"Error syncing director to individual: {str(e)}")

#python -m celery -A core worker -l info --pool=solo
