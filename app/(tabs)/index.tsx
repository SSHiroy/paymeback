import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Text, View, ScrollView, StyleSheet } from "react-native";

export default function home() {
  return (
    <View>
      <Text>Recent receipts</Text>
      <View>
	{0 === 0 ? (
	  <View>
	    <Text>True</Text>
	  </View>
        ) : (
	  <ScrollView>
	    <Text>False</Text>
	  </ScrollView>
	)}
      </View>
      <Button
	title = "test"
	onPress = {() => <Redirect href = "/cameraView"/>}
      />
    </View>
  );
}
