import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';

const StoryBubble = ({ user, onPress, hasStory }) => {
  const { theme } = useTheme();

  const avatarUrl = user?.profile_pic_url || user?.user?.profile_pic_url;
  const username = user?.username || user?.user?.username || 'user';
  const displayName = username.length > 8 ? username.substring(0, 8) + '..' : username;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <View style={styles.avatarWrapper}>
        {hasStory ? (
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            style={styles.gradientRing}
          >
            <View style={[styles.avatarContainer, { backgroundColor: theme.background }]}>
              <FastImage
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.avatarContainer, { backgroundColor: theme.card }]}>
            <FastImage
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
      <Text style={[styles.username, { color: theme.text }]} numberOfLines={1}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  avatarWrapper: {
    marginBottom: 4,
  },
  gradientRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  username: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    width: 70,
  },
});

export default StoryBubble;
