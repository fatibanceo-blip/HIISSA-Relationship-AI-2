import { notFound } from "next/navigation";
import AuthenticatedStaffSessionDeviceControl from "./AuthenticatedStaffSessionDeviceControl.js";
export const dynamic = "force-dynamic";
export default function StaffSessionDeviceControlPage(){
  if(process.env.VERCEL_ENV==="production") notFound();
  return <AuthenticatedStaffSessionDeviceControl />;
}
