'use client';

import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { DocumentList } from '@/components/dashboard/DocumentList';
import { useAuth } from '@/lib/context/AuthContext';
import { FileText, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading, switchUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs">Initializing workspace...</p>
          </div>
        ) : user ? (
          <DocumentList />
        ) : (
          /* Unauthenticated Landing / Demo Entry */
          <div className="max-w-3xl mx-auto py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production-Grade Document Collaboration MVP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Collaborative documents, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                simplified & secure.
              </span>
            </h1>

            <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
              Create, edit with rich text formatting, import Markdown/TXT files, and share with fine-grained Viewer and Editor permissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <button
                type="button"
                onClick={() => switchUser('alex')}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Demo as Alex (Owner)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/auth"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all"
              >
                Sign In with Supabase Auth
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-slate-200 pt-10">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">TipTap Rich Text</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Headings, bold, italic, underline, lists, code blocks, and 1s debounced auto-saving.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Access Roles</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Owner, Editor, and Viewer permissions enforced at the UI and PostgreSQL RLS levels.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">File Importer</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload .md and .txt files with instant client-side validation and structure conversion.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
