import { notFound } from "next/navigation";
import StaffWorkspacePreview from "./StaffWorkspacePreview";

export const dynamic = "force-dynamic";

export default async function StaffWorkspacePreviewPage({ searchParams }) {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment =
    process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";

  if (
    branch !== "feature/founder-control-room-staging" ||
    environment === "production"
  ) {
    notFound();
  }

  const params = await searchParams;
  const workspaceId = String(params?.workspace || "customer_support");

  return <StaffWorkspacePreview workspaceId={workspaceId} />;
}
