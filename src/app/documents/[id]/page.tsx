'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { documentService } from '@/lib/services/documentService';
import { DocumentItem } from '@/types';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { FileQuestion, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DocumentPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const docId = params.id as string;

  useEffect(() => {
    async function loadDoc() {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getDocument(docId, user.id, user.email);

        if (!data) {
          setError('This document could not be found or has not been shared with your account.');
        } else {
          setDocument(data);
        }
      } catch (err: any) {
        console.error('Error fetching document:', err);
        setError(err.message || 'Failed to retrieve document.');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDoc();
    }
  }, [docId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-medium">Opening document...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You must be logged in to view and collaborate on CollabSpace documents.
          </p>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Go to Home & Select User
          </Link>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Document Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            {error || 'This document does not exist or access has been revoked.'}
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 mb-6 text-left">
            <strong>Logged in as:</strong> {user.email} <br />
            Tip: If this document belongs to another user, switch accounts from the top bar or ask the owner to grant access.
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <DocumentEditor initialDocument={document} />;
}
