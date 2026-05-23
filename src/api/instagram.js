import axios from 'axios';
import { getSession, saveSession, clearSession } from '../utils/session';

const BASE_URL = 'https://i.instagram.com/api/v1/';

const HEADERS = {
  'User-Agent': 'Instagram 269.0.0.18.75 Android (26/8.0.0; 480dpi; 1080x1920; OnePlus; ONEPLUS A3003; OnePlus3; qcom; en_US; 314665256)',
  'Accept-Language': 'en-US',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'X-IG-App-ID': '936619743392459',
  'X-IG-Capabilities': '3brTvw==',
  'X-IG-Connection-Type': 'WIFI',
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: HEADERS,
  timeout: 30000,
});

let cookieStore = {};

const parseCookies = (setCookieHeader) => {
  if (!setCookieHeader) return {};
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const parsed = {};
  cookies.forEach((cookie) => {
    const parts = cookie.split(';')[0].trim();
    const eqIdx = parts.indexOf('=');
    if (eqIdx > 0) {
      const name = parts.substring(0, eqIdx).trim();
      const value = parts.substring(eqIdx + 1).trim();
      parsed[name] = value;
    }
  });
  return parsed;
};

const buildCookieHeader = (cookies) => {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
};

let lastRequestTime = 0;
const MIN_DELAY_MS = 1200;

api.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const session = getSession();
  if (session && session.cookies) {
    config.headers.Cookie = buildCookieHeader(session.cookies);
  }

  if (config.method === 'post' && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const newCookies = parseCookies(setCookie);
      const session = getSession() || { cookies: {} };
      session.cookies = { ...session.cookies, ...newCookies };
      saveSession(session);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        clearSession();
      } else if (status === 429) {
        console.warn('Rate limited by Instagram — backing off');
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    const data = new URLSearchParams();
    data.append('username', username);
    data.append('password', password);
    data.append('device_id', `android-${Math.random().toString(36).substring(2, 10)}`);
    data.append('login_attempt_count', '0');

    const response = await api.post('accounts/login/', data.toString());

    if (response.data.status === 'ok') {
      const cookies = parseCookies(response.headers['set-cookie']);
      const user = response.data.logged_in_user;

      const sessionData = {
        cookies,
        user,
        ds_user_id: user.pk,
        csrftoken: cookies.csrftoken || '',
        sessionid: cookies.sessionid || '',
      };

      saveSession(sessionData);
      return { success: true, user };
    } else {
      return { success: false, error: response.data.message || 'Login failed' };
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Network error';
    return { success: false, error: message };
  }
};

export const getTimeline = async (maxId = null) => {
  try {
    let url = 'feed/timeline/?reason=cold_start_fetch';
    if (maxId) url += `&max_id=${maxId}`;
    const response = await api.get(url);
    const items = response.data.feed_items || response.data.items || [];
    return {
      items,
      nextMaxId: response.data.next_max_id || null,
    };
  } catch (error) {
    throw error;
  }
};

export const getStoryTray = async () => {
  try {
    const response = await api.get('feed/reels_tray/');
    return response.data.tray || [];
  } catch (error) {
    throw error;
  }
};

export const getStories = async (userIds) => {
  try {
    const data = new URLSearchParams();
    data.append('user_ids', JSON.stringify(userIds));
    const response = await api.post('feed/reels_media/', data.toString());
    return response.data.reels || {};
  } catch (error) {
    throw error;
  }
};

export const getInbox = async () => {
  try {
    const response = await api.get('direct_v2/inbox/');
    return response.data.inbox || { threads: [] };
  } catch (error) {
    throw error;
  }
};

export const getThread = async (threadId, cursor = null) => {
  try {
    let url = `direct_v2/threads/${threadId}/`;
    if (cursor) url += `?cursor=${cursor}`;
    const response = await api.get(url);
    return response.data.thread || { items: [] };
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (threadId, text) => {
  try {
    const data = new URLSearchParams();
    data.append('text', text);
    data.append('action', 'send_item');
    const response = await api.post(
      `direct_v2/threads/${threadId}/broadcast/text/`,
      data.toString()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`users/${userId}/info/`);
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

export const getUserFeed = async (userId, maxId = null) => {
  try {
    let url = `feed/user/${userId}/`;
    if (maxId) url += `?max_id=${maxId}`;
    const response = await api.get(url);
    return {
      items: response.data.items || [],
      nextMaxId: response.data.next_max_id || null,
    };
  } catch (error) {
    throw error;
  }
};

export default api;
