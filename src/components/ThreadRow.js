import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';

const ThreadRow = ({ thread, onPress }) => {
  const { theme } = useTheme();

  const users = thread.users || [];
  const user = users[0] || {};
  const lastMessage = thread.last_message || {};
  const preview = lastMessage.text || 'Sent an attachment';
  const timestamp = lastMessage.timestamp
    ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const unread = thread.read_state === 0 || thread.has_newer;

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(thread)}
      style={[styles.container, { borderBottomColor: theme.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <FastImage source={{ uri: user.profile_pic_url }} style={styles.avatar} />
        {unread && (
          <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.username, { color: theme.text }]} numberOfLines={1}>
            {user.username || 'Unknown'}
          </Text>
          <Text style={[styles.time, { color: theme.subtext }]}>{timestamp}</Text>
        </View>
        <Text style={[styles.preview, { color: theme.subtext }]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a0a1a',
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  preview: {
    fontSize: 14,
  },
});

export default ThreadRow;
