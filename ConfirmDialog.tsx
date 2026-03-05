import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen?: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  confirmVariant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen = true,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant,
  confirmVariant,
}: ConfirmDialogProps) {
  if (isOpen === false) return null;

  const effectiveVariant = confirmVariant || variant || 'warning';
  const effectiveConfirmText = confirmLabel || confirmText || 'Continue';

  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-orange-500 hover:bg-orange-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${effectiveVariant === 'danger' ? 'bg-red-500/10' : effectiveVariant === 'warning' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
            <AlertTriangle className={`w-6 h-6 ${effectiveVariant === 'danger' ? 'text-red-500' : effectiveVariant === 'warning' ? 'text-orange-500' : 'text-blue-500'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors ${variantStyles[effectiveVariant]}`}
          >
            {effectiveConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
