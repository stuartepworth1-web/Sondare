import { useState, useEffect } from 'react';
import { Trash2, Copy } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface PropertyEditorProps {
  component: any;
  onUpdate: (id: string, props: any, styles: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose?: () => void;
}

export function PropertyEditor({ component, onUpdate, onDelete, onDuplicate, onClose }: PropertyEditorProps) {
  const [props, setProps] = useState(component.props);
  const [position, setPosition] = useState({
    x: component.position_x,
    y: component.position_y,
  });
  const [size, setSize] = useState({
    width: component.width,
    height: component.height,
  });

  useEffect(() => {
    setProps(component.props);
    setPosition({ x: component.position_x, y: component.position_y });
    setSize({ width: component.width, height: component.height });
  }, [component]);

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onUpdate(component.id, newProps, component.styles);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newPos = axis === 'x' ? { ...position, x: value } : { ...position, y: value };
    setPosition(newPos);
    onUpdate(
      component.id,
      { ...props, position_x: newPos.x, position_y: newPos.y },
      component.styles
    );
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    const newSize = dimension === 'width' ? { ...size, width: value } : { ...size, height: value };
    setSize(newSize);
    onUpdate(
      component.id,
      { ...props, width: newSize.width, height: newSize.height },
      component.styles
    );
  };

  const renderPropertyInput = (key: string, value: any) => {
    if (key === 'source' && component.component_type === 'image') {
      return (
        <ImageUpload
          currentUrl={value}
          onImageUploaded={(url) => handlePropChange('source', url)}
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(key, e.target.checked)}
            className="w-4 h-4 rounded bg-white/10 border-white/20"
          />
          <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <div>
          <label className="text-xs text-white/60 capitalize mb-1 block">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropChange(key, parseInt(e.target.value) || 0)}
            className="input-field text-sm py-1.5"
          />
        </div>
      );
    }

    if (key.toLowerCase().includes('color')) {
      return (
        <div>
          <label className="text-xs text-white/60 capitalize mb-1 block">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="w-12 h-9 rounded border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="input-field text-sm py-1.5 flex-1"
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-xs text-white/60 capitalize mb-1 block">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="input-field text-sm py-1.5"
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">X</label>
              <input
                type="number"
                value={position.x}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Y</label>
              <input
                type="number"
                value={position.y}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Width</label>
              <input
                type="number"
                value={size.width}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Height</label>
              <input
                type="number"
                value={size.height}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Properties</h4>
          {Object.entries(props).map(([key, value]) => (
            <div key={key}>{renderPropertyInput(key, value)}</div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        {onClose && (
          <button
            onClick={onClose}
            className="w-full accent-button py-3"
          >
            Done
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicate(component.id)}
            className="flex-1 glass-button py-2 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
          <button
            onClick={() => onDelete(component.id)}
            className="glass-button py-2 px-4 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
