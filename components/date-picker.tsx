import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';

interface DatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDatesChange: (startDate: Date | null, endDate: Date | null) => void;
  minDate?: Date;
  minNights?: number; // Minimum stay requirement
  blockedDates?: Set<string>; // Set of YYYY-MM-DD strings
  isLoadingAvailability?: boolean;
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isBlocked: boolean;
}

export function DatePicker({ startDate, endDate, onDatesChange, minDate, minNights = 1, blockedDates, isLoadingAvailability }: DatePickerProps) {
  const { isMobile } = useResponsive();
  // Initialize currentMonth to startDate's month if provided, otherwise current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    return new Date();
  });
  // If both dates exist, user is editing - start in "select end" mode so clicking updates checkout
  // If only startDate exists, continue selecting end date
  // If no dates, start fresh with selecting start
  const [selectingStart, setSelectingStart] = useState(() => {
    if (startDate && endDate) return false; // Both exist: next click updates end date
    if (startDate && !endDate) return false; // Only start: continue to end
    return true; // No dates: select start
  });
  const [invalidRangeMessage, setInvalidRangeMessage] = useState<string | null>(null);

  // Helper to check if a date is blocked
  const isDateBlocked = (date: Date): boolean => {
    if (!blockedDates) return false;
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.has(dateStr);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Use single letters on mobile, abbreviated on desktop
  const dayNames = isMobile
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      const blocked = isDateBlocked(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: (minDate ? date < minDate : false) || blocked,
        isBlocked: blocked,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const blocked = isDateBlocked(date);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isDisabled: (minDate ? date < minDate : false) || blocked,
        isBlocked: blocked,
      });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const blocked = isDateBlocked(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: (minDate ? date < minDate : false) || blocked,
        isBlocked: blocked,
      });
    }

    return days;
  }, [currentMonth, minDate, blockedDates]);

  // Helper to check if any date in a range is blocked
  const hasBlockedDateInRange = useCallback((start: Date, end: Date): boolean => {
    if (!blockedDates || blockedDates.size === 0) return false;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endTime = end.getTime();
    while (current.getTime() <= endTime) {
      if (isDateBlocked(current)) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  }, [blockedDates]);

  // Find the next available end date starting from a given date
  const findNextAvailableEnd = useCallback((start: Date, minNightsRequired: number): Date => {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + minNightsRequired);

    // Check if any date in range is blocked - if so, extend past the blocked period
    let attempts = 0;
    const maxAttempts = 365; // Prevent infinite loop
    while (hasBlockedDateInRange(start, candidate) && attempts < maxAttempts) {
      candidate.setDate(candidate.getDate() + 1);
      attempts++;
    }
    return candidate;
  }, [hasBlockedDateInRange]);

  const handleDayPress = useCallback((dayCell: DayCell) => {
    if (dayCell.isDisabled) return;

    if (selectingStart || !startDate) {
      // Selecting start date
      onDatesChange(dayCell.date, null);
      setSelectingStart(false);
    } else {
      // Selecting end date
      let selectedEnd = dayCell.date;
      let selectedStart = startDate;

      if (selectedEnd < selectedStart) {
        // If end date is before start, swap them
        [selectedStart, selectedEnd] = [selectedEnd, selectedStart];
      }

      // Calculate nights
      const nights = Math.round((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24));

      // Check if range contains blocked dates
      if (hasBlockedDateInRange(selectedStart, selectedEnd)) {
        // Range contains blocked dates - show error and reset
        setInvalidRangeMessage('Your selection includes unavailable dates');
        setTimeout(() => setInvalidRangeMessage(null), 3000);
        setSelectingStart(true);
        onDatesChange(null, null);
        return;
      } else if (nights < minNights) {
        // Enforce minimum nights - extend checkout
        const extendedEnd = findNextAvailableEnd(selectedStart, minNights);
        onDatesChange(selectedStart, extendedEnd);
      } else {
        onDatesChange(selectedStart, selectedEnd);
      }
      setSelectingStart(true);
    }
  }, [selectingStart, startDate, onDatesChange, minNights, hasBlockedDateInRange, findNextAvailableEnd]);

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | 'middle' | 'single' | null => {
    if (!startDate) return null;

    const dateTime = date.getTime();
    const startTime = startDate.getTime();

    // Check for single day selection (start === end)
    if (endDate && startTime === endDate.getTime() && dateTime === startTime) {
      return 'single';
    }

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
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={previousMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>

        <Text style={[styles.monthText, isMobile && styles.monthTextMobile]}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <Pressable
          onPress={nextMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.dayNameCell}>
            <Text style={[styles.dayNameText, isMobile && styles.dayNameTextMobile]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid - Using TouchableOpacity for reliable web clicks */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayCell, index) => {
          const selected = isDateSelected(dayCell.date);
          const inRange = isDateInRange(dayCell.date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (!dayCell.isDisabled) {
                  handleDayPress(dayCell);
                }
              }}
              activeOpacity={dayCell.isDisabled ? 1 : 0.7}
              style={[
                styles.dayCell,
                isMobile && styles.dayCellMobile,
                !dayCell.isCurrentMonth && styles.dayCellOtherMonth,
                selected === 'single' && styles.dayCellSingle,
                selected === 'start' && styles.dayCellStart,
                selected === 'end' && styles.dayCellEnd,
                selected === 'middle' && styles.dayCellMiddle,
                inRange && !selected && styles.dayCellInRange,
                dayCell.isDisabled && styles.dayCellDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${dayCell.date.toLocaleDateString()}`}
            >
              <View style={[styles.dayInner, dayCell.isBlocked && styles.dayInnerBlocked]}>
                <Text
                  style={[
                    styles.dayText,
                    isMobile && styles.dayTextMobile,
                    !dayCell.isCurrentMonth && styles.dayTextOtherMonth,
                    (selected === 'start' || selected === 'end' || selected === 'single') && styles.dayTextSelected,
                    dayCell.isToday && !selected && styles.dayTextToday,
                    dayCell.isDisabled && styles.dayTextDisabled,
                    dayCell.isBlocked && styles.dayTextBlocked,
                  ]}
                >
                  {dayCell.date.getDate()}
                </Text>
                {dayCell.isBlocked && <View style={styles.blockedLine} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[
          styles.legendText,
          isMobile && styles.legendTextMobile,
          startDate && !endDate && styles.legendTextHighlight
        ]}>
          {!startDate && 'Select check-in date'}
          {startDate && !endDate && `✓ Check-in selected — Now select check-out${minNights > 1 ? ` (${minNights} night min)` : ''}`}
          {startDate && endDate && `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
        </Text>
        {isLoadingAvailability && (
          <Text style={styles.loadingText}>Loading availability...</Text>
        )}
        {blockedDates && blockedDates.size > 0 && !isLoadingAvailability && (
          <Text style={styles.blockedInfo}>Strikethrough dates are unavailable</Text>
        )}
        {invalidRangeMessage && (
          <Text style={styles.invalidRangeText}>{invalidRangeMessage}</Text>
        )}
      </View>

      {/* Clear Dates Button */}
      {(startDate || endDate) && (
        <Pressable
          style={styles.clearDatesButton}
          onPress={() => {
            onDatesChange(null, null);
            setSelectingStart(true);
          }}
        >
          <Feather name="x" size={14} color={BrandColors.gray.dark} />
          <Text style={styles.clearDatesText}>Clear dates</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[6],
    ...Shadow.md,
    maxWidth: 380,
  },
  containerMobile: {
    padding: Space[4],
    borderRadius: Radius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  navButton: {
    width: TouchTarget.min, // 44px
    height: TouchTarget.min, // 44px
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  navText: {
    fontSize: FontSize['3xl'], // Larger for easier tapping
    lineHeight: LineHeight['3xl'],
    color: BrandColors.black,
    fontWeight: FontWeight.bold,
  },
  navButtonPressed: {
    backgroundColor: BrandColors.gray.light,
  },
  monthText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  monthTextMobile: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: Space[2],
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space[2],
  },
  dayNameText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
  },
  dayNameTextMobile: {
    fontSize: 10,
    letterSpacing: 0,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 0, // No negative margin - stable layout
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40, // Ensure minimum touch target
    zIndex: 1, // Ensure cells are above any background
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  dayCellMobile: {
    minHeight: 44, // iOS minimum touch target
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellPressed: {
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.full,
  },
  dayCellSingle: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.full,
  },
  dayCellStart: {
    backgroundColor: BrandColors.black,
    borderTopLeftRadius: Radius.full,
    borderBottomLeftRadius: Radius.full,
  },
  dayCellEnd: {
    backgroundColor: BrandColors.black,
    borderTopRightRadius: Radius.full,
    borderBottomRightRadius: Radius.full,
  },
  dayCellMiddle: {
    backgroundColor: BrandColors.gray.light,
  },
  dayCellInRange: {
    backgroundColor: BrandColors.gray.light,
  },
  dayCellDisabled: {
    opacity: 0.2,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  dayText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.black,
    fontWeight: FontWeight.medium,
  },
  dayTextMobile: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },
  dayTextOtherMonth: {
    color: BrandColors.gray.medium,
  },
  dayTextSelected: {
    color: BrandColors.white,
    fontWeight: FontWeight.bold,
  },
  dayTextToday: {
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
  dayTextDisabled: {
    color: BrandColors.gray.border,
  },
  dayTextBlocked: {
    color: BrandColors.gray.medium,
  },
  dayInnerBlocked: {
    position: 'relative',
  },
  blockedLine: {
    position: 'absolute',
    width: 20,
    height: 1,
    backgroundColor: BrandColors.gray.medium,
    transform: [{ rotate: '-45deg' }],
  },
  legend: {
    marginTop: Space[4],
    paddingTop: Space[4],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    alignItems: 'center',
  },
  legendText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    fontWeight: FontWeight.medium,
  },
  legendTextMobile: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
  },
  legendTextHighlight: {
    color: BrandColors.black,
    fontWeight: FontWeight.semibold,
  },
  loadingText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginTop: Space[2],
    fontStyle: 'italic',
  },
  blockedInfo: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginTop: Space[2],
  },
  invalidRangeText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: '#c0392b',
    marginTop: Space[2],
    textAlign: 'center',
  },
  clearDatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[3],
    marginTop: Space[2],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  clearDatesText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
});
