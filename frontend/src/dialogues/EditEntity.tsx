import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { OptionButton } from '@/components/general/OptionButton';
import { Edit } from 'lucide-react';

import CustomDialogueHeader from '@/components/general/CustomDialogueHeader';
import { type EntityInformationProps } from '@/types/core';
import useEditEntity from '@/hooks/useEditEntity';
import CompanyDetails from '@/components/general/CompanyDetails';
import IndividualDetails from '@/components/general/IndividualDetails';
import CompanyOverview from '@/components/general/CompanyOverview';
import CompanyStructure from '@/components/general/CompanyStructure';
import CompanyOperations from '@/components/general/CompanyOperations';
import EmploymentInformation from '@/components/general/EmploymentInformation';
import NextOfKin from '@/components/general/NextOfKin';
import { Button } from '@/components/ui/button';
import { GeneralFormSkeletons } from '@/components/general/Skeletons';

const EditEntity = ({
  entity_type,
  id
}:EntityInformationProps) => {
  const {
    companyInformation,
    companyOperations,
    companyStructure,
    companyOverview,
    individualDetails,
    employmentInformation,
    nextOfKin,
    isLoading,
    isError
  } = useEditEntity({entity_type, id })

  return (
    <Dialog>
        <DialogTrigger>
            <OptionButton label="Edit" Icon={Edit}/>    
        </DialogTrigger>
        <DialogContent className="md:max-w-280 max-h-[90vh] overflow-y-scroll">
          <CustomDialogueHeader
            title={`Edit ${entity_type}.`}
          />
          {
            isLoading &&
            <GeneralFormSkeletons/>
          }
          {
            !isLoading &&
            !isError &&
            <div className="flex flex-col gap-3">
              {    
                entity_type === "company"
                ? <>
                    <CompanyDetails
                        subject_type= {entity_type}
                        company_overview = {companyInformation}
                        report_id={undefined}
                    />
                    <CompanyOverview
                        subject_type={entity_type}
                        subject_object_id={id}
                        report_id={undefined}
                        company_overview={companyOverview}
                    />
                    <CompanyStructure 
                        structure_data = {companyStructure}
                        report_id={undefined}
                        subject_object_id = {id}
                        subject_type = {entity_type}
                    />
                    <CompanyOperations 
                        operations_data = {companyOperations}
                        report_id={undefined}
                        subject_object_id = {id}
                        subject_type = {entity_type}
                    />
                </>
                : entity_type === "individual"
                    ? <>
                        <IndividualDetails 
                            report_id={undefined}
                            individual_details={individualDetails}
                        />
                        <EmploymentInformation 
                            employment_information = {employmentInformation}
                            report_id={undefined}
                            subject_type= {entity_type}
                        />
                        <NextOfKin 
                            subject_type={entity_type}
                            next_of_kin={nextOfKin}
                            report_id={undefined}
                        />
                    </>
                    : null
              }
            </div>
          }
          <DialogFooter>
            <DialogClose>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default EditEntity