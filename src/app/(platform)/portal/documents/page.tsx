'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPortalDocuments, uploadPortalDocument } from '@/lib/actions/portal';
import type { PortalAddress } from '@/lib/actions/portal';

export default function DocumentsPage() {
  const [addresses, setAddresses] = useState<PortalAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = useCallback(() => {
    getPortalDocuments().then(result => {
      if (result.success && result.data) {
        setAddresses(result.data);
        if (result.data.length > 0 && !selectedAddressId) {
          setSelectedAddressId(result.data[0].id);
        }
      }
      setLoading(false);
    });
  }, [selectedAddressId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = useCallback(async () => {
    if (!uploadName.trim() || !selectedAddressId) return;
    setUploading(true);
    const result = await uploadPortalDocument(selectedAddressId, {
      name: uploadName.trim(),
      url: '', // Actual file upload can come later
    });
    if (result.success) {
      setShowUploadModal(false);
      setUploadName('');
      loadDocuments();
    }
    setUploading(false);
  }, [uploadName, selectedAddressId, loadDocuments]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const documents = selectedAddress?.documents ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>

      {addresses.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">No properties found</p>
        </div>
      ) : (
        <>
          {/* Address selector */}
          <div className="flex gap-2 overflow-x-auto">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedAddressId === addr.id ? 'bg-[#AF52DE] text-white' : 'bg-white text-gray-600 shadow-sm'
                }`}
              >
                {addr.display}
              </button>
            ))}
          </div>

          {/* Upload Document */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-6 text-sm font-medium text-gray-500 hover:border-[#AF52DE] hover:text-[#AF52DE] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Document
          </button>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Upload Document</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Document Name</label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="e.g. Cleaning Contract"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#AF52DE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">File</label>
                    <input
                      type="file"
                      className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#AF52DE]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#AF52DE]"
                    />
                    <p className="mt-1 text-xs text-gray-400">File upload storage coming soon. Metadata will be saved now.</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { setShowUploadModal(false); setUploadName(''); }}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadName.trim() || uploading}
                    className="flex-1 rounded-xl bg-[#AF52DE] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : 'Save Document'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document list */}
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-400">No documents for this property</p>
              </div>
            ) : (
              documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F7] text-red-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate font-medium text-gray-900">{doc.name}</h3>
                    {doc.uploadedAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-gray-400 hover:bg-[#F2F2F7] hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
