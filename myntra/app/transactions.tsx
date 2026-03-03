import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import TransactionsList from "./TransactionsList";
import React from "react";

export default function TransactionsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TransactionsList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
});