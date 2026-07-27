import AdminDashboard from "@/components/general/AdminDashboard";
import ClientDashboard from "@/components/general/ClientDashboard";
import { useAuth } from "@/contexts/AuthContext";

function Dashboard() {
    const {user} = useAuth()


    return (
        user?.i_s 
        ? <AdminDashboard/>
        : <ClientDashboard/>
    )
}

export default Dashboard