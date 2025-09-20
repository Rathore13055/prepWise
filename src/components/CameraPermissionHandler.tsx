'use client';

import { useEffect, useState } from 'react';

export default function CameraPermissionHandler() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });

        if (permissions.state === 'granted') {
          setPermissionGranted(true);
        }

        permissions.onchange = () => {
          if (permissions.state === 'granted') {
            setPermissionGranted(true);
          }
        };
      } catch (err: unknown) {
        // ✅ Log the error to avoid unused variable warning
        console.warn('⚠️ Permissions API not supported or error occurred:', err);
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    const requestCamera = async () => {
      if (!permissionGranted) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
          setPermissionGranted(true);
        } catch (err: unknown) {
          console.warn('⚠️ Error requesting camera access:', err);
          alert('⚠️ Please allow camera access to continue.');
        }
      }
    };

    requestCamera();
  }, [permissionGranted]);

  return null;
}
