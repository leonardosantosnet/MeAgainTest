import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import * as Device from 'expo-device';

import RNPickerSelect from "react-native-picker-select";

import { getSessionTypes, createSession, getSessions, deleteSession } from '../../services/api';
import { Session, SessionType } from '../../types/session';

export default function SessionsScreen() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState('30');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const macDevice = Device.osInternalBuildId || "";

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

    try {
      await createSession({
        sessionTypeId,
        startTime: startTime.toISOString(),
        duration: Number(duration),
        mac: macDevice,
      });
      Alert.alert('Success', 'Session created!');
      setSessionTypeId(null);
      setStartTime(null);
      setDuration('30');
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

  const renderSession = ({ item }: { item: Session }) => {
    return (
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>
          {item.sessionType?.name || 'Unnamed'}
        </Text>
        <Text style={styles.sessionCategory}>
          {item.sessionType?.category || 'Category'}
        </Text>
        <Text style={styles.sessionInfo}>
          Date: <Text style={styles.sessionBold}>{dayjs(item.dateTime).format('MM/DD/YYYY HH:mm')}</Text>
        </Text>
        <Text style={styles.sessionInfo}>
          Duration: <Text style={styles.sessionBold}>{item.duration} min</Text>
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
            onValueChange={(value) => setSessionTypeId(value)}
            items={sessionTypes.map(type => ({
              label: `${type.name} (${type.category})`,
              value: type.id,
            }))}
            placeholder={{ label: "Select a type", value: null }}
            style={{
              inputIOS: {
                padding: 14,
                borderRadius: 12,
                backgroundColor: '#fff',
                fontSize: 16,
              },
              inputAndroid: {
                padding: 14,
                borderRadius: 12,
                backgroundColor: '#fff', 
                fontSize: 16,
              },
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
  container: {
    padding: 20,
    backgroundColor: '#F2F4F8',
    flexGrow: 1,
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
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
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
    fontSize: 16,
    color: '#1E1E1E',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  sessionCategory: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 10,
  },
  sessionInfo: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  sessionBold: {
    fontWeight: '700',
    color: '#1E1E1E',
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
