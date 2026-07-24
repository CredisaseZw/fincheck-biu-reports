import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import useCreateUserApi from "./api/useCreateUserApi";
import type { User } from "@/types/core";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

const createUserSchema = z
  .object({
    is_staff : z.boolean(),
    user_type: z.enum(["internal", "external"]),
    company_name: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Minimum 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.user_type === "external" && !data.company_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required",
        path: ["company_name"],
      });
    }
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UserType = "internal" | "external";

function useCreateUser() {
  const {mutate, isPending} = useCreateUserApi();
  const [userType, setUserType] = useState<UserType>("internal");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, },
    reset,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      user_type: "internal",
      company_name: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });



  const onSubmit = (data: CreateUserFormData) => {
    const payload = data.user_type === "internal" 
    ? { ...data,is_staff: true, company_name: undefined, } 
    : data;

    mutate(payload, {
      onSuccess : (response: User) =>{
        toast.success("User successfully .d")
        reset({
          user_type: "internal",
          company_name: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        })
      },
      onError : (error) => handleAxiosError(error)
    });
  };

  const changeUserType = (type: UserType) => {
    setUserType(type);
    setValue("user_type", type);
    if (type === "internal") {
      setValue("company_name", "");
    }
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    isPending,
    userType,
    changeUserType,
  };
}

export default useCreateUser;
