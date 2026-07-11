import React, { useState, useEffect } from "react";
import { Volume2Icon, CircleStop } from "lucide-react"; // Make sure lucide-react is installed

const MessageSpeaker = ({ msg }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    // Check for TTS support
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setIsSupported(false);
      return;
    }

    const newUtterance = new SpeechSynthesisUtterance();
    setUtterance(newUtterance);
  }, []);

  const handleSpeak = () => {
    if (!utterance || !msg.text) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Stop current speech before starting new
    }

    utterance.text = msg.text;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* <span>{msg.text}</span> */}

      {isSupported &&
        (isSpeaking ? (
          <CircleStop
            onClick={handleStop}
            className="h-5 w-5 cursor-pointer text-red-600 hover:text-red-700"
          />
        ) : (
          <Volume2Icon
            onClick={handleSpeak}
            className="hover:text-primary h-5 w-5 cursor-pointer text-gray-800"
          />
        ))}
    </div>
  );
};

export default MessageSpeaker;
