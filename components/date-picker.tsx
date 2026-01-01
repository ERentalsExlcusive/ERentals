import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { BrandColors, Spacing } from '@/constants/theme';

interface DatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDatesChange: (startDate: Date | null, endDate: Date | null) => void;
  minDate?: Date;
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

export function DatePicker({ startDate, endDate, onDatesChange, minDate }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: DayCell[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: minDate ? date < minDate : false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isDisabled: minDate ? date < minDate : false,
      });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: minDate ? date < minDate : false,
      });
    }

    return days;
  }, [currentMonth, minDate]);

  const handleDayPress = (dayCell: DayCell) => {
    if (dayCell.isDisabled) return;

    if (selectingStart || !startDate) {
      // Selecting start date
      onDatesChange(dayCell.date, null);
      setSelectingStart(false);
    } else {
      // Selecting end date
      if (dayCell.date < startDate) {
        // If end date is before start, swap them
        onDatesChange(dayCell.date, startDate);
      } else {
        onDatesChange(startDate, dayCell.date);
      }
      setSelectingStart(true);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | 'middle' | null => {
    if (!startDate) return null;

    const dateTime = date.getTime();
    const startTime = startDate.getTime();

    if (dateTime === startTime) return 'start';

    if (endDate) {
      const endTime = endDate.getTime();
      if (dateTime === endTime) return 'end';
      if (dateTime > startTime && dateTime < endTime) return 'middle';
    }

    return null;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <Pressable onPress={previousMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>

        <Text style={styles.monthText}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <Pressable onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((day) => (
          <View key={day} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayCell, index) => {
          const selected = isDateSelected(dayCell.date);
          const inRange = isDateInRange(dayCell.date);

          return (
            <Pressable
              key={index}
              onPress={() => handleDayPress(dayCell)}
              disabled={dayCell.isDisabled}
              style={[
                styles.dayCell,
                !dayCell.isCurrentMonth && styles.dayCellOtherMonth,
                selected === 'start' && styles.dayCellStart,
                selected === 'end' && styles.dayCellEnd,
                selected === 'middle' && styles.dayCellMiddle,
                inRange && !selected && styles.dayCellInRange,
                dayCell.isDisabled && styles.dayCellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !dayCell.isCurrentMonth && styles.dayTextOtherMonth,
                  (selected === 'start' || selected === 'end') && styles.dayTextSelected,
                  dayCell.isToday && !selected && styles.dayTextToday,
                  dayCell.isDisabled && styles.dayTextDisabled,
                ]}
              >
                {dayCell.date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, startDate && !endDate && styles.legendTextHighlight]}>
          {!startDate && 'Select check-in date'}
          {startDate && !endDate && '✓ Check-in selected — Now select check-out date'}
          {startDate && endDate && `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    maxWidth: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.sm,
    width: 40,
    alignItems: 'center',
  },
  navText: {
    fontSize: 24,
    color: BrandColors.black,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.black,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellStart: {
    backgroundColor: BrandColors.black,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  dayCellEnd: {
    backgroundColor: BrandColors.black,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  dayCellMiddle: {
    backgroundColor: BrandColors.gray.light,
  },
  dayCellInRange: {
    backgroundColor: BrandColors.gray.light,
  },
  dayCellDisabled: {
    opacity: 0.2,
  },
  dayText: {
    fontSize: 14,
    color: BrandColors.black,
    fontWeight: '500',
  },
  dayTextOtherMonth: {
    color: BrandColors.gray.medium,
  },
  dayTextSelected: {
    color: BrandColors.white,
    fontWeight: '700',
  },
  dayTextToday: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  dayTextDisabled: {
    color: BrandColors.gray.border,
  },
  legend: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: BrandColors.gray.dark,
    fontWeight: '500',
  },
  legendTextHighlight: {
    color: BrandColors.black,
    fontWeight: '600',
  },
});
