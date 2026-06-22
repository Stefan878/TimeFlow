import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../services/authService";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert("Грешка", "Моля, попълнете всички полета");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Грешка", "Паролите не съвпадат");
    }
    if (password.length < 6) {
      return Alert.alert("Грешка", "Паролата трябва да е поне 6 символа");
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (error) {
      Alert.alert("Грешка при регистрация", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Декоративна завеса */}
      <View style={styles.topCurtain} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Бутон за връщане */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={36} color="#fff" />
            </View>
            <Text style={styles.title}>Създай акаунт</Text>
            <Text style={styles.subtitle}>Присъедини се към нас днес!</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Имейл адрес</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "email" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="example@mail.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.cardLabel}>Парола</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "password" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                secureTextEntry
              />
            </View>

            <Text style={styles.cardLabel}>Потвърди парола</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "confirm" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput("confirm")}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                secureTextEntry
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>РЕГИСТРИРАЙ СЕ</Text>
            )}
          </TouchableOpacity>

          {/* Footer Link */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>
              Вече имате акаунт?{" "}
              <Text style={styles.linkHighlight}>Влезте тук</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 320,
    backgroundColor: "#6366F1",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 45,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "ios" ? 80 : 70,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: "center",
    marginTop: 10,
  },
  logoCircle: {
    width: 75,
    height: 75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 25,
    marginTop: 5,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  inputFocused: {
    borderColor: "#6366F1",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#94A3B8" },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: { color: "#64748B", fontSize: 14 },
  linkHighlight: { color: "#6366F1", fontWeight: "800" },
});
