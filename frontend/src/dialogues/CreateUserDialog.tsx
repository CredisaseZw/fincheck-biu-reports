import { Send, UserPlus, X, Pencil } from "lucide-react";
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
import SearchEntity from "@/components/general/SearchEntity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/types/core";

interface CreateUserDialogProps {
    editingUser?: User | null;
    externalOpen?: boolean;
    onExternalOpenChange?: (open: boolean) => void;
}

function CreateUserDialog({ editingUser, externalOpen, onExternalOpenChange }: CreateUserDialogProps) {
    const isControlled = externalOpen !== undefined && onExternalOpenChange !== undefined;

    const {
        watch,
        onSubmit,
        onSelectEntity,
        register,
        handleSubmit,
        onClear,
        reset,
        changeUserType,
        setOpen,
        open,
        selectedClient,
        errors,
        clientRef,
        control,
        isPending,
        userType,
        isEditMode,
    } = useCreateUser({
        editingUser: editingUser ?? null,
        onClose: () => onExternalOpenChange?.(false),
    });

    const dialogOpen = isControlled ? externalOpen : open;
    
    const handleDialogState = (state: boolean) => {
        if (!state) {
            onClear();
            reset();
        }
        if (isControlled) {
            onExternalOpenChange(state);
        } else {
            setOpen(state);
        }
    };

    const renderExternalClientCard = () => {
        if (!isEditMode || userType !== "external" || !editingUser?.client) return null;
        const client = editingUser.client;
        const isIndividual = "national_id" in  client;
        const displayName = isIndividual ? client.full_name : client.registered_name;
        const displayId = isIndividual ? client.national_id : (client.registration_number ?? "-");

        return (
            <div className="border rounded-lg py-3 px-4 flex flex-col gap-1 border-blue-500 bg-blue-100 dark:bg-blue-800/20 text-primary dark:text-white">
                <span className="font-semibold text-sm">Client</span>
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{displayId}</span>
            </div>
        );
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogState}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="size-4" />
                        Activate User
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditMode ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
                        {isEditMode ? "Edit User" : "Create User"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update user details, status, or password."
                            : "Add a new internal staff member or an external company user."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={userType}
                    onValueChange={(value: string) => changeUserType(value as UserType)}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="external" className="flex-1" disabled={isEditMode}>External</TabsTrigger>
                        <TabsTrigger value="internal" className="flex-1" disabled={isEditMode}>Internal</TabsTrigger>
                    </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  {/* External: client search (create mode only) */}
                  {userType === "external" && !isEditMode && (
                    <div className="form-group">
                        <Label className="required">Client Name</Label>
                        <div className="flex flex-row gap-3">
                            <Controller
                                control={control}
                                name="client_type"
                                render={({field}) => (
                             <  Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger
                                        className="mt-2"
                                    >
                                        <SelectValue placeholder = "Select item"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                    </SelectContent>
                                </Select>    
                                )}
                            
                            />
                            <SearchEntity
                                onClear = {onClear}
                                ref={clientRef}
                                entityType={watch("client_type")}
                                entityMode="client"
                                onSelectEntity={onSelectEntity}
                            />
                        </div>
                        {errors.client_id && <p className="text-destructive text-sm">{errors.client_id.message}</p>}
                        {errors.client_type && <p className="text-destructive text-sm">{errors.client_type.message}</p>}
                    </div>
                  )}

                  {renderExternalClientCard()}
                  {userType === "external" && !isEditMode && selectedClient && (
                    <div className="border rounded-lg py-2 px-3 flex flex-row justify-between border-blue-500 bg-blue-100 text-primary dark:text-white dark:bg-blue-800/20 ">
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-md">Selected Client</span>
                            <div className="flex flex-col">
                                <span className="text-xs">{selectedClient.value}</span>
                                <span className="text-xs">{selectedClient.uniqueID}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onClear}
                            type="button"
                            className=" cursor-pointer"
                        >
                            <X
                                size={15}
                            />
                        </button>
                    </div>
                  )}

                    {
                        userType === "internal" &&  
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
                    }

                    <div className="form-group">
                        <Label className="required">Email</Label>
                        <Input type="email" {...register("email")} />
                        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>

                  <div className="form-group">
                      <Label className={isEditMode ? "" : "required"}>
                          {isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                      </Label>
                      <Input type="password" {...register("password")} placeholder={isEditMode ? "••••••••" : ""} />
                      {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                  </div>

                  {isEditMode && (
                    <Controller
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                            <div className="flex items-center justify-between border rounded-lg py-3 px-4">
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-sm font-medium">Account Active</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {field.value ? "User can log in" : "User is locked out"}
                                    </span>
                                </div>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </div>
                        )}
                    />
                  )}
                  
                  <div className="flex w-full justify-end">
                    <Button
                        disabled = {isPending}
                        className={
                        cn( isPending ? "cursor-not-allowed" : "")
                      }> 
                      {
                        isPending
                        ? <LoadingIndicator variant="button"/>
                        : isEditMode ? <Pencil className="size-4" /> : <Send/>
                      }
                      {isEditMode ? "Update User" : "Add User"}
                    </Button>
                  </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateUserDialog;
