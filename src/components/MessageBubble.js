import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const MessageBubble = ({ message, isSent }) => {
  const { theme } = useTheme();

  const text = message.text || '';
  const media = message.visual_media || message.media_share;
  const imageUrl = media?.image_versions2?.candidates?.[0]?.url;

  if (isSent) {
    return (
      <View style={[styles.container, styles.sentContainer]}>
        <LinearGradient
          colors={[theme.primary, theme.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sentBubble}
        >
          {imageUrl && (
            <FastImage
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          {text ? <Text style={styles.sentText}>{text}</Text> : null}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.receivedContainer]}>
      <View style={[styles.receivedBubble, { backgroundColor: theme.card }]}>
        {imageUrl && (
          <FastImage
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        {text ? (
          <Text style={[styles.receivedText, { color: theme.text }]}>{text}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  sentBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  receivedBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  sentText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  receivedText: {
    fontSize: 15,
    lineHeight: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
});

export default MessageBubble;
