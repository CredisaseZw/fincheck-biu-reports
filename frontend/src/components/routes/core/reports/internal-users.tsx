import { useState } from "react";
import BaseTable from "@/components/general/BaseTable";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import OptionsWrapper from "@/components/general/OptionsWrapper";
import SearchBox from "@/components/general/Searchbox";
import SectionHeader from "@/components/general/SectionHeader";
import { StatusPill } from "@/components/general/StatusPills";
import { UsersFilterPopover } from "@/components/general/UsersFilterPopover";
import { TableCell, TableRow } from "@/components/ui/table";
import { USER_HEADERS } from "@/constants";
import CreateCompanyDialogue from "@/dialogues/CreateCompanyDialogue";
import CreateIndividualDialogue from "@/dialogues/CreateIndividualDialogue";
import CreateUserDialog from "@/dialogues/CreateUserDialog";
import DeleteUserDialog from "@/dialogues/DeleteUserDialog";
import useInternalUsers from "@/hooks/api/useInternalUsers";
import type { User } from "@/types/core";
import { Pencil } from "lucide-react";

function InternalUsers() {
    const {
      users,
      pagination,
      isLoading,
      isError
    } = useInternalUsers();

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
      
    const handleEditUser = (user: User) => {
      setEditingUser(user);
      setEditDialogOpen(true);
    };

    const handleEditDialogClose = (open: boolean) => {
      setEditDialogOpen(open);
      if (!open) {
        setEditingUser(null);
      }
    };

    return (
    <div className="flex flex-col gap-5">
      <ColumnsContainer>
          <SectionHeader
              label="Internal User"
              total={pagination?.count}
              subTotal={users.length}
          />
          <div className="flex justify-end">
            <CreateUserDialog/>
            <CreateCompanyDialogue/>
            <CreateIndividualDialogue/>
          </div>
      </ColumnsContainer>
      <div className="card flex flex-col gap-5">
        <ColumnsContainer>
          <SearchBox/>
          <div className="flex w-full md:justify-end">
            <UsersFilterPopover/>
          </div>
        </ColumnsContainer>
        <BaseTable
          headers={USER_HEADERS}
          isLoading = {isLoading}
          paginationData={pagination}
          isError = {isError}
          isEmpty = {users.length === 0 }
        >
          {
            users.map((item, idx)=>{
              const name = item.client
              ? "national_id" in  item.client
                ? `${item.client.full_name}`
                :`${item.client.registered_name}`
              : item.full_name

              const uniqueId = item.client
              ? "national_id" in  item.client
                ? `${item.client.national_id ?? "-"}`
                :`${item.client.registration_number ?? "-"}`
              : "-"

              return (
              <TableRow key={idx}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-center">{uniqueId}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <StatusPill variant={
                      typeof item.i_a === "boolean"?
                      item.i_a
                      ? "success"
                      : "danger"
                      : "warning"
                    }>
                      {
                        typeof item.i_a === "boolean"&&
                        item.i_a
                        ? "active"
                        : "in-active"
                      }                  
                    </StatusPill>
                  </div>
                </TableCell>
                <TableCell className="flex flex-row items-center justify-center">
                  <div className="flex items-center justify-center">
                    <StatusPill variant={item.i_s ?"success" : "warning"}>{item.i_s ? "Stuff" : "Client"}</StatusPill>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center">
                    <OptionsWrapper>
                      <>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer w-full text-left"
                          onClick={() => handleEditUser(item)}
                        >
                          <Pencil size={14} />
                          Edit User
                        </button>
                        <DeleteUserDialog id={item.id} />
                      </>
                    </OptionsWrapper>
                  </div>
                </TableCell>
              </TableRow>
            )})
          } 
        </BaseTable>
      </div>

      <CreateUserDialog
        editingUser={editingUser}
        externalOpen={editDialogOpen}
        onExternalOpenChange={handleEditDialogClose}
      />

    </div>
  )
}

export default InternalUsers