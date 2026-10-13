import {notFound} from "next/navigation";
import FounderPrivateCases from "./FounderPrivateCases.js";
export const dynamic="force-dynamic";
// This is a distinct Founder-only STAGING view; actual case data is additionally gated at API.
export default function PrivateCustomerCasesPage(){
  if(process.env.VERCEL_ENV==="production")notFound();
  return <FounderPrivateCases/>;
}
