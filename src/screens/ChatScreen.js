import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getThread, sendMessage } from '../api/instagram';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = ({ route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { threadId, username } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    loadMessages();
    pollInterval.current = setInterval(loadMessages, 8000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [threadId]);

  const loadMessages = async () => {
    try {
      const thread = await getThread(threadId);
      const items = thread.items || [];
      setMessages(items.reverse());
    } catch (error) {
      console.error('Chat load error', error);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const messageText = text.trim();
    setText('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      item_id: tempId,
      text: messageText,
      user_id: user?.pk || 'me',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage(threadId, messageText);
      loadMessages();
    } catch (error) {
      console.error('Send error', error);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSent = item.user_id === user?.pk || item.is_sent_by_viewer;
    return <MessageBubble message={item} isSent={isSent} />;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => `msg-${item.item_id || item.timestamp || index}`}
        inverted
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View
        style={[
          styles.inputBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
          placeholder="Message..."
          placeholderTextColor={theme.subtext}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={!text.trim() || sending} style={styles.sendBtn}>
          <Icon
            name="send"
            size={24}
            color={text.trim() && !sending ? theme.primary : theme.subtext}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 10,
    padding: 8,
  },
});

export default ChatScreen;
