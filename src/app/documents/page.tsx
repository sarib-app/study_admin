'use client';

import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { documentsApi, type AdminDocument } from '@/lib/api';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Genuine async API fetch-on-page-change, not a synchronous re-render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    documentsApi
      .list(page)
      .then((result) => {
        setDocuments(result.data);
        setLastPage(result.last_page);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load documents.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Protected>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold text-neutral-50">Documents</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Read-only record of what students have uploaded or typed into Learn — content itself isn&apos;t editable here.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        ) : (
          <>
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Title</th>
                  <th className="py-2 font-medium">Subject</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Size</th>
                  <th className="py-2 font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-neutral-900">
                    <td className="py-2 text-neutral-300">{doc.user.email}</td>
                    <td className="py-2 text-neutral-100">{doc.title}</td>
                    <td className="py-2 text-neutral-400">{doc.subject.name}</td>
                    <td className="py-2 text-neutral-400">{doc.type === 'pdf' ? 'PDF' : 'Typed note'}</td>
                    <td className="py-2 text-neutral-400">{formatSize(doc.size_bytes)}</td>
                    <td className="py-2 text-neutral-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && <p className="mt-4 text-sm text-neutral-500">No documents yet.</p>}

            {lastPage > 1 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500">
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Protected>
  );
}
