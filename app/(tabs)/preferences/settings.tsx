import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Settings() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>
        Killer Queen has already touched this settings
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/preferences/profile')}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("General")}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>General</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Notifications")}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Storage and data")}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>Storage and data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("About Us")}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>Credits</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // Make sure content stretches full width
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  headerText: {
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
  },
});
