/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import useCreateUserApi from "./api/useCreateUserApi";
import useUpdateUserApi from "./api/useUpdateUserApi";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import type { EntityMode, onSelectEntityProps, User } from "@/types/core";
import type { SearchEntityRef } from "@/components/general/SearchEntity";

const createUserSchema = z
  .object({
    user_type: z.enum(["internal", "external"]),
    client_type: z.enum(["company", "individual"]),
    client_id: z.number().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().optional(),
    is_active: z.boolean().optional(),
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

interface UseCreateUserOptions {
  editingUser?: User | null;
  onClose?: () => void;
}

function useCreateUser(options?: UseCreateUserOptions) {
  const editingUser = options?.editingUser ?? null;
  const onCloseCallback = options?.onClose;
  const isEditMode = !!editingUser;

  const { mutate: createMutate, isPending: isCreatePending } = useCreateUserApi();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateUserApi();
  const isPending = isCreatePending || isUpdatePending;

  const [open, setOpen] = useState(false);
  const clientRef = useRef<SearchEntityRef>(null);
  const [selectedClient, setSelectedClient] = useState<onSelectEntityProps | undefined>();
  const [userType, setUserType] = useState<UserType>("external");
  const queryClient = useQueryClient();

  const getDefaultValues = (): CreateUserFormData => {
    if (editingUser) {
      const isExternal = !!editingUser.client;
      const clientType: "company" | "individual" = editingUser.client
        ? "type" in editingUser.client
          ? editingUser.client.type
          : "company"
        : "company";

      return {
        user_type: isExternal ? "external" : "internal",
        client_type: clientType,
        client_id: editingUser.client ? editingUser.client.id : undefined,
        first_name: !isExternal ? editingUser.full_name.split(" ")[0] ?? "" : "",
        last_name: !isExternal ? editingUser.full_name.split(" ").slice(1).join(" ") ?? "" : "",
        email: editingUser.email,
        password: "",
        is_active: typeof editingUser.i_a === "boolean" ? editingUser.i_a : true,
      };
    }
    return {
      client_type: "company",
      user_type: "external",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      is_active: true,
    };
  };

  const {
    control,
    watch,
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const defaults = getDefaultValues();
    reset(defaults);

    if (editingUser) {
      const isExternal = !!editingUser.client;
      setUserType(isExternal ? "external" : "internal");

      if (isExternal && editingUser.client) {
        const client = editingUser.client;
        const isIndividual = "national_id" in  client;
        setSelectedClient({
          id: client.id,
          value: isIndividual ? client.full_name : client.registered_name,
          uniqueID: isIndividual ? client.national_id : client.registration_number,
          email: client.email,
        });
      } else {
        setSelectedClient(undefined);
      }
    } else {
      setUserType("external");
      setSelectedClient(undefined);
    }
  }, [editingUser]);

  const onSelectEntity = (_: EntityMode, client: onSelectEntityProps) => {
    if (client.value === "") {
      setSelectedClient(undefined);
      setValue("email", "");
      setValue("client_id", 0);
      return;
    }
    setSelectedClient(client);
    setValue("client_id", client.id);
    if (client.email) {
      setValue("email", client.email);
    }
  };

  const onClear = () => {
    clientRef.current?.clear();
    setSelectedClient(undefined);
    setValue("email", "");
    setValue("client_id", 0);
  };

  const changeUserType = (type: UserType) => {
    setUserType(type);
    setValue("user_type", type);
    if (type === "internal") {
      onClear();
    }
  };

  const onSubmit = (data: CreateUserFormData) => {
    if (isEditMode && editingUser) {
      const payload: Record<string, unknown> = {};

      if (data.email !== editingUser.email) {
        payload.email = data.email;
      }
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }
      if (data.is_active !== undefined) {
        payload.is_active = data.is_active;
      }
      if (data.user_type === "internal") {
        payload.first_name = data.first_name;
        payload.last_name = data.last_name;
      }

      updateMutate(
        { id: editingUser.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully");
            setOpen(false);
            onCloseCallback?.();
          },
          onError: (error) => handleAxiosError(error),
        }
      );
    } else {

      let payload_data: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      };
      if (data.user_type === "external") {
        payload_data = {
          client_type: data.client_type,
          client_id: data.client_id,
          email: data.email,
          password: data.password,
        };
      }
      createMutate(
        {
          mode: data.user_type,
          data: payload_data,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User successfully created");
            reset({
              client_type: "company",
              user_type: data.user_type,
              first_name: "",
              last_name: "",
              email: "",
              password: "",
              is_active: true,
            });
            setOpen(false);
            onClear();
          },
          onError: (error) => handleAxiosError(error),
        }
      );
    }
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
    isEditMode,
  };
}

export default useCreateUser;
