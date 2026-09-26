import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveOrg, requireUser } from "@/lib/data/orgs";
import { FenceBuilder } from "../../../tools/fence-builder";

/**
 * Fence plan editor rendered inside a job's tabs — replaces the Floor Plan
 * Builder for this edition. Loads the job server-side (same ownership check
 * Floor Plans used) and hands it straight to FenceBuilder so there's no
 * manual job-number lookup step; the tech is already on the job.
 */
export default async function JobFencePlanPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  await requireUser();
  const { activeOrg } = await requireActiveOrg();
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, job_number, client_name, address, city, jurisdiction, contract_value")
    .eq("id", jobId)
    .eq("org_id", activeOrg.id)
    .maybeSingle();

  if (!job) notFound();

  return <FenceBuilder orgId={activeOrg.id} initialJob={job} />;
}
