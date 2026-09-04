import { useState, useRef, useEffect } from "react";
import { Volume2, ChevronDown, RefreshCw, Check, Square } from "lucide-react";

interface VoiceOption {
  id: string;
  name: string;
  gender: "Perempuan" | "Laki-laki";
  description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "id-ID-GadisNeural",
    name: "Suara Perempuan (Gadis)",
    gender: "Perempuan",
    description: "Indonesia (Neural)",
  },
  {
    id: "id-ID-ArdiNeural",
    name: "Suara Laki-laki (Ardi)",
    gender: "Laki-laki",
    description: "Indonesia (Neural)",
  },
];

export function TtsCard() {
  const [ttsText, setTtsText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleStopSpeaking = () => {
    cleanupAudio();
  };

  const handleSpeak = async () => {
    const textToSpeak = ttsText.trim();
    if (!textToSpeak) return;

    if (isPlaying || isLoading) {
      handleStopSpeaking();
      return;
    }

    cleanupAudio();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voice: selectedVoice.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat suara (${response.status})`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        cleanupAudio();
      };

      audio.onerror = () => {
        cleanupAudio();
        setErrorMessage("Terjadi kesalahan saat memutar audio.");
      };

      await audio.play();
    } catch (err) {
      console.error("Gagal memutar audio TTS:", err);
      cleanupAudio();
      setErrorMessage("Gagal memproses suara TTS. Pastikan koneksi dan service AI aktif.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col shadow-xs relative">
      <h3 className="font-bold text-gray-900 text-base">Ucapkan (TTS)</h3>
      <p className="text-sm text-gray-400 mt-1 mb-3">
        Ubah teks menjadi suara untuk berbicara
      </p>

      {/* Input Area */}
      <div className="relative mb-1">
        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          maxLength={300}
          placeholder="Tulis pesan anda disini..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 h-28 transition-all"
        />
      </div>
      <p className="text-right text-xs text-gray-400 mb-3">
        {ttsText.length}/300
      </p>

      {errorMessage && (
        <div className="mb-3 p-2.5 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Voice Selection Box */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setShowDropdown((prev) => !prev)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors text-left"
        >
          <Volume2 className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selectedVoice.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {selectedVoice.description}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Options */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
            {VOICE_OPTIONS.map((voice) => {
              const isSelected = selectedVoice.id === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoice(voice);
                    setShowDropdown(false);
                    if (isPlaying) handleStopSpeaking();
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-purple-50 transition-colors ${
                    isSelected ? "bg-purple-50/70" : ""
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isSelected ? "text-purple-700" : "text-gray-800"
                      }`}
                    >
                      {voice.name}
                    </p>
                    <p className="text-xs text-gray-400">{voice.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Button */}
      {isPlaying ? (
        <button
          type="button"
          onClick={handleStopSpeaking}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-base flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Square className="w-4 h-4 fill-current" />
          Berhenti Bicara
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSpeak}
          disabled={!ttsText.trim() || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-base flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Memproses Suara...
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              Ucapkan
            </>
          )}
        </button>
      )}
    </div>
  );
}
