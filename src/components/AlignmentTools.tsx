import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterVertical
} from 'lucide-react';

interface AlignmentToolsProps {
  onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'horizontal' | 'vertical') => void;
  disabled?: boolean;
}

export function AlignmentTools({ onAlign, disabled }: AlignmentToolsProps) {
  const buttonClass = `glass-button p-2 ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`;

  return (
    <div className="glass-card p-3">
      <h4 className="text-xs font-semibold mb-2 text-white/60">ALIGNMENT</h4>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={() => onAlign('left')}
          disabled={disabled}
          className={buttonClass}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('center')}
          disabled={disabled}
          className={buttonClass}
          title="Align Center Horizontally"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('right')}
          disabled={disabled}
          className={buttonClass}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('horizontal')}
          disabled={disabled}
          className={buttonClass}
          title="Distribute Horizontally"
        >
          <AlignHorizontalJustifyCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('top')}
          disabled={disabled}
          className={buttonClass}
          title="Align Top"
        >
          <AlignStartVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('middle')}
          disabled={disabled}
          className={buttonClass}
          title="Align Middle Vertically"
        >
          <AlignCenterVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('bottom')}
          disabled={disabled}
          className={buttonClass}
          title="Align Bottom"
        >
          <AlignEndVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('vertical')}
          disabled={disabled}
          className={buttonClass}
          title="Distribute Vertically"
        >
          <AlignVerticalJustifyCenter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
