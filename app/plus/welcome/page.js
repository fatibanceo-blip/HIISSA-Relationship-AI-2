import Link from "next/link";

const gold = "#d4aa52";
const deep = "#0f2d22";
const cream = "#fff8ea";

const cardBase = {
  borderRadius: 18,
  padding: "18px 18px",
  border: "1px solid rgba(212,170,82,.38)",
  boxShadow: "0 10px 28px rgba(6,31,23,.15)",
};

function FeatureCard({ title, subtitle, dark = false }) {
  return (
    <div
      style={{
        ...cardBase,
        background: dark
          ? "linear-gradient(115deg,#123a2d,#1e5a43)"
          : "rgba(255,248,234,.94)",
        color: dark ? "#fff" : deep,
      }}
    >
      <strong style={{ display: "block", fontSize: 19, marginBottom: 6 }}>
        {title}
      </strong>
      <span
        style={{
          display: "block",
          fontSize: 14,
          lineHeight: 1.5,
          color: dark ? "rgba(255,255,255,.82)" : "#657267",
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

export default function PlusWelcome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(14px,4vw,36px)",
        background:
          "linear-gradient(145deg,#0b2119 0%,#143529 50%,#0a1d17 100%)",
        fontFamily: "inherit",
      }}
    >
      <section
        aria-label="HIISSA+ welcome"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: 28,
          border: "1px solid rgba(212,170,82,.35)",
          background:
            "radial-gradient(circle at 82% 8%,rgba(230,177,73,.28),transparent 22%),radial-gradient(circle at 14% 26%,rgba(255,230,174,.10),transparent 24%),linear-gradient(160deg,#12362a 0%,#0e2c22 38%,#183e2f 61%,#f1dfb7 61.2%,#fbf4e5 100%)",
          boxShadow: "0 24px 70px rgba(0,0,0,.34)",
        }}
      >
        <div
          style={{
            padding: "22px clamp(18px,4vw,34px) 34px",
            color: "#fff",
            minHeight: 330,
            position: "relative",
          }}
        >
          <Link
            href="/"
            aria-label="Back to HIISSA"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
              color: "#f5d887",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            ← Back to HIISSA
          </Link>

          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "#0a2018",
                  border: "1px solid rgba(212,170,82,.55)",
                  fontWeight: 900,
                  color: cream,
                }}
              >
                H
              </span>
              <strong style={{ letterSpacing: ".03em" }}>HIISSA+</strong>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "9px 14px",
                background: "rgba(10,32,24,.82)",
                border: "1px solid rgba(212,170,82,.7)",
                color: "#f5d887",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              👑 PLUS
            </span>
          </header>

          <div style={{ marginTop: "clamp(54px,10vw,90px)", maxWidth: 480 }}>
            <p
              style={{
                margin: "0 0 12px",
                color: "#e7c66f",
                fontWeight: 800,
                letterSpacing: ".08em",
                fontSize: 13,
              }}
            >
              YOUR PERSONAL GROWTH SPACE
            </p>
            <h1
              style={{
                margin: "0 0 14px",
                fontSize: "clamp(36px,7vw,58px)",
                lineHeight: 1.03,
                color: "#fff",
              }}
            >
              Welcome to HIISSA+ ✨
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,.82)",
                fontSize: "clamp(16px,2.5vw,19px)",
                lineHeight: 1.6,
              }}
            >
              A richer experience for your personal journey.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(180deg,#fbf2df,#fffaf1)",
            padding: "22px clamp(16px,4vw,28px) 18px",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Link href="/talk?plusTalk=1" style={{ textDecoration: "none" }}>
              <FeatureCard
                title="Talk to HIISSA"
                subtitle="Continue your personal journey."
                dark
              />
            </Link>

            <Link href="/talk?plusExplore=1" style={{ textDecoration: "none" }}>
              <FeatureCard
                title="Explore HIISSA"
                subtitle="Access and explore existing HIISSA experiences."
              />
            </Link>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,220px),1fr))",
                gap: 12,
              }}
            >
              <FeatureCard
                title="My Journey"
                subtitle="A personal home for deeper reflection."
              />
              <FeatureCard
                title="Guided Support"
                subtitle="Supportive experiences with more depth."
              />
              <FeatureCard
                title="Tools & Resources"
                subtitle="Useful tools gathered in one place."
              />
              <FeatureCard
                title="My Analytics"
                subtitle="Private insight into your own journey."
              />
            </div>

            <div
              role="status"
              style={{
                marginTop: 4,
                borderRadius: 18,
                padding: "15px 17px",
                background: "linear-gradient(110deg,#8a6a25,#b8913d)",
                color: "#fff",
                textAlign: "center",
                fontWeight: 750,
              }}
            >
              You’re on HIISSA+ — thank you for being part of the journey.
            </div>
          </div>

          <nav
            aria-label="HIISSA+ navigation"
            style={{
              marginTop: 18,
              paddingTop: 15,
              borderTop: "1px solid rgba(120,100,50,.18)",
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 6,
              textAlign: "center",
              fontSize: 12,
            }}
          >
            <Link href="/" style={{ color: deep, textDecoration: "none" }}>
              <span aria-hidden="true">⌂</span>
              <br />
              Home
            </Link>
            <Link
              href="/talk?plusTalk=1"
              style={{ color: deep, textDecoration: "none" }}
            >
              <span aria-hidden="true">♡</span>
              <br />
              Talk
            </Link>
            <Link
              href="/talk?plusExplore=1"
              style={{ color: deep, textDecoration: "none" }}
            >
              <span aria-hidden="true">◇</span>
              <br />
              Explore
            </Link>
            <span style={{ color: "#66756b" }}>
              <span aria-hidden="true">▣</span>
              <br />
              Resources
            </span>
            <span style={{ color: "#66756b" }}>
              <span aria-hidden="true">◯</span>
              <br />
              Profile
            </span>
          </nav>
        </div>
      </section>
    </main>
  );
}
