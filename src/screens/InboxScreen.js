import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getInbox } from '../api/instagram';
import ThreadRow from '../components/ThreadRow';

const InboxScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [threads, setThreads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    try {
      const inbox = await getInbox();
      setThreads(inbox.threads || []);
    } catch (error) {
      console.error('Inbox load error', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInbox();
    setRefreshing(false);
  }, []);

  const handleThreadPress = (thread) => {
    const users = thread.users || [];
    const username = users[0]?.username || 'Chat';
    navigation.navigate('Chat', {
      threadId: thread.thread_id || thread.threadId,
      username,
    });
  };

  const renderItem = ({ item }) => <ThreadRow thread={item} onPress={handleThreadPress} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={(item, index) => `thread-${item.thread_id || item.threadId || index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.subtext }}>No messages yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default InboxScreen;
