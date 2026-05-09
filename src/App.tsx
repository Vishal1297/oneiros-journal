/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format } from "date-fns";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  BookOpen,
  ChevronLeft,
  Loader2,
  LogOut,
  MessageSquare,
  Mic,
  Moon,
  Plus,
  Send,
  Sparkles,
  StopCircle,
  Trash2
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { auth, db } from "./lib/firebase";
import {
  handleFirestoreError,
  OperationType,
} from "./lib/firestoreErrorHandler";
import { cn } from "./lib/utils";
import { DreamAnalysis, geminiService } from "./services/geminiService";

// --- Types ---
interface DreamEntry {
  id: string;
  userId: string;
  timestamp: Timestamp;
  transcription: string;
  imageUrl?: string;
  interpretation?: string;
  emotionalTheme?: string;
  symbols?: string[];
  chatHistory?: { role: "user" | "model"; text: string }[];
}

// --- Components ---

function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-28 h-28"
  };
  
  return (
    <div className={cn("relative flex items-center justify-center shrink-0", sizes[size], className)}>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-indigo-500 blur-2xl rounded-full" 
      />
      <motion.div
        animate={{ 
          rotate: [0, 360],
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
        }}
        className="relative z-10"
      >
        <Moon className={cn(
          "text-indigo-400",
          size === "sm" ? "h-5 w-5" : size === "md" ? "h-8 w-8" : "h-16 w-16"
        )} />
      </motion.div>
      <motion.div
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1.3, 0.8],
          x: [0, 5, 0],
          y: [0, -5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20"
      >
        <Sparkles className={cn(
          "text-white",
          size === "sm" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-8 w-8"
        )} />
      </motion.div>
    </div>
  );
}

function Header({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-brand-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-brand-border h-20">
      <div className="flex items-center gap-4">
        <Logo size="sm" />
        <h1 className="text-xl font-bold font-display tracking-tighter text-white uppercase flex items-center gap-1.5">
          Oneiros <span className="text-indigo-400 font-light italic normal-case tracking-normal">Journal</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-200">
            {user.displayName}
          </span>
          <span className="text-[10px] text-slate-500 tracking-wider font-mono">
            {user.email}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function WelcomeScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/15 via-brand-bg to-brand-bg -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full"
      >
        <Logo size="lg" className="mb-8 md:mb-12 mx-auto" />
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-display text-white mb-6 tracking-tighter leading-[0.9] md:leading-[0.85] text-balance">
          Mapping the <br />
          <span className="text-indigo-400 font-light italic">Subconscious.</span>
        </h1>
        <p className="text-slate-400 mb-10 md:mb-14 leading-relaxed max-w-sm mx-auto font-light text-sm md:text-base tracking-wide px-4">
          A sleek sanctuary for your nocturnal journeys. Capture voice, visualize the surreal, and decode the silence.
        </p>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="group relative flex items-center justify-center gap-3 px-6 h-12 w-full max-w-[240px] bg-brand-surface/40 backdrop-blur-md border border-white/10 text-white font-medium rounded-xl overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="relative z-10 tracking-tight text-sm">Continue with Google</span>
          </motion.button>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-medium font-sans">Secure Biometric Access</p>
        </div>
      </motion.div>
    </div>
  );
}

function DreamRecorder({
  onComplete,
}: {
  onComplete: (dream: {
    transcription: string;
    analysis: DreamAnalysis;
    imageUrl: string;
  }) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Please allow microphone access to record dreams.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      setProcessingStatus("Transcribing voice...");
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        const transcription = await geminiService.transcribeAudio(
          base64Audio,
          blob.type,
        );

        setProcessingStatus("Decoding archetypes...");
        const analysis = await geminiService.analyzeDream(transcription);

        setProcessingStatus("Architecting visualization...");
        const imageUrl = await geminiService.generateDreamImage(
          analysis.surrealPrompt,
        );

        onComplete({ transcription, analysis, imageUrl });
        setIsProcessing(false);
      };
    } catch (err) {
      console.error("Error processing audio:", err);
      setIsProcessing(false);
      alert("Failed to process dream.");
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-6">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1 font-display uppercase tracking-widest">
          Processing
        </h3>
        <p className="text-xs text-indigo-300 animate-pulse uppercase tracking-[0.2em]">
          {processingStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 p-12">
      <div className="flex items-center justify-center relative">
        {isRecording && (
          <div className="absolute -inset-8 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 border",
            isRecording
              ? "bg-red-500 border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
              : "bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.4)]",
          )}
        >
          {isRecording ? (
            <StopCircle className="h-10 w-10 text-white" />
          ) : (
            <Mic className="h-10 w-10 text-white" />
          )}
        </motion.button>
      </div>

      <div className="text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 uppercase block mb-2">
          {isRecording ? "Live Capture" : "Wait for signal"}
        </span>
        <h3 className="text-sm text-slate-300 font-light italic max-w-[200px]">
          {isRecording
            ? "Transcribing your subconscious..."
            : "Narrate your journey for aethersphere mapping"}
        </h3>
      </div>
    </div>
  );
}

function DreamChat({
  dream,
  onUpdate,
}: {
  dream: DreamEntry;
  onUpdate: (updatedDream: DreamEntry) => void;
}) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dream.chatHistory]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    const newHistory = [
      ...(dream.chatHistory || []),
      { role: "user" as const, text: userMessage },
    ];

    try {
      const response = await geminiService.chatAboutDream(
        dream.transcription,
        dream.interpretation || "",
        newHistory,
        userMessage,
      );

      const finalHistory = [
        ...newHistory,
        { role: "model" as const, text: response },
      ];

      const dreamRef = doc(db, "dreams", dream.id);
      await updateDoc(dreamRef, { chatHistory: finalHistory });

      onUpdate({ ...dream, chatHistory: finalHistory });
    } catch (err) {
      console.error("Chat error:", err);
      handleFirestoreError(err, OperationType.UPDATE, `dreams/${dream.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-surface rounded-3xl border border-brand-border overflow-hidden">
      <div className="p-5 border-b border-brand-border bg-white/5 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
            Symbol Chat
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 font-sans no-scrollbar"
      >
        {!dream.chatHistory?.length && (
          <div className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest leading-relaxed">
            Inquire about symbols, <br /> emotions, or hidden gates.
          </div>
        )}
        {dream.chatHistory?.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed",
              msg.role === "user"
                ? "bg-white/5 text-slate-300 ml-auto border border-white/5"
                : "bg-indigo-500/10 text-indigo-100 border border-indigo-500/20 mr-auto",
            )}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 mr-auto rounded-2xl px-4 py-3 text-[10px] uppercase tracking-widest animate-pulse">
            Consulting the Oracle...
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-white/5 flex gap-2 border-t border-brand-border backdrop-blur-md"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your inquiry..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-indigo-600 p-2 rounded-xl text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}

function DreamView({
  dream,
  onBack,
  onDelete,
}: {
  dream: DreamEntry;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const [activeDream, setActiveDream] = useState(dream);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-screen-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/5 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
            Return to Aethersphere
          </span>
        </button>
        <button
          onClick={() => {
            if (confirm("Permanently erase this subconscious imprint?")) {
              onDelete(dream.id);
            }
          }}
          className="p-3 text-slate-600 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left column: Data & Capture info */}
        <div className="lg:w-1/4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-brand-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                Voice Capture
              </span>
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic font-light">
              "{dream.transcription}"
            </p>
          </div>

          <div className="flex-1 p-6 rounded-3xl bg-white/5 border border-brand-border">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block mb-4">
              Archetypal Map
            </span>
            <div className="space-y-4">
              {dream.symbols?.map((sym, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                    <span>{sym}</span>
                    <span>ACTIVE</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              ))}
              {!dream.symbols?.length && (
                <p className="text-[10px] text-slate-600 uppercase italic">
                  No symbols identified.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center: Visualization */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative flex-1 min-h-[400px] lg:min-h-0 rounded-3xl overflow-hidden border border-brand-border group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
            {dream.imageUrl ? (
              <img
                src={dream.imageUrl}
                alt="Subconscious projection"
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-pulse">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              </div>
            )}
            <div className="absolute bottom-8 left-8 z-20">
              <span className="text-[10px] text-indigo-300 font-bold tracking-[0.3em] uppercase block mb-1">
                Projection Alpha
              </span>
              <h2 className="text-3xl font-light font-display text-white tracking-tight">
                {dream.emotionalTheme || "Dream Essence"}
              </h2>
              <p className="text-slate-400 text-[10px] tracking-widest uppercase mt-2 font-mono">
                ID: {dream.id.slice(0, 8)} •{" "}
                {format(
                  dream.timestamp?.toDate
                    ? dream.timestamp.toDate()
                    : new Date(),
                  "MMM dd, p",
                )}
              </p>
            </div>
            <div className="absolute top-6 right-6 z-20 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
              S-AI Visualization
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
              ✨
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                Subconscious Insight
              </p>
              <p className="text-sm text-indigo-100/70 leading-relaxed font-light italic">
                The visual representation highlights the fluidity of your memory
                during this specific REM cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Interpretation & Chat */}
        <div className="lg:w-1/4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-brand-border h-[400px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                Analysis
              </span>
            </div>
            <div className="prose prose-invert prose-xs max-w-none prose-p:text-slate-400 prose-headings:text-indigo-300 prose-strong:text-indigo-200">
              <ReactMarkdown>{dream.interpretation || ""}</ReactMarkdown>
            </div>
          </div>

          <div className="h-[350px]">
            <DreamChat dream={activeDream} onUpdate={setActiveDream} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DreamGallery({
  dreams,
  onSelect,
}: {
  dreams: DreamEntry[];
  onSelect: (dream: DreamEntry) => void;
}) {
  if (dreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white/5 rounded-[40px] border border-dashed border-brand-border">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Moon className="h-6 w-6 text-slate-700" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 font-display">
          The Aethersphere is still.
        </h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2 text-xs uppercase tracking-[0.2em] font-light">
          Capture your first subconsciously recorded journey to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {dreams.map((dream) => (
        <motion.div
          key={dream.id}
          layoutId={dream.id}
          whileHover={{ y: -8 }}
          onClick={() => onSelect(dream)}
          className="group cursor-pointer bg-brand-surface rounded-[32px] overflow-hidden border border-brand-border hover:border-indigo-500/40 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/10"
        >
          <div className="aspect-[4/5] bg-slate-900 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
            {dream.imageUrl ? (
              <img
                src={dream.imageUrl}
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                alt="Dream visual"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-slate-800 animate-spin" />
              </div>
            )}
            <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold text-indigo-300 border border-white/5 uppercase tracking-[0.2em]">
              {dream.emotionalTheme || "Decoding"}
            </div>

            <div className="absolute bottom-6 left-6 z-20 pr-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">
                {dream.timestamp?.toDate
                  ? format(dream.timestamp.toDate(), "MMM dd • yyyy")
                  : "Recently captured"}
              </p>
              <p className="text-sm text-slate-100 line-clamp-2 leading-relaxed italic font-light group-hover:text-white">
                "{dream.transcription}"
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDreams([]);
      return;
    }

    const q = query(
      collection(db, "dreams"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as DreamEntry,
        );
        setDreams(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "dreams");
      },
    );

    return () => unsubscribe();
  }, [user]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const logout = () => signOut(auth);

  const saveDream = async (data: {
    transcription: string;
    analysis: DreamAnalysis;
    imageUrl: string;
  }) => {
    if (!user) return;

    try {
      const dreamRef = await addDoc(collection(db, "dreams"), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        transcription: data.transcription,
        imageUrl: data.imageUrl,
        emotionalTheme: data.analysis.emotionalTheme,
        symbols: data.analysis.symbols,
        interpretation: data.analysis.interpretation,
        chatHistory: [],
      });

      setIsRecordingModalOpen(false);
      setSelectedDreamId(dreamRef.id);
    } catch (err) {
      console.error("Save error:", err);
      handleFirestoreError(err, OperationType.WRITE, "dreams");
    }
  };

  const deleteDream = async (id: string) => {
    try {
      await deleteDoc(doc(db, "dreams", id));
      setSelectedDreamId(null);
    } catch (err) {
      console.error("Delete error:", err);
      handleFirestoreError(err, OperationType.WRITE, `dreams/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen onLogin={login} />;
  }

  const selectedDream = dreams.find((d) => d.id === selectedDreamId);

  return (
    <div className="min-h-screen bg-brand-bg text-slate-300 selection:bg-indigo-500/30 font-sans">
      <Header user={user} onLogout={logout} />

      <main className="container mx-auto px-8 py-12 max-w-screen-2xl">
        <AnimatePresence mode="wait">
          {selectedDream ? (
            <DreamView
              dream={selectedDream}
              onBack={() => setSelectedDreamId(null)}
              onDelete={deleteDream}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brand-border pb-10">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 uppercase block mb-3">
                    Subconscious Archive
                  </span>
                  <h2 className="text-4xl font-bold font-display text-white tracking-tight">
                    Galleries of Night
                  </h2>
                  <p className="text-slate-500 mt-2 font-light">
                    Documented subconscious projection clusters.
                  </p>
                </div>
                <button
                  onClick={() => setIsRecordingModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95 font-semibold text-[10px] uppercase tracking-[0.2em]"
                >
                  <Plus className="h-4 w-4" />
                  INITIATE RECORD
                </button>
              </div>

              <DreamGallery
                dreams={dreams}
                onSelect={(d) => setSelectedDreamId(d.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Recording Modal */}
      <AnimatePresence>
        {isRecordingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordingModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-brand-surface border border-brand-border w-full max-w-lg rounded-[40px] shadow-[0_0_100px_rgba(79,70,229,0.15)] relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-white/5">
                <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                  Capture Sequence
                </span>
                <button
                  onClick={() => setIsRecordingModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <StopCircle className="h-4 w-4" />
                </button>
              </div>
              <DreamRecorder onComplete={saveDream} />

              <div className="px-12 pb-8 flex items-center gap-4 text-[10px] text-slate-600 uppercase tracking-widest justify-center">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span>Sync with Oneiros Journal</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="container mx-auto px-10 py-8 border-t border-brand-border mt-auto flex items-center justify-between text-[10px] text-slate-600 tracking-[0.2em] uppercase font-mono">
        <div className="flex gap-8">
          <span>Latency: 42ms</span>
          <span>Core: Gemini-3.0-Oneiros</span>
        </div>
        <div>System Verified • Subconscious Auth Established</div>
      </footer>
    </div>
  );
}
