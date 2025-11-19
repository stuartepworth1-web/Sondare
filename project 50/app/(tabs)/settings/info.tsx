import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ChevronLeft, Info, Shield, FileText, Mail, ExternalLink, Code } from 'lucide-react-native';
import { router } from 'expo-router';

export default function AppInfo() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#FF9500" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appSection}>
          <View style={styles.appIcon}>
            <Code size={48} color="#FF9500" />
          </View>
          <Text style={styles.appName}>AI App Builder</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Build amazing mobile applications with AI-powered design and code generation tools
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>AI-powered app idea generation</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Visual design builder with Canva-like controls</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Code generation for multiple frameworks</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Project management and organization</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Export and share your projects</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
        </View>

        <View style={styles.linksGroup}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://example.com/privacy')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#007AFF' }]}>
                <Shield size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </View>
            <ExternalLink size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://example.com/terms')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#30D158' }]}>
                <FileText size={20} color="#000000" />
              </View>
              <Text style={styles.linkText}>Terms of Service</Text>
            </View>
            <ExternalLink size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('mailto:support@example.com')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#FF9500' }]}>
                <Mail size={20} color="#000000" />
              </View>
              <Text style={styles.linkText}>Contact Support</Text>
            </View>
            <ExternalLink size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2025 AI App Builder. All rights reserved.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Made with ❤️ for developers
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  appSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
    marginTop: 7,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 20,
    flex: 1,
  },
  linksGroup: {
    paddingHorizontal: 16,
    gap: 8,
  },
  linkItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  copyrightText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
  },
  bottomSpacer: {
    height: 32,
  },
});
