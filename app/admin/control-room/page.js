import { notFound } from "next/navigation";
import AuthenticatedControlRoom from "./AuthenticatedControlRoom";

export const dynamic = "force-dynamic";

export default function ControlRoomPage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return <AuthenticatedControlRoom />;
}
