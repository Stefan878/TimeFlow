import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import TaskCard from "../components/TaskCard";
import useTasks from "../hooks/useTasks";
import { toggleTaskComplete } from "../services/taskService";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropwdownAnim = useRef(new Animated.Value(0)).current;

  // Анимация за Dropdown менюто
  useEffect(() => {
    Animated.timing(dropwdownAnim, {
      toValue: dropdownVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dropdownVisible]);

  // Функция за промяна на статус (Done/Undone)
  const handleToggle = async (taskId, currentStatus) => {
    try {
      await toggleTaskComplete(taskId, !currentStatus);
    } catch (error) {
      console.error("Грешка при промяна на статус:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Грешка при излизане:", error);
    }
  };

  const todayDate = new Date()
    .toLocaleDateString("bg-BG", {
      weekday: "short",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? completedCount / tasks.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.dateLabel}>{todayDate}</Text>
            <Text style={styles.welcomeText}>
              Здравей, {user?.email?.split("@")[0]}!
            </Text>
          </View>

          {/* Аватар и Меню */}
          <View style={{ zIndex: 100 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Surface
                style={[
                  styles.avatarSurface,
                  dropdownVisible && styles.avatarActive,
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    dropdownVisible && styles.avatarTextActive,
                  ]}
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </Text>
              </Surface>
            </TouchableOpacity>

            {dropdownVisible && (
              <>
                <TouchableOpacity
                  style={styles.overlay}
                  activeOpacity={1}
                  onPress={() => setDropdownVisible(false)}
                />
                <Animated.View
                  style={[
                    styles.dropdown,
                    {
                      opacity: dropwdownAnim,
                      transform: [
                        {
                          translateY: dropwdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.userLabel}>ПРОФИЛ</Text>
                    <Text numberOfLines={1} style={styles.dropdownEmail}>
                      {user?.email}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutItem}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color="#ef4444"
                    />
                    <Text style={styles.logoutText}>Изход</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </View>

        {/* PROGRESS CARD */}
        <Surface style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <View>
              <Text style={styles.progressTitle}>Твоят прогрес</Text>
              <Text style={styles.progressSub}>
                {completedCount} от {tasks.length} задачи са готови
              </Text>
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </Surface>
      </View>

      {/* TASK LIST */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            toggleCompleted={handleToggle}
            navigation={navigation}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={60} color="#E2E8F0" />
            <Text style={styles.emptyText}>Няма планирани задачи</Text>
            <Text style={styles.emptySubText}>Натисни + за да започнеш</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFEFF" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFEFF",
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366F1",
    letterSpacing: 1.2,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    marginTop: 2,
  },

  /* AVATAR & DROPDOWN */
  avatarSurface: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  avatarActive: { backgroundColor: "#6366F1" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#64748B" },
  avatarTextActive: { color: "#FFF" },

  overlay: {
    position: "absolute",
    top: -100,
    right: -100,
    width: SCREEN_WIDTH * 2,
    height: 2000,
    zIndex: 40,
  },
  dropdown: {
    position: "absolute",
    top: 55,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    width: 220,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    zIndex: 50,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  dropdownHeader: { marginBottom: 8 },
  userLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  dropdownEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  logoutItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 14 },

  /* PROGRESS CARD */
  progressCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFF",
    elevation: 4,
    shadowColor: "#6366F1",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  progressTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  progressSub: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  progressPercent: { fontSize: 22, fontWeight: "900", color: "#6366F1" },
  progressBarBg: { height: 8, backgroundColor: "#F1F5F9", borderRadius: 4 },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },

  /* LIST */
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: {
    marginTop: 15,
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubText: { color: "#CBD5E1", fontSize: 13, marginTop: 5 },
});

export default HomeScreen;
