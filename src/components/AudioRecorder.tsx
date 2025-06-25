'use client';

import { useEffect, useRef, useState } from 'react';

// ✅ Define props for the component
interface AudioRecorderProps {
  onTranscriptReady: (transcript: string) => void;
}

// ✅ Allow TypeScript to understand the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

export default function AudioRecorder({ onTranscriptReady }: AudioRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech Recognition API not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => console.log('🎙️ Recording started...');
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Transcript:', transcript);
        onTranscriptReady(transcript);
        setIsListening(false);
      };
      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        console.log('🛑 Recording ended.');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptReady]);

  const handleStart = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex gap-4 mt-4">
      {!isListening ? (
        <button onClick={handleStart} className="bg-green-600 px-4 py-2 rounded">
          🎙️ Start Speaking
        </button>
      ) : (
        <button onClick={handleStop} className="bg-red-600 px-4 py-2 rounded">
          ⏹️ Stop
        </button>
      )}
    </div>
  );
}
