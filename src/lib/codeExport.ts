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

interface Screen {
  id: string;
  name: string;
  screen_type: string;
  background_color: string;
  order_index: number;
  is_home_screen: boolean;
  components?: Component[];
}

export function generateReactNativeCode(screens: Screen[]): string {
  const screenComponents = screens.map((screen) => generateScreenCode(screen)).join('\n\n');

  const navigationConfig = screens.map((screen, index) => {
    const screenName = toScreenName(screen.name);
    return `        <Stack.Screen name="${screenName}" component={${screenName}} />`;
  }).join('\n');

  const homeScreen = screens.find(s => s.is_home_screen) || screens[0];
  const initialRoute = toScreenName(homeScreen?.name || 'Home');

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

${screenComponents}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="${initialRoute}">
${navigationConfig}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;
}

function toScreenName(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function generateScreenCode(screen: Screen): string {
  const screenName = toScreenName(screen.name);
  const components = screen.components || [];

  const sortedComponents = [...components].sort((a, b) => a.layer_order - b.layer_order);

  const componentJSX = sortedComponents.map((comp) => generateComponentJSX(comp, 4)).join('\n');

  const styles = generateScreenStyles(screen, sortedComponents);

  return `function ${screenName}({ navigation }) {
  const [state, setState] = useState({});

  return (
    <SafeAreaView style={styles.${toStyleName(screenName)}Container}>
      <View style={styles.${toStyleName(screenName)}}>
${componentJSX}
      </View>
    </SafeAreaView>
  );
}

${styles}`;
}

function toStyleName(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function generateComponentJSX(component: Component, indent: number): string {
  const spaces = ' '.repeat(indent);
  const props = component.props;
  const styleName = `component${component.id.replace(/-/g, '')}`;

  switch (component.component_type) {
    case 'text':
      return `${spaces}<Text style={styles.${styleName}}>${props.text || 'Text'}</Text>`;

    case 'button':
      return `${spaces}<TouchableOpacity
${spaces}  style={styles.${styleName}}
${spaces}  onPress={() => {/* Add your action here */}}
${spaces}>
${spaces}  <Text style={styles.${styleName}Text}>${props.text || 'Button'}</Text>
${spaces}</TouchableOpacity>`;

    case 'input':
      return `${spaces}<TextInput
${spaces}  style={styles.${styleName}}
${spaces}  placeholder="${props.placeholder || 'Enter text...'}"
${spaces}  placeholderTextColor="#999"
${spaces}  value={state.${styleName} || ''}
${spaces}  onChangeText={(text) => setState({...state, ${styleName}: text})}
${spaces}/>`;

    case 'image':
      return `${spaces}<Image
${spaces}  style={styles.${styleName}}
${spaces}  source={{ uri: '${props.source || 'https://via.placeholder.com/150'}' }}
${spaces}  resizeMode="cover"
${spaces}/>`;

    case 'container':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  {/* Add child components here */}
${spaces}</View>`;

    case 'card':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Title}>${props.title || 'Title'}</Text>
${spaces}  <Text style={styles.${styleName}Subtitle}>${props.subtitle || 'Subtitle'}</Text>
${spaces}</View>`;

    case 'header':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  ${props.showBackButton ? `<TouchableOpacity onPress={() => navigation.goBack()}>
${spaces}    <Text style={styles.${styleName}BackButton}>←</Text>
${spaces}  </TouchableOpacity>` : ''}
${spaces}  <Text style={styles.${styleName}Title}>${props.title || 'Header'}</Text>
${spaces}</View>`;

    case 'list':
      return `${spaces}<FlatList
${spaces}  style={styles.${styleName}}
${spaces}  data={[${Array.from({ length: props.itemCount || 3 }, (_, i) => `'Item ${i + 1}'`).join(', ')}]}
${spaces}  renderItem={({ item }) => (
${spaces}    <View style={styles.${styleName}Item}>
${spaces}      <Text style={styles.${styleName}ItemText}>{item}</Text>
${spaces}    </View>
${spaces}  )}
${spaces}  keyExtractor={(item, index) => index.toString()}
${spaces}/>`;

    default:
      return `${spaces}<View style={styles.${styleName}} />`;
  }
}

function generateScreenStyles(screen: Screen, components: Component[]): string {
  const screenName = toScreenName(screen.name);
  const styleName = toStyleName(screenName);

  let stylesCode = `const styles = StyleSheet.create({\n`;
  stylesCode += `  ${styleName}Container: {\n`;
  stylesCode += `    flex: 1,\n`;
  stylesCode += `    backgroundColor: '${screen.background_color}',\n`;
  stylesCode += `  },\n`;
  stylesCode += `  ${styleName}: {\n`;
  stylesCode += `    flex: 1,\n`;
  stylesCode += `    width: 375,\n`;
  stylesCode += `    alignSelf: 'center',\n`;
  stylesCode += `  },\n`;

  components.forEach((component) => {
    const compStyleName = `component${component.id.replace(/-/g, '')}`;
    stylesCode += generateComponentStyle(compStyleName, component);
  });

  stylesCode += `});\n`;
  return stylesCode;
}

function generateComponentStyle(styleName: string, component: Component): string {
  const props = component.props;
  let style = `  ${styleName}: {\n`;
  style += `    position: 'absolute',\n`;
  style += `    left: ${component.position_x},\n`;
  style += `    top: ${component.position_y},\n`;
  style += `    width: ${component.width},\n`;
  style += `    height: ${component.height},\n`;

  switch (component.component_type) {
    case 'text':
      style += `    fontSize: ${props.fontSize || 16},\n`;
      style += `    color: '${props.color || '#FFFFFF'}',\n`;
      style += `    fontWeight: '${props.fontWeight || 'normal'}',\n`;
      style += `    textAlign: '${props.textAlign || 'left'}',\n`;
      break;

    case 'button':
      style += `    backgroundColor: '${props.backgroundColor || '#FF9500'}',\n`;
      style += `    borderRadius: ${props.borderRadius || 8},\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `  },\n`;
      style += `  ${styleName}Text: {\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    fontSize: ${props.fontSize || 16},\n`;
      style += `    fontWeight: '600',\n`;
      break;

    case 'input':
      style += `    backgroundColor: '${props.backgroundColor || '#1C1C1E'}',\n`;
      style += `    borderColor: '${props.borderColor || '#3A3A3C'}',\n`;
      style += `    borderWidth: 1,\n`;
      style += `    borderRadius: ${props.borderRadius || 8},\n`;
      style += `    paddingHorizontal: 12,\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    fontSize: 14,\n`;
      break;

    case 'image':
      style += `    borderRadius: ${props.borderRadius || 0},\n`;
      break;

    case 'container':
    case 'card':
      style += `    backgroundColor: '${props.backgroundColor || '#1C1C1E'}',\n`;
      style += `    borderRadius: ${props.borderRadius || 8},\n`;
      style += `    padding: ${props.padding || 16},\n`;
      if (component.component_type === 'card') {
        style += `  },\n`;
        style += `  ${styleName}Title: {\n`;
        style += `    fontSize: 16,\n`;
        style += `    fontWeight: 'bold',\n`;
        style += `    color: '#FFFFFF',\n`;
        style += `    marginBottom: 4,\n`;
        style += `  },\n`;
        style += `  ${styleName}Subtitle: {\n`;
        style += `    fontSize: 14,\n`;
        style += `    color: '#FFFFFF99',\n`;
      }
      break;

    case 'header':
      style += `    backgroundColor: '${props.backgroundColor || '#000000'}',\n`;
      style += `    flexDirection: 'row',\n`;
      style += `    alignItems: 'center',\n`;
      style += `    paddingHorizontal: 16,\n`;
      style += `  },\n`;
      style += `  ${styleName}Title: {\n`;
      style += `    fontSize: ${props.fontSize || 20},\n`;
      style += `    fontWeight: '${props.fontWeight || 'bold'}',\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      if (props.showBackButton) {
        style += `    marginLeft: 12,\n`;
        style += `  },\n`;
        style += `  ${styleName}BackButton: {\n`;
        style += `    fontSize: 20,\n`;
        style += `    color: '#FF9500',\n`;
      }
      break;

    case 'list':
      style += `  },\n`;
      style += `  ${styleName}Item: {\n`;
      style += `    height: ${props.itemHeight || 60},\n`;
      style += `    backgroundColor: '${props.itemBackgroundColor || '#1C1C1E'}',\n`;
      style += `    borderRadius: ${props.itemBorderRadius || 8},\n`;
      style += `    marginBottom: ${props.spacing || 8},\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    paddingHorizontal: 12,\n`;
      style += `  },\n`;
      style += `  ${styleName}ItemText: {\n`;
      style += `    fontSize: 14,\n`;
      style += `    color: '#FFFFFF',\n`;
      break;
  }

  style += `  },\n`;
  return style;
}

export function generatePackageJson(projectName: string): string {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
    },
    dependencies: {
      'expo': '~50.0.0',
      'expo-status-bar': '~1.11.0',
      'react': '18.2.0',
      'react-native': '0.73.0',
      '@react-navigation/native': '^6.1.9',
      '@react-navigation/native-stack': '^6.9.17',
      'react-native-screens': '~3.29.0',
      'react-native-safe-area-context': '4.8.2',
    },
    devDependencies: {
      '@babel/core': '^7.20.0',
    },
    private: true,
  }, null, 2);
}

export function generateAppJson(projectName: string): string {
  return JSON.stringify({
    expo: {
      name: projectName,
      slug: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'dark',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#000000',
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.${projectName.toLowerCase().replace(/\s+/g, '')}`,
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#000000',
        },
        package: `com.${projectName.toLowerCase().replace(/\s+/g, '')}`,
      },
      web: {
        favicon: './assets/favicon.png',
      },
    },
  }, null, 2);
}

export function generateReadme(projectName: string): string {
  return `# ${projectName}

This app was built with Sondare - The Visual App Builder.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Run on your device:
   - iOS: Press \`i\` or scan QR code with Camera app
   - Android: Press \`a\` or scan QR code with Expo Go app
   - Web: Press \`w\`

## Project Structure

- \`App.js\` - Main application file with all screens and navigation
- \`package.json\` - Project dependencies
- \`app.json\` - Expo configuration

## Customization

Edit the screens and components in \`App.js\` to customize your app.
Add your own logic, API calls, and features as needed.

## Publishing

To publish your app:
1. Create an Expo account at https://expo.dev
2. Run \`expo publish\`
3. Follow the Expo docs to build for iOS/Android

## Built With

- React Native
- Expo
- React Navigation
- Sondare (https://sondare.app)
`;
}
