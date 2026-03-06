import { Component, Screen } from '../types';

export function generateReactNativeCode(screens: Screen[]): string {
  const screenComponents = screens.map((screen) => generateScreenCode(screen)).join('\n\n');

  const navigationConfig = screens.map((screen) => {
    const screenName = toScreenName(screen.name);
    return `        <Stack.Screen
          name="${screenName}"
          component={${screenName}}
          options={{ headerShown: false }}
        />`;
  }).join('\n');

  const homeScreen = screens.find(s => s.is_home_screen) || screens[0];
  const initialRoute = toScreenName(homeScreen?.name || 'Home');

  return `import React, { useState, useEffect } from 'react';
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
  Switch,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  // Generate state for interactive components
  const stateInit = generateStateInitialization(sortedComponents);
  const componentJSX = sortedComponents.map((comp) => generateComponentJSX(comp, screenName, 4)).join('\n');

  const styles = generateScreenStyles(screen, sortedComponents);

  return `function ${screenName}({ navigation }) {
  // Component state management
  ${stateInit}

  // Navigation helpers
  const navigateTo = (screenName) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName);
    }
  };

  const goBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.${toStyleName(screenName)}Container}>
      <ScrollView
        style={styles.${toStyleName(screenName)}Scroll}
        contentContainerStyle={styles.${toStyleName(screenName)}Content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.${toStyleName(screenName)}}>
${componentJSX}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

${styles}`;
}

function toStyleName(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function generateStateInitialization(components: Component[]): string {
  const states: string[] = [];

  components.forEach((comp) => {
    const id = comp.id.replace(/-/g, '');
    switch (comp.component_type) {
      case 'input':
      case 'searchbar':
        states.push(`const [input${id}, setInput${id}] = useState('');`);
        break;
      case 'switch':
        states.push(`const [switch${id}, setSwitch${id}] = useState(${comp.props.isOn || false});`);
        break;
      case 'checkbox':
        states.push(`const [checkbox${id}, setCheckbox${id}] = useState(${comp.props.isChecked || false});`);
        break;
      case 'radio':
        states.push(`const [radio${id}, setRadio${id}] = useState(${comp.props.isSelected || false});`);
        break;
      case 'slider':
        states.push(`const [slider${id}, setSlider${id}] = useState(${comp.props.value || 50});`);
        break;
      case 'dropdown':
        states.push(`const [dropdown${id}, setDropdown${id}] = useState('');`);
        break;
      case 'modal':
      case 'bottomsheet':
      case 'alert':
        states.push(`const [visible${id}, setVisible${id}] = useState(false);`);
        break;
      case 'accordion':
        states.push(`const [expanded${id}, setExpanded${id}] = useState(${comp.props.isExpanded || false});`);
        break;
      case 'tabbar':
        states.push(`const [activeTab${id}, setActiveTab${id}] = useState(${comp.props.activeTab || 0});`);
        break;
      case 'rating':
        states.push(`const [rating${id}, setRating${id}] = useState(${comp.props.rating || 0});`);
        break;
    }
  });

  return states.length > 0 ? states.join('\n  ') : '// No interactive state needed';
}

function generateComponentJSX(component: Component, screenName: string, indent: number): string {
  const spaces = ' '.repeat(indent);
  const props = component.props;
  const id = component.id.replace(/-/g, '');
  const styleName = `component${id}`;

  switch (component.component_type) {
    case 'text':
      return `${spaces}<Text style={styles.${styleName}}>${props.text || 'Text'}</Text>`;

    case 'button':
      const action = props.navigationTarget
        ? `navigateTo('${toScreenName(props.navigationTarget)}')`
        : props.externalUrl
        ? `Linking.openURL('${props.externalUrl}')`
        : `Alert.alert('Button Pressed', 'Add your custom action here')`;

      return `${spaces}<TouchableOpacity
${spaces}  style={styles.${styleName}}
${spaces}  onPress={() => ${action}}
${spaces}  activeOpacity={0.7}
${spaces}>
${spaces}  <Text style={styles.${styleName}Text}>${props.text || 'Button'}</Text>
${spaces}</TouchableOpacity>`;

    case 'input':
      return `${spaces}<TextInput
${spaces}  style={styles.${styleName}}
${spaces}  placeholder="${props.placeholder || 'Enter text...'}"
${spaces}  placeholderTextColor="${props.placeholderColor || '#999'}"
${spaces}  value={input${id}}
${spaces}  onChangeText={setInput${id}}
${spaces}  secureTextEntry={${props.secureTextEntry || false}}
${spaces}  keyboardType="${props.keyboardType || 'default'}"
${spaces}/>`;

    case 'searchbar':
      return `${spaces}<View style={styles.${styleName}Container}>
${spaces}  <TextInput
${spaces}    style={styles.${styleName}}
${spaces}    placeholder="${props.placeholder || 'Search...'}"
${spaces}    placeholderTextColor="${props.iconColor || '#8E8E93'}"
${spaces}    value={input${id}}
${spaces}    onChangeText={setInput${id}}
${spaces}  />
${spaces}</View>`;

    case 'image':
      return `${spaces}<Image
${spaces}  style={styles.${styleName}}
${spaces}  source={{ uri: '${props.source || 'https://via.placeholder.com/150'}' }}
${spaces}  resizeMode="${props.resizeMode || 'cover'}"
${spaces}/>`;

    case 'avatar':
      return `${spaces}<Image
${spaces}  style={styles.${styleName}}
${spaces}  source={{ uri: '${props.source || 'https://via.placeholder.com/100'}' }}
${spaces}  resizeMode="cover"
${spaces}/>`;

    case 'container':
    case 'view':
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
${spaces}  ${props.showBackButton ? `<TouchableOpacity onPress={goBack} style={styles.${styleName}BackButton}>
${spaces}    <Text style={styles.${styleName}BackText}>←</Text>
${spaces}  </TouchableOpacity>` : ''}
${spaces}  <Text style={styles.${styleName}Title}>${props.title || 'Header'}</Text>
${spaces}</View>`;

    case 'badge':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Text}>${props.text || 'Badge'}</Text>
${spaces}</View>`;

    case 'chip':
      return `${spaces}<TouchableOpacity style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Text}>${props.text || 'Chip'}</Text>
${spaces}</TouchableOpacity>`;

    case 'switch':
      return `${spaces}<Switch
${spaces}  value={switch${id}}
${spaces}  onValueChange={setSwitch${id}}
${spaces}  trackColor={{ false: '${props.offColor || '#3A3A3C'}', true: '${props.onColor || '#34C759'}' }}
${spaces}  thumbColor="${props.thumbColor || '#FFFFFF'}"
${spaces}  style={styles.${styleName}}
${spaces}/>`;

    case 'checkbox':
      return `${spaces}<TouchableOpacity
${spaces}  style={styles.${styleName}}
${spaces}  onPress={() => setCheckbox${id}(!checkbox${id})}
${spaces}>
${spaces}  <View style={[styles.${styleName}Box, checkbox${id} && styles.${styleName}Checked]}>
${spaces}    {checkbox${id} && <Text style={styles.${styleName}Check}>✓</Text>}
${spaces}  </View>
${spaces}</TouchableOpacity>`;

    case 'slider':
      return `${spaces}<Slider
${spaces}  style={styles.${styleName}}
${spaces}  value={slider${id}}
${spaces}  onValueChange={setSlider${id}}
${spaces}  minimumValue={${props.minimumValue || 0}}
${spaces}  maximumValue={${props.maximumValue || 100}}
${spaces}  minimumTrackTintColor="${props.minimumTrackColor || '#FF9500'}"
${spaces}  maximumTrackTintColor="${props.maximumTrackColor || '#3A3A3C'}"
${spaces}  thumbTintColor="${props.thumbColor || '#FFFFFF'}"
${spaces}/>`;

    case 'progressbar':
      return `${spaces}<View style={styles.${styleName}Container}>
${spaces}  <View style={[styles.${styleName}, { width: \`\${${props.progress || 0.6} * 100}%\` }]} />
${spaces}</View>`;

    case 'spinner':
      return `${spaces}<ActivityIndicator
${spaces}  size="${props.size || 'medium'}"
${spaces}  color="${props.color || '#FF9500'}"
${spaces}  style={styles.${styleName}}
${spaces}/>`;

    case 'divider':
      return `${spaces}<View style={styles.${styleName}} />`;

    case 'icon':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Icon}>{/* Icon: ${props.iconName || 'star'} */}★</Text>
${spaces}</View>`;

    case 'rating':
      const stars = Array.from({ length: props.maxRating || 5 }, (_, i) => i < (props.rating || 0) ? '★' : '☆').join('');
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Stars}>${stars}</Text>
${spaces}</View>`;

    case 'tabbar':
      const tabs = props.tabs || ['Tab 1', 'Tab 2', 'Tab 3'];
      return `${spaces}<View style={styles.${styleName}}>
${tabs.map((tab, i) => `${spaces}  <TouchableOpacity
${spaces}    style={styles.${styleName}Tab}
${spaces}    onPress={() => setActiveTab${id}(${i})}
${spaces}  >
${spaces}    <Text style={[styles.${styleName}TabText, activeTab${id} === ${i} && styles.${styleName}TabActive]}>${tab}</Text>
${spaces}  </TouchableOpacity>`).join('\n')}
${spaces}</View>`;

    case 'list':
      const itemCount = props.itemCount || 5;
      return `${spaces}<FlatList
${spaces}  style={styles.${styleName}}
${spaces}  data={${JSON.stringify(Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`))}}
${spaces}  renderItem={({ item }) => (
${spaces}    <TouchableOpacity style={styles.${styleName}Item}>
${spaces}      <Text style={styles.${styleName}ItemText}>{item}</Text>
${spaces}    </TouchableOpacity>
${spaces}  )}
${spaces}  keyExtractor={(item, index) => index.toString()}
${spaces}  scrollEnabled={false}
${spaces}/>`;

    case 'modal':
      return `${spaces}<Modal
${spaces}  visible={visible${id}}
${spaces}  transparent
${spaces}  animationType="fade"
${spaces}  onRequestClose={() => setVisible${id}(false)}
${spaces}>
${spaces}  <View style={styles.${styleName}Overlay}>
${spaces}    <View style={styles.${styleName}}>
${spaces}      <Text style={styles.${styleName}Title}>${props.title || 'Modal'}</Text>
${spaces}      <TouchableOpacity onPress={() => setVisible${id}(false)}>
${spaces}        <Text style={styles.${styleName}Close}>Close</Text>
${spaces}      </TouchableOpacity>
${spaces}    </View>
${spaces}  </View>
${spaces}</Modal>
${spaces}<TouchableOpacity onPress={() => setVisible${id}(true)} style={styles.${styleName}Trigger}>
${spaces}  <Text>Open Modal</Text>
${spaces}</TouchableOpacity>`;

    case 'accordion':
      return `${spaces}<TouchableOpacity
${spaces}  style={styles.${styleName}}
${spaces}  onPress={() => setExpanded${id}(!expanded${id})}
${spaces}>
${spaces}  <Text style={styles.${styleName}Title}>${props.title || 'Expand'}</Text>
${spaces}  {expanded${id} && (
${spaces}    <View style={styles.${styleName}Content}>
${spaces}      <Text style={styles.${styleName}Text}>Accordion content goes here</Text>
${spaces}    </View>
${spaces}  )}
${spaces}</TouchableOpacity>`;

    case 'dropdown':
      const options = props.options || ['Option 1', 'Option 2', 'Option 3'];
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <TouchableOpacity style={styles.${styleName}Button}>
${spaces}    <Text style={styles.${styleName}Text}>{dropdown${id} || '${props.placeholder || 'Select'}'}</Text>
${spaces}  </TouchableOpacity>
${spaces}</View>`;

    case 'toast':
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Text}>${props.message || 'Notification'}</Text>
${spaces}</View>`;

    case 'carousel':
      return `${spaces}<ScrollView
${spaces}  horizontal
${spaces}  pagingEnabled
${spaces}  showsHorizontalScrollIndicator={false}
${spaces}  style={styles.${styleName}}
${spaces}>
${(props.images || []).map((img, i) => `${spaces}  <Image
${spaces}    source={{ uri: '${img}' }}
${spaces}    style={styles.${styleName}Image}
${spaces}  />`).join('\n')}
${spaces}</ScrollView>`;

    case 'floatingbutton':
      return `${spaces}<TouchableOpacity style={styles.${styleName}}>
${spaces}  <Text style={styles.${styleName}Icon}>+</Text>
${spaces}</TouchableOpacity>`;

    default:
      return `${spaces}<View style={styles.${styleName}}>
${spaces}  <Text style={{ color: '#666' }}>Component: ${component.component_type}</Text>
${spaces}</View>`;
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
  stylesCode += `  ${styleName}Scroll: {\n`;
  stylesCode += `    flex: 1,\n`;
  stylesCode += `  },\n`;
  stylesCode += `  ${styleName}Content: {\n`;
  stylesCode += `    flexGrow: 1,\n`;
  stylesCode += `  },\n`;
  stylesCode += `  ${styleName}: {\n`;
  stylesCode += `    width: SCREEN_WIDTH,\n`;
  stylesCode += `    minHeight: SCREEN_HEIGHT - 100,\n`;
  stylesCode += `    position: 'relative',\n`;
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

  // Add common styles
  if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    style += `    backgroundColor: '${props.backgroundColor}',\n`;
  }
  if (props.borderRadius) {
    style += `    borderRadius: ${props.borderRadius},\n`;
  }
  if (props.borderWidth) {
    style += `    borderWidth: ${props.borderWidth},\n`;
    style += `    borderColor: '${props.borderColor || '#3A3A3C'}',\n`;
  }
  if (props.opacity !== undefined && props.opacity !== 1) {
    style += `    opacity: ${props.opacity},\n`;
  }
  if (props.padding) {
    style += `    padding: ${props.padding},\n`;
  }

  // Component-specific styles
  switch (component.component_type) {
    case 'text':
      style += `    fontSize: ${props.fontSize || 16},\n`;
      style += `    color: '${props.color || '#FFFFFF'}',\n`;
      style += `    fontWeight: '${props.fontWeight || 'normal'}',\n`;
      style += `    textAlign: '${props.textAlign || 'left'}',\n`;
      break;

    case 'button':
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `  },\n`;
      style += `  ${styleName}Text: {\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    fontSize: ${props.fontSize || 16},\n`;
      style += `    fontWeight: '${props.fontWeight || '600'}',\n`;
      break;

    case 'input':
    case 'searchbar':
      style += `    paddingHorizontal: 12,\n`;
      style += `    paddingVertical: 10,\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    fontSize: ${props.fontSize || 16},\n`;
      break;

    case 'header':
      style += `    flexDirection: 'row',\n`;
      style += `    alignItems: 'center',\n`;
      style += `    paddingHorizontal: 16,\n`;
      style += `  },\n`;
      style += `  ${styleName}Title: {\n`;
      style += `    fontSize: ${props.fontSize || 20},\n`;
      style += `    fontWeight: '${props.fontWeight || 'bold'}',\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    flex: 1,\n`;
      if (props.showBackButton) {
        style += `  },\n`;
        style += `  ${styleName}BackButton: {\n`;
        style += `    marginRight: 12,\n`;
        style += `  },\n`;
        style += `  ${styleName}BackText: {\n`;
        style += `    fontSize: 20,\n`;
        style += `    color: '#FF9500',\n`;
      }
      break;

    case 'card':
      style += `  },\n`;
      style += `  ${styleName}Title: {\n`;
      style += `    fontSize: 18,\n`;
      style += `    fontWeight: 'bold',\n`;
      style += `    color: '#FFFFFF',\n`;
      style += `    marginBottom: 6,\n`;
      style += `  },\n`;
      style += `  ${styleName}Subtitle: {\n`;
      style += `    fontSize: 14,\n`;
      style += `    color: '#FFFFFF99',\n`;
      break;

    case 'list':
      style += `  },\n`;
      style += `  ${styleName}Item: {\n`;
      style += `    height: ${props.itemHeight || 60},\n`;
      style += `    backgroundColor: '${props.itemBackgroundColor || '#1C1C1E'}',\n`;
      style += `    borderRadius: ${props.itemBorderRadius || 8},\n`;
      style += `    marginBottom: ${props.spacing || 8},\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    paddingHorizontal: 16,\n`;
      style += `  },\n`;
      style += `  ${styleName}ItemText: {\n`;
      style += `    fontSize: 15,\n`;
      style += `    color: '#FFFFFF',\n`;
      break;

    case 'badge':
    case 'chip':
      style += `    paddingHorizontal: ${props.paddingHorizontal || 12},\n`;
      style += `    paddingVertical: ${props.paddingVertical || 6},\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `  },\n`;
      style += `  ${styleName}Text: {\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    fontSize: ${props.fontSize || 14},\n`;
      style += `    fontWeight: '${props.fontWeight || '600'}',\n`;
      break;

    case 'tabbar':
      style += `    flexDirection: 'row',\n`;
      style += `    justifyContent: 'space-around',\n`;
      style += `  },\n`;
      style += `  ${styleName}Tab: {\n`;
      style += `    flex: 1,\n`;
      style += `    alignItems: 'center',\n`;
      style += `    paddingVertical: 12,\n`;
      style += `  },\n`;
      style += `  ${styleName}TabText: {\n`;
      style += `    fontSize: ${props.fontSize || 14},\n`;
      style += `    color: '${props.inactiveColor || '#8E8E93'}',\n`;
      style += `  },\n`;
      style += `  ${styleName}TabActive: {\n`;
      style += `    color: '${props.activeColor || '#FF9500'}',\n`;
      style += `    fontWeight: '600',\n`;
      break;

    case 'checkbox':
      style += `  },\n`;
      style += `  ${styleName}Box: {\n`;
      style += `    width: ${props.size || 24},\n`;
      style += `    height: ${props.size || 24},\n`;
      style += `    borderRadius: ${props.borderRadius || 4},\n`;
      style += `    borderWidth: 2,\n`;
      style += `    borderColor: '${props.uncheckedColor || '#3A3A3C'}',\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `  },\n`;
      style += `  ${styleName}Checked: {\n`;
      style += `    backgroundColor: '${props.checkedColor || '#FF9500'}',\n`;
      style += `    borderColor: '${props.checkedColor || '#FF9500'}',\n`;
      style += `  },\n`;
      style += `  ${styleName}Check: {\n`;
      style += `    color: '#FFFFFF',\n`;
      style += `    fontSize: 16,\n`;
      style += `    fontWeight: 'bold',\n`;
      break;

    case 'progressbar':
      style += `  },\n`;
      style += `  ${styleName}Container: {\n`;
      style += `    position: 'absolute',\n`;
      style += `    left: ${component.position_x},\n`;
      style += `    top: ${component.position_y},\n`;
      style += `    width: ${component.width},\n`;
      style += `    height: ${props.height || 8},\n`;
      style += `    backgroundColor: '${props.backgroundColor || '#1C1C1E'}',\n`;
      style += `    borderRadius: ${props.borderRadius || 4},\n`;
      style += `    overflow: 'hidden',\n`;
      style += `  },\n`;
      style += `  ${styleName}: {\n`;
      style += `    height: '100%',\n`;
      style += `    backgroundColor: '${props.progressColor || '#34C759'}',\n`;
      break;

    case 'modal':
      style += `  },\n`;
      style += `  ${styleName}Overlay: {\n`;
      style += `    flex: 1,\n`;
      style += `    backgroundColor: 'rgba(0, 0, 0, 0.5)',\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `  },\n`;
      style += `  ${styleName}: {\n`;
      style += `    width: ${component.width},\n`;
      style += `    backgroundColor: '${props.backgroundColor || '#1C1C1E'}',\n`;
      style += `    borderRadius: ${props.borderRadius || 12},\n`;
      style += `    padding: ${props.padding || 20},\n`;
      style += `  },\n`;
      style += `  ${styleName}Title: {\n`;
      style += `    fontSize: 18,\n`;
      style += `    fontWeight: 'bold',\n`;
      style += `    color: '${props.textColor || '#FFFFFF'}',\n`;
      style += `    marginBottom: 16,\n`;
      style += `  },\n`;
      style += `  ${styleName}Close: {\n`;
      style += `    color: '#FF9500',\n`;
      style += `    marginTop: 16,\n`;
      style += `  },\n`;
      style += `  ${styleName}Trigger: {\n`;
      style += `    position: 'absolute',\n`;
      style += `    left: ${component.position_x},\n`;
      style += `    top: ${component.position_y},\n`;
      style += `    padding: 12,\n`;
      style += `    backgroundColor: '#FF9500',\n`;
      style += `    borderRadius: 8,\n`;
      break;

    case 'floatingbutton':
      style += `    position: 'absolute',\n`;
      style += `    right: 20,\n`;
      style += `    bottom: 20,\n`;
      style += `    width: ${props.size || 56},\n`;
      style += `    height: ${props.size || 56},\n`;
      style += `    borderRadius: ${(props.size || 56) / 2},\n`;
      style += `    justifyContent: 'center',\n`;
      style += `    alignItems: 'center',\n`;
      style += `    shadowColor: '#000',\n`;
      style += `    shadowOffset: { width: 0, height: 4 },\n`;
      style += `    shadowOpacity: 0.3,\n`;
      style += `    shadowRadius: 8,\n`;
      style += `    elevation: 8,\n`;
      style += `  },\n`;
      style += `  ${styleName}Icon: {\n`;
      style += `    color: '${props.iconColor || '#FFFFFF'}',\n`;
      style += `    fontSize: 24,\n`;
      style += `    fontWeight: 'bold',\n`;
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
      lint: 'eslint .',
      test: 'jest',
    },
    dependencies: {
      'expo': '~51.0.0',
      'expo-status-bar': '~1.12.1',
      'react': '18.2.0',
      'react-native': '0.74.5',
      '@react-navigation/native': '^6.1.18',
      '@react-navigation/native-stack': '^6.10.1',
      'react-native-screens': '~3.31.1',
      'react-native-safe-area-context': '4.10.5',
      '@react-native-community/slider': '^4.5.2',
      'react-native-gesture-handler': '~2.16.1',
      'react-native-reanimated': '~3.10.1',
    },
    devDependencies: {
      '@babel/core': '^7.24.0',
      '@types/react': '~18.2.79',
      'typescript': '^5.3.0',
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
        buildNumber: '1.0.0',
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#000000',
        },
        package: `com.${projectName.toLowerCase().replace(/\s+/g, '')}`,
        versionCode: 1,
      },
      web: {
        favicon: './assets/favicon.png',
      },
      plugins: [
        'expo-router',
        [
          'expo-build-properties',
          {
            ios: {
              newArchEnabled: true
            },
            android: {
              newArchEnabled: true
            }
          }
        ]
      ],
    },
  }, null, 2);
}

export function generateReadme(projectName: string): string {
  return `# ${projectName}

Built with ❤️ using **Sondare** - The Visual App Builder

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed (\`npm install -g expo-cli\`)
- iOS Simulator (Mac) or Android Studio (for Android development)

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server:**
   \`\`\`bash
   npm start
   \`\`\`

3. **Run on your device:**
   - **iOS:** Press \`i\` in terminal or scan QR code with Camera app
   - **Android:** Press \`a\` in terminal or scan QR code with Expo Go app
   - **Web:** Press \`w\` in terminal

## Project Structure

\`\`\`
├── App.js                 # Main application with all screens
├── assets/                # Images, fonts, and other assets
├── package.json           # Dependencies and scripts
└── app.json              # Expo configuration
\`\`\`

## Customization Guide

### Adding New Features

1. **State Management:** All interactive components use React hooks
2. **Navigation:** Uses React Navigation - modify Stack.Navigator to add screens
3. **Styling:** All styles in StyleSheet.create() for performance
4. **API Integration:** Add API calls in useEffect or button handlers

### Common Tasks

**Add a new screen:**
\`\`\`javascript
function NewScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>New Screen</Text>
    </SafeAreaView>
  );
}

// Add to Stack.Navigator:
<Stack.Screen name="NewScreen" component={NewScreen} />
\`\`\`

**Connect to an API:**
\`\`\`javascript
useEffect(() => {
  fetch('https://api.example.com/data')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.error(err));
}, []);
\`\`\`

**Add navigation:**
\`\`\`javascript
<TouchableOpacity onPress={() => navigation.navigate('ScreenName')}>
  <Text>Go to Screen</Text>
</TouchableOpacity>
\`\`\`

## Building for Production

### iOS (Mac only)
\`\`\`bash
expo build:ios
\`\`\`

### Android
\`\`\`bash
expo build:android
\`\`\`

### Publishing Updates
\`\`\`bash
expo publish
\`\`\`

## Testing

- Run on multiple device sizes in simulator
- Test on real devices before publishing
- Check navigation flows work correctly
- Verify all interactive elements respond

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Screen navigation
- **React Hooks** - State management

## Need Help?

- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Sondare Support:** https://sondare.app/support

## Built with Sondare

This app was visually designed and exported from **Sondare**, the no-code app builder for creators.

Visit https://sondare.app to build your own app!
`;
}
