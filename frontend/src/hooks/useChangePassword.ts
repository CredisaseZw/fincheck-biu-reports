import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod"
import useChangePasswordApi from "./api/useChangePasswordApi";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
    old_password: z.string().min(1, "Current password is required."),
    new_password: z.string().min(8, "New password must be at least 8 characters."),
    confirm_password: z.string().min(1, "Please confirm your new password.")
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
}).refine((data) => data.old_password !== data.new_password, {
    message: "New password must be different from current password.",
    path: ["new_password"],
})

type FormData = z.infer<typeof schema>

function useChangePassword(onSuccess?: () => void) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            old_password: "",
            new_password: "",
            confirm_password: ""
        }
    })

    const { mutate, isPending } = useChangePasswordApi();

    const onSubmit = (data: FormData) => {
        mutate(data, {
            onSuccess: () => {
                toast.success("Password changed successfully.");
                reset();
                onSuccess?.();
            },
            onError: (error) => handleAxiosError(error, "Failed to change password."),
        })
    }

    return {
        onSubmit,
        register,
        handleSubmit,
        errors,
        isPending,
        reset,
    }
}

export default useChangePassword
