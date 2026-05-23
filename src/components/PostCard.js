import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostCard = ({ item, onLike, onComment, onShare, onSave }) => {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const media = item.media_or_ad || item;
  const user = media.user || {};
  const images = [];

  if (media.carousel_media && media.carousel_media.length > 0) {
    media.carousel_media.forEach((cm) => {
      if (cm.image_versions2?.candidates?.[0]?.url) {
        images.push(cm.image_versions2.candidates[0].url);
      }
    });
  } else if (media.image_versions2?.candidates?.[0]?.url) {
    images.push(media.image_versions2.candidates[0].url);
  }

  const likeCount = media.like_count || 0;
  const caption = media.caption?.text || '';
  const timestamp = media.taken_at
    ? new Date(media.taken_at * 1000).toLocaleDateString()
    : '';

  const handleLike = () => {
    setLiked(!liked);
    onLike && onLike(media.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave && onSave(media.id);
  };

  const renderImage = ({ item: uri }) => (
    <FastImage
      source={{ uri }}
      style={[styles.image, { width: SCREEN_WIDTH - 32 }]}
      resizeMode="cover"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <FastImage
          source={{ uri: user.profile_pic_url }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.username, { color: theme.text }]}>{user.username}</Text>
          <Text style={[styles.timestamp, { color: theme.subtext }]}>{timestamp}</Text>
        </View>
      </View>

      {images.length > 1 ? (
        <View>
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(uri, idx) => `img-${media.id}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32)
              );
              setActiveIndex(index);
            }}
          />
          <View style={styles.dotContainer}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === activeIndex ? theme.primary : theme.subtext,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : (
        images.length > 0 && (
          <FastImage
            source={{ uri: images[0] }}
            style={[styles.singleImage, { width: SCREEN_WIDTH - 32 }]}
            resizeMode="cover"
          />
        )
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? '#FF3040' : theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} style={styles.actionBtn}>
          <Icon name="comment-outline" size={26} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
          <Icon name="send-outline" size={26} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
          <Icon
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={[styles.likes, { color: theme.text }]}>
          {likeCount.toLocaleString()} likes
        </Text>
        {caption ? (
          <Text style={[styles.caption, { color: theme.text }]} numberOfLines={3}>
            <Text style={styles.captionUsername}>{user.username}</Text> {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    height: 300,
  },
  singleImage: {
    height: 300,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtn: {
    marginRight: 16,
  },
  spacer: {
    flex: 1,
  },
  info: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
  },
});

export default PostCard;
