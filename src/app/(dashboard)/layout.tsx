import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DialerProvider } from "@/components/layout/dialer-provider";
import { DialerFAB } from "@/components/dialer/dialer-fab";
import { DialerSheet } from "@/components/dialer/dialer-sheet";

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <DialerProvider>
      <div className="flex min-h-dvh">
        <Sidebar />
        <main className="md:ml-[220px] flex-1 min-h-dvh flex flex-col pb-16 md:pb-0">
          <Topbar />
          <div className="p-5 md:p-7 flex-1 animate-fade-in">
            {children}
          </div>
        </main>
        <MobileNav />
        <DialerFAB />
        <DialerSheet />
      </div>
    </DialerProvider>
  );
}
