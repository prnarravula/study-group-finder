import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../constants';

// configure locale
LocaleConfig.locales['en'] = LocaleConfig.locales[''];
LocaleConfig.defaultLocale = 'en';

const upcomingSessions = [
  { id: '1', title: 'Art History', date: new Date().toISOString().slice(0,10), time: '2:00 PM' },
  { id: '2', title: 'Biology',    date: '2025-06-16',                                   time: '11:00 AM' },
  { id: '3', title: 'Chemistry',  date: '2025-06-25',                                   time: '3:00 PM' },
];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // build markedDates for dots
  const markedDates = upcomingSessions.reduce((acc, session) => {
    acc[session.date] = { marked: true };
    return acc;
  }, {});
  markedDates[currentDate] = { ...(markedDates[currentDate] || {}), selected: true };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.header}>Calendar</Text>

      <Calendar
        current={currentDate}
        onDayPress={day => setCurrentDate(day.dateString)}
        monthFormat={'MMMM yyyy'}
        hideExtraDays
        firstDay={0}
        markingType={'simple'}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.white,
          calendarBackground: colors.white,
          dayTextColor: colors.text,
          textSectionTitleColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.text,
          todayTextColor: colors.primary,
          // these are fallback; actual circle is drawn in dayComponent
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
        }}
        // custom dayComponent to enlarge the selected-day circle
        dayComponent={({ date, state, marking }) => {
          const isSelected = marking?.selected;
          const isMarked   = marking?.marked;
          return (
            <TouchableOpacity onPress={() => setCurrentDate(date.dateString)}>
              <View style={[
                styles.dayContainer,
                isSelected && styles.selectedDayContainer
              ]}>
                <Text style={[
                  styles.dayText,
                  isSelected ? styles.selectedDayText : (state === 'disabled' ? styles.disabledDayText : null)
                ]}>
                  {date.day}
                </Text>
                {isMarked && !isSelected && (
                  <View style={styles.dot} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        style={styles.calendar}
      />

      <Text style={styles.subheader}>Upcoming Sessions</Text>
      <FlatList
        data={upcomingSessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.sessionList}
        renderItem={({ item }) => {
          const isToday = item.date === currentDate;
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
                  {isToday ? 'Today' : new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.sessionTime, isToday && styles.highlightTitle]}>
                {item.time}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const DAY_SIZE = spacing.s7;         // larger circle diameter
const DOT_SIZE = spacing.s1;                  // small marker dot

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
  sessionList: {
    paddingBottom: spacing.vs4,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.vs2,
    paddingHorizontal: spacing.s3,
  },
  highlightRow: {
    backgroundColor: colors.primary + '20',
    borderRadius: spacing.s2,
  },
  sessionDot: {
    width: spacing.s3 - spacing.s1/2,
    height: spacing.s3 - spacing.s1/2,
    borderRadius: (spacing.s3 - spacing.s1/2) / 2,
    backgroundColor: colors.primary,
    marginRight: spacing.s3,
  },
  highlightDot: {
    width: spacing.s3,
    height: spacing.s3,
    borderRadius: spacing.s3 / 2,
  },
  sessionText: {
    flex: 1,
  },
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
  sessionTime: {
    fontSize: typography.fontMd,
    color: colors.text,
    fontWeight: '600',
  },
});
