import connectDb from '@/lib/db'
import { redirect } from "next/navigation"
import User from "@/models/user.models";
import { auth } from "@/auth";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import GeoUpdater from '@/components/GeoUpdater';


async function Home() {
  await connectDb()
  const session = await auth()
  const user = await User.findById(session?.user?.id)
  if(!user){
    redirect("/")
  }

  const inComplete = !user.mobile || !user.role || (!user.mobile && user.role== "user")
  if(inComplete){
    return <EditRoleMobile />
  }

  const plainUser = JSON.parse(JSON.stringify(user))



  return (
    <>
      <Nav user={plainUser}/>
      <GeoUpdater userId={plainUser._id}/>
      {user.role == "user" ? (
        <UserDashboard />
      ): user.role == "admin" ? (
        <AdminDashboard />
      ) : <DeliveryBoy />
    }
      
    </>
  );
}



export default Home