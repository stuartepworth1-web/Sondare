export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  components: string[];
}

export interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

const SNAP_THRESHOLD = 5;
const CANVAS_WIDTH = 375;

export function calculateSnapPosition(
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  allComponents: any[],
  targetId: string,
  snapToGrid: boolean = true,
  gridSize: number = 8
): SnapResult {
  let snappedX = targetX;
  let snappedY = targetY;
  const guides: AlignmentGuide[] = [];

  const otherComponents = allComponents.filter(c => c.id !== targetId);

  // Snap to grid
  if (snapToGrid) {
    const gridX = Math.round(targetX / gridSize) * gridSize;
    const gridY = Math.round(targetY / gridSize) * gridSize;

    if (Math.abs(targetX - gridX) < SNAP_THRESHOLD) {
      snappedX = gridX;
    }

    if (Math.abs(targetY - gridY) < SNAP_THRESHOLD) {
      snappedY = gridY;
    }
  }

  // Calculate edges
  const targetLeft = snappedX;
  const targetRight = snappedX + targetWidth;
  const targetCenterX = snappedX + targetWidth / 2;
  const targetTop = snappedY;
  const targetBottom = snappedY + targetHeight;
  const targetCenterY = snappedY + targetHeight / 2;

  // Canvas edges
  const canvasEdges = {
    left: 0,
    right: CANVAS_WIDTH,
    centerX: CANVAS_WIDTH / 2,
  };

  // Snap to canvas edges
  if (Math.abs(targetLeft - canvasEdges.left) < SNAP_THRESHOLD) {
    snappedX = canvasEdges.left;
    guides.push({
      type: 'vertical',
      position: canvasEdges.left,
      components: ['canvas'],
    });
  }

  if (Math.abs(targetRight - canvasEdges.right) < SNAP_THRESHOLD) {
    snappedX = canvasEdges.right - targetWidth;
    guides.push({
      type: 'vertical',
      position: canvasEdges.right,
      components: ['canvas'],
    });
  }

  if (Math.abs(targetCenterX - canvasEdges.centerX) < SNAP_THRESHOLD) {
    snappedX = canvasEdges.centerX - targetWidth / 2;
    guides.push({
      type: 'vertical',
      position: canvasEdges.centerX,
      components: ['canvas'],
    });
  }

  // Snap to other components
  for (const comp of otherComponents) {
    const compLeft = comp.position_x;
    const compRight = comp.position_x + comp.width;
    const compCenterX = comp.position_x + comp.width / 2;
    const compTop = comp.position_y;
    const compBottom = comp.position_y + comp.height;
    const compCenterY = comp.position_y + comp.height / 2;

    // Vertical alignment (X axis)
    if (Math.abs(targetLeft - compLeft) < SNAP_THRESHOLD) {
      snappedX = compLeft;
      addOrUpdateGuide(guides, 'vertical', compLeft, comp.id);
    } else if (Math.abs(targetLeft - compRight) < SNAP_THRESHOLD) {
      snappedX = compRight;
      addOrUpdateGuide(guides, 'vertical', compRight, comp.id);
    } else if (Math.abs(targetRight - compLeft) < SNAP_THRESHOLD) {
      snappedX = compLeft - targetWidth;
      addOrUpdateGuide(guides, 'vertical', compLeft, comp.id);
    } else if (Math.abs(targetRight - compRight) < SNAP_THRESHOLD) {
      snappedX = compRight - targetWidth;
      addOrUpdateGuide(guides, 'vertical', compRight, comp.id);
    } else if (Math.abs(targetCenterX - compCenterX) < SNAP_THRESHOLD) {
      snappedX = compCenterX - targetWidth / 2;
      addOrUpdateGuide(guides, 'vertical', compCenterX, comp.id);
    }

    // Horizontal alignment (Y axis)
    if (Math.abs(targetTop - compTop) < SNAP_THRESHOLD) {
      snappedY = compTop;
      addOrUpdateGuide(guides, 'horizontal', compTop, comp.id);
    } else if (Math.abs(targetTop - compBottom) < SNAP_THRESHOLD) {
      snappedY = compBottom;
      addOrUpdateGuide(guides, 'horizontal', compBottom, comp.id);
    } else if (Math.abs(targetBottom - compTop) < SNAP_THRESHOLD) {
      snappedY = compTop - targetHeight;
      addOrUpdateGuide(guides, 'horizontal', compTop, comp.id);
    } else if (Math.abs(targetBottom - compBottom) < SNAP_THRESHOLD) {
      snappedY = compBottom - targetHeight;
      addOrUpdateGuide(guides, 'horizontal', compBottom, comp.id);
    } else if (Math.abs(targetCenterY - compCenterY) < SNAP_THRESHOLD) {
      snappedY = compCenterY - targetHeight / 2;
      addOrUpdateGuide(guides, 'horizontal', compCenterY, comp.id);
    }
  }

  return {
    x: Math.round(snappedX),
    y: Math.round(snappedY),
    guides,
  };
}

function addOrUpdateGuide(guides: AlignmentGuide[], type: 'vertical' | 'horizontal', position: number, componentId: string) {
  const existing = guides.find(g => g.type === type && Math.abs(g.position - position) < 1);
  if (existing) {
    if (!existing.components.includes(componentId)) {
      existing.components.push(componentId);
    }
  } else {
    guides.push({
      type,
      position,
      components: [componentId],
    });
  }
}

export interface AlignmentOption {
  key: string;
  label: string;
  icon: string;
  action: (components: any[]) => any[];
}

export const alignmentOptions: AlignmentOption[] = [
  {
    key: 'left',
    label: 'Align Left',
    icon: 'align-left',
    action: (components) => {
      if (components.length === 0) return components;
      const minX = Math.min(...components.map(c => c.position_x));
      return components.map(c => ({ ...c, position_x: minX }));
    },
  },
  {
    key: 'center-h',
    label: 'Center Horizontally',
    icon: 'align-center',
    action: (components) => {
      if (components.length === 0) return components;
      const minX = Math.min(...components.map(c => c.position_x));
      const maxX = Math.max(...components.map(c => c.position_x + c.width));
      const centerX = (minX + maxX) / 2;
      return components.map(c => ({ ...c, position_x: centerX - c.width / 2 }));
    },
  },
  {
    key: 'right',
    label: 'Align Right',
    icon: 'align-right',
    action: (components) => {
      if (components.length === 0) return components;
      const maxX = Math.max(...components.map(c => c.position_x + c.width));
      return components.map(c => ({ ...c, position_x: maxX - c.width }));
    },
  },
  {
    key: 'top',
    label: 'Align Top',
    icon: 'align-top',
    action: (components) => {
      if (components.length === 0) return components;
      const minY = Math.min(...components.map(c => c.position_y));
      return components.map(c => ({ ...c, position_y: minY }));
    },
  },
  {
    key: 'center-v',
    label: 'Center Vertically',
    icon: 'align-middle',
    action: (components) => {
      if (components.length === 0) return components;
      const minY = Math.min(...components.map(c => c.position_y));
      const maxY = Math.max(...components.map(c => c.position_y + c.height));
      const centerY = (minY + maxY) / 2;
      return components.map(c => ({ ...c, position_y: centerY - c.height / 2 }));
    },
  },
  {
    key: 'bottom',
    label: 'Align Bottom',
    icon: 'align-bottom',
    action: (components) => {
      if (components.length === 0) return components;
      const maxY = Math.max(...components.map(c => c.position_y + c.height));
      return components.map(c => ({ ...c, position_y: maxY - c.height }));
    },
  },
  {
    key: 'distribute-h',
    label: 'Distribute Horizontally',
    icon: 'distribute-h',
    action: (components) => {
      if (components.length < 3) return components;
      const sorted = [...components].sort((a, b) => a.position_x - b.position_x);
      const minX = sorted[0].position_x;
      const maxX = sorted[sorted.length - 1].position_x + sorted[sorted.length - 1].width;
      const totalWidth = sorted.reduce((sum, c) => sum + c.width, 0);
      const gap = (maxX - minX - totalWidth) / (sorted.length - 1);

      let currentX = minX;
      return sorted.map(c => {
        const newComp = { ...c, position_x: currentX };
        currentX += c.width + gap;
        return newComp;
      });
    },
  },
  {
    key: 'distribute-v',
    label: 'Distribute Vertically',
    icon: 'distribute-v',
    action: (components) => {
      if (components.length < 3) return components;
      const sorted = [...components].sort((a, b) => a.position_y - b.position_y);
      const minY = sorted[0].position_y;
      const maxY = sorted[sorted.length - 1].position_y + sorted[sorted.length - 1].height;
      const totalHeight = sorted.reduce((sum, c) => sum + c.height, 0);
      const gap = (maxY - minY - totalHeight) / (sorted.length - 1);

      let currentY = minY;
      return sorted.map(c => {
        const newComp = { ...c, position_y: currentY };
        currentY += c.height + gap;
        return newComp;
      });
    },
  },
];

export function distributeSpacing(
  components: any[],
  direction: 'horizontal' | 'vertical',
  spacing: number
): any[] {
  if (components.length < 2) return components;

  const sorted = [...components].sort((a, b) => {
    return direction === 'horizontal'
      ? a.position_x - b.position_x
      : a.position_y - b.position_y;
  });

  if (direction === 'horizontal') {
    let currentX = sorted[0].position_x;
    return sorted.map(c => {
      const newComp = { ...c, position_x: currentX };
      currentX += c.width + spacing;
      return newComp;
    });
  } else {
    let currentY = sorted[0].position_y;
    return sorted.map(c => {
      const newComp = { ...c, position_y: currentY };
      currentY += c.height + spacing;
      return newComp;
    });
  }
}

export function matchSize(
  components: any[],
  dimension: 'width' | 'height' | 'both',
  referenceComponent?: any
): any[] {
  if (components.length === 0) return components;

  const reference = referenceComponent || components[0];

  return components.map(c => {
    const newComp = { ...c };
    if (dimension === 'width' || dimension === 'both') {
      newComp.width = reference.width;
    }
    if (dimension === 'height' || dimension === 'both') {
      newComp.height = reference.height;
    }
    return newComp;
  });
}

export function groupComponents(components: any[]): any {
  if (components.length === 0) return null;

  const minX = Math.min(...components.map(c => c.position_x));
  const minY = Math.min(...components.map(c => c.position_y));
  const maxX = Math.max(...components.map(c => c.position_x + c.width));
  const maxY = Math.max(...components.map(c => c.position_y + c.height));

  return {
    position_x: minX,
    position_y: minY,
    width: maxX - minX,
    height: maxY - minY,
    children: components.map(c => ({
      ...c,
      position_x: c.position_x - minX,
      position_y: c.position_y - minY,
    })),
  };
}
