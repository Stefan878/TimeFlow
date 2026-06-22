import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/useAuth";
import AuthStack from "./AuthStack";
import AppNavigator from "./AppNavigator";

export default function RootNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    // 🟡 чакаме Firebase да върне user-а
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthStack />;
}