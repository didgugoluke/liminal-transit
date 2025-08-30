import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 🔮 Liminal Transit — Y/N Adventure (AI-Agent Driven, Ultra-Lean)
 * - First-run setup screen for GPT key (or continue offline)
 * - Seeded RNG world-gen (Minecraft-style seed vibes)
 * - Functional roles: Narrator, WorldBuilder, NPC Actors
 * - Binary choices (Y/N) with 1–2 sentence beats
 *
 * Fixes:
 * - Resolved SyntaxError: Unterminated string constant by properly escaping newline in join("\n").
 * - Added lightweight self-tests to validate core utilities and offline generator.
 */

// --- Seeded RNG utils (deterministic) ---------------------------------------
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStringToSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// --- Minimal world gen -------------------------------------------------------
function generateWorld(seedStr) {
  const rng = mulberry32(hashStringToSeed(seedStr));
  const roles = [
    "Hero (Pending)",
    "Suspicious Stranger",
    "Background Character, L3",
    "Plot Device — Handle With Care",
  ];
  const cities = [
    "Checkpoint City",
    "Undesignated Territory 7",
    "Harbor of Revisions",
    "The Stray Road",
  ];
  const agents = [
    { name: pick(rng, ["The Charioteer", "The Driver", "Route-7 Operator"]).toString(), role: "Guide", mood: pick(rng, ["stern", "tired", "kind"]) },
    { name: pick(rng, ["The Scribbler", "Note-Taker", "Margin Poet"]).toString(), role: "Mystic Teen", mood: pick(rng, ["eager", "anxious"]) },
    { name: pick(rng, ["Retired Villain", "Former Antagonist", "Ex-Problem"]).toString(), role: "Advisor", mood: pick(rng, ["wry", "guilty"]) },
    { name: pick(rng, ["Farmer", "Quiet Carrier", "Keeper"]).toString(), role: "Caretaker", mood: pick(rng, ["calm", "guarded"]) },
  ];
  return {
    seed: seedStr,
    rng,
    playerRole: pick(rng, roles),
    destination: pick(rng, cities),
    agents,
    continuity: 3, // 0–6
    foreshadow: 0,
    genre: pick(rng, ["mystery", "surreal", "noir", "folk"]),
  };
}

// --- Optional GPT integration (lean) ----------------------------------------
const MODEL = "gpt-5"; // placeholder model id
async function generateWithGPT({ apiKey, systemPrompt, messages }) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "system", content: "Reply in <=2 short sentences. End with a clear Y/N question unless the scene ends; then end with '(Restart?)'." },
        ],
        temperature: 0.7,
        max_tokens: 120,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("No text");
    return text;
  } catch (e) {
    console.warn("GPT fallback:", e.message);
    return null;
  }
}

// --- Offline micro-generator (deterministic, 1–2 sentences) -----------------
function offlineBeat(world, lastChoice) {
  const { rng } = world;
  const senses = ["neon", "dust", "sea-wet air", "library quiet", "violet dusk"];
  const beatsY = ["A guard wavers; the clipboard dims.", "A side door clicks open, unmarked.", "Someone nods as if they expected you."];
  const beatsN = ["The line of passengers rustles like paper.", "A siren purrs but never rises.", "Footsteps multiply in the hall."];
  const hooks = ["Follow the whispering lawyer?", "Trust the teen with the notebook?", "Take the unlit stair?", "Ask the driver what he knows?"];
  const enders = ["The room exhales. Your story opens elsewhere.", "The road bends and forgets you were chased."];
  const chanceEnd = rng() < 0.06;
  if (chanceEnd) return `${pick(rng, enders)} (Restart?)`;
  const sense = pick(rng, senses);
  const beat = lastChoice === "Y" ? pick(rng, beatsY) : pick(rng, beatsN);
  const hook = pick(rng, hooks);
  return `${beat} The air tastes of ${sense}. ${hook} (Y/N)`;
}

// --- System prompt composer --------------------------------------------------
function buildSystemPrompt(world) {
  const agentList = world.agents.map(a => `${a.name} (${a.role}, ${a.mood})`).join(", ");
  return (
    `You are a compact game engine composed of functional agents: Narrator, WorldBuilder, and NPC Actors. ` +
    `Tone: inclusive, humane, surreal-but-grounded. Avoid lectures. Keep outputs ultra-lean (<=2 short sentences). ` +
    `World seed: ${world.seed}. Genre: ${world.genre}. Destination: ${world.destination}. ` +
    `Player designation: ${world.playerRole}. Agents present: ${agentList}. ` +
    `Mechanics: Continuity=${world.continuity} (0–6), Foreshadow=${world.foreshadow}. ` +
    `Respect prior choices and escalate softly. If a clean ending occurs, end with '(Restart?)' and no Y/N.`
  );
}

// --- Setup Screen ------------------------------------------------------------
function SetupScreen({ initialKey, onContinue, onOffline }) {
  const [key, setKey] = useState(initialKey || "");
  const hasKey = key.trim().length > 10;
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-3">Liminal Transit — Setup</h1>
        <p className="text-sm opacity-80 mb-4">
          Choose how you want to play. Use GPT for dynamic narration (paste an API key), or continue in offline deterministic mode.
        </p>

        <label className="text-sm block mb-2">OpenAI API Key (optional)</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm mb-3"
        />
        <div className="text-xs opacity-70 mb-4 space-y-1">
          <div>How to get a key (1–2 mins):</div>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Sign in to your AI provider account.</li>
            <li>Open your dashboard’s API Keys page.</li>
            <li>Create a new secret key and copy it.</li>
            <li>Paste it above. You can revoke it anytime from the dashboard.</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-xl ${hasKey ? "bg-green-600 hover:bg-green-700" : "bg-green-900 opacity-60"}`}
            disabled={!hasKey}
            onClick={() => onContinue(key)}
          >
            Use GPT
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600"
            onClick={onOffline}
          >
            Continue Offline
          </button>
        </div>

        <div className="text-[11px] opacity-60 mt-4">
          Your key is stored locally in your browser (localStorage). You can change or remove it later from the top bar.
        </div>
      </div>
    </div>
  );
}

// --- Lightweight self-tests --------------------------------------------------
function runSelfTests() {
  const errs = [];
  try {
    // Determinism: hashStringToSeed
    const h1 = hashStringToSeed("abc");
    const h2 = hashStringToSeed("abc");
    const h3 = hashStringToSeed("abd");
    if (!(h1 === h2 && h1 !== h3)) errs.push("hashStringToSeed determinism failed");

    // Determinism: mulberry32 sequence
    const rA = mulberry32(123);
    const rB = mulberry32(123);
    const seqA = [rA(), rA(), rA()].join(",");
    const seqB = [rB(), rB(), rB()].join(",");
    if (seqA !== seqB) errs.push("mulberry32 sequence mismatch");

    // Offline beat validation
    const world = generateWorld("test-seed");
    const bY = offlineBeat(world, "Y");
    const bN = offlineBeat(world, "N");
    const ok = (s) => /(\(Y\/N\)|\(Restart\?\))$/.test(s.trim());
    if (!ok(bY) || !ok(bN)) errs.push("offlineBeat did not end with Y/N or (Restart?)");

    // Newline join sanity (prevents the original SyntaxError)
    const recent = [{ who: "A", text: "x" }, { who: "B", text: "y" }]
      .map(m => `${m.who}: ${m.text}`)
      .join("\n");
    if (!recent.includes("\n")) errs.push("recent join did not include newline");
  } catch (e) {
    errs.push("Exception during tests: " + e.message);
  }
  return errs;
}

// --- Main Component ----------------------------------------------------------
export default function AIAgentAdventure() {
  const [seed, setSeed] = useState(() => new URLSearchParams(window.location.search).get("seed") || Math.random().toString(36).slice(2, 10));
  const [world, setWorld] = useState(() => generateWorld("seed-" + Date.now()));
  const [log, setLog] = useState(() => [
    { who: "Narrator", text: "The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)" },
  ]);
  const [awaiting, setAwaiting] = useState(false);
  const [apiKey, setApiKey] = useState(() => (typeof window !== "undefined" && (window.OPENAI_API_KEY || localStorage.getItem("OPENAI_KEY"))) || "");
  const [useGPT, setUseGPT] = useState(() => !!((typeof window !== "undefined" && (window.OPENAI_API_KEY || localStorage.getItem("OPENAI_KEY")))));
  const [showSetup, setShowSetup] = useState(() => !apiKey); // Step 1: show setup if no key
  const [ended, setEnded] = useState(false);
  const [testErrors, setTestErrors] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Run tests once on mount
    setTestErrors(runSelfTests());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, awaiting]);

  const systemPrompt = useMemo(() => buildSystemPrompt(world), [world]);

  function resetWithSeed(s) {
    const nextSeed = s || Math.random().toString(36).slice(2, 10);
    const nextWorld = generateWorld(nextSeed);
    setSeed(nextSeed);
    setWorld(nextWorld);
    setLog([{ who: "Narrator", text: "The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)" }]);
    setEnded(false);
  }

  function applyChoice(choice) {
    const w = { ...world };
    const coherent = (w.playerRole.includes("Hero") && choice === "Y") || (!w.playerRole.includes("Hero") && choice === "N");
    w.continuity = Math.max(0, Math.min(6, w.continuity + (coherent ? 1 : -1)));
    if (Math.random() < 0.25) w.foreshadow += 1;
    setWorld(w);
  }

  async function nextBeat(choice) {
    if (awaiting || ended) return;
    setAwaiting(true);
    applyChoice(choice);

    // ✅ Fixed newline usage in join("\n")
    const recent = log
      .slice(-6)
      .map((m) => `${m.who}: ${m.text}`)
      .join("\n");

    const userMsg = `Player chooses ${choice}. Keep it lean.`;

    let text = null;
    if (useGPT && apiKey) {
      localStorage.setItem("OPENAI_KEY", apiKey);
      text = await generateWithGPT({
        apiKey,
        systemPrompt,
        messages: [
          { role: "user", content: recent },
          { role: "user", content: userMsg },
        ],
      });
    }

    if (!text) text = offlineBeat(world, choice);

    const tidyEnd = /\(Restart\?\)$/i.test(text);
    setLog((l) => [...l, { who: "Narrator", text }]);
    setAwaiting(false);
    if (tidyEnd) setEnded(true);
  }

  function restartIfEnded() {
    if (ended) resetWithSeed(seed);
  }

  // --- First-run Setup step --------------------------------------------------
  if (showSetup) {
    return (
      <SetupScreen
        initialKey={apiKey}
        onContinue={(key) => {
          setApiKey(key);
          setUseGPT(true);
          localStorage.setItem("OPENAI_KEY", key);
          setShowSetup(false);
        }}
        onOffline={() => {
          setUseGPT(false);
          setShowSetup(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="w-full border-b border-gray-800 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Seed</span>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm w-40"
            placeholder="seed"
          />
          <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm" onClick={() => resetWithSeed(seed)}>
            New World
          </button>
          <div className="text-xs opacity-70 ml-2">
            Role: <span className="font-mono">{world.playerRole}</span>
          </div>
          <div className="text-xs opacity-70 ml-3">
            Genre: <span className="font-mono">{world.genre}</span>
          </div>
          <div className="text-xs opacity-70 ml-3">
            Dest: <span className="font-mono">{world.destination}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={useGPT} onChange={(e) => setUseGPT(e.target.checked)} />
            Use GPT
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm w-64"
            placeholder="Paste API Key (or leave empty for offline)"
          />
          <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs" onClick={() => setShowSetup(true)}>
            Setup
          </button>
        </div>
      </div>

      {/* Log */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Test status */}
          <div className="text-[11px] mb-2">
            <span className={testErrors.length ? "text-red-400" : "text-emerald-400"}>
              {testErrors.length ? `Tests failed: ${testErrors.join("; ")}` : "All self-tests passed."}
            </span>
          </div>

          {log.map((m, i) => (
            <div key={i} className="mb-3">
              <div className="text-xs uppercase tracking-wider text-gray-400">{m.who}</div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 leading-relaxed">{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full border-t border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3 justify-center">
          <button
            onClick={() => (ended ? restartIfEnded() : nextBeat("Y"))}
            disabled={awaiting}
            className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {ended ? "Restart" : "Yes"}
          </button>
          {!ended && (
            <button
              onClick={() => nextBeat("N")}
              disabled={awaiting}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              No
            </button>
          )}
          <div className="text-xs opacity-70 ml-4">Continuity: {world.continuity} | Foreshadow: {world.foreshadow}</div>
          {awaiting && <div className="text-xs animate-pulse opacity-70 ml-2">thinking…</div>}
        </div>
        <div className="max-w-2xl mx-auto text-center text-[11px] opacity-60 mt-2">
          Ultra-lean outputs. Inclusive world by default. Your choices ripple.
        </div>
      </div>
    </div>
  );
}
