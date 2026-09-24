import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Persistent, quiet sidebar on desktop only. */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Content area. Extra bottom padding on mobile for the bottom nav. */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>

      <MobileNav />
    </div>
  );
}
