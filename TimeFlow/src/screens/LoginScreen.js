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
import { login } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Грешка", "Моля, попълнете всички полета");
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert("Грешка при влизане", "Невалиден имейл или парола.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Translucent StatusBar за да влиза цвета под иконите */}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.topCurtain} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header - Вече е фиксиран по-високо */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="rocket" size={38} color="#fff" />
            </View>
            <Text style={styles.title}>Добре дошли!</Text>
            <Text style={styles.subtitle}>Влезте в акаунта си</Text>
          </View>

          {/* Login Card */}
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Забравена парола?</Text>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ВЛЕЗ В АКАУНТА</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.linkText}>
              Нямате акаунт?{" "}
              <Text style={styles.linkHighlight}>Регистрирайте се</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ... запазваме целия код, променяме само стиловете долу ...

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topCurtain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300, // Връщаме малко височина за по-добър обем
    backgroundColor: "#6366F1",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 25,
    // Увеличаваме това, за да свалим всичко надолу
    paddingTop: Platform.OS === "ios" ? 70 : 60,
    paddingBottom: 30,
  },

  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
    // Това е "златното" разстояние, което контролира колко е високо логото
    marginTop: 15,
  },
  logoCircle: {
    width: 75,
    height: 75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 6,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 10, // Малко разстояние между подзаглавието и картата
    marginBottom: 25,
  },

  // ... останалите стилове (inputs, buttons) остават същите ...
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
  textInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#1E293B" },
  inputFocused: { borderColor: "#6366F1", backgroundColor: "#fff" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 5 },
  forgotText: { color: "#6366F1", fontSize: 14, fontWeight: "700" },
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  linkButton: { marginTop: 25, alignItems: "center" },
  linkText: { color: "#64748B", fontSize: 14 },
  linkHighlight: { color: "#6366F1", fontWeight: "800" },
});
