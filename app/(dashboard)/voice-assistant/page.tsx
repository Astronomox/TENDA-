"use client";

/**
 * app/voice/page.tsx
 *
 * ── Layout Integration ────────────────────────────────────────────────────────
 * Parent: DashboardLayout (layout.tsx)
 *
 * layout.tsx provides:
 *   Mobile  → max-w-[480px] mx-auto  |  pt-16 pb-24
 *   Desktop → max-w-6xl              |  pt-8 px-8 pb-12  |  flex-1 beside w-64 nav
 *
 * Integration strategy (SAME AS Insights page — standard scrollable dashboard):
 *   • Does NOT escape layout.tsx padding — this page scrolls naturally.
 *   • Adds only `px-4 lg:px-0` for inner mobile gutter.
 *   • On desktop: uses a two-column CSS grid (main area + session history sidebar)
 *     that works inside max-w-6xl.
 *   • On mobile: single column, session history appears below main content.
 *
 * Voice orb + controls do NOT use fixed positioning — they scroll with the page,
 * keeping the layout contract with layout.tsx's fixed mobile chrome intact.
 */

import React, { useState, useCallback } from "react";
import VoiceHero from "./components/VoiceHero";
import VoiceTranscript, { TranscriptEntry } from "./components/VoiceTranscript";
import QuickCommandGrid from "./components/QuickCommandGrid";
import VoiceSummaryCard, { VoiceSummary } from "./components/VoiceSummaryCard";
import VoiceSessionHistory, { VoiceSession } from "./components/VoiceSessionHistory";
import { VoiceState } from "./components/VoiceStateIndicator";

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: "t1",
    role: "user",
    text: "Analyze my sales performance this month.",
    time: "10:41 AM",
  },
  {
    id: "t2",
    role: "assistant",
    text: "Your revenue this month is ₦450,000, which is up 12% compared to last month. Friday is your strongest day, contributing about 18% of weekly revenue. Your top category is Food & Beverage, which drives the most repeat purchases.",
    time: "10:41 AM",
  },
  {
    id: "t3",
    role: "user",
    text: "Which customers should I focus on this week?",
    time: "10:42 AM",
  },
  {
    id: "t4",
    role: "assistant",
    text: "I'd prioritize 47 customers who haven't purchased in 14 or more days. They represent about ₦58,000 in at-risk revenue. Reaching out now with a personalised offer could recover 30 to 40 percent of them based on historical patterns.",
    time: "10:42 AM",
  },
];

const SEED_SUMMARY: VoiceSummary = {
  summary:
    "This voice session focused on monthly sales performance and customer retention strategy. Revenue is trending positively at +12%, with key opportunities in re-engaging at-risk customers and optimising Friday sales windows.",
  takeaways: [
    "Revenue up 12% — driven by Friday traffic and Food & Beverage",
    "47 customers are at churn risk this week",
    "Morning hours (7–10 AM) are underutilised despite high activity",
  ],
  tasks: [
    "Send re-engagement message to 47 at-risk customers",
    "Plan a Friday evening flash sale promotion",
    "Review Electronics category decline with team",
  ],
  recommendations: [
    "Introduce a morning loyalty incentive to shift purchase timing",
    "Bundle Electronics with Food & Beverage to reverse slump",
    "Increase WhatsApp outreach frequency for top 20 customers",
  ],
  nextActions: [
    "Go to Follow-ups → create outreach campaign",
    "Review AI Insights page for detailed revenue breakdown",
    "Export this summary to share with team",
  ],
};

const SEED_SESSIONS: VoiceSession[] = [
  {
    id: "s1",
    title: "Monthly sales analysis",
    duration: "4:32",
    date: "Today, 10:41 AM",
    dateGroup: "Today",
    messageCount: 8,
    preview: "Analyzed revenue trends and at-risk customer segments",
  },
  {
    id: "s2",
    title: "Customer retention review",
    duration: "3:18",
    date: "Today, 9:15 AM",
    dateGroup: "Today",
    messageCount: 6,
    preview: "Discussed churn prevention strategies for June",
  },
  {
    id: "s3",
    title: "Product performance deep dive",
    duration: "6:04",
    date: "Yesterday, 3:22 PM",
    dateGroup: "Yesterday",
    messageCount: 12,
    preview: "Food & Beverage repeat rate analysis and Electronics decline",
  },
  {
    id: "s4",
    title: "Weekly business summary",
    duration: "2:45",
    date: "Yesterday, 9:00 AM",
    dateGroup: "Yesterday",
    messageCount: 5,
    preview: "High-level weekly performance overview",
  },
  {
    id: "s5",
    title: "Friday promo planning",
    duration: "5:10",
    date: "Jun 10",
    dateGroup: "Earlier",
    messageCount: 9,
    preview: "Discussed flash sale strategy and timing optimisation",
  },
];

// ─── State machine helpers ────────────────────────────────────────────────────
// Simulates a voice session state cycle for demo purposes
function nextState(current: VoiceState): VoiceState {
  const cycle: VoiceState[] = ["listening", "processing", "speaking", "listening"];
  const idx = cycle.indexOf(current);
  return idx === -1 ? "listening" : cycle[(idx + 1) % cycle.length];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VoiceAssistantPage() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessions, setSessions] = useState<VoiceSession[]>(SEED_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("s1");
  const [stateTimer, setStateTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // Start session — cycles through voice states to demo animation
  const handleStart = useCallback(() => {
    setIsActive(true);
    setVoiceState("listening");
    setTranscript([]);
    setShowSummary(false);

    // Cycle states for demo
    let current: VoiceState = "listening";
    let msgIdx = 0;
    const timer = setInterval(() => {
      current = nextState(current);
      setVoiceState(current);

      // Inject transcript messages as state cycles
      if (current === "speaking" && msgIdx < SEED_TRANSCRIPT.length) {
        const msg = SEED_TRANSCRIPT[msgIdx];
        const userMsg = SEED_TRANSCRIPT[msgIdx > 0 ? msgIdx - 1 : 0];
        setTranscript((prev) => {
          const already = prev.find((e) => e.id === msg.id);
          if (already) return prev;
          // Add user message just before AI speaks
          const withUser =
            msgIdx > 0 && !prev.find((e) => e.id === userMsg.id)
              ? [...prev, userMsg]
              : prev;
          return [...withUser, msg];
        });
        msgIdx += 2;
      }
    }, 2200);

    setStateTimer(timer);
  }, []);

  // Stop session
  const handleStop = useCallback(() => {
    if (stateTimer) clearInterval(stateTimer);
    setIsActive(false);
    setVoiceState("idle");
    setTranscript(SEED_TRANSCRIPT);
    setShowSummary(true);
  }, [stateTimer]);

  // Quick command — inject as user message and trigger session
  const handleQuickCommand = useCallback(
    (prompt: string) => {
      if (!isActive) {
        handleStart();
        setTimeout(() => {
          setTranscript([
            { id: `q-${Date.now()}`, role: "user", text: prompt, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
          ]);
        }, 400);
      }
    },
    [isActive, handleStart]
  );

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <div className="px-4 lg:px-0">
      {/*
        Desktop layout: two columns
          Left (flex-1): orb + transcript + commands + summary
          Right (w-80):  session history (sticky)

        Mobile: single column, history at bottom
      */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">

        {/* ── LEFT / MAIN COLUMN ────────────────────────────── */}
        <div>
          {/* Voice hero (orb, controls, waveform) */}
          <VoiceHero
            state={voiceState}
            isActive={isActive}
            isMuted={isMuted}
            onStart={handleStart}
            onStop={handleStop}
            onMute={() => setIsMuted((v) => !v)}
          />

          {/* Divider */}
          <div className="border-t border-[#F0F0EC] mb-6" />

          {/* AI-generated session summary (shown after session ends) */}
          {showSummary && (
            <VoiceSummaryCard
              summary={SEED_SUMMARY}
              sessionDate="Today, 10:45 AM"
            />
          )}

          {/* Live transcript */}
          <VoiceTranscript
            entries={transcript}
            isListening={voiceState === "listening"}
          />

          {/* Quick commands */}
          <QuickCommandGrid
            onSelect={handleQuickCommand}
            disabled={false}
          />
        </div>

        {/* ── RIGHT / SESSION HISTORY COLUMN (desktop) ──────── */}
        {/* On mobile this renders naturally below the main column */}
        <div className="lg:sticky lg:top-4">
          <VoiceSessionHistory
            sessions={sessions}
            activeId={activeSessionId}
            onReplay={(id) => setActiveSessionId(id)}
            onDelete={handleDeleteSession}
            onSelect={(id) => setActiveSessionId(id)}
          />
        </div>

      </div>
    </div>
  );
}
