import Link from "next/link";

export const metadata = {
  title: "HIISSA FREE Access",
  description: "Explore HIISSA with no account needed.",
};

const green = "#1f5a46";
const soft = "#f7f7ef";

function Card({ href, title, text, icon, strong = false }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 18px",
        borderRadius: 22,
        textDecoration: "none",
        border: strong ? "1px solid #4e8b70" : "1px solid #d7c9a6",
        background: strong
          ? "linear-gradient(125deg,#174d3d,#2f7358)"
          : "rgba(255,254,248,.96)",
        color: strong ? "#fff" : green,
        boxShadow: "0 9px 24px rgba(33,77,56,.09)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 58,
          height: 58,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: strong ? "#f6f2df" : "#e8efe6",
          color: green,
          fontSize: 28,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>
        <strong style={{ display: "block", fontSize: 21, marginBottom: 5 }}>
          {title}
        </strong>
        <span style={{ display: "block", fontSize: 16, lineHeight: 1.45 }}>
          {text}
        </span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 30 }}>→</span>
    </Link>
  );
}

export default function FreeAccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(14px,3vw,30px)",
        background:
          "radial-gradient(circle at 10% 7%,rgba(210,229,211,.78),transparent 28%),radial-gradient(circle at 91% 12%,rgba(241,219,151,.26),transparent 30%),linear-gradient(140deg,#eef4ed,#fffaf0 56%,#edf3ea)",
        color: green,
        fontFamily: "Arial,Helvetica,sans-serif",
      }}
    >
      <section style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 42,
              padding: "10px 14px",
              borderRadius: 14,
              background: "#fffefa",
              border: "1px solid #c8d8cc",
              color: green,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Back to HIISSA
          </Link>
          <span
            style={{
              padding: "10px 17px",
              borderRadius: 999,
              border: "1px solid #c6d7c9",
              background: "#fffefa",
              fontWeight: 900,
            }}
          >
            FREE
          </span>
        </div>

        <section
          style={{
            overflow: "hidden",
            borderRadius: 29,
            border: "1px solid #d5dfd4",
            background:
              "linear-gradient(145deg,rgba(255,254,247,.98),rgba(247,249,239,.96))",
            boxShadow: "0 18px 50px rgba(34,77,57,.12)",
          }}
        >
          <header
            style={{
              padding: "clamp(28px,6vw,52px) clamp(20px,5vw,42px) 28px",
              background:
                "radial-gradient(circle at 90% 10%,rgba(241,217,145,.35),transparent 32%),radial-gradient(circle at 5% 75%,rgba(151,194,159,.22),transparent 40%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: green,
                  color: "#fff",
                  fontSize: 31,
                  fontWeight: 900,
                }}
              >
                H
              </span>
              <strong style={{ fontSize: 21 }}>HIISSA</strong>
            </div>

            <p
              style={{
                margin: "0 0 11px",
                fontWeight: 900,
                letterSpacing: ".055em",
                color: "#a08349",
              }}
            >
              FREE ACCESS
            </p>
            <h1
              style={{
                margin: "0 0 15px",
                fontSize: "clamp(34px,7vw,52px)",
                lineHeight: 1.07,
              }}
            >
              Welcome to HIISSA FREE
            </h1>
            <p style={{ margin: "0 0 8px", fontSize: 19, lineHeight: 1.5, fontWeight: 700 }}>
              A taste of HIISSA. No account needed.
            </p>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#5d7067" }}>
              Explore, get support and see what feels useful. Some experiences have limited access while you are using HIISSA FREE.
            </p>
          </header>

          <div style={{ padding: "clamp(18px,4vw,34px)", display: "grid", gap: 15 }}>
            <Card
              href="/talk?freeAccessTalk=1"
              title="Talk to HIISSA"
              text="Start a conversation."
              icon="♡"
              strong
            />
            <Card
              href="/talk?freeAccessExplore=1"
              title="Explore HIISSA"
              text="Discover tools, insights and guidance."
              icon="✧"
            />
            <a
              href="#learn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 18px",
                borderRadius: 22,
                textDecoration: "none",
                border: "1px solid #d7c9a6",
                background: "rgba(255,254,248,.96)",
                color: green,
                boxShadow: "0 9px 24px rgba(33,77,56,.09)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 58,
                  height: 58,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "#f2ead3",
                  color: green,
                  fontSize: 27,
                }}
              >
                💡
              </span>
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: 21, marginBottom: 5 }}>
                  Learn about HIISSA
                </strong>
                <span style={{ display: "block", fontSize: 16, lineHeight: 1.45 }}>
                  See how the wider HIISSA experience is organised.
                </span>
              </span>
              <span aria-hidden="true" style={{ fontSize: 30 }}>↓</span>
            </a>

            <Card
              href="/access"
              title="More when you’re ready"
              text="Explore all HIISSA access options and choose what fits you."
              icon="★"
            />
          </div>

          <section
            id="learn"
            style={{
              margin: "0 clamp(18px,4vw,34px) clamp(22px,5vw,38px)",
              padding: "22px",
              borderRadius: 22,
              background: soft,
              border: "1px solid #dde5da",
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: 24 }}>A taste of the HIISSA universe</h2>
            <p style={{ margin: "0 0 15px", color: "#5d7067", lineHeight: 1.6 }}>
              HIISSA is more than Talk. FREE Access is designed to let you discover the wider experience before deciding whether you want more depth.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {["Talk", "Listen", "Read", "Reflect", "Reset", "Grow", "Discover"].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 999,
                    background: "#fffefa",
                    border: "1px solid #d4dfd3",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.5, color: "#66786f" }}>
              Exact FREE limits will be set feature by feature. Core safety, privacy and responsible guidance are not reduced to force an upgrade.
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}
