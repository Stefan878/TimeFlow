import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAuth } from "../hooks/useAuth";
import { GeminiService } from "../services/geminiService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BOTTOM_NAV_HEIGHT = 90;

const MetricBox = ({ value, label, color = "#6366F1", icon }) => (
  <Surface style={styles.metricBox}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}10` }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <View style={styles.metricTextContainer}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </Surface>
);

const AnalyticsScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { user } = useAuth();
  const analytics = useAnalytics();

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleManualRefresh = async () => {
    if (tasks.length === 0) return;
    setIsAiLoading(true);

    try {
      const advice = await GeminiService.generateStudentRecommendations(tasks);
      setAiRecommendations(advice);
    } catch (error) {
      console.error("Gemini API error, switching to local fallbacks:", error);

      if (
        analytics &&
        analytics.recommendations &&
        analytics.recommendations.length > 0
      ) {
        setAiRecommendations(analytics.recommendations);
      } else {
        setAiRecommendations([
          "Добави още завършени задачи, за да генерираме точен анализ.",
          "Старай се да разпределяш времето си балансирано през седмицата.",
        ]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };
  useEffect(() => {
    if (tasks.length > 0 && aiRecommendations.length === 0) {
      handleManualRefresh();
    }
  }, [tasks.length]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed);
    const completionRate = tasks.length
      ? completedTasks.length / tasks.length
      : 0;
    const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    const productivity = Array(7).fill(0);
    let totalMinutes = 0;

    completedTasks.forEach((task) => {
      totalMinutes += task.duration || 0;
      if (task.date) {
        const date = new Date(task.date);
        let day = date.getDay();
        day = day === 0 ? 6 : day - 1;
        if (day >= 0 && day < 7) productivity[day] += 1;
      }
    });

    return {
      completionRate,
      completedCount: completedTasks.length,
      totalCount: tasks.length,
      productivity,
      maxTasksInDay: Math.max(...productivity, 1),
      avgHours: completedTasks.length
        ? (totalMinutes / completedTasks.length / 60).toFixed(1)
        : 0,
      bestDay: productivity.some((v) => v > 0)
        ? weekDays[productivity.indexOf(Math.max(...productivity))]
        : "-",
      weekDays,
    };
  }, [tasks]);

  if (!analytics)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#FDFEFF", "#F4F7FB"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>СТАТИСТИКА</Text>
          <Text style={styles.headerTitle}>Твоят Анализ</Text>
        </View>

        {/* ОСНОВНА КАРТА С ГРАДИЕНТЕН АКЦЕНТ */}
        <Surface style={styles.heroCard}>
          <LinearGradient
            colors={["#6366F1", "#4F46E5"]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroLabel}>Успеваемост</Text>
                <Text style={styles.heroValue}>
                  {Math.round(stats.completionRate * 100)}%
                </Text>
              </View>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={40}
                color="rgba(255,255,255,0.8)"
              />
            </View>
            <View style={styles.heroProgressBg}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${stats.completionRate * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.heroSubtext}>
              {stats.completedCount} от {stats.totalCount} задачи са готови
            </Text>
          </LinearGradient>
        </Surface>

        {/* МЕТРИКИ */}
        <View style={styles.metricsGrid}>
          <MetricBox
            value={`${stats.avgHours}ч`}
            label="Ср. време"
            icon="timer-outline"
            color="#8B5CF6"
          />
          <MetricBox
            value={stats.bestDay}
            label="Пик"
            icon="trending-up"
            color="#10B981"
          />
        </View>

        {/* ДИАГРАМА */}
        <Surface style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Седмична активност</Text>
          <View style={styles.chartArea}>
            {stats.productivity.map((value, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(value / stats.maxTasksInDay) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{stats.weekDays[index]}</Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* AI ПРЕПОРЪКИ */}
        <View style={styles.aiHeader}>
          <View>
            <Text style={styles.sectionTitle}>AI Препоръки</Text>
            <Text style={styles.aiSubtitle}>Персонализирани съвети за теб</Text>
          </View>
          <TouchableOpacity
            onPress={handleManualRefresh}
            style={styles.refreshIconContainer}
          >
            {isAiLoading ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <MaterialCommunityIcons name="cached" size={24} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.aiList}>
          {aiRecommendations.length === 0 && !isAiLoading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="robot-confused-outline"
                size={40}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>
                Добави задачи, за да получиш AI анализ.
              </Text>
            </View>
          ) : (
            aiRecommendations.map((rec, index) => (
              <Surface key={index} style={styles.aiCard}>
                <View
                  style={[
                    styles.aiBullet,
                    {
                      backgroundColor: index % 2 === 0 ? "#6366F1" : "#10B981",
                    },
                  ]}
                />
                <Text style={styles.aiText}>{rec}</Text>
              </Surface>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFEFF" },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    // КЛЮЧЪТ КЪМ РЕШАВАНЕТО НА ПРОБЛЕМА С НАВИГАЦИЯТА:
    paddingBottom: BOTTOM_NAV_HEIGHT + 40,
  },
  header: { marginBottom: 24 },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366F1",
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1E293B",
    marginTop: 4,
  },

  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#6366F1",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 20,
  },
  heroGradient: { padding: 24 },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  heroValue: { color: "#FFF", fontSize: 48, fontWeight: "900" },
  heroProgressBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginBottom: 12,
  },
  heroProgressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 4,
  },
  heroSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },

  metricsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  metricBox: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metricTextContainer: { flex: 1 },
  metricValue: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  metricLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },

  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 20,
    elevation: 2,
    marginBottom: 25,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  chartArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    marginTop: 20,
    paddingHorizontal: 5,
  },
  barContainer: { alignItems: "center" },
  barTrack: {
    width: 16,
    height: 110,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", backgroundColor: "#6366F1", borderRadius: 8 },
  barLabel: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },

  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  aiSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  refreshIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  aiList: { gap: 12 },
  aiCard: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 1,
  },
  aiBullet: { width: 4, height: "100%", borderRadius: 2, marginRight: 14 },
  aiText: {
    flex: 1,
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  emptyText: {
    marginTop: 10,
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 14,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AnalyticsScreen;
