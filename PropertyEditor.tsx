import { useState, useEffect } from 'react';
import { Trash2, Copy, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface PropertyEditorProps {
  component: any;
  onUpdate: (id: string, props: any, styles: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose?: () => void;
  onLayerUp?: (id: string) => void;
  onLayerDown?: (id: string) => void;
}

export function PropertyEditor({ component, onUpdate, onDelete, onDuplicate, onClose, onLayerUp, onLayerDown }: PropertyEditorProps) {
  const [props, setProps] = useState(component.props);
  const [position, setPosition] = useState({
    x: component.position_x,
    y: component.position_y,
  });
  const [size, setSize] = useState({
    width: component.width,
    height: component.height,
  });
  const [expandedSections, setExpandedSections] = useState({
    position: true,
    size: true,
    typography: false,
    properties: true,
    effects: false,
    transform: false,
    gradient: false,
    filters: false,
    animation: false,
    interactions: false,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

    if (key === 'fontFamily') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Font Family</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="System">System</option>
            <option value="SF Pro">SF Pro</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Lato">Lato</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Poppins">Poppins</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier">Courier</option>
          </select>
        </div>
      );
    }

    if (key === 'fontWeight') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Font Weight</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="normal">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="bold">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
      );
    }

    if (key === 'textAlign') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Text Align</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      );
    }

    if (key === 'textDecoration') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Text Decoration</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="none">None</option>
            <option value="underline">Underline</option>
            <option value="line-through">Strike Through</option>
            <option value="underline line-through">Underline + Strike</option>
          </select>
        </div>
      );
    }

    if (key === 'textTransform') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Text Transform</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      );
    }

    if (key === 'gradientDirection') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Gradient Direction</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
            <option value="diagonal">Diagonal</option>
            <option value="radial">Radial</option>
          </select>
        </div>
      );
    }

    if (key === 'animation') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Animation</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="none">None</option>
            <option value="fadeIn">Fade In</option>
            <option value="slideUp">Slide Up</option>
            <option value="slideDown">Slide Down</option>
            <option value="slideLeft">Slide Left</option>
            <option value="slideRight">Slide Right</option>
            <option value="scale">Scale</option>
            <option value="bounce">Bounce</option>
            <option value="pulse">Pulse</option>
          </select>
        </div>
      );
    }

    if (key === 'action') {
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Button Action</label>
          <select
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="none">None</option>
            <option value="navigate">Navigate to Screen</option>
            <option value="back">Go Back</option>
            <option value="external">Open URL</option>
            <option value="submit">Submit Form</option>
          </select>
        </div>
      );
    }

    if (key === 'gradientColors') {
      const isGradient = value && Array.isArray(value);
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block">Gradient</label>
          {!isGradient ? (
            <button
              onClick={() => handlePropChange(key, [props.backgroundColor || '#FF9500', '#FF6B00'])}
              className="glass-button px-3 py-2 text-xs w-full"
            >
              Enable Gradient
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value[0]}
                  onChange={(e) => handlePropChange(key, [e.target.value, value[1]])}
                  className="w-12 h-9 rounded border border-white/20 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={value[0]}
                  onChange={(e) => handlePropChange(key, [e.target.value, value[1]])}
                  className="input-field text-sm py-1.5 flex-1"
                  placeholder="Start"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value[1]}
                  onChange={(e) => handlePropChange(key, [value[0], e.target.value])}
                  className="w-12 h-9 rounded border border-white/20 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={value[1]}
                  onChange={(e) => handlePropChange(key, [value[0], e.target.value])}
                  className="input-field text-sm py-1.5 flex-1"
                  placeholder="End"
                />
              </div>
              <button
                onClick={() => handlePropChange(key, null)}
                className="glass-button px-3 py-1.5 text-xs w-full"
              >
                Disable Gradient
              </button>
            </div>
          )}
        </div>
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

    if (key.startsWith('filter')) {
      const filterName = key.replace('filter', '');
      const isPercentage = ['Brightness', 'Contrast', 'Saturation', 'Grayscale', 'Sepia'].includes(filterName);
      const max = isPercentage ? 200 : filterName === 'Blur' ? 10 : 100;
      return (
        <div>
          <label className="text-xs text-white/60 mb-1 block flex items-center justify-between">
            <span>{filterName}</span>
            <span className="text-orange-400">{value}{isPercentage ? '%' : 'px'}</span>
          </label>
          <input
            type="range"
            min="0"
            max={max}
            step={isPercentage ? 1 : 0.5}
            value={value}
            onChange={(e) => handlePropChange(key, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      );
    }

    if (typeof value === 'number' || key.includes('letterSpacing') || key.includes('lineHeight') || key.includes('rotation') || key.includes('animationDuration')) {
      const step = key === 'letterSpacing' ? 0.1 : key === 'lineHeight' ? 0.1 : key === 'rotation' ? 1 : key === 'animationDuration' ? 100 : 1;
      return (
        <div>
          <label className="text-xs text-white/60 capitalize mb-1 block">
            {key.replace(/([A-Z])/g, ' $1').trim()}
            {key === 'rotation' && ' (deg)'}
            {key === 'letterSpacing' && ' (px)'}
            {key === 'animationDuration' && ' (ms)'}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropChange(key, parseFloat(e.target.value) || 0)}
            className="input-field text-sm py-1.5"
            step={step}
          />
        </div>
      );
    }

    if (key.toLowerCase().includes('color') || key === 'backgroundColor') {
      const isTransparent = value === 'transparent';
      return (
        <div>
          <label className="text-xs text-white/60 capitalize mb-1 block">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div className="flex gap-2 items-center">
            {!isTransparent && (
              <>
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
              </>
            )}
            {key === 'backgroundColor' && (
              <button
                onClick={() => handlePropChange(key, isTransparent ? '#000000' : 'transparent')}
                className="glass-button px-3 py-1.5 text-xs whitespace-nowrap"
              >
                {isTransparent ? 'Color' : 'Clear'}
              </button>
            )}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        <div className="glass-card p-3">
          <button
            onClick={() => toggleSection('position')}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
          >
            <span>Position</span>
            {expandedSections.position ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.position && (
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
          )}
        </div>

        <div className="glass-card p-3">
          <button
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
          >
            <span>Size</span>
            {expandedSections.size ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.size && (
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
          )}
        </div>

        {onLayerUp && onLayerDown && (
          <div className="glass-card p-3">
            <div className="text-sm font-medium text-white/80 mb-2">Layer</div>
            <div className="flex gap-2">
              <button
                onClick={() => onLayerUp(component.id)}
                className="flex-1 glass-button py-2 flex items-center justify-center gap-2 text-sm"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Forward</span>
              </button>
              <button
                onClick={() => onLayerDown(component.id)}
                className="flex-1 glass-button py-2 flex items-center justify-center gap-2 text-sm"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Backward</span>
              </button>
            </div>
          </div>
        )}

        {(props.fontFamily !== undefined || props.fontSize !== undefined) && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('typography')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Typography</span>
              {expandedSections.typography ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.typography && (
              <div className="space-y-3">
                {props.fontFamily !== undefined && renderPropertyInput('fontFamily', props.fontFamily)}
                {props.fontSize !== undefined && renderPropertyInput('fontSize', props.fontSize)}
                {props.fontWeight !== undefined && renderPropertyInput('fontWeight', props.fontWeight)}
                {props.textAlign !== undefined && renderPropertyInput('textAlign', props.textAlign)}
                {props.textDecoration !== undefined && renderPropertyInput('textDecoration', props.textDecoration)}
                {props.textTransform !== undefined && renderPropertyInput('textTransform', props.textTransform)}
                {props.letterSpacing !== undefined && renderPropertyInput('letterSpacing', props.letterSpacing)}
                {props.lineHeight !== undefined && renderPropertyInput('lineHeight', props.lineHeight)}
              </div>
            )}
          </div>
        )}

        {props.rotation !== undefined && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('transform')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Transform</span>
              {expandedSections.transform ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.transform && (
              <div className="space-y-3">
                {renderPropertyInput('rotation', props.rotation)}
                {props.paddingHorizontal !== undefined && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>{renderPropertyInput('paddingHorizontal', props.paddingHorizontal)}</div>
                    <div>{renderPropertyInput('paddingVertical', props.paddingVertical)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="glass-card p-3">
          <button
            onClick={() => toggleSection('effects')}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
          >
            <span>Effects & Style</span>
            {expandedSections.effects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.effects && (
            <div className="space-y-3">
              {props.opacity !== undefined && (
                <div>
                  <label className="text-xs text-white/60 mb-1 block flex items-center justify-between">
                    <span>Opacity</span>
                    <span className="text-orange-400">{Math.round(props.opacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={props.opacity}
                    onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {props.borderWidth !== undefined && (
                <>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Border Width</label>
                    <input
                      type="number"
                      value={props.borderWidth}
                      onChange={(e) => handlePropChange('borderWidth', parseInt(e.target.value) || 0)}
                      className="input-field text-sm py-1.5"
                      min="0"
                    />
                  </div>
                  {props.borderWidth > 0 && (
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">Border Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={props.borderColor || '#FFFFFF'}
                          onChange={(e) => handlePropChange('borderColor', e.target.value)}
                          className="w-12 h-9 rounded border border-white/20 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={props.borderColor || '#FFFFFF'}
                          onChange={(e) => handlePropChange('borderColor', e.target.value)}
                          className="input-field text-sm py-1.5 flex-1"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {props.shadowOpacity !== undefined && (
                <>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block flex items-center justify-between">
                      <span>Shadow Opacity</span>
                      <span className="text-orange-400">{Math.round(props.shadowOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={props.shadowOpacity}
                      onChange={(e) => handlePropChange('shadowOpacity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {props.shadowOpacity > 0 && (
                    <>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Shadow Radius</label>
                        <input
                          type="number"
                          value={props.shadowRadius}
                          onChange={(e) => handlePropChange('shadowRadius', parseInt(e.target.value) || 0)}
                          className="input-field text-sm py-1.5"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Shadow Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={props.shadowColor || '#000000'}
                            onChange={(e) => handlePropChange('shadowColor', e.target.value)}
                            className="w-12 h-9 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={props.shadowColor || '#000000'}
                            onChange={(e) => handlePropChange('shadowColor', e.target.value)}
                            className="input-field text-sm py-1.5 flex-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Shadow X</label>
                          <input
                            type="number"
                            value={props.shadowOffsetX}
                            onChange={(e) => handlePropChange('shadowOffsetX', parseInt(e.target.value) || 0)}
                            className="input-field text-sm py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Shadow Y</label>
                          <input
                            type="number"
                            value={props.shadowOffsetY}
                            onChange={(e) => handlePropChange('shadowOffsetY', parseInt(e.target.value) || 0)}
                            className="input-field text-sm py-1.5"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-3">
          <button
            onClick={() => toggleSection('properties')}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
          >
            <span>Properties</span>
            {expandedSections.properties ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.properties && (
            <div className="space-y-3">
              {Object.entries(props)
                .filter(([key]) => ![
                  'opacity', 'borderWidth', 'borderColor',
                  'shadowOpacity', 'shadowRadius', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY',
                  'fontFamily', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform',
                  'letterSpacing', 'lineHeight', 'rotation', 'paddingHorizontal', 'paddingVertical',
                  'gradientColors', 'gradientDirection', 'animation', 'animationDuration', 'action',
                  'navigationTarget', 'externalUrl', 'filterBrightness', 'filterContrast', 'filterSaturation',
                  'filterBlur', 'filterGrayscale', 'filterSepia'
                ].includes(key))
                .map(([key, value]) => (
                  <div key={key}>{renderPropertyInput(key, value)}</div>
                ))}
            </div>
          )}
        </div>

        {props.gradientColors !== undefined && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('gradient')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Gradient</span>
              {expandedSections.gradient ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.gradient && (
              <div className="space-y-3">
                {renderPropertyInput('gradientColors', props.gradientColors)}
                {props.gradientColors && renderPropertyInput('gradientDirection', props.gradientDirection)}
              </div>
            )}
          </div>
        )}

        {(props.filterBrightness !== undefined || props.filterContrast !== undefined) && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('filters')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Image Filters</span>
              {expandedSections.filters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.filters && (
              <div className="space-y-3">
                {props.filterBrightness !== undefined && renderPropertyInput('filterBrightness', props.filterBrightness)}
                {props.filterContrast !== undefined && renderPropertyInput('filterContrast', props.filterContrast)}
                {props.filterSaturation !== undefined && renderPropertyInput('filterSaturation', props.filterSaturation)}
                {props.filterBlur !== undefined && renderPropertyInput('filterBlur', props.filterBlur)}
                {props.filterGrayscale !== undefined && renderPropertyInput('filterGrayscale', props.filterGrayscale)}
                {props.filterSepia !== undefined && renderPropertyInput('filterSepia', props.filterSepia)}
              </div>
            )}
          </div>
        )}

        {props.animation !== undefined && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('animation')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Animation</span>
              {expandedSections.animation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.animation && (
              <div className="space-y-3">
                {renderPropertyInput('animation', props.animation)}
                {props.animation !== 'none' && renderPropertyInput('animationDuration', props.animationDuration)}
              </div>
            )}
          </div>
        )}

        {props.action !== undefined && (
          <div className="glass-card p-3">
            <button
              onClick={() => toggleSection('interactions')}
              className="w-full flex items-center justify-between text-sm font-medium text-white/80 mb-2"
            >
              <span>Interactions</span>
              {expandedSections.interactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.interactions && (
              <div className="space-y-3">
                {renderPropertyInput('action', props.action)}
                {props.action === 'navigate' && props.navigationTarget !== undefined && (
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Screen Name</label>
                    <input
                      type="text"
                      value={props.navigationTarget}
                      onChange={(e) => handlePropChange('navigationTarget', e.target.value)}
                      className="input-field text-sm py-1.5"
                      placeholder="e.g., HomeScreen"
                    />
                  </div>
                )}
                {props.action === 'external' && props.externalUrl !== undefined && (
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">URL</label>
                    <input
                      type="text"
                      value={props.externalUrl}
                      onChange={(e) => handlePropChange('externalUrl', e.target.value)}
                      className="input-field text-sm py-1.5"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
