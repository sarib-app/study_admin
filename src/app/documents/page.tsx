'use client';

import { ChevronLeft, ChevronRight, FileText, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Badge, Button, Card, EmptyState, ErrorText, PageHeader } from '@/components/ui';
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
      <PageHeader
        title="Documents"
        description="Read-only record of what students have uploaded or typed into Learn."
      />

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <Card className="max-w-5xl overflow-x-auto p-0">
          {documents.length === 0 ? (
            <div className="p-6">
              <EmptyState>No documents yet.</EmptyState>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-bold uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-bold">Student</th>
                  <th className="px-5 py-3 font-bold">Title</th>
                  <th className="px-5 py-3 font-bold">Subject</th>
                  <th className="px-5 py-3 font-bold">Type</th>
                  <th className="px-5 py-3 font-bold">Size</th>
                  <th className="px-5 py-3 font-bold">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-soft">{doc.user.email}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{doc.title}</td>
                    <td className="px-5 py-3 text-soft">{doc.subject.name}</td>
                    <td className="px-5 py-3">
                      <Badge>
                        <span className="flex items-center gap-1">
                          {doc.type === 'pdf' ? <FileText size={11} /> : <StickyNote size={11} />}
                          {doc.type === 'pdf' ? 'PDF' : 'Typed note'}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-faint">{formatSize(doc.size_bytes)}</td>
                    <td className="px-5 py-3 text-faint">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {lastPage > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium text-faint">
            Page {page} of {lastPage}
          </span>
          <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </Protected>
  );
}
