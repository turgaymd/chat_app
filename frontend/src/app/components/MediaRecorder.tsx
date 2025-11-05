import { useState, useRef } from "react";

export function useAudioRecorder() {
  const [record, setRecord] = useState<string>("") || null;
  const [recording, setRecording] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder>(null);
  const mediaStream = useRef<MediaStream>(null);
  const chunks = useRef<Blob[]>([]);
  const [timer, setTimer] = useState<number>(0);

  const handleAudio = async () => {
    try {
      setRecording(true);
      setTimer(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      const timers = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(blob);
        setRecord(audioURL);
        chunks.current = [];
        clearInterval(timers);
      };
      mediaRecorder.current.start();
    } catch (err) {
      console.log(err);
    }
  };
  const handleCancel = () => {
    setRecording(false);
    if (record) {
      URL.revokeObjectURL(record);
    }
    setRecord("");
  };
  const handleStop = () => {
    setRecording(false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaStream.current?.getTracks().forEach((track) => track.stop());
    }
  };
  return {
    recording,
    record,
    setRecord,
    timer,
    handleAudio,
    handleCancel,
    handleStop,

  };
}
