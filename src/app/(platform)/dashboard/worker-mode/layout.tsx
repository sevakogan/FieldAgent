export default function WorkerModeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-lg mx-auto p-4">
        {children}
      </div>
    </div>
  )
}
