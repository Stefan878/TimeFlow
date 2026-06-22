import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { Surface, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { deleteTask } from "../services/taskService";

const priorityColors = {
  high: "#EF4444", // Red
  medium: "#F59E0B", // Amber
  low: "#10B981", // Emerald
};

const formatDuration = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}ч ${m > 0 ? m + "м" : ""}` : `${m}м`;
};

const TaskCard = ({ item, toggleCompleted, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const handleDelete = () => {
    Alert.alert(
      "Изтриване",
      "Сигурни ли сте, че искате да изтриете тази задача?",
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Изтрий",
          style: "destructive",
          onPress: async () => await deleteTask(item.id),
        },
      ],
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Surface style={styles.card}>
          <View style={styles.inner}>
            {/* Тънка линия за приоритет */}
            <View
              style={[
                styles.priorityIndicator,
                {
                  backgroundColor: item.completed
                    ? "#E2E8F0"
                    : priorityColors[item.priority],
                },
              ]}
            />

            <View style={styles.content}>
              <View style={styles.mainRow}>
                <TouchableOpacity
                  onPress={() => toggleCompleted(item.id, item.completed)}
                  style={[
                    styles.checkCircle,
                    item.completed && styles.checkCircleCompleted,
                  ]}
                >
                  {item.completed && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color="#FFF"
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.title,
                      item.completed && styles.completedTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.category}>{item.category}</Text>
                    {item.duration && <View style={styles.dotSeparator} />}
                    {item.duration && (
                      <View style={styles.timeInfo}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={12}
                          color="#94A3B8"
                        />
                        <Text style={styles.timeText}>
                          {formatDuration(item.duration)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  <IconButton
                    icon="pencil-outline"
                    size={20}
                    iconColor="#64748B"
                    onPress={() =>
                      navigation.navigate("EditTask", {
                        taskData: item,
                        taskId: item.id,
                      })
                    }
                  />
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor="#EF4444"
                    onPress={handleDelete}
                  />
                </View>
              </View>
            </View>
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#6366F1",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  inner: { flexDirection: "row", overflow: "hidden", borderRadius: 20 },
  priorityIndicator: { width: 5, height: "100%" },
  content: { flex: 1, padding: 16 },
  mainRow: { flexDirection: "row", alignItems: "center" },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkCircleCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  completedTitle: { textDecorationLine: "line-through", color: "#94A3B8" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  category: { fontSize: 12, color: "#6366F1", fontWeight: "600" },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    mx: 8,
    marginHorizontal: 8,
  },
  timeInfo: { flexDirection: "row", alignItems: "center" },
  timeText: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 4,
    fontWeight: "500",
  },
  actions: { flexDirection: "row", marginLeft: 8 },
});

export default TaskCard;
