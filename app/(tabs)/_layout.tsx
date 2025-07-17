import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
	return (
		<View style = {{ flex: 1, position: "relative" }}>
		<Tabs screenOptions = {{ tabBarActiveTintColor: 'blue' }}>
		<Tabs.Screen
		name = "index"
		options = {{
			title: "Home"
		}}
		/>
		<Tabs.Screen
		name = "preferences/settings"
		options = {{
			title: "Settings"
		}}
		/>
		<Tabs.Screen
		name = "cameraViewTab"
		options = {{
			href: null
		}}
		/>
		<Tabs.Screen
		name = "billReview"
		options = {{
			title: 'Review your bill!',
			href: null
		}}
		/>
		<Tabs.Screen
		name = "sharePayment"
		options = {{
			title: "Share Payments",
			href: null,
		}}
		/>
		<Tabs.Screen
		name = "preferences/profile"
		options = {{
			title: 'Profile',
			href: null,
		}}
		/>
		</Tabs>
		</View>
	);
}