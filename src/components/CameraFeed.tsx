'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access error:', error);
      }
    };

    loadModels().then(startVideo);
  }, []);

  useEffect(() => {
    const detectFaces = async () => {
      if (!videoRef.current) return;

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      setMultipleFacesDetected(detections.length > 1);
    };

    const interval = setInterval(detectFaces, 1000); // check every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded-lg border border-gray-400 w-64 h-48 object-cover"
      />
      {multipleFacesDetected && (
        <div className="absolute bottom-0 left-0 w-full text-center bg-red-600 text-white py-1 text-sm font-semibold">
          ⚠️ Multiple faces detected! Please be alone during the interview.
        </div>
      )}
    </div>
  );
}
