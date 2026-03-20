'use client';

import { useState } from 'react';

const MOCK_DOCUMENTS: Record<string, Array<{
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  category: string;
}>> = {
  '742 Evergreen Terrace': [
    { id: 'doc-1', name: 'Cleaning Checklist — March.pdf', type: 'pdf', size: '245 KB', uploaded: '2026-03-15', category: 'Checklists' },
    { id: 'doc-2', name: 'Service Agreement 2026.pdf', type: 'pdf', size: '1.2 MB', uploaded: '2026-01-05', category: 'Contracts' },
    { id: 'doc-3', name: 'Property Access Instructions.docx', type: 'doc', size: '38 KB', uploaded: '2025-06-20', category: 'Access' },
    { id: 'doc-4', name: 'Insurance Certificate — SparkleClean.pdf', type: 'pdf', size: '520 KB', uploaded: '2025-06-15', category: 'Insurance' },
  ],
  '123 Ocean Ave, Unit 4B': [
    { id: 'doc-5', name: 'Turnover Checklist — Airbnb.pdf', type: 'pdf', size: '180 KB', uploaded: '2026-03-10', category: 'Checklists' },
    { id: 'doc-6', name: 'Guest Cleaning Guidelines.pdf', type: 'pdf', size: '95 KB', uploaded: '2026-02-28', category: 'Guidelines' },
  ],
  '456 Palm Drive': [
    { id: 'doc-7', name: 'Move-Out Inspection Report.pdf', type: 'pdf', size: '3.1 MB', uploaded: '2026-02-28', category: 'Reports' },
  ],
};

const FILE_ICONS: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
};

export default function DocumentsPage() {
  const addresses = Object.keys(MOCK_DOCUMENTS);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const documents = MOCK_DOCUMENTS[selectedAddress] ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>

      {/* Address selector */}
      <div className="flex gap-2 overflow-x-auto">
        {addresses.map((addr) => (
          <button
            key={addr}
            onClick={() => setSelectedAddress(addr)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedAddress === addr ? 'bg-[#AF52DE] text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            {addr}
          </button>
        ))}
      </div>

      {/* Upload area */}
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-6 text-sm font-medium text-gray-500 hover:border-[#AF52DE] hover:text-[#AF52DE]">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload Document
      </button>

      {/* Document list */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No documents for this property</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F7] ${FILE_ICONS[doc.type] ?? 'text-gray-500'}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate font-medium text-gray-900">{doc.name}</h3>
                <p className="text-xs text-gray-400">
                  {doc.size} &middot; {doc.category} &middot; {new Date(doc.uploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button className="rounded-lg p-2 text-gray-400 hover:bg-[#F2F2F7] hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
