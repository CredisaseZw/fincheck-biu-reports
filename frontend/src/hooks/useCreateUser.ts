import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import useCreateUserApi from "./api/useCreateUserApi";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import type { EntityMode, onSelectEntityProps } from "@/types/core";
import type { SearchEntityRef } from "@/components/general/SearchEntity";

const createUserSchema = z
  .object({
    user_type: z.enum(["internal", "external"]),
    client_type : z.enum(["company", "individual"]),
    client_id: z.number().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(4, "Minimum 4 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.user_type === "external" && !data.client_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Client id is required",
        path: ["client_id"],
      });
    }
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UserType = "internal" | "external";

function useCreateUser() {
  const {mutate, isPending} = useCreateUserApi();
  const [open, setOpen] = useState(false);
  const clientRef = useRef<SearchEntityRef>(null);
  const [selectedClient, setSelectedClient] = useState<onSelectEntityProps | undefined>()
  const [userType, setUserType] = useState<UserType>("external");
  const queryClient = useQueryClient();

  const {
    control,
    watch, 
    getValues,
    register,
    handleSubmit,
    formState: { errors, },
    reset,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      client_type : "company",
      user_type: "external",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  const onSelectEntity = (_: EntityMode, client: onSelectEntityProps)=>{
    if (client.value === ""){
      setSelectedClient(undefined)
      setValue("email", "")
      setValue("client_id", 0)
      return;
    }
    setSelectedClient(client)
    setValue("client_id", client.id)
    if(client.email){
      setValue("email", client.email)
    }
  }

  const onClear = () =>{
    clientRef.current?.clear()
    setSelectedClient(undefined)
    setValue("email", "")
    setValue("client_id", 0)
  }

  const changeUserType = (type: UserType) => {
    setUserType(type);
    setValue("user_type", type);
    if (type === "internal") {
      onClear()
    }
  };

  const onSubmit = (data: CreateUserFormData) => {
    let payload_data: Record<string, unknown> = {
      first_name : data.first_name,
      last_name : data.last_name,
      email : data.email,
      password : data.password
    }
    if(data.user_type === "external"){
      payload_data = {
        client_type: data.client_type,
        client_id : data.client_id,
        email : data.email,
        password: data.password
      }
    }
    mutate({
      mode : data.user_type,
      data : payload_data
    }, {
      onSuccess : () =>{
        queryClient.invalidateQueries({queryKey : ["users"]})
        toast.success("User successfully created")
        reset({
          client_type: "company",
          user_type: data.user_type,
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        })
        setOpen(false)
        onClear()

      },
      onError : (error) => handleAxiosError(error)
    });
  };

  return {
    watch, 
    getValues,
    onSelectEntity,
    onSubmit,
    setValue,
    register,
    setOpen,
    onClear,
    reset,
    handleSubmit,
    changeUserType,
    selectedClient,
    errors,
    clientRef,
    open,
    isPending,
    userType,
    control,

  };
}

export default useCreateUser;
