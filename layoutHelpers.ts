export interface LayoutConstraints {
  top?: number | 'auto';
  bottom?: number | 'auto';
  left?: number | 'auto';
  right?: number | 'auto';
  width?: number | 'auto' | 'fill';
  height?: number | 'auto' | 'fill';
  aspectRatio?: number;
}

export interface FlexboxProps {
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number;
  padding?: number;
  wrap?: boolean;
}

export interface ResponsiveBreakpoints {
  xs: number; // 0-375 (small phones)
  sm: number; // 376-667 (phones)
  md: number; // 668-768 (large phones/small tablets)
  lg: number; // 769-1024 (tablets)
  xl: number; // 1025+ (large tablets/desktop)
}

export const defaultBreakpoints: ResponsiveBreakpoints = {
  xs: 375,
  sm: 667,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function createFlexboxLayout(
  components: any[],
  props: FlexboxProps
): any[] {
  const {
    flexDirection = 'column',
    justifyContent = 'flex-start',
    alignItems = 'flex-start',
    gap = 8,
    padding = 0,
    wrap = false,
  } = props;

  if (components.length === 0) return components;

  const containerWidth = 375 - padding * 2;
  const containerHeight = 812 - padding * 2;

  let currentX = padding;
  let currentY = padding;
  let maxWidth = 0;
  let maxHeight = 0;

  const positioned = components.map((comp, index) => {
    const newComp = { ...comp };

    if (flexDirection === 'row') {
      // Horizontal layout
      if (wrap && currentX + comp.width > containerWidth + padding) {
        currentX = padding;
        currentY += maxHeight + gap;
        maxHeight = 0;
      }

      newComp.position_x = currentX;
      newComp.position_y = currentY;

      currentX += comp.width + gap;
      maxHeight = Math.max(maxHeight, comp.height);
    } else {
      // Vertical layout
      newComp.position_x = currentX;
      newComp.position_y = currentY;

      currentY += comp.height + gap;
      maxWidth = Math.max(maxWidth, comp.width);
    }

    return newComp;
  });

  // Apply justifyContent
  if (flexDirection === 'column' && justifyContent !== 'flex-start') {
    const totalHeight = positioned[positioned.length - 1].position_y + positioned[positioned.length - 1].height - padding;
    const remainingSpace = containerHeight - totalHeight;

    positioned.forEach((comp, index) => {
      switch (justifyContent) {
        case 'flex-end':
          comp.position_y += remainingSpace;
          break;
        case 'center':
          comp.position_y += remainingSpace / 2;
          break;
        case 'space-between':
          if (positioned.length > 1) {
            comp.position_y = padding + index * (containerHeight / (positioned.length - 1));
          }
          break;
        case 'space-around':
          const spaceAround = remainingSpace / positioned.length;
          comp.position_y += spaceAround * (index + 0.5);
          break;
        case 'space-evenly':
          const spaceEvenly = remainingSpace / (positioned.length + 1);
          comp.position_y += spaceEvenly * (index + 1);
          break;
      }
    });
  }

  // Apply alignItems
  positioned.forEach(comp => {
    if (flexDirection === 'column') {
      switch (alignItems) {
        case 'center':
          comp.position_x = padding + (containerWidth - comp.width) / 2;
          break;
        case 'flex-end':
          comp.position_x = containerWidth + padding - comp.width;
          break;
        case 'stretch':
          comp.width = containerWidth;
          comp.position_x = padding;
          break;
      }
    }
  });

  return positioned;
}

export function createGridLayout(
  components: any[],
  columns: number,
  gap: number = 16,
  padding: number = 20
): any[] {
  if (components.length === 0) return components;

  const containerWidth = 375 - padding * 2;
  const columnWidth = (containerWidth - gap * (columns - 1)) / columns;

  return components.map((comp, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    return {
      ...comp,
      position_x: padding + col * (columnWidth + gap),
      position_y: padding + row * (comp.height + gap),
      width: columnWidth,
    };
  });
}

export function stackComponents(
  components: any[],
  direction: 'vertical' | 'horizontal',
  spacing: number = 16,
  startX: number = 20,
  startY: number = 20
): any[] {
  if (components.length === 0) return components;

  let currentX = startX;
  let currentY = startY;

  return components.map(comp => {
    const positioned = {
      ...comp,
      position_x: currentX,
      position_y: currentY,
    };

    if (direction === 'vertical') {
      currentY += comp.height + spacing;
    } else {
      currentX += comp.width + spacing;
    }

    return positioned;
  });
}

export function centerComponent(
  component: any,
  containerWidth: number = 375,
  containerHeight: number = 812
): any {
  return {
    ...component,
    position_x: (containerWidth - component.width) / 2,
    position_y: (containerHeight - component.height) / 2,
  };
}

export function pinToEdge(
  component: any,
  edge: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  margin: number = 20,
  containerWidth: number = 375,
  containerHeight: number = 812
): any {
  const positioned = { ...component };

  switch (edge) {
    case 'top':
      positioned.position_x = (containerWidth - component.width) / 2;
      positioned.position_y = margin;
      break;
    case 'bottom':
      positioned.position_x = (containerWidth - component.width) / 2;
      positioned.position_y = containerHeight - component.height - margin;
      break;
    case 'left':
      positioned.position_x = margin;
      positioned.position_y = (containerHeight - component.height) / 2;
      break;
    case 'right':
      positioned.position_x = containerWidth - component.width - margin;
      positioned.position_y = (containerHeight - component.height) / 2;
      break;
    case 'top-left':
      positioned.position_x = margin;
      positioned.position_y = margin;
      break;
    case 'top-right':
      positioned.position_x = containerWidth - component.width - margin;
      positioned.position_y = margin;
      break;
    case 'bottom-left':
      positioned.position_x = margin;
      positioned.position_y = containerHeight - component.height - margin;
      break;
    case 'bottom-right':
      positioned.position_x = containerWidth - component.width - margin;
      positioned.position_y = containerHeight - component.height - margin;
      break;
  }

  return positioned;
}

export function responsiveResize(
  component: any,
  currentBreakpoint: keyof ResponsiveBreakpoints,
  targetBreakpoint: keyof ResponsiveBreakpoints
): any {
  const scale = defaultBreakpoints[targetBreakpoint] / defaultBreakpoints[currentBreakpoint];

  return {
    ...component,
    position_x: component.position_x * scale,
    position_y: component.position_y * scale,
    width: component.width * scale,
    height: component.height * scale,
    props: {
      ...component.props,
      fontSize: component.props?.fontSize ? Math.round(component.props.fontSize * scale) : undefined,
    },
  };
}

export function createMasonryLayout(
  components: any[],
  columns: number = 2,
  gap: number = 16,
  padding: number = 20
): any[] {
  if (components.length === 0) return components;

  const containerWidth = 375 - padding * 2;
  const columnWidth = (containerWidth - gap * (columns - 1)) / columns;

  // Track the height of each column
  const columnHeights = new Array(columns).fill(padding);

  return components.map(comp => {
    // Find the shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

    const positioned = {
      ...comp,
      position_x: padding + shortestColumnIndex * (columnWidth + gap),
      position_y: columnHeights[shortestColumnIndex],
      width: columnWidth,
    };

    // Update column height
    columnHeights[shortestColumnIndex] += comp.height + gap;

    return positioned;
  });
}

export function autoLayout(components: any[], type: 'stack' | 'grid' | 'flex' | 'masonry'): any[] {
  switch (type) {
    case 'stack':
      return stackComponents(components, 'vertical');
    case 'grid':
      return createGridLayout(components, 2);
    case 'flex':
      return createFlexboxLayout(components, { flexDirection: 'column', gap: 16 });
    case 'masonry':
      return createMasonryLayout(components);
    default:
      return components;
  }
}

export function maintainAspectRatio(width: number, height: number, newWidth?: number, newHeight?: number): { width: number; height: number } {
  const aspectRatio = width / height;

  if (newWidth) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  return { width, height };
}

export function optimizeForMobile(components: any[]): any[] {
  return components.map(comp => {
    const optimized = { ...comp };

    // Ensure minimum tap targets
    if (['button', 'input', 'switch', 'checkbox'].includes(comp.component_type)) {
      if (comp.width < 44) optimized.width = 44;
      if (comp.height < 44) optimized.height = 44;
    }

    // Optimize font sizes for readability
    if (comp.props?.fontSize) {
      if (comp.props.fontSize < 12) {
        optimized.props = { ...optimized.props, fontSize: 12 };
      }
    }

    // Add adequate spacing
    if (comp.props?.padding && comp.props.padding < 12) {
      optimized.props = { ...optimized.props, padding: 12 };
    }

    return optimized;
  });
}
