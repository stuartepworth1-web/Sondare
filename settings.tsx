import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, CreditCard, User, Bell, Info, RotateCcw, FileText, Shield } from 'lucide-react-native';
import { restorePurchases } from '../../lib/revenuecat';
import { UpgradeModalIAP } from '../../components/UpgradeModalIAP';
import { CreditsBar } from '../../components/CreditsBar';
import { useCredits } from '../../contexts/CreditsContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { credits, profile } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const getCreditsForTier = (tier: string) => {
    switch (tier) {
      case 'starter': return 20;
      case 'pro': return 50;
      case 'entrepreneur': return 200;
      default: return 3;
    }
  };

  const creditsRemaining = credits - profile?.total_credits_spent ?? 0;
  const creditsPercentage = (creditsRemaining / credits) * 100;

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo) {
        {}
        Alert.alert('Success', 'Your purchases have been restored successfully!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <LinearGradient
      colors={['#010202', '#101623']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <CreditsBar
        credits={credits}
        creditsUsed={profile?.total_credits_spent ?? 0}
        onUpgrade={() => setShowUpgradeModal(true)}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.creditsCard}>
          <View style={styles.creditsHeader}>
            <View style={styles.creditsIconContainer}>
              <Zap size={24} color="#f97315" />
            </View>
            <View style={styles.creditsInfo}>
              <Text style={styles.creditsTitle}>AI Generation Credits</Text>
              <Text style={styles.creditsSubtitle}>
                {creditsRemaining} of {credits} remaining
              </Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${creditsPercentage}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setShowUpgradeModal(true)}
          >
            <CreditCard size={18} color="#000000" />
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planName}>
              {(profile?.subscription_tier || 'free') === 'free' ? 'Free Plan' :
               (profile?.subscription_tier || 'free') === 'starter' ? 'Starter Plan' :
               (profile?.subscription_tier || 'free') === 'pro' ? 'Pro Plan' : 'Entrepreneur Plan'}
            </Text>
            <Text style={styles.planCredits}>
              {getCreditsForTier(profile?.subscription_tier || 'free')} AI Generations/month
            </Text>
            <TouchableOpacity
              style={styles.changePlanButton}
              onPress={() => setShowUpgradeModal(true)}
            >
              <Text style={styles.changePlanText}>Change Plan</Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color="#f97315" />
                ) : (
                  <>
                    <RotateCcw size={16} color="#f97315" />
                    <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/settings/profile')}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <User size={20} color="#f97315" />
              </View>
              <Text style={styles.settingItemText}>Profile Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/settings/notifications')}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Bell size={20} color="#f97315" />
              </View>
              <Text style={styles.settingItemText}>Notifications</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/settings/terms')}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <FileText size={20} color="#f97315" />
              </View>
              <Text style={styles.settingItemText}>Terms of Use</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/settings/privacy')}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Shield size={20} color="#f97315" />
              </View>
              <Text style={styles.settingItemText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/settings/info')}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Info size={20} color="#f97315" />
              </View>
              <Text style={styles.settingItemText}>App Information</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <UpgradeModalIAP
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={"free" as any}
        onUpgradeSuccess={async () => {
          {}
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  creditsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2C2C2E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creditsInfo: {
    flex: 1,
  },
  creditsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creditsSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f97315',
    borderRadius: 4,
  },
  upgradeButton: {
    backgroundColor: '#f97315',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planCredits: {
    fontSize: 15,
    fontWeight: '400',
    color: '#f97315',
    marginBottom: 16,
  },
  changePlanButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePlanText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f97315',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f97315',
  },
  settingItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
  },
  bottomSpacer: {
    height: 32,
  },
});
