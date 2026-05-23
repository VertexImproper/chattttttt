import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserFeed } from '../api/instagram';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = (SCREEN_WIDTH - 4) / 3;

const ProfileScreen = () => {
  const { theme, themeName, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    if (user?.pk) {
      loadProfile();
      loadUserPosts();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile(user.pk);
      setProfile(data);
    } catch (error) {
      console.error('Profile load error', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const result = await getUserFeed(user.pk);
      setPosts(result.items || []);
    } catch (error) {
      console.error('Posts load error', error);
    }
  };

  const handleThemeSelect = (name) => {
    setTheme(name);
    setShowThemeModal(false);
  };

  const renderPost = ({ item }) => {
    const imageUrl = item.image_versions2?.candidates?.[0]?.url;
    return <FastImage source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />;
  };

  const themeOptions = [
    { name: 'spaceDark', label: 'Space Dark' },
    { name: 'nebula', label: 'Nebula' },
    { name: 'athleticNeon', label: 'Athletic Neon' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{user?.username || 'Profile'}</Text>
        <TouchableOpacity onPress={() => setShowThemeModal(true)} style={styles.settingsBtn}>
          <Icon name="cog-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <FastImage
          source={{ uri: profile?.hd_profile_pic_url_info?.url || user?.profile_pic_url }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>
            {profile?.full_name || user?.full_name || user?.username}
          </Text>
          <Text style={[styles.username, { color: theme.subtext }]}>@{user?.username}</Text>
        </View>
      </View>

      <View style={[styles.stats, { borderColor: theme.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {profile?.media_count || posts.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {profile?.follower_count?.toLocaleString() || '0'}
          </Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {profile?.following_count?.toLocaleString() || '0'}
          </Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Following</Text>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => `profile-post-${item.id || item.pk || index}`}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      />

      <Modal visible={showThemeModal} transparent animationType="slide" onRequestClose={() => setShowThemeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Theme</Text>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                onPress={() => handleThemeSelect(option.name)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.card,
                    borderColor: themeName === option.name ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.themeLabel, { color: theme.text }]}>{option.label}</Text>
                {themeName === option.name && <Icon name="check-circle" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowThemeModal(false)} style={styles.closeModal}>
              <Text style={{ color: theme.subtext }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { borderColor: '#FF3040' }]}>
              <Text style={{ color: '#FF3040', fontWeight: '600' }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsBtn: {
    padding: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
  },
  grid: {
    paddingHorizontal: 2,
  },
  gridImage: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    margin: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeModal: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
});

export default ProfileScreen;
