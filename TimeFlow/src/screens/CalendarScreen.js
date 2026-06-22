import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");
const HOUR_HEIGHT = 80;
const START_HOUR = 0;
const END_HOUR = 23;

const monthNames = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

const generateYears = (baseYear) => {
  return Array.from({ length: 101 }, (_, i) => baseYear - 50 + i);
};

const getDayName = (date) => {
  const days = ["НД", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
  return days[date.getDay()];
};

const formatDateKey = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPositionFromTime = (timeString) => {
  if (!timeString) return -1;
  const [hours, minutes] = timeString.split(":").map(Number);
  return ((hours * 60 + minutes) / 60) * HOUR_HEIGHT;
};

const generateMonthDays = (month, year) => {
  const days = [];
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export default function CalendarScreen({ navigation }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = formatDateKey(today);

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [dates, setDates] = useState(
    generateMonthDays(today.getMonth(), today.getFullYear()),
  );
  const [tasks, setTasks] = useState([]);
  const [taskDates, setTaskDates] = useState({});
  const [showMonthModal, setShowMonthModal] = useState(false);

  const yearsList = useMemo(() => generateYears(new Date().getFullYear()), []);
  const yearScrollRef = useRef(null);

  const {user} = useAuth();

  const handleMonthChange = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  useEffect(() => {
    setDates(generateMonthDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  // Следене на задачите за избрания ден
  useEffect(() => {

    if(!user?.uid) return;


    const dateKey = formatDateKey(selectedDate);
    const q = query(collection(db, "tasks"), where("date", "==", dateKey),where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }); 
    return () => unsubscribe();
  }, [selectedDate,user]);

  // СЛЕДЕНЕ НА ВСИЧКИ ЗАДАЧИ ЗА МЕСЕЦА (за индикаторите върху датите)
  useEffect(() => {

    if(!user?.uid) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        map[data.date] = true; // Отбелязваме, че на тази дата има задача
      });
      setTaskDates(map);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (showMonthModal && yearScrollRef.current) {
      const index = yearsList.indexOf(currentYear);
      if (index !== -1) {
        setTimeout(() => {
          yearScrollRef.current?.scrollTo({
            x: index * 85 - (width / 2 - 50),
            animated: true,
          });
        }, 100);
      }
    }
  }, [showMonthModal]);

  const renderDateItem = ({ item }) => {
    const itemKey = formatDateKey(item);
    const isSelected = itemKey === formatDateKey(selectedDate);
    const isToday = itemKey === todayKey;
    const hasTasks = taskDates[itemKey]; // Проверка дали денят има задачи

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item)}
        style={[
          styles.dateItem,
          isSelected && styles.dateItemActive,
          isToday && !isSelected && styles.dateItemToday,
        ]}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.textActive,
            isToday && !isSelected && styles.textToday,
          ]}
        >
          {getDayName(item)}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.textActive,
            isToday && !isSelected && styles.textToday,
          ]}
        >
          {item.getDate()}
        </Text>

        {/* КОНТЕЙНЕР ЗА ИНДИКАТОРИТЕ */}
        <View style={styles.indicatorContainer}>
          {isToday && (
            <View
              style={[
                styles.todayLine,
                isSelected && { backgroundColor: "#fff" },
              ]}
            />
          )}
          {hasTasks && (
            <View
              style={[
                styles.taskDotIndicator,
                isSelected && { backgroundColor: "#fff" },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setShowMonthModal(true)}
            style={styles.monthSelector}
          >
            <Text style={styles.headerTitle}>{monthNames[currentMonth]}</Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearBadgeText}>{currentYear}</Text>
              <Text style={styles.chevron}>▾</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.navGroup}>
            <TouchableOpacity
              onPress={() => handleMonthChange(-1)}
              style={styles.roundBtn}
            >
              <Text style={styles.navIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMonthChange(1)}
              style={styles.roundBtn}
            >
              <Text style={styles.navIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stripContainer}>
          <FlatList
            data={dates}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDateItem}
            contentContainerStyle={styles.flatListPadding}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.calendarBody}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeGrid}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={styles.hourRow}>
              <Text style={styles.hourText}>
                {String(i).padStart(2, "0")}:00
              </Text>
              <View style={styles.line} />
            </View>
          ))}
          <View style={styles.tasksLayer}>
            {(() => {
              const sortedTasks = tasks
                .filter((t) => t.startTime)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              const renderedTasks = [];
              const groups = [];

              sortedTasks.forEach((task) => {
                let placed = false;
                for (let group of groups) {
                  const overlaps = group.some((t) => {
                    const tStart = getPositionFromTime(t.startTime);
                    const tEnd =
                      tStart + ((t.duration || 60) / 60) * HOUR_HEIGHT;
                    const taskStart = getPositionFromTime(task.startTime);
                    const taskEnd =
                      taskStart + ((task.duration || 60) / 60) * HOUR_HEIGHT;

                    return taskStart < tEnd && taskEnd > tStart;
                  });

                  if (overlaps) {
                    group.push(task);
                    placed = true;
                    break;
                  }
                }
                if (!placed) groups.push([task]);
              });

              return groups.flatMap((group) => {
                return group.map((task, index) => {
                  const top = getPositionFromTime(task.startTime);
                  const height = ((task.duration || 60) / 60) * HOUR_HEIGHT;

                  const totalInGroup = group.length;
                  const columnWidth = 100 / totalInGroup;
                  const leftOffset = columnWidth * index;

                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskCard,
                        {
                          top: top + 10,
                          height: height - 5,
                          borderLeftColor: task.completed
                            ? "#cbd5e1"
                            : "#6366f1",
                          left: `${leftOffset}%`,
                          width: `${columnWidth - 2}%`,
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate("EditTask", {
                          taskData: task,
                          taskId: task.id,
                        })
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.taskTitle,
                          task.completed && styles.completedText,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {totalInGroup < 3 && (
                        <Text style={styles.taskTime}>{task.startTime}</Text>
                      )}
                    </TouchableOpacity>
                  );
                });
              });
            })()}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showMonthModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Календар</Text>
              <TouchableOpacity
                onPress={() => {
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setShowMonthModal(false);
                }}
              >
                <Text style={styles.todayBtn}>Днес</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Година</Text>
            <ScrollView
              ref={yearScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.yearRow}
            >
              {yearsList.map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setCurrentYear(y)}
                  style={[
                    styles.yearTag,
                    currentYear === y && styles.activeTag,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      currentYear === y && styles.textActive,
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Месец</Text>
            <View style={styles.monthGrid}>
              {monthNames.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    setCurrentMonth(i);
                    setShowMonthModal(false);
                  }}
                  style={[
                    styles.monthBox,
                    currentMonth === i && styles.activeMonth,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthBoxText,
                      currentMonth === i && styles.textActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  safeArea: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  monthSelector: { flexDirection: "column" },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  yearBadge: { flexDirection: "row", alignItems: "center", marginTop: -2 },
  yearBadgeText: { fontSize: 18, color: "#6366f1", fontWeight: "700" },
  chevron: { color: "#6366f1", marginLeft: 4, fontSize: 14 },
  navGroup: { flexDirection: "row", gap: 12 },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: { fontSize: 20, color: "#1e293b" },

  stripContainer: { paddingBottom: 20 },
  flatListPadding: { paddingHorizontal: 20, gap: 12 },
  dateItem: {
    width: 62,
    height: 85,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  dateItemActive: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
    elevation: 8,
  },
  dateItemToday: {
    borderColor: "#6366f1",
    borderWidth: 2,
    backgroundColor: "#eff6ff",
  },
  dayName: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  dayNumber: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  textActive: { color: "#fff" },
  textToday: { color: "#6366f1" },

  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
    height: 6,
  },
  todayLine: {
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6366f1",
  },
  taskDotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#cbd5e1",
  },

  calendarBody: { flex: 1 },
  timeGrid: { paddingHorizontal: 20, marginTop: 20 },
  hourRow: {
    height: HOUR_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  hourText: {
    width: 55,
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: -8,
  },
  line: { flex: 1, height: 1.5, backgroundColor: "#f1f5f9" },
  tasksLayer: { position: "absolute", left: 75, right: 10, top: 0, bottom: 0 },
  taskCard: {
    position: "absolute",
    // ПРЕМАХНИ: left: 0, right: 0 (вече ги подаваме динамично)
    backgroundColor: "#fff",
    borderRadius: 12, // Малко по-малък радиус за тесни карти
    padding: 8, // По-малко padding, за да се вижда текстът
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  taskTime: { fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 4 },
  completedText: { textDecorationLine: "line-through", color: "#cbd5e1" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    paddingBottom: 50,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  sheetTitle: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  todayBtn: { color: "#6366f1", fontWeight: "800", fontSize: 16 },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 1,
  },
  yearRow: { marginBottom: 30 },
  yearTag: {
    width: 75,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  activeTag: { backgroundColor: "#1e293b" },
  tagText: { fontSize: 16, fontWeight: "700", color: "#475569" },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthBox: {
    width: "31%",
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  activeMonth: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  monthBoxText: { fontSize: 15, fontWeight: "700", color: "#475569" },
});
