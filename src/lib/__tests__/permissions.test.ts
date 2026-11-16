import { describe, it, expect } from 'vitest';
import { evaluatePermissions } from '../permissions';

describe('evaluatePermissions', () => {
  it('grants full control to owners', () => {
    const rights = evaluatePermissions('owner');
    expect(rights.canView).toBe(true);
    expect(rights.canEdit).toBe(true);
    expect(rights.canDelete).toBe(true);
    expect(rights.canManageSharing).toBe(true);
  });

  it('grants view and edit to editors, but forbids delete and share management', () => {
    const rights = evaluatePermissions('editor');
    expect(rights.canView).toBe(true);
    expect(rights.canEdit).toBe(true);
    expect(rights.canDelete).toBe(false);
    expect(rights.canManageSharing).toBe(false);
  });

  it('restricts viewers to read-only access', () => {
    const rights = evaluatePermissions('viewer');
    expect(rights.canView).toBe(true);
    expect(rights.canEdit).toBe(false);
    expect(rights.canDelete).toBe(false);
    expect(rights.canManageSharing).toBe(false);
  });

  it('denies all rights if no permission is provided', () => {
    const rights = evaluatePermissions(null);
    expect(rights.canView).toBe(false);
    expect(rights.canEdit).toBe(false);
    expect(rights.canDelete).toBe(false);
    expect(rights.canManageSharing).toBe(false);
  });
});
