import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Bell, Zap, Sparkles, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function NotificationsSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [aiGeneration, setAiGeneration] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('push_notifications_enabled, project_updates_enabled, ai_generation_notifications, weekly_digest_enabled, marketing_emails_enabled')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPushEnabled(profile.push_notifications_enabled ?? true);
        setProjectUpdates(profile.project_updates_enabled ?? true);
        setAiGeneration(profile.ai_generation_notifications ?? true);
        setWeeklyDigest(profile.weekly_digest_enabled ?? false);
        setMarketing(profile.marketing_emails_enabled ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (field: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_profiles')
        .update({ [field]: value })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f97315" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f97315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <Text style={styles.sectionDescription}>
            Manage how you receive notifications on your device
          </Text>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#f97315' }]}>
                <Bell size={20} color="#000000" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Enable Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive important updates and alerts
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(value) => {
                setPushEnabled(value);
                updateSetting('push_notifications_enabled', value);
              }}
              trackColor={{ false: '#38383A', true: '#f97315' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#007AFF' }]}>
                <TrendingUp size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Project Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified about project changes
                </Text>
              </View>
            </View>
            <Switch
              value={projectUpdates}
              onValueChange={(value) => {
                setProjectUpdates(value);
                updateSetting('project_updates_enabled', value);
              }}
              trackColor={{ false: '#38383A', true: '#f97315' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#30D158' }]}>
                <Zap size={20} color="#000000" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>AI Generation Complete</Text>
                <Text style={styles.settingDescription}>
                  Know when your AI generations are ready
                </Text>
              </View>
            </View>
            <Switch
              value={aiGeneration}
              onValueChange={(value) => {
                setAiGeneration(value);
                updateSetting('ai_generation_notifications', value);
              }}
              trackColor={{ false: '#38383A', true: '#f97315' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <Text style={styles.sectionDescription}>
            Choose what you want to receive via email
          </Text>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#5E5CE6' }]}>
                <Sparkles size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Weekly Digest</Text>
                <Text style={styles.settingDescription}>
                  Summary of your activity and insights
                </Text>
              </View>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={(value) => {
                setWeeklyDigest(value);
                updateSetting('weekly_digest_enabled', value);
              }}
              trackColor={{ false: '#38383A', true: '#f97315' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF375F' }]}>
                <Bell size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Marketing & Updates</Text>
                <Text style={styles.settingDescription}>
                  News about features and improvements
                </Text>
              </View>
            </View>
            <Switch
              value={marketing}
              onValueChange={(value) => {
                setMarketing(value);
                updateSetting('marketing_emails_enabled', value);
              }}
              trackColor={{ false: '#38383A', true: '#f97315' }}
              thumbColor="#FFFFFF"
            />
          </View>
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
  section: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 20,
  },
  settingsGroup: {
    paddingHorizontal: 16,
    gap: 8,
  },
  settingItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});
