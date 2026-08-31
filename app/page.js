"use client";

import { useState } from "react";

const starters = [
  ["💔", "I'm struggling to let someone go."],
  ["❤️", "I don't know if they really love me."],
  ["🧩", "I don't understand their behavior."],
  ["🌱", "I want to heal and move forward."],
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm HIISSA Relationship AI. Tell me what's happening, and I'll help you look at it with empathy, balance, and self-respect.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text = input) {
    const clean = text.trim();

    if (!clean || loading) return;

    const next = [...messages, { role: "user", content: clean }];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 413) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content:
                "Your message is a little too long. ❤️ Please shorten it to 6,000 characters or fewer and try again.",
            },
          ]);
          return;
        }

        throw new Error("Request failed");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't respond right now. Please try again in a moment. 💛",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="orb one" />
      <div className="orb two" />
      <div className="spark s1">✦</div>
      <div className="spark s2">♡</div>

      <section className="wrap">
        <header className="hero">
          <div className="logo">H</div>

          <div>
            <div className="kicker">HIISSA • RELATIONSHIP AI</div>

            <h1>
              Someone to talk to.
              <br />
              <span>Without judgment.</span>
            </h1>

            <p>
              A beautiful space for relationship questions, emotional clarity,
              boundaries, healing, and self-respect.
            </p>
          </div>
        </header>

        <div className="principle">
          ✦{" "}
          <span>
            I'll help you separate <b>what you know</b>,{" "}
            <b>what you suspect</b>, <b>what you feel</b>, and{" "}
            <b>what you cannot control</b>.
          </span>
        </div>

        <div className="trust">
          <span>♡ Compassionate</span>
          <span>⚖ Balanced</span>
          <span>✦ Self-respecting</span>
          <span>◌ Non-judgmental</span>
        </div>

        <section className="chat">
          <div className="chatHead">
            <div className="mini">H</div>

            <div>
              <strong>HIISSA Relationship AI</strong>
              <small>● Here with you</small>
            </div>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={"row " + message.role}>
                <div className={"bubble " + message.role}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="row assistant">
                <div className="bubble assistant">Thinking…</div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="starters">
              <small>You can start with…</small>

              <div className="grid">
                {starters.map(([emoji, text]) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => sendMessage(text)}
                  >
                    <i>{emoji}</i>
                    <span>{text}</span>
                    <b>→</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="privacy">
            🔒 Please avoid sharing identifying or highly sensitive personal
            information such as your full name, address, phone number,
            passwords, financial details, or private account information.
          </div>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell me what's on your heart…"
              rows={1}
            />

            <button type="submit" disabled={!input.trim() || loading}>
              Send ↑
            </button>
          </form>

          <p className="fine">
            HIISSA offers reflective AI guidance, not emergency, medical,
            legal, or professional mental-health care.
          </p>
        </section>

        <footer>
          <b>HIISSA</b> · Healing is transformation, not erasure.
        </footer>
      </section>
    </main>
  );
}
