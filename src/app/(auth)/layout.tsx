export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5"
      style={{
        background: "linear-gradient(180deg, #F2F2F7 0%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4"
            style={{ color: "#007AFF" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-black text-2xl tracking-tight" style={{ color: "#1C1C1E" }}>
            KleanHQ
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Field Service CRM
          </p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
