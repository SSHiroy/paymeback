import { useRouter } from "expo-router";
import GlobalStyles from "../styles/globalStyles";
import { Button, Text, View, ScrollView, StyleSheet } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <View style = { GlobalStyles.parentView }>
      <Text>Recent receipts</Text>
      <View style = {{ flex: 1 }}>
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

      <View style = { styles.buttonWrapper }>
	<Button
	  title = "test"
	  onPress = {() => {
	    router.push("/cameraViewTab");
	  }}
	/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
})
