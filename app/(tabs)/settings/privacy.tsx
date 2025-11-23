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

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f97315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: November 2025</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us when you:{'\n\n'}
            • Create an account{'\n'}
            • Use our AI generation features{'\n'}
            • Make purchases through the app{'\n'}
            • Contact us for support
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:{'\n\n'}
            • Provide, maintain, and improve our services{'\n'}
            • Process your transactions and manage your subscription{'\n'}
            • Send you technical notices and support messages{'\n'}
            • Respond to your comments and questions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not share your personal information with third parties except:{'\n\n'}
            • With your consent{'\n'}
            • To comply with legal obligations{'\n'}
            • To protect our rights and prevent fraud{'\n'}
            • With service providers who assist in our operations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate data{'\n'}
            • Request deletion of your data{'\n'}
            • Export your data{'\n'}
            • Opt out of marketing communications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Account Deletion</Text>
          <Text style={styles.paragraph}>
            You can request account deletion at any time through Profile Settings. Upon deletion:{'\n\n'}
            • All your personal data will be permanently deleted{'\n'}
            • Your subscription will be cancelled{'\n'}
            • Your projects and AI generations will be removed{'\n'}
            • This process is irreversible
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:{'\n\n'}
            privacy@sondare.me
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
