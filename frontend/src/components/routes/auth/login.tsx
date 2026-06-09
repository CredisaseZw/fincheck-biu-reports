import LoadingIndicator from "@/components/general/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLogin from "@/hooks/useLogin";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

function Login() {
  const {
    onSubmit,
    register,
    handleSubmit,
    errors,
    isPending
  } = useLogin();

  return (
    <div className="h-screen bg-background px-5 flex justify-center items-center">
      <form 
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 border text-center flex flex-col gap-4 rounded-md shadow bg-light w-full dark:bg-dark md:w-130">
          <div className="flex flex-col ">
            <h1 className="font-bold text-2xl text-gray-800 dark:text-gray-200">Welcome back!</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">Credit Report Portal</span>
          </div>
          <div className="flex flex-col gap-5">
            <div className="form-group">
              <Label className="required">Email</Label>
              <Input
                {...register("email")}
                placeholder="johndean@example.com"
              />
              {errors.email && <p className="text-red-600 text-xs font-light text-left">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <Label className = "required">Password</Label>
              <Input
                {...register("password")}
                type="password" 
              />
              {errors.password && <p className="text-red-600 text-xs font-light text-left">{errors.password.message}</p>}
            </div>
          </div>
          <Button
            disabled = {isPending}
            type="submit" 
            className={cn(
              "py-6 w-full rounded-lg",
              isPending && "cursor-not-allowed"
            )}
          >
            {
              isPending 
              ? <LoadingIndicator variant="button"/>
              : <LogIn/>
            }
            Sign In
          </Button>
          
      </form>
    </div>
  )
}

export default Login