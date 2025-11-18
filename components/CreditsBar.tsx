import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';

interface CreditsBarProps {
  credits: number;
  creditsUsed: number;
  onUpgrade?: () => void;
}

export function CreditsBar({ credits, creditsUsed, onUpgrade }: CreditsBarProps) {
  const creditsRemaining = credits - creditsUsed;
  const creditsPercentage = (creditsRemaining / credits) * 100;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Zap size={18} color="#FF9500" fill="#FF9500" />
          <Text style={styles.creditsText}>
            {creditsRemaining} / {credits}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${creditsPercentage}%` }
              ]}
            />
          </View>
        </View>

        {onUpgrade && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
  upgradeButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
});
