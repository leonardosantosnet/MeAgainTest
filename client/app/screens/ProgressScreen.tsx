import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getProgress } from '../../services/api';

export default function ProgressScreen() {
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    streak: number;
  } | null>(null);

  async function loadProgress() {
    try {
      const progress = await getProgress();
      setStats(progress);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>Loading progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Scheduled Sessions:</Text>
        <Text style={styles.value}>{stats.total}</Text>

        <Text style={styles.label}>Completed Sessions:</Text>
        <Text style={styles.value}>{stats.completed}</Text>

        <Text style={styles.label}>Current Streak:</Text>
        <Text style={styles.value}>{stats.streak} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
});