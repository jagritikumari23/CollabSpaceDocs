'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DocumentItem } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  MoreVertical,
  Edit2,
  Share2,
  Trash2,
  Users,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DocumentCardProps {
  document: DocumentItem;
  currentUserId?: string;
  onRename: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  currentUserId,
  onRename,
  onShare,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = document.permission === 'owner' || document.owner_id === currentUserId;
  const isEditor = document.permission === 'editor';
  const isViewer = document.permission === 'viewer';

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner / Color Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500/80 to-indigo-500/80 group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Icon, Title & Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="flex items-start gap-3 flex-1 min-w-0"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <FileText className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {document.title || 'Untitled Document'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {formatDate(document.updated_at)}
              </p>
            </div>
          </Link>

          {/* Context Actions Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Document options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 mt-1 w-44 rounded-lg bg-white shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/documents/${document.id}`}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Open Document
                  </Link>

                  {/* Rename allowed for Owner or Editor */}
                  {(isOwner || isEditor) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onRename(document);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      Rename
                    </button>
                  )}

                  {/* Share allowed for Owner only */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onShare(document);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      Share...
                    </button>
                  )}

                  {/* Delete allowed for Owner only */}
                  {isOwner && (
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(document);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Preview Snippet */}
        <Link
          href={`/documents/${document.id}`}
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500"
        >
          {/* Permission Badge */}
          <div>
            {isOwner && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3" /> Owner
              </span>
            )}
            {isEditor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Edit2 className="w-3 h-3" /> Can Edit
              </span>
            )}
            {isViewer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Eye className="w-3 h-3" /> Viewer (Read-only)
              </span>
            )}
          </div>

          {/* Owner info or Collaborators count */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            {isOwner ? (
              document.shared_count !== undefined && document.shared_count > 0 ? (
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3 h-3" /> {document.shared_count} shared
                </span>
              ) : (
                <span>Private</span>
              )
            ) : (
              <span className="truncate max-w-[120px]" title={document.owner?.email}>
                by {document.owner?.full_name || document.owner?.email?.split('@')[0] || 'Owner'}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};
