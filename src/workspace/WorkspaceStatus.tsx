import React from 'react';
import { AlertTriangle, CheckCircle2, CloudOff, Eye, Loader2, LogOut, Repeat, RotateCcw } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { RoleBadge } from './CloudGate';
import { SyncStatus } from './useContractSync';

const SyncIndicator: React.FC<{ status: SyncStatus; onRetry: () => void; onReload: () => void }> = ({ status, onRetry, onReload }) => {
  switch (status.state) {
    case 'saving':
      return (
        <span className="inline-flex items-center gap-1 text-stone-300" role="status">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving…
        </span>
      );
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1 text-emerald-300" role="status">
          <CheckCircle2 className="w-3 h-3" /> All changes saved
        </span>
      );
    case 'readonly':
      return (
        <span className="inline-flex items-center gap-1 text-stone-400" title="Your role cannot change contracts; edits are for analysis only and are not saved">
          <Eye className="w-3 h-3" /> Read-only
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 text-red-300" role="alert" title={status.message}>
          <CloudOff className="w-3 h-3" /> Not saved
          <button onClick={onRetry} className="underline font-bold hover:text-red-100">Retry</button>
        </span>
      );
    case 'conflict':
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-300" role="alert" title={status.message}>
          <AlertTriangle className="w-3 h-3" /> Edited elsewhere
          <button onClick={onReload} className="inline-flex items-center gap-0.5 underline font-bold hover:text-amber-100">
            <RotateCcw className="w-3 h-3" /> Load latest
          </button>
        </span>
      );
    default:
      return null;
  }
};

/** Save state plus, in cloud mode, the organization, role and account controls. */
export const WorkspaceStatus: React.FC<{ status: SyncStatus; onRetry: () => void; onReload: () => void }> = (props) => {
  const ws = useWorkspace();
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px]">
      <SyncIndicator {...props} />
      {ws.organization && ws.role && (
        <>
          <span className="font-bold text-stone-200 max-w-[180px] truncate" title={ws.organization.name}>{ws.organization.name}</span>
          <RoleBadge role={ws.role} />
          <span className="hidden lg:inline text-stone-400 max-w-[180px] truncate" title={ws.user?.email}>{ws.user?.email}</span>
          {ws.switchOrganization && (
            <button onClick={ws.switchOrganization} title="Switch organization" className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-100">
              <Repeat className="w-3.5 h-3.5" />
            </button>
          )}
          {ws.signOut && (
            <button onClick={ws.signOut} title="Sign out" className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-100">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
};
