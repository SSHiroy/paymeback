import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function CameraViewTab() {
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission && !permission.granted) {
    return (
      <View>
        <Text>No access to camera</Text>
        <Button
	  title = "Request Permission"
	  onPress = { requestPermission }
	/>
      </View>
    );
  }

  return (
    <View>
      {permission && permission.granted && (
        <CameraView facing = { facing }/>
      )}
    </View>
  );
}
