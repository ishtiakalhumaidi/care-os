import GuardianRequestsPanel from "@/components/dashboard/guardianRequests/GuardianRequestsPanel";

export default function CenterAdminGuardianRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Guardian Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Review requests from primary guardians to add a co-guardian for
          children in your branch.
        </p>
      </div>
      <GuardianRequestsPanel />
    </div>
  );
}