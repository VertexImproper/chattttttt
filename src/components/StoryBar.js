import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStoryTray } from '../api/instagram';
import StoryBubble from './StoryBubble';

const StoryBar = ({ onStoryPress }) => {
  const { theme } = useTheme();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const tray = await getStoryTray();
      setStories(tray);
    } catch (error) {
      console.error('Failed to load stories', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <StoryBubble
      user={item}
      hasStory={true}
      onPress={() => onStoryPress && onStoryPress(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item, index) => `story-${item.id || item.pk || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
});

export default StoryBar;
