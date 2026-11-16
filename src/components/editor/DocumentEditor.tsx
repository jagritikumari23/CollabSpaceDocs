'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { DocumentItem, SaveStatus } from '@/types';
import { documentService } from '@/lib/services/documentService';
import { useAuth } from '@/lib/context/AuthContext';
import { EditorToolbar } from './EditorToolbar';
import { ShareModal } from '@/components/ui/ShareModal';
import {
  ArrowLeft,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  Edit3,
  Sparkles,
  Download,
  ShieldAlert,
} from 'lucide-react';

interface DocumentEditorProps {
  initialDocument: DocumentItem;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialDocument }) => {
  const { user } = useAuth();
  const [doc, setDoc] = useState<DocumentItem>(initialDocument);
  const [title, setTitle] = useState(initialDocument.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine permissions based on current logged in user and document
  const isOwner = Boolean(user && doc.owner_id === user.id);
  const isEditor = doc.permission === 'editor';
  const isViewer = doc.permission === 'viewer' && !isOwner;
  const canEdit = isOwner || isEditor;

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef<any>(initialDocument.content);
  const latestTitleRef = useRef<string>(initialDocument.title);

  // Update latestTitleRef whenever title state changes
  useEffect(() => {
    latestTitleRef.current = title;
  }, [title]);

  // Actual auto-save function
  const performSave = useCallback(
    async (contentToSave: any, titleToSave: string) => {
      if (!user || !canEdit) return;

      try {
        setSaveStatus('saving');
        setErrorMessage(null);

        const updated = await documentService.updateDocument(
          doc.id,
          {
            title: titleToSave,
            content: contentToSave,
          },
          user.id,
          user.email
        );

        setDoc(updated);
        setSaveStatus('saved');
      } catch (err: any) {
        console.error('Failed to auto-save document:', err);
        setSaveStatus('error');
        setErrorMessage(err.message || 'Error saving changes');
      }
    },
    [doc.id, user, canEdit]
  );

  // Schedule a debounced auto-save
  const triggerDebouncedSave = useCallback(
    (newContent?: any, newTitle?: string) => {
      if (!canEdit) return;

      setSaveStatus('unsaved');
      if (newContent) latestContentRef.current = newContent;
      if (newTitle !== undefined) latestTitleRef.current = newTitle;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        performSave(latestContentRef.current, latestTitleRef.current);
      }, 1000); // 1-second debounce
    },
    [canEdit, performSave]
  );

  // Initialize TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Type your thoughts, documentation, or notes here...',
      }),
    ],
    content: initialDocument.content,
    editable: canEdit,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      triggerDebouncedSave(json, undefined);
    },
  });

  // Keep editor editable state in sync if user role switches
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor]);

  // Handle Title input change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerDebouncedSave(undefined, val);
  };

  // Export document feature
  const handleExport = (format: 'md' | 'txt') => {
    if (!editor) return;
    const textContent = editor.getText();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_') || 'document'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Editor Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Back button & Title input */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex-1 min-w-0 max-w-xl">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                disabled={!canEdit}
                placeholder="Untitled Document"
                className={`w-full px-2 py-1 text-base font-semibold text-slate-900 rounded-md border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors truncate ${
                  !canEdit ? 'bg-transparent cursor-not-allowed hover:border-transparent' : 'bg-transparent'
                }`}
              />
            </div>
          </div>

          {/* Right: Save Status, Permissions & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Saved</span>
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">Unsaved changes</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span
                  className="flex items-center gap-1.5 text-red-600 font-medium cursor-pointer"
                  title={errorMessage || 'Failed to save'}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Error</span>
                </span>
              )}
            </div>

            {/* Permission Badge */}
            <div className="hidden md:block">
              {isOwner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3" /> Owner
                </span>
              )}
              {isEditor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Edit3 className="w-3 h-3" /> Editor
                </span>
              )}
              {isViewer && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Eye className="w-3 h-3" /> Viewer (Read-only)
                </span>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Download / Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-30">
                <button
                  type="button"
                  onClick={() => handleExport('md')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Markdown (.md)
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Plain Text (.txt)
                </button>
              </div>
            </div>

            {/* Share Button (Owner only) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Read-only banner if Viewer */}
        {isViewer && (
          <div className="bg-amber-50 border-t border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-900 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> You have Viewer permissions for this document. Editing is disabled.
            </span>
          </div>
        )}
      </header>

      {/* Editor Toolbar */}
      <div className="sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-b-lg border border-t-0 border-slate-200 bg-white">
            <EditorToolbar editor={editor} disabled={!canEdit} />
          </div>
        </div>
      </div>

      {/* Editor Paper Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-14 min-h-[700px]">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        document={doc}
        onShareUpdated={async () => {
          if (user) {
            const reloaded = await documentService.getDocument(doc.id, user.id, user.email);
            if (reloaded) setDoc(reloaded);
          }
        }}
      />
    </div>
  );
};
