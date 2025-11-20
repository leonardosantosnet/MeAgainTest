import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { getFullSessions } from '../../services/api';
import dayjs from 'dayjs';

export default function ProgressScreen() {
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    streak: number;
  } | null>(null);

  async function loadProgress() {
    try {
      const sessions = await getFullSessions();
      const now = dayjs();

      const total = sessions.length;
      const completedSessions = sessions.filter((s: { completed: any; }) => s.completed);
      const completed = completedSessions.length;

      // Calculate streak
      const completedDates = completedSessions
        .map((s: { dateTime: string | number | dayjs.Dayjs | Date | null | undefined; }) => dayjs(s.dateTime).startOf('day'))
        .sort((a: number, b: number) => b.valueOf() - a.valueOf());

      let streak = 0;
      let referenceDay = now.startOf('day');

      for (const d of completedDates) {
        if (d.isSame(referenceDay, 'day')) {
          streak++;
          referenceDay = referenceDay.subtract(1, 'day');
        } else if (d.isBefore(referenceDay, 'day')) {
          break;
        }
      }

      setStats({ total, completed, streak });
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  }

  useFocusEffect(
      useCallback(() => {
         loadProgress();
      }, [])
  );
  
  useEffect(() => {
    loadProgress();
  }, []);

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading progress…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Statistics Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Scheduled</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{stats.completed}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{stats.streak} days</Text>
        </View>
      </View>


      <Text style={styles.progressBarText}>
        {stats.completed} of {stats.total} sessions completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F2F4F8',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 32,
  },
  statItem: {
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    color: '#1E1E1E',
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  progressBarFill: {
    backgroundColor: '#3B82F6',
  },
  progressBarEmpty: {
    backgroundColor: 'transparent',
  },
  progressBarText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
});
