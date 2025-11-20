import axios from 'axios';
import * as Device from 'expo-device';
const macDevice = Device.osInternalBuildId;

console.log("Device ID:", Device.osInternalBuildId);


const BASE_URL = 'http://192.168.1.209:3000/api'; // ou 10.0.2.2 para Android emulator

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// ------------------- SESSION TYPES -------------------

export async function getSessionTypes() {
  const res = await api.get(`/session-types?mac=${macDevice}`);
  return res.data;
}

export async function createSessionType(data: { name: string; category: string; priority: number; mac: string }) {
  const res = await api.post(`/session-types?mac=${macDevice}`, data);
  return res.data;
}

export async function deleteSessionType(id: string) {
  await api.delete(`/session-types/?id=${id}`);
}

// ------------------- AVAILABILITY -------------------

export async function getAvailability() {
  const res = await api.get(`/availability?mac=${macDevice}`);
  return res.data;
}

export async function createAvailability(data: { day: string; startHour: string; endHour: string; mac: string }) {
  const res = await api.post(`/availability?mac=${macDevice}`, data);
  return res.data;
}

export async function deleteAvailability(id: string) {
  await api.delete(`/availability/?id=${id}`);
}

// ------------------- SESSIONS -------------------

export async function getSessions() {
  const res = await api.get(`/sessions?mac=${macDevice}`);
  return res.data;
}

export async function getFullSessions() {
  const res = await api.get(`/sessions?mac=${macDevice}&filter=full`);
  return res.data;
}

export async function createSession(data: { sessionTypeId: number; startTime: string; duration: number, mac: string }) {
  const res = await api.post(`/sessions?action=INSERT&mac=${macDevice}`, data);
  return res.data;
}

export async function deleteSession(id: string) {
  await api.delete(`/sessions/?id=${id}`);
}

export async function completeSession(id: string) {
  console.log("completeSession");
  const response = await api.post(`/sessions/?action=COMPLETE_SESSION&id=${id}&mac=${macDevice}`);
  return response.data;
}



export async function getSuggestions(data: { sessionTypeId: number; duration: number }) {
  const res = await api.post('/sessions/suggest', data);
  return res.data;
}

// ------------------- PROGRESS -------------------

export async function getProgress() {
  const res = await api.get('/progress');
  return res.data;
}