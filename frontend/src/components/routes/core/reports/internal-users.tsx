import ColumnsContainer from "@/components/general/ColumnsContainer";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { Button } from "@/components/ui/button";
import CreateUserDialog from "@/dialogues/CreateUserDialog";

function InternalUsers() {
  return (
    <div className="flex flex-col gap-5">
      <ColumnsContainer>
          <SectionHeader
              label="Internal User"
          />
          <div className="flex justify-end">
            <CreateUserDialog/>
          </div>
      </ColumnsContainer>
      <div className="card">
        <ColumnsContainer>
          <SearchBox/>
          <div className="flex w-full md:justify-end">
            <Button variant={"outline"}>Filters</Button>
          </div>

        </ColumnsContainer>
      </div>
    </div>
  )
}

export default InternalUsers