import React from 'react';
import {
  CheckSquare,
  X,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

/**
 * BulkActionBar
 * Standard floating batch action bar appearing when rows are selected in a CRUD table.
 *
 * @param {number} selectedCount - Number of currently selected items
 * @param {number} totalCount - Total number of filtered items
 * @param {Function} onClearSelection - Handler to deselect all
 * @param {Array} actions - Optional array of action buttons:
 *   [{ label: string, icon: Component, onClick: Function, variant: 'primary'|'danger'|'warning'|'secondary', disabled: boolean }]
 * @param {React.ReactNode} children - Optional custom action buttons
 */
export default function BulkActionBar({
  selectedCount = 0,
  totalCount,
  onClearSelection,
  actions = [],
  children,
}) {
  if (selectedCount <= 0) return null;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 max-w-[95vw] overflow-x-auto custom-scrollbar">
        {/* Selection Count Badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">
            Đã chọn <strong className="text-white font-bold">{selectedCount}</strong>
            {totalCount ? ` / ${totalCount}` : ''} dòng
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
            if (act.variant === 'primary') {
              btnClass = 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500';
            } else if (act.variant === 'danger') {
              btnClass = 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500';
            } else if (act.variant === 'warning') {
              btnClass = 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500';
            } else if (act.variant === 'emerald') {
              btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={act.onClick}
                disabled={act.disabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{act.label}</span>
              </button>
            );
          })}

          {children}
        </div>

        {/* Clear Selection Button */}
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 shrink-0"
            title="Bỏ chọn tất cả (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
