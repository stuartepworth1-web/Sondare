import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text, Alert } from 'react-native';

try {
  const ErrorUtils = (global as any).ErrorUtils;
  if (ErrorUtils) {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('GLOBAL ERROR HANDLER:', error, 'isFatal:', isFatal);
      try {
        Alert.alert(
          'App Error',
          `${error.name}: ${error.message}\n\nStack: ${error.stack?.substring(0, 200)}`,
          [{ text: 'OK' }]
        );
      } catch (alertError) {
        console.error('Failed to show alert:', alertError);
      }
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
} catch (setupError) {
  console.error('Failed to setup error handler:', setupError);
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  useFrameworkReady();

  const [appReady, setAppReady] = React.useState(false);
  const [appError, setAppError] = React.useState<string | null>(null);

  useEffect(() => {
    async function initApp() {
      try {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase configuration');
        }

        setAppReady(true);
      } catch (error: any) {
        console.error('App initialization error:', error);
        setAppError(error.message || 'Failed to initialize');
        setAppReady(true);
      }
    }

    initApp();
  }, []);

  if (!appReady) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1C1C1E', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorDetails}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (appError) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1C1C1E', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Configuration Error</Text>
          <Text style={styles.errorDetails}>{appError}</Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1C1C1E', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF0000',
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
