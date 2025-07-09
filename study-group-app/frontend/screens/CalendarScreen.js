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

/* ----- locale setup ----- */
LocaleConfig.locales.en = LocaleConfig.locales[''];
LocaleConfig.defaultLocale = 'en';

export default function CalendarScreen() {
  const { user } = useContext(AuthContext);

  // “Today” as YYYY-MM-DD in local time
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [currentDate, setCurrentDate] = useState(todayStr);
  const [sessions, setSessions] = useState([]); // flattened array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const groupsQ = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', user.uid)
    );

    // Will hold our unsubscribe functions
    let sessUnsubs = [];
    // Temporary map from groupId → its sessions array
    let sessionsMap = {};

    // 1) Listen for the user’s groups
    const unsubGroups = onSnapshot(
      groupsQ,
      (groupSnap) => {
        // a) tear down old session listeners
        sessUnsubs.forEach((unsub) => unsub());
        sessUnsubs = [];

        // b) reset our map & UI
        sessionsMap = {};
        setSessions([]);
        setLoading(true);

        // c) for each group, attach a listener on its “sessions” sub-col
        groupSnap.forEach((gDoc) => {
          const gId     = gDoc.id;
          const sessCol = collection(db, 'groups', gId, 'sessions');

          const unsubSess = onSnapshot(
            sessCol,
            (sessSnap) => {
              // build this group’s session list
              const groupSessions = sessSnap.docs.map((d) => {
                const { startTime, endTime } = d.data();
                const startDate = startTime.toDate();
                const endDate   = endTime.toDate();

                return {
                  id:    `${gId}-${d.id}`,
                  title: gDoc.data().groupName ?? gDoc.data().name ?? 'Session',
                  date:  startDate.toLocaleDateString('en-CA'),
                  start: startDate,
                  end:   endDate,
                };
              });

              // update our map & re-flatten
              sessionsMap[gId] = groupSessions;
              const allSessions = Object.values(sessionsMap)
                .flat()
                .sort((a, b) => a.start.getTime() - b.start.getTime());
              setSessions(allSessions);
              setLoading(false);
            },
            (err) => {
              if (err.code === 'permission-denied') {
                console.warn(`Ignored sessions.read for new group ${gId}`);
              } else {
                console.error('Sessions listener error:', err);
              }
            }
          );

          sessUnsubs.push(unsubSess);
        });
      },
      (err) => {
        if (err.code === 'permission-denied') {
          console.warn('Ignored groups.read permission error');
        } else {
          console.error('Groups listener error:', err);
        }
      }
    );

    // cleanup all listeners
    return () => {
      unsubGroups();
      sessUnsubs.forEach((fn) => fn());
    };
  }, [user]);

  // Build the calendar’s markedDates object
  const markedDates = sessions.reduce((acc, s) => {
    acc[s.date] = { marked: true };
    return acc;
  }, {});
  markedDates[currentDate] = {
    ...(markedDates[currentDate] || {}),
    selected: true,
  };

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
          const isMarked   = marking?.marked;
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
            <Text style={styles.emptyTxt}>No sessions scheduled</Text>
          )
        }
        renderItem={({ item }) => {
          const isToday = item.date === currentDate;
          const timeRange = `${item.start.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })} – ${item.end.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`;

          return (
            <TouchableOpacity
              onPress={() => setCurrentDate(item.date)}
              style={[styles.sessionRow, isToday && styles.highlightRow]}
            >
              <View style={[styles.sessionDot, isToday && styles.highlightDot]} />
              <View style={styles.sessionText}>
                <Text style={[styles.sessionTitle, isToday && styles.highlightTitle]}>
                  {item.title}
                </Text>
                <Text style={styles.sessionDate}>
                  {isToday ? 'Today' : item.start.toLocaleDateString()}
                </Text>
                <Text style={styles.sessionRange}>{timeRange}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

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
  emptyTxt: {
    color: colors.textSecondary,
    alignSelf: 'center',
  },
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
    backgroundColor: colors.primary,
  },
  sessionText: { flex: 1 },
  sessionTitle: {
    fontSize: typography.fontMd,
    color: colors.text,
    fontWeight: '600',
  },
  highlightTitle: {
    color: colors.primary,
  },
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
