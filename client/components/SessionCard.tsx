import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SessionCardProps {
  session: {
    id: string;
    typeName: string;
    startTime: string;
    duration: number;
    priority: number;
    completed: boolean;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  const start = new Date(session.startTime).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return (
    <View style={[styles.card, session.completed && styles.completedCard]}>
      <View style={styles.header}>
        <Text style={styles.type}>{session.typeName}</Text>
        <Text style={styles.priority}>Priority: {session.priority}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.time}>Start: {start}</Text>
        <Text style={styles.duration}>Duration: {session.duration} min</Text>
        {session.completed && <Text style={styles.completedText}>Completed</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  completedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priority: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 14,
    color: '#374151',
  },
  duration: {
    fontSize: 14,
    color: '#374151',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
