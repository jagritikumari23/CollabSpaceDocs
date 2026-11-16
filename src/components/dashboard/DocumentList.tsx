'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentItem } from '@/types';
import { documentService } from '@/lib/services/documentService';
import { useAuth } from '@/lib/context/AuthContext';
import { DocumentCard } from './DocumentCard';
import { RenameModal } from '@/components/ui/RenameModal';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { ImportModal } from '@/components/ui/ImportModal';
import {
  Plus,
  Upload,
  Search,
  FileText,
  Users,
  FolderLock,
  Loader2,
  X,
} from 'lucide-react';

export const DocumentList: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [myDocuments, setMyDocuments] = useState<DocumentItem[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [renameDoc, setRenameDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await documentService.getDocuments(user.id, user.email);
      setMyDocuments(data.myDocuments);
      setSharedDocuments(data.sharedDocuments);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!user || isCreating) return;
    try {
      setIsCreating(true);
      const newDoc = await documentService.createDocument(
        'Untitled Document',
        undefined,
        user.id,
        user.email
      );
      router.push(`/documents/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create document', err);
      setIsCreating(false);
    }
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameDoc || !user) return;
    await documentService.updateDocument(
      renameDoc.id,
      { title: newTitle },
      user.id,
      user.email
    );
    await loadDocuments();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc || !user) return;
    await documentService.deleteDocument(deleteDoc.id, user.id);
    await loadDocuments();
  };

  // Filtered documents by search query
  const filteredMyDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return myDocuments;
    return myDocuments.filter((d) => d.title.toLowerCase().includes(q));
  }, [myDocuments, searchQuery]);

  const filteredSharedDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sharedDocuments;
    return sharedDocuments.filter((d) => d.title.toLowerCase().includes(q));
  }, [sharedDocuments, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Documents Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal workspace and collaborate on shared documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import (.txt / .md)</span>
          </button>

          <button
            type="button"
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tabs: My Documents vs Shared with Me */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'mine'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-blue-600" />
            <span>My Documents</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'mine'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {myDocuments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'shared'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shared with Me</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'shared'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {sharedDocuments.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid / Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Loading documents...</p>
        </div>
      ) : activeTab === 'mine' ? (
        filteredMyDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                currentUserId={user?.id}
                onRename={(d) => setRenameDoc(d)}
                onShare={(d) => setShareDoc(d)}
                onDelete={(d) => setDeleteDoc(d)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {searchQuery ? 'No matching documents found' : 'No documents in your workspace'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery
                ? `No documents matched "${searchQuery}". Try a different keyword.`
                : 'Create your first document or import existing notes from markdown or text files.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={handleCreateDocument}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Create Document
              </button>
            </div>
          </div>
        )
      ) : (
        filteredSharedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSharedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                currentUserId={user?.id}
                onRename={(d) => setRenameDoc(d)}
                onShare={(d) => setShareDoc(d)}
                onDelete={(d) => setDeleteDoc(d)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {searchQuery ? 'No matching shared documents' : 'No shared documents yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Documents that colleagues share with your email ({user?.email}) will appear right here.
            </p>
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg max-w-md mx-auto text-xs text-indigo-800">
              💡 <strong>Assessment Tip:</strong> Use the top right role switcher to switch to <strong>Alex Rivera</strong> (Owner) and share a document with <strong>{user?.email}</strong>!
            </div>
          </div>
        )
      )}

      {/* Modals */}
      <RenameModal
        isOpen={Boolean(renameDoc)}
        onClose={() => setRenameDoc(null)}
        currentTitle={renameDoc?.title || ''}
        onRename={handleRenameConfirm}
      />

      <DeleteModal
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        documentTitle={deleteDoc?.title || ''}
        onConfirm={handleDeleteConfirm}
      />

      <ShareModal
        isOpen={Boolean(shareDoc)}
        onClose={() => setShareDoc(null)}
        document={shareDoc}
        onShareUpdated={loadDocuments}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={loadDocuments}
      />
    </div>
  );
};
