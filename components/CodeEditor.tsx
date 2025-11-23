import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Plus,
  Minus,
  RotateCcw,
  Copy,
  Download,
  Settings,
  Eye,
  Code,
} from 'lucide-react-native';
import { EditorPreferences } from '@/lib/projects';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fileName?: string;
  preferences: EditorPreferences;
  onPreferencesChange: (prefs: Partial<EditorPreferences>) => void;
  onCopy?: () => void;
  onExport?: () => void;
}

export function CodeEditor({
  code,
  onChange,
  fileName,
  preferences,
  onPreferencesChange,
  onCopy,
  onExport,
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    if (preferences.autoSave) {
      const timer = setTimeout(() => {
        if (localCode !== code) {
          onChange(localCode);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [localCode, preferences.autoSave]);

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10, Math.min(24, preferences.fontSize + delta));
    onPreferencesChange({ fontSize: newSize });
  };

  const lines = localCode.split('\n');

  return (
    <View style={[styles.container, preferences.theme === 'light' && styles.containerLight]}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          {fileName && (
            <Text style={[styles.fileName, preferences.theme === 'light' && styles.textLight]}>
              {fileName}
            </Text>
          )}
        </View>

        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => handleFontSizeChange(-1)}
          >
            <Minus size={18} color={preferences.theme === 'dark' ? '#8E8E93' : '#666'} />
          </TouchableOpacity>

          <Text style={[styles.fontSize, preferences.theme === 'light' && styles.textLight]}>
            {preferences.fontSize}
          </Text>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => handleFontSizeChange(1)}
          >
            <Plus size={18} color={preferences.theme === 'dark' ? '#8E8E93' : '#666'} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {onCopy && (
            <TouchableOpacity style={styles.toolButton} onPress={onCopy}>
              <Copy size={18} color={preferences.theme === 'dark' ? '#8E8E93' : '#666'} />
            </TouchableOpacity>
          )}

          {onExport && (
            <TouchableOpacity style={styles.toolButton} onPress={onExport}>
              <Download size={18} color={preferences.theme === 'dark' ? '#8E8E93' : '#666'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Settings size={18} color={preferences.theme === 'dark' ? '#f97315' : '#f97315'} />
          </TouchableOpacity>
        </View>
      </View>

      {showSettings && (
        <View style={[styles.settingsPanel, preferences.theme === 'light' && styles.settingsPanelLight]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => onPreferencesChange({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
          >
            <Text style={[styles.settingLabel, preferences.theme === 'light' && styles.textLight]}>
              Theme: {preferences.theme === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => onPreferencesChange({ showLineNumbers: !preferences.showLineNumbers })}
          >
            <Text style={[styles.settingLabel, preferences.theme === 'light' && styles.textLight]}>
              Line Numbers: {preferences.showLineNumbers ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => onPreferencesChange({ wordWrap: !preferences.wordWrap })}
          >
            <Text style={[styles.settingLabel, preferences.theme === 'light' && styles.textLight]}>
              Word Wrap: {preferences.wordWrap ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => onPreferencesChange({ autoSave: !preferences.autoSave })}
          >
            <Text style={[styles.settingLabel, preferences.theme === 'light' && styles.textLight]}>
              Auto Save: {preferences.autoSave ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.editorContainer}
        horizontal={!preferences.wordWrap}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.editorContent}>
          {preferences.showLineNumbers && (
            <View style={styles.lineNumbers}>
              {lines.map((_, index) => (
                <Text
                  key={index}
                  style={[
                    styles.lineNumber,
                    { fontSize: preferences.fontSize },
                    preferences.theme === 'light' && styles.lineNumberLight
                  ]}
                >
                  {index + 1}
                </Text>
              ))}
            </View>
          )}

          <TextInput
            style={[
              styles.codeInput,
              {
                fontSize: preferences.fontSize,
                color: preferences.theme === 'dark' ? '#FFFFFF' : '#000000',
              }
            ]}
            value={localCode}
            onChangeText={setLocalCode}
            multiline
            scrollEnabled={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="default"
            placeholder="Start typing your code..."
            placeholderTextColor={preferences.theme === 'dark' ? '#666' : '#999'}
          />
        </View>
      </ScrollView>

      {!preferences.autoSave && localCode !== code && (
        <View style={styles.saveBar}>
          <Text style={styles.saveText}>Unsaved changes</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onChange(localCode)}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  containerLight: {
    backgroundColor: '#F5F5F5',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  toolbarLeft: {
    flex: 1,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textLight: {
    color: '#000',
  },
  toolButton: {
    padding: 6,
  },
  fontSize: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#38383A',
    marginHorizontal: 4,
  },
  settingsPanel: {
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  settingsPanelLight: {
    backgroundColor: '#E5E5E5',
  },
  settingRow: {
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  editorContainer: {
    flex: 1,
  },
  editorContent: {
    flexDirection: 'row',
    padding: 12,
  },
  lineNumbers: {
    paddingRight: 12,
    paddingTop: 2,
  },
  lineNumber: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: '#666',
    lineHeight: 22,
    textAlign: 'right',
    minWidth: 30,
  },
  lineNumberLight: {
    color: '#999',
  },
  codeInput: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    lineHeight: 22,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
  },
  saveBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2C2C2E',
    borderTopWidth: 1,
    borderTopColor: '#38383A',
  },
  saveText: {
    fontSize: 14,
    color: '#FF9500',
  },
  saveButton: {
    backgroundColor: '#f97315',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
