"use client";
import Link from "next/link";
import FounderStaffSessionDeviceControl from "../control-room-preview/FounderStaffSessionDeviceControl.js";

export default function StaffSessionDeviceControlPage(){
  return <main style={{minHeight:"100vh",padding:"24px",background:"linear-gradient(145deg,#edf4ee,#fffaf0)"}}>
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <Link href="/admin/control-room" style={{display:"inline-block",marginBottom:12,color:"#245b48",fontWeight:800}}>← Back to Founder Control Room</Link>
      <FounderStaffSessionDeviceControl authenticated />
    </div>
  </main>;
}
