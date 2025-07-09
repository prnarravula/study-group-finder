import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { colors, typography, spacing } from '../constants';

/* ----- locale ----- */
LocaleConfig.locales.en = LocaleConfig.locales[''];
LocaleConfig.defaultLocale = 'en';

export default function CalendarScreen() {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sessions, setSessions] = useState([]); // { id, title, date, start, end }
  const [loading, setLoading] = useState(true);

  /* ---- listen to all groups → sessions ---- */
  useEffect(() => {
    if (!user) return;

    // 1. find every group the user is a member of
    const groupsQ = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', user.uid)
    );

    let sessUnsubs = []; // to clean up each group's listener

    // 2. listen for changes in the user's groups
    const unsubGroups = onSnapshot(groupsQ, (groupSnap) => {
      // detach previous session listeners
      sessUnsubs.forEach((fn) => fn());
      sessUnsubs = [];

      groupSnap.forEach((gDoc) => {
        const gId = gDoc.id;
        const sessCol = collection(db, 'groups', gId, 'sessions');

        // listen to this group's sessions
        const unsubSess = onSnapshot(sessCol, (sessSnap) => {
          // build a fresh array for this group's sessions
          const groupSessions = sessSnap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: `${gId}-${doc.id}`,
              title: gDoc.data().groupName ?? gDoc.data().name ?? 'Session',
              date: d.startTime.toDate().toISOString().slice(0, 10),
              start: d.startTime.toDate(),
              end: d.endTime.toDate(),
            };
          });

          // merge into global sessions state, removing stale entries
          setSessions((prev) => {
            const others = prev.filter((s) => !s.id.startsWith(`${gId}-`));
            return [...others, ...groupSessions].sort(
              (a, b) => a.start.getTime() - b.start.getTime()
            );
          });
          setLoading(false);
        });

        sessUnsubs.push(unsubSess);
      });
    });

    return () => {
      unsubGroups();
      sessUnsubs.forEach((fn) => fn());
    };
  }, [user]);

  /* ---- marked dates ---- */
  const markedDates = sessions.reduce((acc, s) => {
    acc[s.date] = { marked: true };
    return acc;
  }, {});
  markedDates[currentDate] = {
    ...(markedDates[currentDate] || {}),
    selected: true,
  };

  /* ---- render ---- */
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.header}>Calendar</Text>

      <Calendar
        current={currentDate}
        onDayPress={(day) => setCurrentDate(day.dateString)}
        monthFormat="MMMM yyyy"
        hideExtraDays
        firstDay={0}
        markingType="simple"
        markedDates={markedDates}
        theme={{
          calendarBackground: colors.white,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.text,
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
        }}
        dayComponent={({ date, state, marking }) => {
          const isSelected = marking?.selected;
          const isMarked = marking?.marked;
          return (
            <TouchableOpacity onPress={() => setCurrentDate(date.dateString)}>
              <View
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDayContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected
                      ? styles.selectedDayText
                      : state === 'disabled'
                      ? styles.disabledDayText
                      : null,
                  ]}
                >
                  {date.day}
                </Text>
                {isMarked && !isSelected && <View style={styles.dot} />}
              </View>
            </TouchableOpacity>
          );
        }}
        style={styles.calendar}
      />

      <Text style={styles.subheader}>Upcoming Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sessionList}
        ListEmptyComponent={
          !loading && (
            <Text style={{ color: colors.textSecondary, alignSelf: 'center' }}>
              No sessions scheduled
            </Text>
          )
        }
        renderItem={({ item }) => {
          const isToday = item.date === currentDate;
          const range = `${item.start.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })} – ${item.end.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`;
          return (
            <TouchableOpacity
              onPress={() => setCurrentDate(item.date)}
              style={[
                styles.sessionRow,
                isToday && styles.highlightRow,
              ]}
            >
              <View
                style={[
                  styles.sessionDot,
                  isToday && styles.highlightDot,
                ]}
              />
              <View style={styles.sessionText}>
                <Text
                  style={[
                    styles.sessionTitle,
                    isToday && styles.highlightTitle,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.sessionDate}>
                  {isToday
                    ? 'Today'
                    : new Date(item.date).toLocaleDateString()}
                </Text>
                <Text style={styles.sessionRange}>{range}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const DAY_SIZE = spacing.s7;
const DOT_SIZE = spacing.s1;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.s4,
  },
  header: {
    fontSize: typography.fontXxl,
    fontWeight: 'bold',
    color: colors.text,
    alignSelf: 'center',
    marginVertical: spacing.vs4,
  },
  calendar: {
    borderRadius: spacing.s3,
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayContainer: {
    backgroundColor: colors.primary,
    borderRadius: DAY_SIZE / 2,
  },
  dayText: {
    fontSize: typography.fontMd,
    color: colors.text,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  disabledDayText: {
    color: colors.textSecondary,
  },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  subheader: {
    fontSize: typography.fontLg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.vs6,
    marginBottom: spacing.vs3,
  },
  sessionList: { paddingBottom: spacing.vs4 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.vs3,
    paddingHorizontal: spacing.s3,
    borderRadius: spacing.s2,
    backgroundColor: colors.surface ?? '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: spacing.vs2,
  },
  highlightRow: {
    backgroundColor: colors.primary + '20',
  },
  sessionDot: {
    width: spacing.s3,
    height: spacing.s3,
    borderRadius: spacing.s3 / 2,
    backgroundColor: colors.primary,
    marginRight: spacing.s3,
  },
  highlightDot: {
    width: spacing.s3,
    height: spacing.s3,
  },
  sessionText: { flex: 1 },
  sessionTitle: {
    fontSize: typography.fontMd,
    color: colors.text,
    fontWeight: '600',
  },
  highlightTitle: { color: colors.primary },
  sessionDate: {
    fontSize: typography.fontSm,
    color: colors.textSecondary,
  },
  sessionRange: {
    fontSize: typography.fontSm,
    color: colors.text,
    marginTop: 2,
  },
});
