export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateComponent(component: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!component.component_type) {
    errors.push('Component type is required');
  }

  if (typeof component.position_x !== 'number') {
    errors.push('Invalid X position');
  }

  if (typeof component.position_y !== 'number') {
    errors.push('Invalid Y position');
  }

  if (typeof component.width !== 'number' || component.width <= 0) {
    errors.push('Width must be a positive number');
  }

  if (typeof component.height !== 'number' || component.height <= 0) {
    errors.push('Height must be a positive number');
  }

  // Canvas boundaries (375px wide, assuming 812px tall for iPhone)
  const CANVAS_WIDTH = 375;
  const CANVAS_HEIGHT = 812;

  if (component.position_x < 0) {
    warnings.push('Component is positioned outside left canvas boundary');
  }

  if (component.position_y < 0) {
    warnings.push('Component is positioned outside top canvas boundary');
  }

  if (component.position_x + component.width > CANVAS_WIDTH) {
    warnings.push('Component extends beyond right canvas boundary');
  }

  if (component.position_y + component.height > CANVAS_HEIGHT) {
    warnings.push('Component extends beyond bottom canvas boundary');
  }

  // Size limits
  if (component.width > CANVAS_WIDTH) {
    warnings.push('Component width exceeds canvas width');
  }

  if (component.height > CANVAS_HEIGHT) {
    warnings.push('Component height exceeds canvas height');
  }

  // Component-specific validation
  switch (component.component_type) {
    case 'text':
      if (!component.props?.text) {
        warnings.push('Text component has no content');
      }
      if (component.props?.fontSize && (component.props.fontSize < 8 || component.props.fontSize > 72)) {
        warnings.push('Font size should be between 8-72px');
      }
      break;

    case 'button':
      if (!component.props?.text) {
        warnings.push('Button has no label');
      }
      if (component.width < 44 || component.height < 44) {
        warnings.push('Button is smaller than minimum tap target (44x44)');
      }
      break;

    case 'input':
      if (!component.props?.placeholder) {
        warnings.push('Input field has no placeholder');
      }
      if (component.height < 44) {
        warnings.push('Input field is smaller than minimum tap target (44px)');
      }
      break;

    case 'image':
      if (!component.props?.source) {
        errors.push('Image has no source URL');
      }
      break;
  }

  // Color validation
  const colorProps = ['backgroundColor', 'textColor', 'borderColor', 'color'];
  colorProps.forEach(prop => {
    if (component.props?.[prop]) {
      const color = component.props[prop];
      if (typeof color === 'string' && !isValidColor(color)) {
        warnings.push(`Invalid color format for ${prop}: ${color}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateScreen(screen: any, components: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!screen.name || screen.name.trim().length === 0) {
    errors.push('Screen name is required');
  }

  if (screen.name && screen.name.length > 50) {
    warnings.push('Screen name is very long (>50 characters)');
  }

  if (!screen.background_color) {
    warnings.push('Screen has no background color set');
  }

  if (components.length === 0) {
    warnings.push('Screen has no components');
  }

  if (components.length > 100) {
    warnings.push('Screen has many components (>100) - consider splitting into multiple screens');
  }

  // Check for overlapping components
  const overlaps = findOverlappingComponents(components);
  if (overlaps.length > 0) {
    warnings.push(`${overlaps.length} component(s) are overlapping`);
  }

  // Validate all components
  components.forEach((comp, index) => {
    const result = validateComponent(comp);
    result.errors.forEach(err => errors.push(`Component ${index + 1}: ${err}`));
    result.warnings.forEach(warn => warnings.push(`Component ${index + 1}: ${warn}`));
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateProject(screens: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (screens.length === 0) {
    errors.push('Project has no screens');
  }

  const homeScreens = screens.filter(s => s.is_home_screen);
  if (homeScreens.length === 0) {
    warnings.push('No home screen set');
  } else if (homeScreens.length > 1) {
    warnings.push('Multiple home screens detected');
  }

  // Check for duplicate screen names
  const screenNames = screens.map(s => s.name);
  const duplicates = screenNames.filter((name, index) => screenNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate screen names: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function isValidColor(color: string): boolean {
  if (color === 'transparent') return true;

  // Hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(color)) {
    return true;
  }

  // RGB/RGBA
  if (/^rgba?\([\d\s,./]+\)$/.test(color)) {
    return true;
  }

  // HSL/HSLA
  if (/^hsla?\([\d\s,%/]+\)$/.test(color)) {
    return true;
  }

  return false;
}

function findOverlappingComponents(components: any[]): any[] {
  const overlapping: any[] = [];

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const comp1 = components[i];
      const comp2 = components[j];

      const overlap = checkOverlap(
        comp1.position_x,
        comp1.position_y,
        comp1.width,
        comp1.height,
        comp2.position_x,
        comp2.position_y,
        comp2.width,
        comp2.height
      );

      if (overlap) {
        overlapping.push({ comp1: comp1.id, comp2: comp2.id });
      }
    }
  }

  return overlapping;
}

function checkOverlap(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return !(
    x1 + w1 <= x2 ||
    x2 + w2 <= x1 ||
    y1 + h1 <= y2 ||
    y2 + h2 <= y1
  );
}

export function sanitizeComponentProps(component: any): any {
  const sanitized = { ...component };

  // Clamp numeric values
  if (typeof sanitized.position_x === 'number') {
    sanitized.position_x = Math.max(0, Math.min(sanitized.position_x, 375));
  }

  if (typeof sanitized.position_y === 'number') {
    sanitized.position_y = Math.max(0, sanitized.position_y);
  }

  if (typeof sanitized.width === 'number') {
    sanitized.width = Math.max(1, Math.min(sanitized.width, 375));
  }

  if (typeof sanitized.height === 'number') {
    sanitized.height = Math.max(1, Math.min(sanitized.height, 1000));
  }

  // Sanitize props
  if (sanitized.props) {
    if (sanitized.props.fontSize) {
      sanitized.props.fontSize = Math.max(8, Math.min(sanitized.props.fontSize, 72));
    }

    if (sanitized.props.borderRadius) {
      sanitized.props.borderRadius = Math.max(0, Math.min(sanitized.props.borderRadius, 100));
    }

    if (sanitized.props.opacity !== undefined) {
      sanitized.props.opacity = Math.max(0, Math.min(sanitized.props.opacity, 1));
    }
  }

  return sanitized;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function formatValidationErrors(result: ValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push('Errors:');
    result.errors.forEach(err => messages.push(`  • ${err}`));
  }

  if (result.warnings.length > 0) {
    if (messages.length > 0) messages.push('');
    messages.push('Warnings:');
    result.warnings.forEach(warn => messages.push(`  • ${warn}`));
  }

  return messages.join('\n');
}
