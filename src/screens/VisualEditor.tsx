import { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Save,
  Download,
  Smartphone,
  ChevronLeft,
  Settings,
  Layers,
  X,
  Zap,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ComponentLibrary, COMPONENT_LIBRARY, ComponentDefinition } from '../components/ComponentLibrary';
import { PropertyEditor } from '../components/PropertyEditor';
import { PresetLibrary } from '../components/PresetLibrary';

interface VisualEditorProps {
  projectId: string;
  onBack: () => void;
  onPreview: () => void;
  onExport: () => void;
  onShowUpgrade?: () => void;
}

interface Screen {
  id: string;
  name: string;
  screen_type: string;
  background_color: string;
  order_index: number;
  is_home_screen: boolean;
}

interface Component {
  id: string;
  component_type: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  layer_order: number;
}

export function VisualEditor({ projectId, onBack, onPreview, onExport, onShowUpgrade }: VisualEditorProps) {
  const { user } = useAuth();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(true);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [showPresetLibrary, setShowPresetLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number; handle: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragThreshold, setDragThreshold] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    loadScreens();
  }, [projectId]);

  useEffect(() => {
    if (currentScreen) {
      loadComponents(currentScreen.id);
    }
  }, [currentScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
        return;
      }

      if (!selectedComponent) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleDeleteComponent(selectedComponent.id);
      }

      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleDuplicateComponent(selectedComponent.id);
      }

      if (e.key === 'Escape') {
        setSelectedComponent(null);
        setShowPropertyEditor(false);
      }

      const step = e.shiftKey ? 10 : 1;
      let updates: any = {};

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          updates = { position_y: Math.max(0, selectedComponent.position_y - step) };
          break;
        case 'ArrowDown':
          e.preventDefault();
          updates = { position_y: Math.min(667 - selectedComponent.height, selectedComponent.position_y + step) };
          break;
        case 'ArrowLeft':
          e.preventDefault();
          updates = { position_x: Math.max(0, selectedComponent.position_x - step) };
          break;
        case 'ArrowRight':
          e.preventDefault();
          updates = { position_x: Math.min(375 - selectedComponent.width, selectedComponent.position_x + step) };
          break;
      }

      if (Object.keys(updates).length > 0) {
        setComponents(prev =>
          prev.map(c => c.id === selectedComponent.id ? { ...c, ...updates } : c)
        );
        handleUpdateComponent(selectedComponent.id, updates);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, components]);

  const loadScreens = async () => {
    try {
      const { data, error } = await supabase
        .from('app_screens')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (error) throw error;

      if (data && data.length > 0) {
        setScreens(data);
        setCurrentScreen(data[0]);
      } else {
        await createDefaultScreen();
      }
    } catch (error) {
      console.error('Error loading screens:', error);
    }
  };

  const createDefaultScreen = async () => {
    try {
      const { data, error } = await supabase
        .from('app_screens')
        .insert({
          project_id: projectId,
          name: 'Home',
          screen_type: 'home',
          background_color: '#000000',
          is_home_screen: true,
          order_index: 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setScreens([data]);
        setCurrentScreen(data);
      }
    } catch (error) {
      console.error('Error creating default screen:', error);
    }
  };

  const loadComponents = async (screenId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_components')
        .select('*')
        .eq('screen_id', screenId)
        .order('layer_order');

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const handleAddComponent = async (componentDef: ComponentDefinition) => {
    if (!currentScreen) return;

    const centerX = 187 - componentDef.defaultWidth / 2;
    const centerY = 100;

    try {
      const { data, error } = await supabase
        .from('app_components')
        .insert({
          screen_id: currentScreen.id,
          component_type: componentDef.type,
          props: componentDef.defaultProps,
          styles: componentDef.defaultStyles,
          position_x: centerX,
          position_y: centerY,
          width: componentDef.defaultWidth,
          height: componentDef.defaultHeight,
          layer_order: components.length,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setComponents([...components, data]);
        setSelectedComponent(data);
        setShowPropertyEditor(true);
      }
    } catch (error) {
      console.error('Error adding component:', error);
    }
  };

  const handleUpdateComponent = async (
    id: string,
    props: any,
    styles: any
  ) => {
    try {
      const updates: any = { props, styles };

      if (props.position_x !== undefined) {
        updates.position_x = props.position_x;
        updates.position_y = props.position_y;
        delete props.position_x;
        delete props.position_y;
      }

      if (props.width !== undefined) {
        updates.width = props.width;
        updates.height = props.height;
        delete props.width;
        delete props.height;
      }

      const { error } = await supabase
        .from('app_components')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setComponents(
        components.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        )
      );

      if (selectedComponent?.id === id) {
        setSelectedComponent({ ...selectedComponent, ...updates });
      }
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const handleDeleteComponent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('app_components')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComponents(components.filter((c) => c.id !== id));
      setSelectedComponent(null);
      setShowPropertyEditor(false);
    } catch (error) {
      console.error('Error deleting component:', error);
    }
  };

  const handleDuplicateComponent = async (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component || !currentScreen) return;

    try {
      const { data, error } = await supabase
        .from('app_components')
        .insert({
          screen_id: currentScreen.id,
          component_type: component.component_type,
          props: component.props,
          styles: component.styles,
          position_x: component.position_x + 20,
          position_y: component.position_y + 20,
          width: component.width,
          height: component.height,
          layer_order: components.length,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setComponents([...components, data]);
      }
    } catch (error) {
      console.error('Error duplicating component:', error);
    }
  };

  const handleAddScreen = async () => {
    try {
      const { data, error } = await supabase
        .from('app_screens')
        .insert({
          project_id: projectId,
          name: `Screen ${screens.length + 1}`,
          screen_type: 'custom',
          background_color: '#000000',
          order_index: screens.length,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setScreens([...screens, data]);
        setCurrentScreen(data);
      }
    } catch (error) {
      console.error('Error adding screen:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleApplyPreset = async (preset: any) => {
    if (!currentScreen) return;

    try {
      for (const comp of preset.preset_data.components) {
        await supabase.from('app_components').insert({
          screen_id: currentScreen.id,
          component_type: comp.type,
          props: comp.props,
          styles: {},
          position_x: comp.position_x,
          position_y: comp.position_y,
          width: comp.width,
          height: comp.height,
          layer_order: components.length,
        });
      }

      await loadComponents(currentScreen.id);
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, component: Component) => {
    e.stopPropagation();
    e.preventDefault();

    setDragging({
      id: component.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: component.position_x,
      offsetY: component.position_y,
    });
    setIsDragging(false);
    setDragThreshold(false);
    setSelectedComponent(component);
    setShowPropertyEditor(true);
  };

  const handleResizeStart = (e: React.MouseEvent, component: Component, handle: string) => {
    e.stopPropagation();
    e.preventDefault();

    setResizing({
      id: component.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: component.width,
      startHeight: component.height,
      handle,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const deltaX = e.clientX - dragging.startX;
        const deltaY = e.clientY - dragging.startY;

        if (!dragThreshold && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
          setDragThreshold(true);
          setIsDragging(true);
        }

        if (dragThreshold) {
          const canvasRect = document.querySelector('[data-canvas]')?.getBoundingClientRect();
          if (!canvasRect) return;

          let newX = dragging.offsetX + deltaX;
          let newY = dragging.offsetY + deltaY;

          const component = components.find(c => c.id === dragging.id);
          if (component) {
            newX = Math.max(0, Math.min(375 - component.width, newX));
            newY = Math.max(0, Math.min(667 - component.height, newY));
          }

          setComponents((prev) =>
            prev.map((c) =>
              c.id === dragging.id
                ? { ...c, position_x: Math.round(newX), position_y: Math.round(newY) }
                : c
            )
          );
        }
      } else if (resizing) {
        const deltaX = e.clientX - resizing.startX;
        const deltaY = e.clientY - resizing.startY;

        const component = components.find(c => c.id === resizing.id);
        if (!component) return;

        let newWidth = resizing.startWidth;
        let newHeight = resizing.startHeight;
        let newX = component.position_x;
        let newY = component.position_y;

        if (resizing.handle.includes('e')) {
          newWidth = Math.max(30, Math.min(375 - component.position_x, resizing.startWidth + deltaX));
        }
        if (resizing.handle.includes('w')) {
          const widthDiff = Math.min(deltaX, resizing.startWidth - 30);
          newWidth = resizing.startWidth - widthDiff;
          newX = component.position_x + widthDiff;
        }
        if (resizing.handle.includes('s')) {
          newHeight = Math.max(20, Math.min(667 - component.position_y, resizing.startHeight + deltaY));
        }
        if (resizing.handle.includes('n')) {
          const heightDiff = Math.min(deltaY, resizing.startHeight - 20);
          newHeight = resizing.startHeight - heightDiff;
          newY = component.position_y + heightDiff;
        }

        setComponents((prev) =>
          prev.map((c) =>
            c.id === resizing.id
              ? {
                  ...c,
                  width: Math.round(newWidth),
                  height: Math.round(newHeight),
                  position_x: Math.round(newX),
                  position_y: Math.round(newY)
                }
              : c
          )
        );
      }
    };

    const handleMouseUp = async () => {
      if (dragging) {
        if (dragThreshold) {
          const component = components.find((c) => c.id === dragging.id);
          if (component) {
            await handleUpdateComponent(component.id, {
              position_x: component.position_x,
              position_y: component.position_y,
            });
          }
        }
        setDragging(null);
        setIsDragging(false);
        setDragThreshold(false);
      } else if (resizing) {
        const component = components.find((c) => c.id === resizing.id);
        if (component) {
          await handleUpdateComponent(component.id, {
            width: component.width,
            height: component.height,
            position_x: component.position_x,
            position_y: component.position_y,
          });
        }
        setResizing(null);
      }
    };

    if (dragging || resizing) {
      document.body.style.cursor = dragging ? 'grabbing' : 'inherit';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.body.style.cursor = 'inherit';
        document.body.style.userSelect = 'inherit';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing, components, dragThreshold]);

  const renderComponent = (component: Component) => {
    const isSelected = selectedComponent?.id === component.id;
    const isBeingDragged = dragging?.id === component.id && isDragging;
    const baseStyle = {
      position: 'absolute' as const,
      left: `${component.position_x}px`,
      top: `${component.position_y}px`,
      width: `${component.width}px`,
      height: `${component.height}px`,
      cursor: dragging?.id === component.id ? 'grabbing' : 'move',
      border: isSelected ? '2px solid #FF9500' : '2px solid transparent',
      transition: isBeingDragged ? 'none' : 'all 0.15s ease',
      userSelect: 'none' as const,
      boxShadow: isSelected
        ? '0 0 0 1px rgba(255, 149, 0, 0.3), 0 4px 12px rgba(255, 149, 0, 0.2)'
        : isBeingDragged
        ? '0 8px 24px rgba(0, 0, 0, 0.3)'
        : 'none',
      opacity: isBeingDragged ? 0.9 : 1,
      zIndex: isSelected || isBeingDragged ? 1000 : 1,
    };

    const resizeHandleStyle = {
      position: 'absolute' as const,
      width: 10,
      height: 10,
      backgroundColor: '#FF9500',
      border: '2px solid white',
      borderRadius: '50%',
      zIndex: 10001,
      transition: 'all 0.15s ease',
    };

    const resizeHandles = isSelected && !isBeingDragged ? (
      <>
        <div
          style={{
            ...resizeHandleStyle,
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'ew-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'e')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            left: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'ew-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'w')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'ns-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 's')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            top: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'ns-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'n')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            right: -5,
            bottom: -5,
            cursor: 'nwse-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'se')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            left: -5,
            top: -5,
            cursor: 'nwse-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'nw')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            right: -5,
            top: -5,
            cursor: 'nesw-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'ne')}
        />
        <div
          style={{
            ...resizeHandleStyle,
            left: -5,
            bottom: -5,
            cursor: 'nesw-resize',
          }}
          onMouseDown={(e) => handleResizeStart(e, component, 'sw')}
        />
      </>
    ) : null;

    switch (component.component_type) {
      case 'text':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            <p
              style={{
                fontSize: `${component.props.fontSize}px`,
                color: component.props.color,
                fontWeight: component.props.fontWeight,
                textAlign: component.props.textAlign,
                margin: 0,
              }}
            >
              {component.props.text}
            </p>
          </div>
        );

      case 'button':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            <button
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: component.props.backgroundColor,
                color: component.props.textColor,
                fontSize: `${component.props.fontSize}px`,
                borderRadius: `${component.props.borderRadius}px`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                pointerEvents: 'none',
              }}
            >
              {component.props.text}
            </button>
          </div>
        );

      case 'input':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            <input
              type="text"
              placeholder={component.props.placeholder}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: component.props.backgroundColor,
                color: component.props.textColor,
                border: `1px solid ${component.props.borderColor}`,
                borderRadius: `${component.props.borderRadius}px`,
                padding: '0 12px',
                fontSize: '14px',
                outline: 'none',
                pointerEvents: 'none',
              }}
              readOnly
            />
          </div>
        );

      case 'image':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            <img
              src={component.props.source}
              alt="Component"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: `${component.props.borderRadius}px`,
                pointerEvents: 'none',
              }}
            />
          </div>
        );

      case 'container':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              borderRadius: `${component.props.borderRadius}px`,
              border: `${component.props.borderWidth}px solid ${component.props.borderColor}`,
              padding: `${component.props.padding}px`,
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
          </div>
        );

      case 'list':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              gap: `${component.props.spacing}px`,
              overflow: 'hidden',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            {Array.from({ length: component.props.itemCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: `${component.props.itemHeight}px`,
                  backgroundColor: component.props.itemBackgroundColor,
                  borderRadius: `${component.props.itemBorderRadius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>List Item {i + 1}</span>
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              borderRadius: `${component.props.borderRadius}px`,
              padding: `${component.props.padding}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF', pointerEvents: 'none' }}>
              {component.props.title}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#FFFFFF99', pointerEvents: 'none' }}>
              {component.props.subtitle}
            </p>
          </div>
        );

      case 'header':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
            }}
            onMouseDown={(e) => handleMouseDown(e, component)}
          >
            {resizeHandles}
            {component.props.showBackButton && (
              <button style={{ marginRight: '12px', background: 'none', border: 'none', color: '#FF9500', fontSize: '20px', cursor: 'pointer', pointerEvents: 'none' }}>
                ←
              </button>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: `${component.props.fontSize}px`,
                fontWeight: component.props.fontWeight,
                color: component.props.textColor,
                pointerEvents: 'none',
              }}
            >
              {component.props.title}
            </h3>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A]">
      <div className="glass-card p-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="glass-button p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-sm">Visual Editor</h2>
            {currentScreen && (
              <p className="text-xs text-white/60">{currentScreen.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="glass-button p-2"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {onShowUpgrade && (
            <button
              onClick={onShowUpgrade}
              className="glass-button p-2"
            >
              <Zap className="w-4 h-4 text-orange-500" />
            </button>
          )}
          <button
            onClick={handleSave}
            className="glass-button p-2"
            disabled={saving}
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
          </button>
          <button onClick={onPreview} className="glass-button p-2">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onExport} className="accent-button p-2">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showComponentLibrary && (
          <div className="hidden md:block md:w-64 glass-card border-r border-white/10">
            <ComponentLibrary onSelectComponent={handleAddComponent} />
          </div>
        )}

        <div className="flex-1 flex flex-col items-center overflow-auto bg-[#0A0A0A] p-4 md:p-8">
          <div className="mb-4 flex gap-2 items-center flex-wrap justify-center">
            <button
              onClick={() => setShowComponentLibrary(!showComponentLibrary)}
              className="glass-button p-2"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowPresetLibrary(true)}
              className="glass-button px-3 py-2"
            >
              <Sparkles className="w-4 h-4 mr-1.5 inline-block" />
              <span className="text-sm">Presets</span>
            </button>

            {screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentScreen?.id === screen.id
                    ? 'bg-orange-500 text-white'
                    : 'glass-button'
                }`}
              >
                {screen.name}
              </button>
            ))}

            <button
              onClick={handleAddScreen}
              className="glass-button p-1.5"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {currentScreen && (
            <div
              className="relative border-4 md:border-8 border-gray-800 rounded-[40px] shadow-2xl"
              style={{
                width: '100%',
                maxWidth: '375px',
                height: '667px',
                backgroundColor: currentScreen.background_color,
                overflow: 'hidden',
              }}
              onClick={() => {
                setSelectedComponent(null);
                setShowPropertyEditor(false);
              }}
            >
              <div className="w-full h-full relative" data-canvas>
                {components.map(renderComponent)}

                {components.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Smartphone className="w-12 h-12 text-white/20 mx-auto" />
                      <p className="text-white/40 text-sm">
                        Click components to add them
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showPropertyEditor && selectedComponent && (
          <div className="hidden md:block md:w-80 glass-card border-l border-white/10">
            <PropertyEditor
              component={selectedComponent}
              onUpdate={handleUpdateComponent}
              onDelete={handleDeleteComponent}
              onDuplicate={handleDuplicateComponent}
            />
          </div>
        )}
      </div>

      {showComponentLibrary && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full glass-card rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Components</h3>
              <button
                onClick={() => setShowComponentLibrary(false)}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <ComponentLibrary onSelectComponent={(comp) => {
                handleAddComponent(comp);
                setShowComponentLibrary(false);
              }} />
            </div>
          </div>
        </div>
      )}

      {showPropertyEditor && selectedComponent && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full glass-card rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Properties</h3>
              <button
                onClick={() => {
                  setShowPropertyEditor(false);
                  setSelectedComponent(null);
                }}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <PropertyEditor
                component={selectedComponent}
                onUpdate={handleUpdateComponent}
                onDelete={(id) => {
                  handleDeleteComponent(id);
                  setShowPropertyEditor(false);
                }}
                onDuplicate={(id) => {
                  handleDuplicateComponent(id);
                  setShowPropertyEditor(false);
                }}
                onClose={() => {
                  setShowPropertyEditor(false);
                  setSelectedComponent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showPresetLibrary && (
        <PresetLibrary
          onApplyPreset={handleApplyPreset}
          onClose={() => setShowPresetLibrary(false)}
          onShowUpgrade={onShowUpgrade || (() => {})}
        />
      )}

      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              <button onClick={() => setShowKeyboardShortcuts(false)} className="glass-button p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Move component</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Arrow Keys</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Move faster</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Shift + Arrows</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Delete component</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Delete / Backspace</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Duplicate component</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Cmd/Ctrl + D</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Deselect</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Esc</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm">?</kbd>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold mb-2 text-white/80">Mouse Controls</h3>
                <div className="space-y-2 text-sm text-white/60">
                  <p>• Click to select component</p>
                  <p>• Drag to move component</p>
                  <p>• Drag handles to resize</p>
                  <p>• Click canvas to deselect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
