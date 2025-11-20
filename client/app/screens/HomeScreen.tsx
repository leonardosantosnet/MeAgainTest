import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SessionCard } from '../../components/SessionCard';
import { StatCard } from '../../components/StatCard';

interface Session {
  id: string;
  typeName: string;
  startTime: string;
  duration: number;
  priority: number;
  completed: boolean;
}

interface Stats {
  total: number;
  completed: number;
  averageSpacing?: number;
  streak?: number;
}

export function HomeScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0 });

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  async function fetchSessions() {
    try {
      //const response = await api.get('/sessions');
      //setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }

  async function fetchStats() {
    try {
      //const response = await api.get('/progress');
      //setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  return (
    <ScrollView style={styles.container}>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB', // light gray background
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  noSessionsText: {
    fontSize: 16,
    color: '#6B7280', // gray
    marginBottom: 8,
  },
});