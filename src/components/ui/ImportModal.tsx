'use client';

import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { processImportFile, validateFile } from '@/lib/importers/fileImporter';
import { documentService } from '@/lib/services/documentService';
import { useAuth } from '@/lib/context/AuthContext';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user) return;

    try {
      setIsProcessing(true);
      setError(null);

      const result = await processImportFile(selectedFile);
      if (!result.success || !result.content) {
        setError(result.error || 'Failed to process file');
        setIsProcessing(false);
        return;
      }

      const newDoc = await documentService.createDocument(
        result.title || 'Imported Document',
        result.content,
        user.id,
        user.email
      );

      onImportSuccess?.();
      onClose();
      router.push(`/documents/${newDoc.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while importing');
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Import Document"
      description="Upload Markdown (.md) or Plain Text (.txt) files up to 2MB"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/60'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {selectedFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready to convert
                  </p>
                </div>
                <p className="text-xs text-blue-600 hover:underline mt-1">Click to select different file</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports Markdown (.md) and Text (.txt) up to 2MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Import instructions */}
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> What happens during import:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
            <li>Markdown headings (#, ##, ###) become formatted headers</li>
            <li>Bulleted and numbered lists are preserved</li>
            <li>Fenced code blocks and blockquotes are automatically converted</li>
            <li>A new document is created with your filename</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isProcessing}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isProcessing ? 'Importing...' : 'Create Document'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
