import AdminDashboard from "@/components/general/AdminDashboard";
//import ClientDashboard from "@/components/general/ClientDashboard";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "../../NotFound";

function Dashboard() {
    const {user} = useAuth()


    return (
        user?.i_s 
        ? <AdminDashboard/>
        : <NotFound/>
    )
}

export default Dashboard