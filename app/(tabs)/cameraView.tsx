import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

export default function CameraView() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    async function requestPermission() {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    }
    requestPermission();
  }, []);

  if (device == null) return <Text>Loading camera...</Text>;

  if (!hasPermission) return <Text>No camera permission</Text>;

  return (
    <View>
      <Camera
        device={device}
        isActive={true}
      />
    </View>
  );
}
