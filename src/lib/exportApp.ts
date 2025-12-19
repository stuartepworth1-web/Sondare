import { supabase } from './supabase';

interface Screen {
  id: string;
  name: string;
  screen_type: string;
  background_color: string;
}

interface Component {
  id: string;
  component_type: string;
  props: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

export async function exportAppCode(projectId: string): Promise<{ files: Record<string, string>; readme: string }> {
  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('id', projectId)
    .single();

  const { data: screens } = await supabase
    .from('app_screens')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  if (!screens || screens.length === 0) {
    throw new Error('No screens found in project');
  }

  const files: Record<string, string> = {};

  for (const screen of screens) {
    const { data: components } = await supabase
      .from('app_components')
      .select('*')
      .eq('screen_id', screen.id)
      .order('layer_order');

    files[`screens/${screen.name}.tsx`] = generateScreenCode(screen, components || []);
  }

  files['App.tsx'] = generateAppCode(screens);
  files['package.json'] = generatePackageJson(project?.name || 'MyApp');
  files['README.md'] = generateReadme(project?.name || 'MyApp', project?.description || '');

  return { files, readme: files['README.md'] };
}

function generateScreenCode(screen: Screen, components: Component[]): string {
  const imports = `import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';

`;

  const componentRenderers = components.map((comp, index) => {
    switch (comp.component_type) {
      case 'text':
        return `      <Text style={[styles.text${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width} }]}>
        {${JSON.stringify(comp.props.text)}}
      </Text>`;

      case 'button':
        return `      <TouchableOpacity
        style={[styles.button${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]}
        onPress={() => console.log('Button pressed')}
      >
        <Text style={styles.buttonText${index}}>{${JSON.stringify(comp.props.text)}}</Text>
      </TouchableOpacity>`;

      case 'input':
        return `      <TextInput
        style={[styles.input${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]}
        placeholder={${JSON.stringify(comp.props.placeholder)}}
        placeholderTextColor="#999"
      />`;

      case 'image':
        return `      <Image
        source={{ uri: ${JSON.stringify(comp.props.source)} }}
        style={[styles.image${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]}
      />`;

      case 'container':
        return `      <View style={[styles.container${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]} />`;

      case 'header':
        return `      <View style={[styles.header${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]}>
        <Text style={styles.headerText${index}}>{${JSON.stringify(comp.props.title)}}</Text>
      </View>`;

      case 'card':
        return `      <View style={[styles.card${index}, { position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }]}>
        <Text style={styles.cardTitle${index}}>{${JSON.stringify(comp.props.title)}}</Text>
        <Text style={styles.cardSubtitle${index}}>{${JSON.stringify(comp.props.subtitle)}}</Text>
      </View>`;

      default:
        return `      <View style={{ position: 'absolute', left: ${comp.position_x}, top: ${comp.position_y}, width: ${comp.width}, height: ${comp.height} }} />`;
    }
  }).join('\n');

  const styles = components.map((comp, index) => {
    switch (comp.component_type) {
      case 'text':
        return `  text${index}: {
    fontSize: ${comp.props.fontSize},
    color: '${comp.props.color}',
    fontWeight: '${comp.props.fontWeight}',
    textAlign: '${comp.props.textAlign}',
  },`;

      case 'button':
        return `  button${index}: {
    backgroundColor: '${comp.props.backgroundColor}',
    borderRadius: ${comp.props.borderRadius},
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText${index}: {
    color: '${comp.props.textColor}',
    fontSize: ${comp.props.fontSize},
    fontWeight: '600',
  },`;

      case 'input':
        return `  input${index}: {
    backgroundColor: '${comp.props.backgroundColor}',
    color: '${comp.props.textColor}',
    borderWidth: 1,
    borderColor: '${comp.props.borderColor}',
    borderRadius: ${comp.props.borderRadius},
    paddingHorizontal: 12,
    fontSize: 14,
  },`;

      case 'image':
        return `  image${index}: {
    borderRadius: ${comp.props.borderRadius},
    resizeMode: 'cover',
  },`;

      case 'container':
        return `  container${index}: {
    backgroundColor: '${comp.props.backgroundColor}',
    borderRadius: ${comp.props.borderRadius},
    borderWidth: ${comp.props.borderWidth},
    borderColor: '${comp.props.borderColor}',
    padding: ${comp.props.padding},
  },`;

      case 'header':
        return `  header${index}: {
    backgroundColor: '${comp.props.backgroundColor}',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText${index}: {
    fontSize: ${comp.props.fontSize},
    fontWeight: '${comp.props.fontWeight}',
    color: '${comp.props.textColor}',
  },`;

      case 'card':
        return `  card${index}: {
    backgroundColor: '${comp.props.backgroundColor}',
    borderRadius: ${comp.props.borderRadius},
    padding: ${comp.props.padding},
  },
  cardTitle${index}: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle${index}: {
    fontSize: 14,
    color: '#FFFFFF99',
    marginTop: 4,
  },`;

      default:
        return '';
    }
  }).join('\n');

  return `${imports}
export default function ${screen.name.replace(/\s+/g, '')}Screen() {
  return (
    <View style={styles.container}>
${componentRenderers}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${screen.background_color}',
  },
${styles}
});
`;
}

function generateAppCode(screens: Screen[]): string {
  const imports = screens.map((screen) =>
    `import ${screen.name.replace(/\s+/g, '')}Screen from './screens/${screen.name}';`
  ).join('\n');

  const homeScreen = screens.find(s => s.is_home_screen) || screens[0];

  return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${imports}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="${homeScreen.name.replace(/\s+/g, '')}"
        screenOptions={{
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
${screens.map(screen => `        <Stack.Screen name="${screen.name.replace(/\s+/g, '')}" component=${screen.name.replace(/\s+/g, '')}Screen} options={{ title: '${screen.name}' }} />`).join('\n')}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;
}

function generatePackageJson(appName: string): string {
  return JSON.stringify({
    name: appName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
    },
    dependencies: {
      'react': '18.2.0',
      'react-native': '0.74.5',
      'expo': '~51.0.0',
      '@react-navigation/native': '^6.1.9',
      '@react-navigation/native-stack': '^6.9.17',
      'react-native-screens': '~3.31.1',
      'react-native-safe-area-context': '4.10.5',
    },
    devDependencies: {
      '@babel/core': '^7.24.0',
      '@types/react': '~18.2.45',
      'typescript': '^5.3.0',
    },
  }, null, 2);
}

function generateReadme(appName: string, description: string): string {
  return `# ${appName}

${description}

## Generated by Sondare

This app was created using Sondare's visual app builder.

## Setup Instructions

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm start
\`\`\`

3. Run on your device:
   - Download the Expo Go app on your phone
   - Scan the QR code shown in the terminal
   - Or press 'a' for Android emulator, 'i' for iOS simulator

## Project Structure

- \`App.tsx\` - Main app navigation
- \`screens/\` - Individual screen components
- \`package.json\` - Project dependencies

## Building for Production

To build standalone apps:

\`\`\`bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
\`\`\`

## Support

For questions or issues, visit: https://sondare.com/support

---

Built with Sondare - Create amazing mobile apps visually
`;
}

export async function downloadProjectFiles(projectId: string, projectName: string) {
  const { files } = await exportAppCode(projectId);

  const zip = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
  const JSZip = zip.default;

  const zipFile = new JSZip();

  Object.entries(files).forEach(([filename, content]) => {
    zipFile.file(filename, content);
  });

  const blob = await zipFile.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
