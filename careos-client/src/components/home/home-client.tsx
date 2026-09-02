import OwnerCommandCenter from "./sections/OwnerCommandCenter";
import LiveOperationsPulse from "./sections/LiveOperationsPulse";
import RoleWorkspaces from "./sections/RoleWorkspaces";
import RevenueAndCompliance from "./sections/RevenueAndCompliance";
import TrustAndSecurity from "./sections/TrustAndSecurity";
import ScaleAcrossBranches from "./sections/ScaleAcrossBranches";
import OwnerCTA from "./sections/OwnerCTA";
import HeroBanner from "./sections/HeroBanner";

export default function HomeClient() {
  return (
      <main className="relative z-10 flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-0">
      <div className="mx-auto w-full max-w-7xl">
        <HeroBanner />
        <OwnerCommandCenter />
        <LiveOperationsPulse />
        <RoleWorkspaces />
        <ScaleAcrossBranches />
        <TrustAndSecurity />
        <RevenueAndCompliance />
        <OwnerCTA />
      </div>
    </main>
  );
}
