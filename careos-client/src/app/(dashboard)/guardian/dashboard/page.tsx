/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getMe } from "@/services/user.services";
import ChildStatusCard from "@/components/dashboard/guardian/ChildStatusCard";
import GuardianActivityFeed from "@/components/dashboard/guardian/GuardianActivityFeed";

export default async function GuardianDashboardPage() {
  const user = await getMe();

  if (!user) redirect("/login");

  const hasRegisteredChild = Boolean(user.guardianProfile?.length);
  if (!hasRegisteredChild) redirect("/guardian/dashboard/register-child");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Children</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your child&apos;s enrollment status and daily activities.
        </p>
      </div>

      <div className="space-y-8">
        {user.guardianProfile?.map((g: any) => (
          <div key={g.child.id} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left Column: Status Card (Takes up 4 columns on large screens) */}
            <div className="lg:col-span-4 h-fit">
              <ChildStatusCard child={g.child} />
            </div>

            {/* Right Column: Activity Feed (Takes up 8 columns on large screens) */}
            <div className="lg:col-span-8">
              {g.child.status === "ENROLLED" ? (
                <GuardianActivityFeed childId={g.child.id} />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-6 text-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">Activity Feed Unavailable</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The daily timeline will activate once {g.child.firstName} is officially enrolled.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}