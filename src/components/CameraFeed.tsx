'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);

  useEffect(() => {
    // ✅ Ensure this runs only in the browser
    if (typeof window === 'undefined') return;

    const loadModelsAndStartVideo = async () => {
      try {
        const MODEL_URL = '/models'; // Make sure these models are in the public folder
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        // Start video stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error loading models or accessing camera:', error);
      }
    };

    loadModelsAndStartVideo();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const detectFaces = async () => {
      if (!videoRef.current) return;

      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        setMultipleFacesDetected(detections.length > 1);
      } catch (error) {
        console.warn('Face detection error:', error);
      }
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
