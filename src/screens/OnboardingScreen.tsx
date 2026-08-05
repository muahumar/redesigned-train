import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../utils/theme';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>; // P17 fix

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to Istiqamah',
    description: 'Track your daily Salah and build lasting habits with consistency and purpose.',
    emoji: '🕌',
  },
  {
    id: '2',
    title: 'Stay Consistent',
    description: 'Log your prayers, track habits, and visualize your progress over time.',
    emoji: '📈',
  },
  {
    id: '3',
    title: 'Share Your Progress',
    description: 'Share your daily summary with friends and family to stay accountable.',
    emoji: '📤',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { setOnboarded } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null); // P8 fix: ref for programmatic scroll

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#111' : '#fff';
  const textColor = isDark ? '#fff' : '#111';
  const subtextColor = isDark ? '#aaa' : '#666';

  const handleGetStarted = () => {
    setOnboarded(true);
    navigation.replace('Main');
  };

  // P8 fix: "Next" advances slides programmatically; only last slide triggers getStarted
  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const nextIndex = currentSlide + 1;
      scrollRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentSlide(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    navigation.replace('Main');
  };

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ScrollView
        ref={scrollRef}   // P8 fix: attach ref
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}  // Disable manual swipe — use Next button only
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={[styles.title, { color: textColor }]}>{slide.title}</Text>
            <Text style={[styles.description, { color: subtextColor }]}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentSlide ? '#1565c0' : '#ccc' },
              ]}
            />
          ))}
        </View>

        {/* P8 fix: uses handleNext instead of handleGetStarted */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>

        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  button: { backgroundColor: '#1565c0', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  skipText: { color: '#888', fontSize: 14, marginTop: 16 },
});
