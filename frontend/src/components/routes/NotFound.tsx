import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="pt-6">
          <Button size="lg" className="rounded-full px-8" onClick={() => navigate(-1)}>
            <MoveLeft/>
            Go Back 
          </Button>
        </div>
      </div>
    </div>
  );
}
