import { useState, useEffect, useRef } from 'react';
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
  Palette,
  Move,
  Maximize2,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ComponentLibrary, COMPONENT_LIBRARY, ComponentDefinition } from '../components/ComponentLibrary';
import { PropertyEditor } from '../components/PropertyEditor';
import { PresetLibrary } from '../components/PresetLibrary';
import { PreviewModal } from '../components/PreviewModal';
import { AlignmentTools } from '../components/AlignmentTools';
import { ScreenTemplatesNew as ScreenTemplates } from '../components/ScreenTemplatesNew';
import { useHistory } from '../hooks/useHistory';

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
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [clipboard, setClipboard] = useState<Component | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
  const history = useHistory<Component[]>([]);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadScreens();
  }, [projectId]);

  useEffect(() => {
    if (currentScreen) {
      loadComponents(currentScreen.id);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (components.length > 0 && history.state.length === 0) {
      history.reset(components);
    }
  }, [components.length]);

  useEffect(() => {
    if (history.state !== components && history.state.length > 0) {
      setComponents(history.state);
    }
  }, [history.state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
        return;
      }

      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        if (history.canUndo) history.undo();
        return;
      }

      if ((e.key === 'z' && e.shiftKey && (e.metaKey || e.ctrlKey)) || (e.key === 'y' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        if (history.canRedo) history.redo();
        return;
      }

      if (e.key === 'c' && (e.metaKey || e.ctrlKey) && selectedComponent) {
        e.preventDefault();
        setClipboard(selectedComponent);
        return;
      }

      if (e.key === 'v' && (e.metaKey || e.ctrlKey) && clipboard) {
        e.preventDefault();
        handlePaste();
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

  const handleLayerUp = async (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index < components.length - 1) {
      const newComponents = [...components];
      const temp = newComponents[index + 1];
      newComponents[index + 1] = newComponents[index];
      newComponents[index] = temp;

      for (let i = 0; i < newComponents.length; i++) {
        await supabase
          .from('app_components')
          .update({ layer_order: i })
          .eq('id', newComponents[i].id);
        newComponents[i].layer_order = i;
      }

      setComponents(newComponents);
    }
  };

  const handleLayerDown = async (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index > 0) {
      const newComponents = [...components];
      const temp = newComponents[index - 1];
      newComponents[index - 1] = newComponents[index];
      newComponents[index] = temp;

      for (let i = 0; i < newComponents.length; i++) {
        await supabase
          .from('app_components')
          .update({ layer_order: i })
          .eq('id', newComponents[i].id);
        newComponents[i].layer_order = i;
      }

      setComponents(newComponents);
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

  const handleBackgroundColorChange = async (color: string) => {
    if (!currentScreen) return;

    try {
      const { error } = await supabase
        .from('app_screens')
        .update({ background_color: color })
        .eq('id', currentScreen.id);

      if (error) throw error;

      setCurrentScreen({ ...currentScreen, background_color: color });
      setScreens(screens.map(s => s.id === currentScreen.id ? { ...s, background_color: color } : s));
    } catch (error) {
      console.error('Error updating background color:', error);
    }
  };

  const loadAllComponentsForPreview = async () => {
    try {
      const screenIds = screens.map(s => s.id);
      const { data, error } = await supabase
        .from('app_components')
        .select('*')
        .in('screen_id', screenIds)
        .order('layer_order');

      if (error) throw error;
      setAllComponents(data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading components for preview:', error);
    }
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

  const handlePaste = async () => {
    if (!clipboard || !currentScreen) return;

    try {
      const { data, error } = await supabase
        .from('app_components')
        .insert({
          screen_id: currentScreen.id,
          component_type: clipboard.component_type,
          props: clipboard.props,
          styles: clipboard.styles,
          position_x: clipboard.position_x + 20,
          position_y: clipboard.position_y + 20,
          width: clipboard.width,
          height: clipboard.height,
          layer_order: components.length,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newComponents = [...components, data];
        setComponents(newComponents);
        history.set(newComponents);
        setSelectedComponent(data);
        setShowPropertyEditor(true);
      }
    } catch (error) {
      console.error('Error pasting component:', error);
    }
  };

  const handleAlign = async (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'horizontal' | 'vertical') => {
    if (!selectedComponent) return;

    let updates: any = {};

    switch (type) {
      case 'left':
        updates.position_x = 0;
        break;
      case 'center':
        updates.position_x = Math.round(187.5 - selectedComponent.width / 2);
        break;
      case 'right':
        updates.position_x = 375 - selectedComponent.width;
        break;
      case 'top':
        updates.position_y = 0;
        break;
      case 'middle':
        updates.position_y = Math.round(333.5 - selectedComponent.height / 2);
        break;
      case 'bottom':
        updates.position_y = 667 - selectedComponent.height;
        break;
      case 'horizontal':
        updates.position_x = Math.round(187.5 - selectedComponent.width / 2);
        break;
      case 'vertical':
        updates.position_y = Math.round(333.5 - selectedComponent.height / 2);
        break;
    }

    if (Object.keys(updates).length > 0) {
      const newComponents = components.map(c =>
        c.id === selectedComponent.id ? { ...c, ...updates } : c
      );
      setComponents(newComponents);
      history.set(newComponents);
      await handleUpdateComponent(selectedComponent.id, updates, {});
    }
  };

  const handleApplyTemplate = async (template: any) => {
    if (!currentScreen) return;

    try {
      await supabase.from('app_components').delete().eq('screen_id', currentScreen.id);

      for (let i = 0; i < template.components.length; i++) {
        const comp = template.components[i];
        await supabase.from('app_components').insert({
          screen_id: currentScreen.id,
          component_type: comp.type,
          props: comp.props,
          styles: {},
          position_x: comp.position_x,
          position_y: comp.position_y,
          width: comp.width,
          height: comp.height,
          layer_order: i,
        });
      }

      await loadComponents(currentScreen.id);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleDoubleClick = (component: Component) => {
    if (component.component_type === 'text' || component.component_type === 'button') {
      const textKey = component.component_type === 'button' ? 'text' : 'text';
      setEditingText(component.id);
      setEditingValue(component.props[textKey] || '');
      setTimeout(() => textInputRef.current?.focus(), 0);
    }
  };

  const handleTextEdit = async (componentId: string, newText: string) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const textKey = component.component_type === 'button' ? 'text' : 'text';
    const newProps = { ...component.props, [textKey]: newText };

    const newComponents = components.map(c =>
      c.id === componentId ? { ...c, props: newProps } : c
    );
    setComponents(newComponents);
    history.set(newComponents);

    await handleUpdateComponent(componentId, newProps, {});
    setEditingText(null);
  };

  const handleMouseDown = (e: React.MouseEvent, component: Component) => {
    e.stopPropagation();
    e.preventDefault();

    setMouseDownTime(Date.now());
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setSelectedComponent(component);
    setShowPropertyEditor(true);

    setDragging({
      id: component.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: component.position_x,
      offsetY: component.position_y,
    });
    setIsDragging(false);
    setDragThreshold(false);
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

            const snapThreshold = 5;
            const guides: { x?: number; y?: number } = {};

            const centerX = 187.5;
            if (Math.abs(newX + component.width / 2 - centerX) < snapThreshold) {
              newX = centerX - component.width / 2;
              guides.x = centerX;
            } else if (Math.abs(newX) < snapThreshold) {
              newX = 0;
              guides.x = 0;
            } else if (Math.abs(newX + component.width - 375) < snapThreshold) {
              newX = 375 - component.width;
              guides.x = 375;
            }

            if (Math.abs(newY) < snapThreshold) {
              newY = 0;
              guides.y = 0;
            } else if (Math.abs(newY + component.height - 667) < snapThreshold) {
              newY = 667 - component.height;
              guides.y = 667;
            }

            setSnapGuides(guides);
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

    const handleMouseUp = async (e: MouseEvent) => {
      const timeDiff = Date.now() - mouseDownTime;
      const distDiff = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );

      if (dragging) {
        if (dragThreshold) {
          const component = components.find((c) => c.id === dragging.id);
          if (component) {
            history.set(components);
            await handleUpdateComponent(component.id, {
              position_x: component.position_x,
              position_y: component.position_y,
            }, {});
          }
        } else if (timeDiff < 300 && distDiff < 5) {
          if (selectedComponent) {
            handleDoubleClick(selectedComponent);
          }
        }
        setDragging(null);
        setIsDragging(false);
        setDragThreshold(false);
        setSnapGuides({});
      } else if (resizing) {
        const component = components.find((c) => c.id === resizing.id);
        if (component) {
          history.set(components);
          await handleUpdateComponent(component.id, {
            width: component.width,
            height: component.height,
            position_x: component.position_x,
            position_y: component.position_y,
          }, {});
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
            onDoubleClick={() => handleDoubleClick(component)}
            title="Double-click to edit text"
          >
            {resizeHandles}
            <p
              style={{
                fontSize: `${component.props.fontSize}px`,
                color: component.props.color,
                fontWeight: component.props.fontWeight,
                textAlign: component.props.textAlign,
                margin: 0,
                pointerEvents: 'none',
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
            onDoubleClick={() => handleDoubleClick(component)}
            title="Double-click to edit text"
          >
            {resizeHandles}
            <button
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: component.props.backgroundColor || '#FF9500',
                color: component.props.textColor || '#FFFFFF',
                fontSize: `${component.props.fontSize || 16}px`,
                borderRadius: `${component.props.borderRadius || 8}px`,
                border: 'none',
                cursor: 'move',
                fontWeight: '600',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {component.props.text || 'Button'}
            </button>
          </div>
        );

      case 'input':
        return (
          <div
            key={component.id}
            style={baseStyle}
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
            onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
            className="glass-button p-2 relative"
            title="Change Background"
          >
            <Palette className="w-4 h-4" />
            {currentScreen && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: currentScreen.background_color }}
              />
            )}
          </button>
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => history.undo()}
            disabled={!history.canUndo}
            className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => history.redo()}
            disabled={!history.canRedo}
            className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => selectedComponent && setClipboard(selectedComponent)}
            disabled={!selectedComponent}
            className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Copy (Cmd+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handlePaste}
            disabled={!clipboard}
            className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Paste (Cmd+V)"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-white/10" />
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
          <button onClick={loadAllComponentsForPreview} className="glass-button p-2">
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

            <button
              onClick={() => setShowTemplates(true)}
              className="accent-button px-3 py-2"
            >
              <Sparkles className="w-4 h-4 mr-1.5 inline-block" />
              <span className="text-sm">Templates</span>
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

                {snapGuides.x !== undefined && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-orange-500 pointer-events-none z-[999]"
                    style={{ left: `${snapGuides.x}px` }}
                  />
                )}
                {snapGuides.y !== undefined && (
                  <div
                    className="absolute left-0 right-0 h-px bg-orange-500 pointer-events-none z-[999]"
                    style={{ top: `${snapGuides.y}px` }}
                  />
                )}

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
          <div className="hidden md:block md:w-80 glass-card border-l border-white/10 overflow-y-auto">
            <div className="p-4 space-y-4">
              <AlignmentTools
                onAlign={handleAlign}
                disabled={false}
              />
            </div>
            <PropertyEditor
              component={selectedComponent}
              onUpdate={handleUpdateComponent}
              onDelete={handleDeleteComponent}
              onDuplicate={handleDuplicateComponent}
              onLayerUp={handleLayerUp}
              onLayerDown={handleLayerDown}
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
                onLayerUp={handleLayerUp}
                onLayerDown={handleLayerDown}
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

      {showBackgroundPicker && currentScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Screen Background</h2>
              <button onClick={() => setShowBackgroundPicker(false)} className="glass-button p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Background Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={currentScreen.background_color}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="w-16 h-16 rounded-lg border-2 border-white/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentScreen.background_color}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="input-field w-full mb-2"
                      placeholder="#000000"
                    />
                    <p className="text-xs text-white/60">Enter a hex color code or use the picker</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 mb-2 block">Quick Colors</label>
                <div className="grid grid-cols-6 gap-2">
                  {['#000000', '#FFFFFF', '#1F2937', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBackgroundColorChange(color)}
                      className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: currentScreen.background_color === color ? '#FF9500' : 'rgba(255,255,255,0.2)',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {showPreview && currentScreen && (
        <PreviewModal
          screens={screens}
          components={allComponents}
          currentScreenId={currentScreen.id}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showTemplates && (
        <ScreenTemplates
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {editingText && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingText(null)}
          />
          <div className="relative glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Text</h3>
            <input
              ref={textInputRef}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextEdit(editingText, editingValue);
                } else if (e.key === 'Escape') {
                  setEditingText(null);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
              placeholder="Enter text..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleTextEdit(editingText, editingValue)}
                className="accent-button flex-1 py-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditingText(null)}
                className="glass-button flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
