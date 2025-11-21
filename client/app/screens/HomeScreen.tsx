import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, SectionList, FlatList, TouchableOpacity } from "react-native";
import dayjs from "dayjs";

import { getAvailability, getFullSessions, createSession } from "../../services/api";
import Icon from 'react-native-vector-icons/Feather';
import * as Device from 'expo-device';

import { isWithinAvailability } from '../utils/availabilityUtils';
import { hasSessionConflict } from '../utils/hasSessionConflict';

import { Availability } from '../../types/availability';
import { Session } from '../../types/session';

export default function HomeScreen() {
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [completedToday, setCompletedToday] = useState<Session[]>([]);
  const [suggestions, setSuggestions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  const macDevice = Device.osInternalBuildId || "";
  let suggestionLimit = 0;
  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => loadData(), 0);
    }, [])
  );

  async function loadData() {
    suggestionLimit = 0;
    const sessions = await getFullSessions();
    const availabilityData = await getAvailability();

    setAvailability(availabilityData);

    const today = dayjs().format("YYYY-MM-DD");

    const todays = sessions.filter((s: { startTime: string | number | dayjs.Dayjs | Date | null | undefined; }) =>
      dayjs(s.startTime).format("YYYY-MM-DD") === today
    );

    const completed = todays.filter((s: { completed: any; }) => s.completed);

    setTodaySessions(todays);
    setCompletedToday(completed);

    generateSmartSuggestions(sessions, availabilityData);
  }

  function generateSmartSuggestions(sessions: Session[], availability: Availability[]) {
    const today = dayjs();

    const sessionHistory = sessions.filter((a) =>
      dayjs(a.startTime).format("dddd") === today.format("dddd") &&
      dayjs(a.startTime).format("YYYY-MM-DD") !== today.format("YYYY-MM-DD") &&
      a.completed === true
    );

    const availableHistory = sessionHistory.filter((a) => {
      const endTime = dayjs(a.startTime).add(a.duration, 'minute').toDate();
      return isWithinAvailability(
        dayjs(a.startTime).toDate(),
        endTime,
        availability
      );
    });

    const conflictFree = availableHistory.filter((a) => {
      const start = dayjs().hour(dayjs(a.startTime).hour()).minute(dayjs(a.startTime).minute());
      const end = start.add(a.duration, "minute");
      return !hasSessionConflict(start.toDate(), end.toDate(), sessions);
    });

    setSuggestions(conflictFree);
  }

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.sessionTitle}>{item.sessionType.name}</Text>
      <Text style={styles.sessionInfo}>
        <Icon name="clock" size={10} color="#333" /> {dayjs(item.startTime).format("HH:mm")} · {item.duration} min
      </Text>
      {item.completed && <Text style={styles.completedBadge}>Completed</Text>}
    </View>
  );

  const suggestionInsert = async (oldSession: Session) => {
    try {
      const oldStartTime = dayjs(oldSession.startTime);

      await createSession({
        sessionTypeId: oldSession.sessionTypeId,
        startTime: dayjs().hour(oldStartTime.hour()).minute(oldStartTime.minute()).toISOString(),
        duration: oldSession.duration,
        mac: macDevice,
      });

      loadData();

    } catch (err) {
      console.error(err);
    }
  };

  const renderSuggestion = ({ item }: { item: Session }) => (
    <View style={styles.suggestionCard}>
      <Text style={styles.suggestionTitle}>{item.sessionType.name}</Text>

      <Text style={styles.suggestionsText}>
        good spacing ({dayjs().diff(dayjs(item.startTime), "day")} day's since last {item.sessionType.name}). Uses your evening focus window.
      </Text>

      <TouchableOpacity
        style={styles.suggestionInsertButton}
        onPress={() => suggestionInsert(item)}
      >
        <Text style={styles.suggestionInsertButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  const sections = [
    { title: "Your schedule today", data: [{ summary: true }] },
    { title: "Smart Suggestions", data: [{ empty: true }] },
    { title: "Today's Sessions", data: todaySessions.length ? todaySessions : [{ empty: true }] }
  ];

  

  return (
    <View style={styles.container}>
      <Text style={styles.todayDate}>{dayjs().format("dddd, MMMM D")}</Text>

      <SectionList
        sections={sections}
        keyExtractor={(_, index) => index.toString()}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 20 }}

        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.subtitle}>{section.title}</Text>
          </View>
        )}

        renderItem={({ item, section }) => {
          if (item.summary)
            return (
              <View style={styles.summaryCard}>
                <View style={styles.actionRow}>
                  <Text style={styles.summaryLabel}>
                    <Icon name="clock" size={14} color="#333" /> {todaySessions.length} Sessions
                  </Text>
                  <Text style={styles.summaryLabel}>
                    <Icon name="check" size={14} color="#333" /> {completedToday.length} Completed
                  </Text>
                </View>
              </View>
            );

          if(section.title === "Smart Suggestions" ){
            suggestionLimit = 1;
            if (suggestions.length){
              return (
                <FlatList
                  data={suggestions}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={renderSuggestion}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 12 }}
                />
              );
            }else{
              return <Text style={styles.noSessions}>No Suggestion</Text>;
            }
          }

          if (section.title === "Today's Sessions"){
            if(todaySessions.length){
              return renderSession({item});
            }else{
              return <Text style={styles.noSessions}>No Session</Text>;
            }
          }

          return null;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F4F8",
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 14,
    marginRight: 14,
  },
  sessionCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 14,
    marginBottom: 20,
    width: '99%',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sessionTitle: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "200",
    color: "#111827",
  },
  sessionInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  completedBadge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#10B981",
    color: "#fff",
    borderRadius: 12,
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "700",
  },
  suggestionCard: {
    backgroundColor: "#f1e5ff",
    padding: 18,
    borderRadius: 16,
    marginRight: 12,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  suggestionsText: {
    fontSize: 12,
    color: "#111827",
  },
  suggestionInsertButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#030303FF',
    alignItems: 'center',
    shadowColor: '#090A0AFF',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionInsertButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  todayDate: {
    fontSize: 18,
    color: '#222224FF',
    marginTop: 4,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#444343FF',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#374151",
  },
  sectionHeader: {
    backgroundColor: "#F2F4F8",
    paddingVertical: 6,
  },
  noSessions: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12
  },
});
