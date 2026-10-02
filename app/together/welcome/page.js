import Link from "next/link";

const burgundy = "#6f2943";
const rose = "#a14a68";
const deepRose = "#7d314e";
const cream = "#fff8f5";
const muted = "#765d67";

const cardBase = {
  borderRadius: 18,
  padding: "18px",
  border: "1px solid rgba(126,49,78,.20)",
  boxShadow: "0 9px 24px rgba(98,40,61,.10)",
};

function FeatureCard({ title, subtitle, strong = false }) {
  return (
    <div
      aria-disabled="true"
      style={{
        ...cardBase,
        background: strong
          ? "linear-gradient(120deg,#78314d,#a24b68)"
          : "rgba(255,250,248,.94)",
        color: strong ? "#fff" : burgundy,
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
          color: strong ? "rgba(255,255,255,.85)" : muted,
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

export default function TogetherWelcome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(14px,4vw,36px)",
        background:
          "linear-gradient(145deg,#f3dfe5 0%,#f8ece8 48%,#ead3dc 100%)",
        fontFamily: "inherit",
      }}
    >
      <section
        aria-label="HIISSA TOGETHER welcome"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: 28,
          border: "1px solid rgba(126,49,78,.22)",
          background:
            "radial-gradient(circle at 84% 10%,rgba(255,226,214,.72),transparent 26%),radial-gradient(circle at 12% 28%,rgba(255,246,241,.54),transparent 30%),linear-gradient(160deg,#a85b74 0%,#8f405d 36%,#733149 60%,#f4dfdc 60.2%,#fff9f5 100%)",
          boxShadow: "0 24px 70px rgba(98,40,61,.22)",
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
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/hiissa-together-approved.jpg"
                alt="HIISSA TOGETHER approved logo"
                style={{
                  width: 52,
                  height: 52,
                  objectFit: "contain",
                  borderRadius: 14,
                  background: "rgba(255,250,246,.95)",
                  padding: 4,
                  boxShadow: "0 4px 14px rgba(80,30,50,.18)",
                }}
              />
              <strong style={{ letterSpacing: ".03em" }}>HIISSA TOGETHER</strong>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "9px 14px",
                background: "rgba(87,31,53,.82)",
                border: "1px solid rgba(255,224,215,.55)",
                color: "#ffe9e0",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              💞 TOGETHER
            </span>
          </header>

          <div style={{ marginTop: "clamp(54px,10vw,90px)", maxWidth: 520 }}>
            <p
              style={{
                margin: "0 0 12px",
                color: "#ffd8cc",
                fontWeight: 800,
                letterSpacing: ".08em",
                fontSize: 13,
              }}
            >
              FOR THE RELATIONSHIPS THAT MATTER
            </p>
            <h1
              style={{
                margin: "0 0 14px",
                fontSize: "clamp(34px,7vw,56px)",
                lineHeight: 1.04,
                color: "#fff",
              }}
            >
              Welcome to HIISSA TOGETHER 💕
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,.86)",
                fontSize: "clamp(16px,2.5vw,19px)",
                lineHeight: 1.6,
              }}
            >
              A shared space for connection, understanding and growing together.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(180deg,#f8e7e3,#fff9f5)",
            padding: "22px clamp(16px,4vw,28px) 18px",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <FeatureCard
              title="Start a shared conversation"
              subtitle="A shared conversation space will open here once member linking, permissions and consent are ready."
              strong
            />

            <FeatureCard
              title="Explore TOGETHER"
              subtitle="Shared experiences will be connected here through the HIISSA Registry after consent-safe mapping."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,220px),1fr))",
                gap: 12,
              }}
            >
              <FeatureCard
                title="Our Space"
                subtitle="A future home for material intentionally shared into this relationship space."
              />
              <FeatureCard
                title="Relationship Tools"
                subtitle="Connection and repair tools will be mapped here without duplicating canonical HIISSA experiences."
              />
              <FeatureCard
                title="Challenges & Goals"
                subtitle="Future shared growth, play and goals will stay voluntary and consent-aware."
              />
              <FeatureCard
                title="Insights"
                subtitle="Future shared reflection will use only authorised shared material, without scores or diagnosis."
              />
            </div>

            <div
              role="status"
              style={{
                marginTop: 4,
                borderRadius: 18,
                padding: "15px 17px",
                background: "linear-gradient(110deg,#8a3856,#b85d78)",
                color: "#fff",
                textAlign: "center",
                fontWeight: 750,
              }}
            >
              TOGETHER is being prepared carefully. Shared features remain protected until consent and access rules are ready.
            </div>
          </div>

          <nav
            aria-label="HIISSA TOGETHER navigation"
            style={{
              marginTop: 18,
              paddingTop: 15,
              borderTop: "1px solid rgba(126,49,78,.15)",
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 6,
              textAlign: "center",
              fontSize: 12,
            }}
          >
            <Link href="/" style={{ color: burgundy, textDecoration: "none" }}>
              <span aria-hidden="true">⌂</span>
              <br />
              Home
            </Link>
            <span style={{ color: muted }}>
              <span aria-hidden="true">♡</span>
              <br />
              Talk
            </span>
            <span style={{ color: muted }}>
              <span aria-hidden="true">◇</span>
              <br />
              Explore
            </span>
            <span style={{ color: muted }}>
              <span aria-hidden="true">◫</span>
              <br />
              Our Space
            </span>
            <span style={{ color: muted }}>
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
