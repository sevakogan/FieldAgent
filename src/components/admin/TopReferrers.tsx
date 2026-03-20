interface Referrer {
  readonly id: string;
  readonly full_name: string;
  readonly email: string;
  readonly referral_count: number;
  readonly position: number;
}

interface TopReferrersProps {
  readonly referrers: readonly Referrer[];
}

export default function TopReferrers({ referrers }: TopReferrersProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-[#1C1C1E]">
        Top Referrers
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Referrals
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Position
              </th>
            </tr>
          </thead>
          <tbody>
            {referrers.map((ref, idx) => (
              <tr
                key={ref.id}
                className={`border-b border-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
              >
                <td className="px-4 py-2 font-bold text-[#007AFF]">
                  {idx + 1}
                </td>
                <td className="px-4 py-2 font-medium text-[#1C1C1E]">
                  {ref.full_name}
                </td>
                <td className="px-4 py-2 text-gray-600">{ref.email}</td>
                <td className="px-4 py-2 font-semibold text-[#1C1C1E]">
                  {ref.referral_count}
                </td>
                <td className="px-4 py-2 text-gray-500">#{ref.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
