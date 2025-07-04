'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioRecorderProps {
  onTranscriptReady: (transcript: string) => void;
}

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
  const transcriptRef = useRef<string>(''); // accumulate transcript

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
      recognition.continuous = true; // ✅ prevent auto-stop on pause

      recognition.onstart = () => {
        console.log('🎙️ Recording started...');
        transcriptRef.current = '';
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcriptRef.current += event.results[i][0].transcript + ' ';
        }
        console.log('📝 Partial Transcript:', transcriptRef.current.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🛑 Recording ended.');
        setIsListening(false);
        onTranscriptReady(transcriptRef.current.trim());
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptReady]);

  const handleStart = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      transcriptRef.current = ''; // reset transcript
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop(); // will trigger `onend`
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
