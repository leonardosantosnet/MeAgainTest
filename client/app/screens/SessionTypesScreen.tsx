import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Slider from "@react-native-community/slider";
import { getSessionTypes, createSessionType, deleteSessionType } from '../../services/api';
import { SessionType } from '../../types/session';
import * as Device from 'expo-device';


export default function SessionTypesScreen() {
  const [types, setTypes] = useState<SessionType[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState(3);
  const macDevice = Device.osInternalBuildId || "";

  async function loadTypes() {
    try {
      const data = await getSessionTypes();
      setTypes(data);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to load session types.');
    }
  }

  async function handleAdd() {
    Keyboard.dismiss();

    if (!name || !category) {
      Alert.alert('Error', 'Please fill in name and category.');
      return;
    }

    try {
      const newType = await createSessionType({
        name,
        category,
        priority: Number(priority),
        mac: macDevice,
      });

      setTypes([...types, newType]);
      setName('');
      setCategory('');
      setPriority(3);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to create the session type.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSessionType(id);
      const data = await getSessionTypes();
      setTypes(data);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Unable to delete the session type.');
    }
  }

  useEffect(() => {
    loadTypes();
  }, []);

  useFocusEffect(
      useCallback(() => {
         loadTypes();
      }, [])
  );

  return (
    <View style={styles.container}>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter category"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Priority Level: {priority}</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={priority}
        onValueChange={setPriority}
        minimumTrackTintColor="#4CAF50"
        maximumTrackTintColor="#ccc"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add Type</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Existing Types</Text>
      <FlatList
        data={types}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.name} {'\n'}
              {item.category} {'\n'}
              P{item.priority}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id.toString())}>
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
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flexWrap: 'wrap',
  },
  delete: {
    color: '#FF4D4D',
    fontWeight: '700',
  },
});
