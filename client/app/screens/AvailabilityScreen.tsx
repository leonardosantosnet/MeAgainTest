import React, { useState, useEffect, useCallback} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  createAvailability,
  deleteAvailability,
  getAvailability,
} from '../../services/api';
import { Availability } from '../../types/availability';
import dayjs from "dayjs";
import * as Device from 'expo-device';

 
export default function AvailabilityScreen() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [startHour, setStartHour] = useState<Date | null>(null);
  const [endHour, setEndHour] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerField, setPickerField] = useState<'start' | 'end'>('start');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const macDevice = Device.osInternalBuildId || "";

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const openStartPicker = () => { setPickerField('start'); setShowPicker(true); };
  const openEndPicker = () => { setPickerField('end'); setShowPicker(true); };

  const handleTimeSelected = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (!selectedDate) return;
    pickerField === 'start' ? setStartHour(selectedDate) : setEndHour(selectedDate);
  };

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability();
      setAvailability(data);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to load availability.');
    }
  };

  const saveAvailability = async () => {
    if (!startHour || !endHour) {
      Alert.alert('Error', 'Please select start and end times.');
      return;
    }

    // Verifica sobreposição ou duplicata
    const duplicate = availability.some(a =>
      a.day === selectedDay &&
      ((dayjs(startHour).format('HH:mm') >= a.startHour && dayjs(startHour).format('HH:mm') < a.endHour) ||
      (dayjs(endHour).format('HH:mm') > a.startHour && dayjs(endHour).format('HH:mm') <= a.endHour) ||
      (dayjs(startHour).format('HH:mm') <= a.startHour && dayjs(endHour).format('HH:mm') >= a.endHour))
    );

    if (duplicate) {
      Alert.alert('Error', 'This time slot already exists or overlaps with another.');
      return;
    }

    try {
      await createAvailability({
        day: selectedDay,
        startHour: dayjs(startHour).format('HH:mm'),
        endHour: dayjs(endHour).format('HH:mm'),
        mac: macDevice
      });

      fetchAvailability();
      setStartHour(null);
      setEndHour(null);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to add availability.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailability(id);
      fetchAvailability();
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to remove availability.');
    }
  };

  const formatTime = (date: Date | null) => !date ? '--:--' : dayjs(date).format('HH:mm');

  useEffect(() => { fetchAvailability(); }, []);

   useFocusEffect(
      useCallback(() => {
         fetchAvailability();
      }, [])
  );
  return (
    <View style={styles.container}>

      {/* Day selection */}
      <Text style={styles.label}>Day of the Week:</Text>
      <View style={styles.daysContainer}>
        {DAYS.map((day) => {
          const selected = day === selectedDay;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selected && styles.daySelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Start/End time pickers */}
      <TouchableOpacity style={styles.timeButton} onPress={openStartPicker}>
        <Text style={styles.timeText}>Start: {formatTime(startHour)}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.timeButton} onPress={openEndPicker}>
        <Text style={styles.timeText}>End: {formatTime(endHour)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveAvailability}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={pickerField === 'start' ? startHour || new Date() : endHour || new Date()}
          mode="time"
          is24Hour
          display="spinner"
          onChange={handleTimeSelected}
        />
      )}

     
      <Text style={styles.subtitle}>Your Schedule:</Text>
      <FlatList
        data={availability}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.day}: {item.startHour} → {item.endHour}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBB',
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#FFF',
  },
  daySelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  timeButton: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  delete: {
    color: '#FF4D4D',
    fontWeight: '700',
  },
});
