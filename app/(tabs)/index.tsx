import GlobalStyles from "@/app/styles/globalStyles";
import { ensureDirExists, readUser } from "@/utils/filePaths";
import { useRouter } from "expo-router";
import { Alert, Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Home() {
  ensureDirExists();
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
    onPress = {async () => {
      const checkUser = await readUser();
      if (checkUser && checkUser.phoneNumber) {
        router.push("/cameraViewTab");
      } else {
        Alert.alert('No user!', 'Within settings, under "Profile" set yourself as the user.');
        return;
      }
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