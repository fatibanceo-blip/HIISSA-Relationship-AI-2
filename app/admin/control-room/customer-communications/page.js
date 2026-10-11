import {notFound} from "next/navigation";
import FounderOperationalCentreView from "../FounderOperationalCentreView.js";
export const dynamic="force-dynamic";
export default function CustomerCommunicationsCentre(){
  if(process.env.VERCEL_ENV==="production")notFound();
  return <FounderOperationalCentreView kind="customer"/>;
}
