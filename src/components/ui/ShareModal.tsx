'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { documentService, DEMO_USERS } from '@/lib/services/documentService';
import { DocumentShare, DocumentItem } from '@/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Users, UserPlus, Trash2, Shield, Eye, Edit3, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onShareUpdated?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  document,
  onShareUpdated,
}) => {
  const { user } = useAuth();
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [permissionInput, setPermissionInput] = useState<'viewer' | 'editor'>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isOwner = Boolean(user && document && document.owner_id === user.id);

  useEffect(() => {
    if (isOpen && document && user) {
      loadShares();
      setEmailInput('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, document, user]);

  const loadShares = async () => {
    if (!document || !user) return;
    try {
      setIsLoading(true);
      const data = await documentService.getDocumentShares(document.id, user.id);
      setShares(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load document shares');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim() || !document || !user) return;

    const email = emailInput.trim().toLowerCase();

    if (email === user.email.toLowerCase()) {
      setError('You are already the owner of this document');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMsg('');
      await documentService.shareDocument(document.id, email, permissionInput, user.id);
      setEmailInput('');
      setSuccessMsg(`Successfully shared with ${email} as ${permissionInput}`);
      await loadShares();
      onShareUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (share: DocumentShare, newPermission: 'viewer' | 'editor') => {
    if (!document || !user || !isOwner) return;
    try {
      await documentService.shareDocument(document.id, share.shared_with_email, newPermission, user.id);
      await loadShares();
      onShareUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!document || !user || !isOwner) return;
    try {
      await documentService.removeShare(shareId, user.id);
      await loadShares();
      onShareUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Document"
      description={`Manage who can view or edit "${document.title}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Add Collaborator Form (Owners only) */}
        {isOwner ? (
          <div>
            <form onSubmit={handleAddShare} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter colleague's email address..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value as 'viewer' | 'editor')}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="editor">Editor (Can edit)</option>
                  <option value="viewer">Viewer (Read only)</option>
                </select>

                <button
                  type="submit"
                  disabled={isLoading || !emailInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Recipient suggestions */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Quick invite:</span>
              {Object.values(DEMO_USERS)
                .filter((u) => u.email.toLowerCase() !== user?.email.toLowerCase())
                .map((demoUser) => (
                  <button
                    key={demoUser.id}
                    type="button"
                    onClick={() => setEmailInput(demoUser.email)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    {demoUser.email}
                  </button>
                ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Only the document owner can invite new collaborators or modify permissions.</span>
          </div>
        )}

        {/* Feedback messages */}
        {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
        {successMsg && (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {successMsg}
          </p>
        )}

        {/* People with access list */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            People with access
          </h4>

          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50">
            {/* Owner Row */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
                  {document.owner?.email ? document.owner.email[0].toUpperCase() : 'O'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {document.owner?.full_name || document.owner?.email || 'Owner'}
                  </p>
                  <p className="text-xs text-slate-500">{document.owner?.email}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-200/80 text-slate-700 rounded-full">
                Owner
              </span>
            </div>

            {/* Shares list */}
            {shares.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Not shared with anyone yet. Invite someone above!
              </div>
            ) : (
              shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
                      {share.shared_with_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {share.shared_with_email}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        {share.permission === 'editor' ? (
                          <span className="flex items-center gap-0.5 text-blue-600">
                            <Edit3 className="w-3 h-3" /> Can edit
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-slate-600">
                            <Eye className="w-3 h-3" /> Can view
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <select
                          value={share.permission}
                          onChange={(e) =>
                            handleUpdatePermission(share, e.target.value as 'viewer' | 'editor')
                          }
                          className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveShare(share.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded capitalize">
                        {share.permission}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
