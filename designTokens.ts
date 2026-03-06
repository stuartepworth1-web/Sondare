export interface ColorToken {
  name: string;
  value: string;
  description?: string;
}

export interface TypographyToken {
  name: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing?: number;
}

export interface SpacingToken {
  name: string;
  value: number;
}

export interface DesignSystem {
  colors: {
    primary: ColorToken[];
    secondary: ColorToken[];
    neutral: ColorToken[];
    semantic: ColorToken[];
  };
  typography: {
    heading: TypographyToken[];
    body: TypographyToken[];
    caption: TypographyToken[];
  };
  spacing: SpacingToken[];
  borderRadius: SpacingToken[];
  shadows: {
    name: string;
    value: string;
  }[];
}

export const defaultDesignSystem: DesignSystem = {
  colors: {
    primary: [
      { name: 'primary-50', value: '#FFF4E6', description: 'Lightest orange' },
      { name: 'primary-100', value: '#FFE5CC', description: 'Very light orange' },
      { name: 'primary-200', value: '#FFCC99', description: 'Light orange' },
      { name: 'primary-300', value: '#FFB366', description: 'Medium-light orange' },
      { name: 'primary-400', value: '#FF9933', description: 'Medium orange' },
      { name: 'primary-500', value: '#FF9500', description: 'Base orange' },
      { name: 'primary-600', value: '#CC7700', description: 'Dark orange' },
      { name: 'primary-700', value: '#995900', description: 'Darker orange' },
      { name: 'primary-800', value: '#663C00', description: 'Very dark orange' },
      { name: 'primary-900', value: '#331E00', description: 'Darkest orange' },
    ],
    secondary: [
      { name: 'secondary-50', value: '#E6F7F7', description: 'Lightest teal' },
      { name: 'secondary-100', value: '#CCEEEE', description: 'Very light teal' },
      { name: 'secondary-200', value: '#99DDDD', description: 'Light teal' },
      { name: 'secondary-300', value: '#66CCCC', description: 'Medium-light teal' },
      { name: 'secondary-400', value: '#33BBBB', description: 'Medium teal' },
      { name: 'secondary-500', value: '#00AAAA', description: 'Base teal' },
      { name: 'secondary-600', value: '#008888', description: 'Dark teal' },
      { name: 'secondary-700', value: '#006666', description: 'Darker teal' },
      { name: 'secondary-800', value: '#004444', description: 'Very dark teal' },
      { name: 'secondary-900', value: '#002222', description: 'Darkest teal' },
    ],
    neutral: [
      { name: 'white', value: '#FFFFFF', description: 'Pure white' },
      { name: 'gray-50', value: '#F8F9FA', description: 'Lightest gray' },
      { name: 'gray-100', value: '#E9ECEF', description: 'Very light gray' },
      { name: 'gray-200', value: '#DEE2E6', description: 'Light gray' },
      { name: 'gray-300', value: '#CED4DA', description: 'Medium-light gray' },
      { name: 'gray-400', value: '#ADB5BD', description: 'Medium gray' },
      { name: 'gray-500', value: '#6C757D', description: 'Base gray' },
      { name: 'gray-600', value: '#495057', description: 'Dark gray' },
      { name: 'gray-700', value: '#343A40', description: 'Darker gray' },
      { name: 'gray-800', value: '#212529', description: 'Very dark gray' },
      { name: 'gray-900', value: '#1C1C1E', description: 'Darkest gray' },
      { name: 'black', value: '#000000', description: 'Pure black' },
    ],
    semantic: [
      { name: 'success', value: '#34C759', description: 'Success green' },
      { name: 'warning', value: '#FF9500', description: 'Warning orange' },
      { name: 'error', value: '#FF3B30', description: 'Error red' },
      { name: 'info', value: '#007AFF', description: 'Info blue' },
    ],
  },
  typography: {
    heading: [
      { name: 'h1', fontSize: 32, fontWeight: 'bold', lineHeight: 1.2 },
      { name: 'h2', fontSize: 28, fontWeight: 'bold', lineHeight: 1.25 },
      { name: 'h3', fontSize: 24, fontWeight: '600', lineHeight: 1.3 },
      { name: 'h4', fontSize: 20, fontWeight: '600', lineHeight: 1.4 },
      { name: 'h5', fontSize: 18, fontWeight: '600', lineHeight: 1.4 },
      { name: 'h6', fontSize: 16, fontWeight: '600', lineHeight: 1.5 },
    ],
    body: [
      { name: 'body-large', fontSize: 18, fontWeight: 'normal', lineHeight: 1.6 },
      { name: 'body', fontSize: 16, fontWeight: 'normal', lineHeight: 1.5 },
      { name: 'body-small', fontSize: 14, fontWeight: 'normal', lineHeight: 1.5 },
    ],
    caption: [
      { name: 'caption', fontSize: 12, fontWeight: 'normal', lineHeight: 1.4 },
      { name: 'overline', fontSize: 10, fontWeight: '600', lineHeight: 1.4, letterSpacing: 0.5 },
    ],
  },
  spacing: [
    { name: 'xs', value: 4 },
    { name: 'sm', value: 8 },
    { name: 'md', value: 16 },
    { name: 'lg', value: 24 },
    { name: 'xl', value: 32 },
    { name: '2xl', value: 40 },
    { name: '3xl', value: 48 },
    { name: '4xl', value: 64 },
  ],
  borderRadius: [
    { name: 'none', value: 0 },
    { name: 'sm', value: 4 },
    { name: 'md', value: 8 },
    { name: 'lg', value: 12 },
    { name: 'xl', value: 16 },
    { name: '2xl', value: 20 },
    { name: 'full', value: 9999 },
  ],
  shadows: [
    { name: 'none', value: 'none' },
    { name: 'sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    { name: 'md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    { name: 'lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    { name: 'xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
  ],
};

export function applyDesignToken(component: any, tokenType: string, tokenValue: any): any {
  const updated = { ...component, props: { ...component.props } };

  switch (tokenType) {
    case 'color':
      if (component.component_type === 'text') {
        updated.props.color = tokenValue;
      } else {
        updated.props.backgroundColor = tokenValue;
      }
      break;

    case 'typography':
      updated.props.fontSize = tokenValue.fontSize;
      updated.props.fontWeight = tokenValue.fontWeight;
      updated.props.lineHeight = tokenValue.lineHeight;
      if (tokenValue.letterSpacing) {
        updated.props.letterSpacing = tokenValue.letterSpacing;
      }
      break;

    case 'spacing':
      if (['container', 'card'].includes(component.component_type)) {
        updated.props.padding = tokenValue;
      }
      break;

    case 'borderRadius':
      updated.props.borderRadius = tokenValue;
      break;
  }

  return updated;
}

export function extractDesignSystemFromProject(components: any[]): Partial<DesignSystem> {
  const colors = new Set<string>();
  const fontSizes = new Set<number>();
  const spacings = new Set<number>();
  const borderRadii = new Set<number>();

  components.forEach(comp => {
    if (comp.props) {
      // Extract colors
      ['backgroundColor', 'textColor', 'color', 'borderColor'].forEach(prop => {
        if (comp.props[prop]) {
          colors.add(comp.props[prop]);
        }
      });

      // Extract font sizes
      if (comp.props.fontSize) {
        fontSizes.add(comp.props.fontSize);
      }

      // Extract spacing
      if (comp.props.padding) {
        spacings.add(comp.props.padding);
      }

      // Extract border radius
      if (comp.props.borderRadius) {
        borderRadii.add(comp.props.borderRadius);
      }
    }
  });

  return {
    colors: {
      primary: Array.from(colors).slice(0, 10).map((c, i) => ({
        name: `color-${i + 1}`,
        value: c,
      })),
      secondary: [],
      neutral: [],
      semantic: [],
    },
    spacing: Array.from(spacings).sort((a, b) => a - b).map((s, i) => ({
      name: `spacing-${i + 1}`,
      value: s,
    })),
    borderRadius: Array.from(borderRadii).sort((a, b) => a - b).map((r, i) => ({
      name: `radius-${i + 1}`,
      value: r,
    })),
  };
}

export function generateColorVariants(baseColor: string): ColorToken[] {
  // This is a simplified version - in production, use a proper color library
  const variants: ColorToken[] = [];
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  shades.forEach(shade => {
    variants.push({
      name: `color-${shade}`,
      value: baseColor, // In production, generate actual variants
      description: `Shade ${shade}`,
    });
  });

  return variants;
}

export function applyDesignSystemToComponent(
  component: any,
  designSystem: DesignSystem
): any {
  const updated = { ...component, props: { ...component.props } };

  // Apply closest matching typography
  if (['text', 'button'].includes(component.component_type)) {
    const fontSize = component.props.fontSize || 16;
    const matchingType = findClosestTypography(fontSize, designSystem);
    if (matchingType) {
      updated.props.fontSize = matchingType.fontSize;
      updated.props.fontWeight = matchingType.fontWeight;
      updated.props.lineHeight = matchingType.lineHeight;
    }
  }

  // Apply closest spacing
  if (component.props.padding) {
    const closestSpacing = findClosestSpacing(component.props.padding, designSystem);
    if (closestSpacing) {
      updated.props.padding = closestSpacing.value;
    }
  }

  // Apply closest border radius
  if (component.props.borderRadius) {
    const closestRadius = findClosestBorderRadius(component.props.borderRadius, designSystem);
    if (closestRadius) {
      updated.props.borderRadius = closestRadius.value;
    }
  }

  return updated;
}

function findClosestTypography(fontSize: number, system: DesignSystem): TypographyToken | null {
  const allTypes = [
    ...system.typography.heading,
    ...system.typography.body,
    ...system.typography.caption,
  ];

  return allTypes.reduce((closest, current) => {
    if (!closest) return current;
    const closestDiff = Math.abs(closest.fontSize - fontSize);
    const currentDiff = Math.abs(current.fontSize - fontSize);
    return currentDiff < closestDiff ? current : closest;
  }, null as TypographyToken | null);
}

function findClosestSpacing(value: number, system: DesignSystem): SpacingToken | null {
  return system.spacing.reduce((closest, current) => {
    if (!closest) return current;
    const closestDiff = Math.abs(closest.value - value);
    const currentDiff = Math.abs(current.value - value);
    return currentDiff < closestDiff ? current : closest;
  }, null as SpacingToken | null);
}

function findClosestBorderRadius(value: number, system: DesignSystem): SpacingToken | null {
  return system.borderRadius.reduce((closest, current) => {
    if (!closest) return current;
    const closestDiff = Math.abs(closest.value - value);
    const currentDiff = Math.abs(current.value - value);
    return currentDiff < closestDiff ? current : closest;
  }, null as SpacingToken | null);
}
