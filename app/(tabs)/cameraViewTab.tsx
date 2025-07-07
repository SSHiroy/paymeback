import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function CameraViewTab() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (permission && !permission.granted) {
    return (
      <View>
        <Text>No access to camera</Text>
        <Button title="Request Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {permission && permission.granted && (
        <CameraView style={{ flex: 1 }} facing={facing} />
      )}
    </View>
  );
}