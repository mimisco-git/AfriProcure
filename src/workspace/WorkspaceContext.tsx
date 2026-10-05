import React, { createContext, useContext } from 'react';
import { OrgRole, Permissions, permissionsFor } from './permissions';
import { LocalWorkspaceStore, WorkspaceStore } from './store';

export interface Workspace {
  store: WorkspaceStore;
  /** null in local mode */
  role: OrgRole | null;
  permissions: Permissions;
  organization?: { id: string; name: string };
  user?: { id: string; email: string };
  signOut?: () => void;
  switchOrganization?: () => void;
}

export const createLocalWorkspace = (): Workspace => ({
  store: new LocalWorkspaceStore(),
  role: null,
  permissions: permissionsFor(null),
});

const WorkspaceContext = createContext<Workspace | null>(null);

export const WorkspaceProvider: React.FC<{ value: Workspace; children: React.ReactNode }> = ({ value, children }) => (
  <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
);

export function useWorkspace(): Workspace {
  const ws = useContext(WorkspaceContext);
  if (!ws) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ws;
}
