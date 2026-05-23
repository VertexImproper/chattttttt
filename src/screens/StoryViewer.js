import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { useTheme } from '../context/ThemeContext';
import { getStories } from '../api/instagram';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StoryViewer = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { userId, users } = route.params || {};
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const pollRef = useRef(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const userIds = users ? users.map((u) => u.pk || u.id) : [userId];
      const result = await getStories(userIds);
      const userStories = result[userId] || result[userIds[0]] || { items: [] };
      setStories(userStories.items || []);
    } catch (error) {
      console.error('Failed to load stories', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStory = stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, stories, navigation]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStory || paused) return;
    setProgress(0);
    const startTime = Date.now();
    pollRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / 5000, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(pollRef.current);
        goNext();
      }
    }, 50);
    return () => clearInterval(pollRef.current);
  }, [currentIndex, stories, paused, goNext]);

  const handleTap = (e) => {
    const x = e.nativeEvent.locationX;
    if (x < SCREEN_WIDTH / 2) {
      goPrevious();
    } else {
      goNext();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (event.nativeEvent.translationY > 100) {
        navigation.goBack();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading stories...</Text>
      </View>
    );
  }

  if (!currentStory) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.text }}>No stories available. Tap to close.</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isVideo = currentStory.media_type === 2;
  const imageUrl = currentStory.image_versions2?.candidates?.[0]?.url;
  const videoUrl = currentStory.video_versions?.[0]?.url;
  const username = currentStory.user?.username || 'user';
  const timestamp = currentStory.taken_at
    ? new Date(currentStory.taken_at * 1000).toLocaleTimeString()
    : '';

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetY={[-5, 5]}
      failOffsetX={[-20, 20]}
    >
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <View style={styles.progressContainer}>
          {stories.map((_, idx) => (
            <View key={idx} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      idx === currentIndex
                        ? `${progress * 100}%`
                        : idx < currentIndex
                        ? '100%'
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.headerText}>
            {username} • {timestamp}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={1} onPress={handleTap} style={styles.content}>
          {isVideo && videoUrl ? (
            <Video
              source={{ uri: videoUrl }}
              style={styles.media}
              resizeMode="contain"
              repeat={false}
              paused={paused}
              onEnd={goNext}
            />
          ) : (
            <FastImage source={{ uri: imageUrl }} style={styles.media} resizeMode="contain" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeArea}>
          <View style={styles.swipeIndicator} />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  progressContainer: {
    position: 'absolute',
    top: 40,
    left: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
});

export default StoryViewer;
