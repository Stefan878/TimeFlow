import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { createTask } from "../services/taskService";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

const categories = ["Лекция", "Упражнение", "Домашно", "Лични", "Проект"];

const priorities = [
  { label: "High", value: "high", color: "#ff6b66" },
  { label: "Medium", value: "medium", color: "#ffd43b" },
  { label: "Low", value: "low", color: "#20c997" },
];

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [pickerMode, setPickerMode] = useState("date");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState("medium");
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setCategory("");
      setDate(new Date());
      setStartTime(new Date());
      setEndTime(new Date(Date.now() + 60 * 60 * 1000));
      setPriority("medium");
    }, []),
  );

  const openPicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("bg-BG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const onChange = (event, selectedValue) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedValue) return;

    if (pickerMode === "date") {
      setDate(selectedValue);
    } else if (pickerMode === "start") {
      setStartTime(selectedValue);
      if (selectedValue > endTime) {
        setEndTime(new Date(selectedValue.getTime() + 60 * 60 * 1000));
      }
    } else if (pickerMode === "end") {
      if (selectedValue < startTime) {
        Alert.alert("Грешка", "Крайният час не може да е преди началния.");
      } else {
        setEndTime(selectedValue);
      }
    }
  };

  const handleAddTask = async () => {
    if (!title || !category) {
      Alert.alert("Липсва информация", "Моля, въведете заглавие и категория.");
      return;
    }

    setLoading(true);
    const durationMinutes = Math.max(
      1,
      Math.floor((endTime - startTime) / 60000),
    );
    const startTimeStr = formatTime(startTime);
    const dateStr = date.toISOString().split("T")[0];

    try {
      await createTask(
        {
          title,
          category,
          date: dateStr,
          startTime: startTimeStr,
          duration: durationMinutes,
          priority,
        },
        user,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert("Грешка", "Възникна проблем при запазването.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topCurtain} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Нова задача</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Заглавие</Text>
            <TextInput
              placeholder="Какво планирате?"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              multiline
            />

            <View style={styles.divider} />

            <Text style={styles.cardLabel}>Време и дата</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                onPress={() => openPicker("date")}
                style={styles.selectorItem}
              >
                <View style={[styles.iconBox, { backgroundColor: "#e0e7ff" }]}>
                  <Ionicons name="calendar" size={18} color="#4f46e5" />
                </View>
                <Text style={styles.pillValue}>
                  {date.toLocaleDateString("bg-BG", {
                    day: "numeric",
                    month: "short",
                    weekday: "short",
                  })}
                </Text>
              </TouchableOpacity>

              <View style={styles.timeRow}>
                <TouchableOpacity
                  onPress={() => openPicker("start")}
                  style={styles.selectorItem}
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: "#fce7f3" }]}
                  >
                    <Ionicons name="time-outline" size={18} color="#db2777" />
                  </View>
                  <Text style={styles.pillValue}>{formatTime(startTime)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openPicker("end")}
                  style={styles.selectorItem}
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: "#fef2f2" }]}
                  >
                    <Ionicons name="flag-outline" size={18} color="#ef4444" />
                  </View>
                  <Text style={styles.pillValue}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Categories Grid (No Scroll) */}
          <Text style={styles.sectionTitle}>Категория</Text>
          <View style={styles.chipsGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, category === c && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority Section */}
          <Text style={styles.sectionTitle}>Приоритет</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                onPress={() => setPriority(p.value)}
                style={[
                  styles.priorityChip,
                  priority === p.value && {
                    backgroundColor: p.color,
                    borderColor: p.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p.value && { color: "#fff" },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleAddTask}
            disabled={!title || !category || loading}
            style={[
              styles.submitButton,
              (!title || !category) && styles.submitButtonDisabled,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Запазване..." : "СЪЗДАЙ ЗАДАЧА"}
            </Text>
            {!loading && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android Picker Logic */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={
            pickerMode === "date"
              ? date
              : pickerMode === "start"
                ? startTime
                : endTime
          }
          mode={pickerMode === "date" ? "date" : "time"}
          display="default"
          is24Hour={true}
          onChange={onChange}
        />
      )}

      {/* iOS Modal Picker Logic */}
      {Platform.OS === "ios" && (
        <Modal transparent visible={showPicker} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {pickerMode === "date"
                    ? "Изберете дата"
                    : pickerMode === "start"
                      ? "Начален час"
                      : "Краен час"}
                </Text>
                <DateTimePicker
                  value={
                    pickerMode === "date"
                      ? date
                      : pickerMode === "start"
                        ? startTime
                        : endTime
                  }
                  mode={pickerMode === "date" ? "date" : "time"}
                  display={pickerMode === "date" ? "inline" : "spinner"}
                  onChange={onChange}
                  style={styles.iosDatePicker}
                  is24Hour={true}
                  locale="bg-BG"
                  textColor="#1e293b"
                  themeVariant="light"
                />
                <Button
                  mode="contained"
                  onPress={() => setShowPicker(false)}
                  style={styles.modalButton}
                  buttonColor="#6366f1"
                >
                  Готово
                </Button>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topCurtain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#6366f1",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  backButton: { padding: 8 },
  scrollContent: { padding: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 25,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 20 },

  dateTimeContainer: { gap: 12 },
  timeRow: { flexDirection: "row", gap: 12 },
  selectorItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  pillValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    marginLeft: 5,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 25,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  chipTextActive: { color: "#fff" },

  priorityRow: { flexDirection: "row", gap: 10, marginBottom: 30 },
  priorityChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  priorityText: { fontWeight: "700", color: "#64748b", fontSize: 13 },

  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitButtonDisabled: { backgroundColor: "#cbd5e1" },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 15,
  },
  iosDatePicker: { height: 280, alignSelf: "stretch" },
  modalButton: { marginTop: 15, borderRadius: 15 },
});
