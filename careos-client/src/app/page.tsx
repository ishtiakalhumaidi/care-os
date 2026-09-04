import { Nav } from "@/components/common/nav";
import { SystemOrbitals } from "@/components/ui/system-orbitals";
import HomeClient from "@/components/home/home-client";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <SystemOrbitals />

      <Nav />

      <HomeClient />
      <Footer />
    </div>
  );
}
