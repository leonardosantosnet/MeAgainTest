import axios from 'axios';
import * as Device from 'expo-device';
import dayjs from 'dayjs';

const macDevice = Device.osInternalBuildId;
const BASE_URL = 'http://192.168.1.209:3000/api'; // ou 10.0.2.2 para Android emulator

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'X-Device-ID': macDevice,
  },
});

// ------------------- SESSION TYPES -------------------

export const getSessionTypes = async () => {
  const res = await api.get(`/session-types?mac=${macDevice}`);
  return res.data;
};

export const createSessionType = async (data: { name: string; category: string; priority: number; mac: string }) => {
  const res = await api.post(`/session-types?mac=${macDevice}`, data);
  return res.data;
};

export const deleteSessionType = async (id: string) => {
  await api.delete(`/session-types/?id=${id}`);
};

// ------------------- AVAILABILITY -------------------

export const getAvailability = async () => {
  const res = await api.get(`/availability?mac=${macDevice}`);
  return res.data;
};

export const createAvailability = async (data: { day: string; startHour: string; endHour: string; mac: string }) => {
  const res = await api.post(`/availability?mac=${macDevice}`, data);
  return res.data;
};

export const deleteAvailability = async (id: string) => {
  await api.delete(`/availability/?id=${id}`);
};

// ------------------- SESSIONS -------------------

export const getSessions = async () => {
  const res = await api.get(`/sessions?mac=${macDevice}`);
  return res.data;
};

export const getFullSessions = async () => {
  const res = await api.get(`/sessions?mac=${macDevice}&filter=full`);
  return res.data;
};

export const getFullSessionsToday = async () => {
  const res = await api.get(
    `/sessions?mac=${macDevice}&filter=full&date=${dayjs().format('YYYY-MM-DD')}`
  );
  return res.data;
};

export const createSession = async (data: { sessionTypeId: number; startTime: string; duration: number; mac: string }) => {
  const res = await api.post(`/sessions?action=INSERT&mac=${macDevice}`, data);
  return res.data;
};

export const deleteSession = async (id: string) => {
  await api.delete(`/sessions/?id=${id}`);
};

export const completeSession = async (id: string) => {
  const res = await api.post(`/sessions/?action=COMPLETE_SESSION&id=${id}&mac=${macDevice}`);
  return res.data;
};

export const getSuggestions = async (data: { sessionTypeId: number; duration: number }) => {
  const res = await api.post('/sessions/suggest', data);
  return res.data;
};

// ------------------- PROGRESS -------------------

export const getProgress = async () => {
  const res = await api.get('/progress');
  return res.data;
};
