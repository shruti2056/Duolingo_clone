"use client";

import { useState } from "react";
import { X, UserCheck, LogIn, UserPlus } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api";
import { sound } from "@/lib/audio";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser({ username, password });
      } else {
        await registerUser({ username, name, email, password });
      }
      sound.playCorrect();
      onSuccess();
      onClose();
    } catch (err: any) {
      sound.playIncorrect();
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131f24] border-4 border-[#58cc02] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl flex flex-col items-center gap-6">
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#777777] hover:text-[#3c3c3c] dark:hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Duo Mascot Banner */}
        <div className="w-20 h-20 rounded-full bg-[#58cc02] flex items-center justify-center font-black text-3xl text-white shadow-xl">
          duo
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-[#3c3c3c] dark:text-[#f1f5f9] tracking-tight">
            {mode === "login" ? "Welcome back!" : "Create your profile"}
          </h2>
          <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8] mt-1">
            {mode === "login" ? "Sign in to save your streaks & XP" : "Join millions of language learners worldwide!"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#f7f7f7] dark:bg-[#18272c] p-1.5 rounded-2xl w-full border border-[#e5e5e5] dark:border-[#37464f]">
          <button
            onClick={() => {
              sound.playTap();
              setMode("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 font-black text-xs rounded-xl transition-all ${
              mode === "login"
                ? "bg-white dark:bg-[#202f36] text-[#58cc02] shadow-sm"
                : "text-[#777777] dark:text-[#93a2a8]"
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setMode("register");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 font-black text-xs rounded-xl transition-all ${
              mode === "register"
                ? "bg-white dark:bg-[#202f36] text-[#58cc02] shadow-sm"
                : "text-[#777777] dark:text-[#93a2a8]"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {errorMsg && (
          <div className="w-full bg-[#ffdadc] dark:bg-[#3a1a1c] border-2 border-[#ffb3b8] text-[#ea2b2b] dark:text-[#ff8080] p-3 rounded-2xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {mode === "register" && (
            <>
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Alex Rivera)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#18272c] text-sm font-bold text-[#3c3c3c] dark:text-[#f1f5f9] outline-none focus:border-[#58cc02]"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#18272c] text-sm font-bold text-[#3c3c3c] dark:text-[#f1f5f9] outline-none focus:border-[#58cc02]"
              />
            </>
          )}

          <input
            type="text"
            required
            placeholder="Username (e.g. learner)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3.5 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#18272c] text-sm font-bold text-[#3c3c3c] dark:text-[#f1f5f9] outline-none focus:border-[#58cc02]"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#18272c] text-sm font-bold text-[#3c3c3c] dark:text-[#f1f5f9] outline-none focus:border-[#58cc02]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 btn-duo-green flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg"
          >
            {loading ? (
              "PROCESSING..."
            ) : mode === "login" ? (
              <>
                <LogIn className="w-5 h-5" />
                SIGN IN
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                CREATE ACCOUNT
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
