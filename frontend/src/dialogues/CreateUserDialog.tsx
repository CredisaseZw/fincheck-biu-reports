import { useState } from "react";
import { UserPlus } from "lucide-react";

import useCreateUser, { type UserType } from "@/hooks/useCreateUser";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ColumnsContainer from "@/components/general/ColumnsContainer";
import { cn } from "@/lib/utils";

function CreateUserDialog() {
    const [open, setOpen] = useState(false);
    const {
        onSubmit,
        register,
        handleSubmit,
        errors,
        isPending,
        userType,
        changeUserType,
    } = useCreateUser();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="size-4" />
                    New User
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                        Add a new internal staff member or an external company user.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={userType}
                    onValueChange={(value:string) => changeUserType(value as UserType)}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="internal" className="flex-1">Internal</TabsTrigger>
                        <TabsTrigger value="external" className="flex-1">External</TabsTrigger>
                    </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  {userType === "external" && (
                      <div className="form-group">
                          <Label className="required">Company Name</Label>
                          <Input {...register("company_name")} />
                          {errors.company_name && <p className="text-destructive text-sm">{errors.company_name.message}</p>}
                      </div>
                  )}

                  <ColumnsContainer numberOfCols={2} gapClass="gap-4">
                      <div className="form-group">
                          <Label className="required">First Name</Label>
                          <Input {...register("first_name")} />
                          {errors.first_name && <p className="text-destructive text-sm">{errors.first_name.message}</p>}
                      </div>

                      <div className="form-group">
                          <Label className="required">Last Name</Label>
                          <Input {...register("last_name")} />
                          {errors.last_name && <p className="text-destructive text-sm">{errors.last_name.message}</p>}
                      </div>
                  </ColumnsContainer>

                  <div className="form-group">
                      <Label className="required">Email</Label>
                      <Input type="email" {...register("email")} />
                      {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                  </div>

                  <div className="form-group">
                      <Label className="required">Password</Label>
                      <Input type="password" {...register("password")} />
                      {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                  </div>
                  
                  <div className="flex w-full justify-end">
                    <Button
                      className={
                        cn( isPending ? "cursor-not-allowed" : "")
                      }> Add User 
                    </Button>
                  </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateUserDialog;
