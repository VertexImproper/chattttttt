import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTimeline } from '../api/instagram';
import { filterReels } from '../utils/feedFilter';
import StoryBar from '../components/StoryBar';
import PostCard from '../components/PostCard';

const FeedScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextMaxId, setNextMaxId] = useState(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async (maxId = null) => {
    try {
      const result = await getTimeline(maxId);
      const filtered = filterReels(result.items);

      if (maxId) {
        setPosts((prev) => [...prev, ...filtered]);
      } else {
        setPosts(filtered);
      }
      setNextMaxId(result.nextMaxId);
    } catch (error) {
      console.error('Feed load error', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, []);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !nextMaxId) return;
    setLoadingMore(true);
    await loadFeed(nextMaxId);
    setLoadingMore(false);
  }, [nextMaxId, loadingMore]);

  const renderItem = ({ item }) => (
    <PostCard item={item} onLike={() => {}} onComment={() => {}} onShare={() => {}} onSave={() => {}} />
  );

  const handleStoryPress = (user) => {
    navigation.navigate('StoryViewer', {
      userId: user.pk || user.id,
      users: [user],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `post-${item.id || item.pk || index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<StoryBar onStoryPress={handleStoryPress} />}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : null
        }
        windowSize={5}
        maxToRenderPerBatch={5}
        initialNumToRender={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    paddingVertical: 20,
  },
});

export default FeedScreen;
