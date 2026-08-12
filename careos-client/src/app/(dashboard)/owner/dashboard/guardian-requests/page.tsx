import GuardianRequestsPanel from "@/components/dashboard/guardianRequests/GuardianRequestsPanel";

export default function OwnerGuardianRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Guardian Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Review requests from primary guardians to add a co-guardian. Approving
          sends a real invitation to the person&apos;s email — nothing is linked
          until they accept it.
        </p>
      </div>
      <GuardianRequestsPanel />
    </div>
  );
}