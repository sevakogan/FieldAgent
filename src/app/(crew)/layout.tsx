import { CrewNav } from "@/components/layout/crew-nav";

export default function CrewLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3.5">
        <h1 className="font-black text-lg tracking-tight">🌿 KleanHQ</h1>
      </header>
      <main className="p-5 pb-20 md:pb-5 animate-fade-in">
        {children}
      </main>
      <CrewNav />
    </div>
  );
}
