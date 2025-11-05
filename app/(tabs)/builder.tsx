import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Code as Code2, Smartphone, Globe, Layers, Play, Download, Copy, Zap } from 'lucide-react-native';

interface CodeSnippet {
  id: string;
  title: string;
  framework: string;
  code: string;
  description: string;
}

export default function BuilderScreen() {
  const [selectedFramework, setSelectedFramework] = useState('React Native');
  const [prompt, setPrompt] = useState('');
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const frameworks = [
    { name: 'React Native', icon: Smartphone },
    { name: 'Flutter', icon: Smartphone },
    { name: 'React', icon: Globe },
    { name: 'Swift UI', icon: Smartphone },
  ];

  const sampleCode: CodeSnippet[] = [
    {
      id: '1',
      title: 'Login Screen Component',
      framework: 'React Native',
      code: `import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}`,
      description: 'A complete login screen with form validation and styling',
    },
  ];

  const generateCode = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setCodeSnippets(sampleCode);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Code Builder</Text>
          <Text style={styles.headerSubtitle}>
            Generate production-ready code instantly
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.frameworkSection}>
          <Text style={styles.sectionTitle}>Choose Framework</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.frameworkList}>
              {frameworks.map((framework) => {
                const IconComponent = framework.icon;
                const isSelected = selectedFramework === framework.name;
                
                return (
                  <TouchableOpacity
                    key={framework.name}
                    style={[
                      styles.frameworkCard,
                      isSelected && styles.frameworkCardSelected
                    ]}
                    onPress={() => setSelectedFramework(framework.name)}
                  >
                    <IconComponent 
                      size={24} 
                      color={isSelected ? '#FF9500' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.frameworkText,
                      isSelected && styles.frameworkTextSelected
                    ]}>
                      {framework.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Describe Your Component</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Create a user profile screen with avatar, name, bio, and settings button..."
              multiline
              numberOfLines={4}
              value={prompt}
              onChangeText={setPrompt}
              placeholderTextColor="#8E8E93"
            />
          </View>
          
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateCode}
            disabled={isGenerating}
          >
            <View style={styles.buttonContent}>
              {isGenerating ? (
                <View style={styles.buttonContent}>
                  <Zap size={20} color="#000000" />
                  <Text style={styles.generateButtonText}>Generating...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Zap size={20} color="#ffffff" />
                  <Text style={styles.generateButtonText}>Generate Code</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {codeSnippets.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Generated Code</Text>
            {codeSnippets.map((snippet) => (
              <View key={snippet.id} style={styles.codeCard}>
                <View style={styles.codeHeader}>
                  <View style={styles.codeTitleSection}>
                    <Layers size={20} color="#FF9500" />
                    <Text style={styles.codeTitle}>{snippet.title}</Text>
                  </View>
                  <Text style={styles.codeFramework}>{snippet.framework}</Text>
                </View>
                
                <Text style={styles.codeDescription}>{snippet.description}</Text>
                
                <View style={styles.codeContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.codeText}>{snippet.code}</Text>
                  </ScrollView>
                </View>

                <View style={styles.codeActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Copy size={16} color="#FF9500" />
                    <Text style={styles.actionButtonText}>Copy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Play size={16} color="#30D158" />
                    <Text style={styles.actionButtonText}>Preview</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Download size={16} color="#FF9500" />
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.41,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  frameworkSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.35,
    marginBottom: 16,
  },
  frameworkList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  frameworkCard: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 88,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  frameworkCardSelected: {
    borderColor: '#FF9500',
    backgroundColor: '#1C1C1E',
  },
  frameworkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginTop: 8,
  },
  frameworkTextSelected: {
    color: '#FF9500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: -0.41,
    lineHeight: 22,
    minHeight: 88,
  },
  generateButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.41,
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 32,
  },
  codeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginLeft: 8,
  },
  codeFramework: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
    fontFamily: 'System',
    letterSpacing: -0.08,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    lineHeight: 20,
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: 'Menlo',
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 18,
  },
  codeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginLeft: 4,
  },
});