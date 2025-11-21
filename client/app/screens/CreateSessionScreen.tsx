import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import * as Device from 'expo-device';
import RNPickerSelect from "react-native-picker-select";

import {
  getSessionTypes,
  createSession,
  getSessions,
  deleteSession,
  completeSession,
  getAvailability,
} from '../../services/api';

import { Session, SessionType } from '../../types/session';
import { Availability } from '../../types/availability';
import { isWithinAvailability } from '../utils/availabilityUtils';
import { hasSessionConflict } from '../utils/hasSessionConflict';

export default function SessionsScreen() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState('30');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const macDevice = Device.osInternalBuildId || "";
  const [listAvailability, setListAvailability] = useState<Availability[]>([]);
  const [pickerKey, setPickerKey] = useState(0);

  useEffect(() => {
    fetchTypes();
    fetchSessions();
  }, []);

  async function fetchTypes() {
    try {
      const types = await getSessionTypes();
      setSessionTypes(types);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to load session types.');
    }
  }

  async function fetchSessions() {
    try {
      const data = await getSessions();
      setSessions(data);
      setListAvailability(await getAvailability());

      setSessionTypeId(null);
      setPickerKey(prev => prev + 1);
      setStartTime(null);
      setDuration('30');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to load sessions.');
    }
  }

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  const handleConfirm = (date: Date) => {
    setStartTime(date);
    hidePicker();
  };

  const handleCreateSession = async () => {
    if (!sessionTypeId || !startTime || !duration) {
      Alert.alert('Error', 'Please fill in session type, date/time, and duration.');
      return;
    }

    const endTime = dayjs(startTime).add(Number(duration), 'minute').toDate();

    if (!isWithinAvailability(startTime, endTime, listAvailability)) {
      Alert.alert('Error', 'No availability for the selected date/time.');
      return;
    }

    if (hasSessionConflict(startTime, endTime, sessions)) {
      Alert.alert('Error', 'This session conflicts with an existing session.');
      return;
    }

    try {
      await createSession({
        sessionTypeId,
        startTime: startTime.toISOString(),
        duration: Number(duration),
        mac: macDevice,
      });

      Alert.alert('Success', 'Session created!');
      fetchSessions();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to create session.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      fetchSessions();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to delete session.');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeSession(id);
      fetchSessions();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to complete session.");
    }
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.sessionTitle}>
        {item.sessionType?.name || 'Unnamed'}
      </Text>

      <Text style={styles.sessionCategory}>
        {item.sessionType?.category || 'Category'}
      </Text>

      <Text style={styles.sessionInfo}>
        Date: <Text style={styles.sessionBold}>{dayjs(item.startTime).format('MM/DD/YYYY HH:mm')}</Text>
      </Text>

      <Text style={styles.sessionInfo}>
        Duration: <Text style={styles.sessionBold}>{item.duration} min</Text>
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeButton} onPress={() => handleComplete(item.id)}>
          <Text style={styles.completeText}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchTypes();
      fetchSessions();
    }, [])
  );

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderSession}
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={
        <>
          <Text style={styles.label}>Session Type</Text>

          <RNPickerSelect
            key={pickerKey}
            onValueChange={(value) => setSessionTypeId(value)}
            items={sessionTypes.map(type => ({
              label: `${type.name} (${type.category})`,
              value: type.id,
            }))}
            placeholder={{ label: "Select a type", value: null }}
            style={{
              inputIOS: styles.pickerInput,
              inputAndroid: styles.pickerInput,
            }}
          />

          <Text style={styles.label}>Date & Time</Text>

          <TouchableOpacity style={styles.dateButton} onPress={showPicker}>
            <Text style={styles.dateButtonText}>
              {startTime
                ? dayjs(startTime).format('MM/DD/YYYY HH:mm')
                : 'Select date/time'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isPickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hidePicker}
          />

          <Text style={styles.label}>Duration (min)</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <TouchableOpacity style={styles.createButton} onPress={handleCreateSession}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>

          <Text style={styles.header}>Your Sessions</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  pickerInput: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1E1E1E',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  sessionCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  sessionInfo: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  sessionBold: {
    fontWeight: '700',
    color: '#1E1E1E',
  },
  deleteButton: {
    flex: 1,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  completeButton: {
    flex: 1,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});
