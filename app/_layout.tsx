// app/_layout.tsx
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style = {{ flex: 1, position: "relative" }}>
      <Stack>
	<Stack.Screen
	  name = "(tabs)"
	  options = {{ headerShown: false }} 
	/>
      </Stack>
    </View>
  );
}
