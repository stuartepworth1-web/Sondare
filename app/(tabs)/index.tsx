import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Send, Zap, Target, Smartphone } from 'lucide-react-native';

interface AppIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  features: string[];
}

export default function IdeasScreen() {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const sampleIdeas: AppIdea[] = [
    {
      id: '1',
      title: 'FitTrack Pro',
      description: 'AI-powered fitness tracking with personalized workout plans',
      category: 'Health & Fitness',
      complexity: 'Medium',
      features: ['Workout tracking', 'AI recommendations', 'Progress analytics', 'Social sharing'],
    },
    {
      id: '2',
      title: 'LocalEats',
      description: 'Discover hidden local restaurants with AR reviews',
      category: 'Food & Drink',
      complexity: 'Complex',
      features: ['AR integration', 'Location-based search', 'Reviews system', 'Booking'],
    },
    {
      id: '3',
      title: 'MindfulMoments',
      description: 'Micro-meditation app for busy professionals',
      category: 'Lifestyle',
      complexity: 'Simple',
      features: ['Quick meditations', 'Stress tracking', 'Reminders', 'Progress streaks'],
    },
  ];

  const generateIdeas = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIdeas(sampleIdeas);
      setIsGenerating(false);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return '#30D158';
      case 'Medium': return '#FF9500';
      case 'Complex': return '#FF453A';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI App Ideas</Text>
          <Text style={styles.headerSubtitle}>
            Generate amazing app concepts powered by AI
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="A social app for book lovers with AI recommendations..."
            multiline
            numberOfLines={4}
            value={prompt}
            onChangeText={setPrompt}
            placeholderTextColor="#8E8E93"
          />
        </View>
        
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateIdeas}
          disabled={isGenerating}
        >
          <View style={styles.generateButtonGradient}>
            {isGenerating ? (
              <>
                <Zap size={20} color="#000000" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Send size={20} color="#000000" />
                <Text style={styles.generateButtonText}>Generate Ideas</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {ideas.length > 0 && (
          <Animated.View style={[styles.resultsSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Generated Ideas</Text>
            {ideas.map((idea) => (
              <View key={idea.id} style={styles.ideaCard}>
                <View style={styles.ideaHeader}>
                  <View style={styles.ideaTitleSection}>
                    <Smartphone size={24} color="#FF9500" />
                    <Text style={styles.ideaTitle}>{idea.title}</Text>
                  </View>
                  <View style={[styles.complexityBadge, { backgroundColor: getComplexityColor(idea.complexity) }]}>
                    <Text style={styles.complexityText}>{idea.complexity}</Text>
                  </View>
                </View>
                <Text style={styles.ideaDescription}>{idea.description}</Text>
                <Text style={styles.ideaCategory}>{idea.category}</Text>
                <View style={styles.featuresSection}>
                  <Text style={styles.featuresTitle}>Key Features</Text>
                  {idea.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Target size={16} color="#FF9500" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.buildButton}>
                  <Text style={styles.buildButtonText}>Start Building</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Animated.View>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputSection: {
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
  generateButtonGradient: {
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
    marginBottom: 24,
  },
  ideaCard: {
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
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ideaTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ideaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginLeft: 8,
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: 0,
  },
  ideaDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    lineHeight: 20,
    marginBottom: 8,
  },
  ideaCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginBottom: 12,
  },
  featuresSection: {
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: -0.24,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    marginLeft: 8,
  },
  buildButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buildButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.24,
  },
});