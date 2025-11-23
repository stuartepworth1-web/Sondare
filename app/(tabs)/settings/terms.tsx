import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function TermsOfService() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f97315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: November 2025</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Subscription Terms</Text>
          <Text style={styles.paragraph}>
            • Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.{'\n\n'}
            • Your account will be charged for renewal within 24 hours prior to the end of the current period.{'\n\n'}
            • Payment will be charged to iTunes Account at confirmation of purchase.{'\n\n'}
            • Subscriptions may be managed and auto-renewal may be turned off by going to Account Settings after purchase.{'\n\n'}
            • Any unused portion of a free trial period will be forfeited when purchasing a subscription.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. AI Generation Credits</Text>
          <Text style={styles.paragraph}>
            AI generation credits are allocated monthly based on your subscription tier and reset at the beginning of each billing cycle. Unused credits do not roll over.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Use License</Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Disclaimer</Text>
          <Text style={styles.paragraph}>
            The materials in this application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Limitations</Text>
          <Text style={styles.paragraph}>
            In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use this application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Account Termination</Text>
          <Text style={styles.paragraph}>
            You may request account deletion at any time through the Profile Settings. Upon deletion, all your data will be permanently removed from our systems within 30 days.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Contact</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at support@sondare.me
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
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    fontWeight: '400',
    color: '#E5E5E7',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 32,
  },
});
