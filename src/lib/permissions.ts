import { DocumentPermission } from '@/types';

export interface UserAccessRights {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageSharing: boolean;
}

export function evaluatePermissions(
  role: DocumentPermission | undefined | null
): UserAccessRights {
  if (role === 'owner') {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canManageSharing: true,
    };
  }

  if (role === 'editor') {
    return {
      canView: true,
      canEdit: true,
      canDelete: false,
      canManageSharing: false,
    };
  }

  if (role === 'viewer') {
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canManageSharing: false,
    };
  }

  // No permission
  return {
    canView: false,
    canEdit: false,
    canDelete: false,
    canManageSharing: false,
  };
}
