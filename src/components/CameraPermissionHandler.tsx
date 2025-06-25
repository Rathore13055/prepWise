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
      } catch (err) {
        // Fallback if navigator.permissions is not supported
        console.warn('⚠️ Permissions API not supported. Relying on getUserMedia fallback.');
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
        } catch (err) {
          alert('⚠️ Please allow camera access to continue.');
        }
      }
    };

    requestCamera();
  }, [permissionGranted]);

  return null;
}
