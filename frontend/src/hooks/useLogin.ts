import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import {z} from "zod"
import useLoginApi from "./api/useLoginApi";
import { handleAxiosError } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import useURLParamsFilter from "./useURLParamsFilter";
import { useNavigate } from "react-router";


const schema = z.object({
    email: z.string().email("A valid email is required."),
    password : z.string().min(1, "Password is required.")
})

type FormData = z.infer<typeof schema>
function useLogin() {
    const {
        register,
        control,
        handleSubmit, 
        formState : {errors},
    } = useForm<FormData>({
        resolver : zodResolver(schema),
        defaultValues : {
            email : "",
            password :""
        }
    })
    const navigate = useNavigate();
    const { mutate, isPending } = useLoginApi();
    const { signIn } = useAuth();
    const { getUrlParams } = useURLParamsFilter();

    const onSubmit =(data: FormData) => {
        mutate(data, {
            onSuccess: (response) =>{
                signIn(response);
                const params = getUrlParams();
                if(params.next){
                    navigate(params.next)
                    return;
                }
                navigate("/reports")
            },
            onError :(error) => handleAxiosError(error),
        })   
    }

    return {
        onSubmit,
        register,
        handleSubmit,
        errors,
        control,
        isPending
    }
}

export default useLogin