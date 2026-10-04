import Link from "next/link";

export const metadata = {
  title: "Go further with HIISSA",
  description: "Explore HIISSA access options and choose what fits you.",
};

const green = "#174d3d";
const deep = "#103e30";
const cream = "#fffaf0";
const gold = "#b98d3b";

function AccessCard({ badge, title, heading, body, href, cta, tone="guest", icon }) {
  const tones = {
    guest: {
      bg: "linear-gradient(135deg,#f5f7ed,#fffdf7)",
      border: "#c9d8ca",
      badgeBg: "#1f6a4d",
      badgeColor: "#fff",
      ctaBg: "linear-gradient(110deg,#15523e,#2b7455)",
      titleColor: green,
    },
    plus: {
      bg: "linear-gradient(135deg,#fff4f7,#fff7ea)",
      border: "#e9c9d1",
      badgeBg: "#c23876",
      badgeColor: "#fff",
      ctaBg: "linear-gradient(110deg,#b52d6b,#cf4d87)",
      titleColor: "#4c2340",
    },
    together: {
      bg: "linear-gradient(135deg,#fff6e9,#fff2df)",
      border: "#e5c49a",
      badgeBg: "#a66a31",
      badgeColor: "#fff",
      ctaBg: "linear-gradient(110deg,#98602f,#b8783a)",
      titleColor: "#4e3522",
    },
  };
  const t=tones[tone];
  return (
    <section style={{
      border:`1px solid ${t.border}`,
      borderRadius:22,
      padding:"18px",
      background:t.bg,
      boxShadow:"0 10px 28px rgba(35,74,56,.08)",
    }}>
      <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
        <div aria-hidden="true" style={{
          width:54,height:54,borderRadius:"50%",display:"grid",placeItems:"center",
          background:"rgba(255,255,255,.88)",fontSize:27,flexShrink:0,
          border:"1px solid rgba(33,77,56,.10)"
        }}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <strong style={{fontSize:20,color:t.titleColor}}>{title}</strong>
            <span style={{
              padding:"5px 10px",borderRadius:999,background:t.badgeBg,color:t.badgeColor,
              fontSize:12,fontWeight:900,letterSpacing:".03em"
            }}>{badge}</span>
          </div>
          <h2 style={{margin:"8px 0 7px",fontSize:22,lineHeight:1.15,color:t.titleColor}}>{heading}</h2>
          <p style={{margin:"0 0 15px",fontSize:16,lineHeight:1.55,color:"#5d6e65"}}>{body}</p>
          <Link href={href} style={{
            display:"block",textAlign:"center",padding:"12px 14px",borderRadius:15,
            background:t.ctaBg,color:"#fff",textDecoration:"none",fontWeight:900
          }}>{cta} →</Link>
        </div>
      </div>
    </section>
  );
}

export default function AccessDiscoveryPage() {
  return (
    <main style={{
      minHeight:"100vh",
      padding:"clamp(14px,3vw,30px)",
      fontFamily:"Arial,Helvetica,sans-serif",
      color:green,
      background:
        "radial-gradient(circle at 10% 4%,rgba(201,226,205,.72),transparent 27%),radial-gradient(circle at 92% 8%,rgba(241,214,143,.25),transparent 31%),linear-gradient(140deg,#edf4ed,#fffaf0 57%,#edf2ea)",
    }}>
      <section style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{marginBottom:14}}>
          <Link href="/free-access" style={{
            display:"inline-flex",alignItems:"center",minHeight:42,padding:"10px 14px",
            borderRadius:14,background:"#fffefa",border:"1px solid #c8d8cc",
            color:green,fontWeight:850,textDecoration:"none"
          }}>← Back to HIISSA FREE</Link>
        </div>

        <section style={{
          border:"1px solid #d5dfd4",borderRadius:28,overflow:"hidden",
          background:"rgba(255,254,248,.97)",boxShadow:"0 18px 50px rgba(34,77,57,.12)"
        }}>
          <header style={{
            padding:"clamp(28px,6vw,48px) clamp(20px,5vw,38px) 28px",
            background:
              "radial-gradient(circle at 88% 18%,rgba(243,213,123,.32),transparent 30%),radial-gradient(circle at 5% 78%,rgba(151,194,159,.20),transparent 40%)"
          }}>
            <p style={{margin:"0 0 8px",fontSize:14,fontWeight:900,letterSpacing:".08em",color:gold}}>
              YOUR NEXT HIISSA SPACE
            </p>
            <h1 style={{margin:"0 0 12px",fontSize:"clamp(34px,7vw,50px)",lineHeight:1.04}}>
              Go further with HIISSA, in the way that fits you. ✨
            </h1>
            <p style={{margin:0,fontSize:18,lineHeight:1.55,color:"#5d7067"}}>
              You already belong here. Choose the HIISSA experience that feels right for you — or simply keep exploring FREE.
            </p>
          </header>

          <div style={{padding:"0 clamp(18px,4vw,34px) clamp(28px,5vw,38px)",display:"grid",gap:15}}>
            <section style={{
              marginTop:4,padding:"15px 17px",borderRadius:18,
              background:"linear-gradient(120deg,#fff6d9,#fffaf0)",
              border:"1px solid #ead7a5"
            }}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <span aria-hidden="true" style={{fontSize:27}}>🌿</span>
                <div>
                  <div style={{fontSize:14,color:"#886d32",fontWeight:800}}>You’re currently exploring</div>
                  <strong style={{fontSize:21}}>HIISSA FREE</strong>
                  <div style={{fontSize:14,color:"#68776f",marginTop:2}}>A taste of HIISSA. No account needed.</div>
                </div>
              </div>
            </section>

            <AccessCard
              badge="FREE"
              title="HIISSA Guest"
              heading="Make HIISSA yours."
              body="Create your free account, return to your personal space, and use the account-based HIISSA Guest experience."
              href="/free"
              cta="Create my HIISSA Guest space"
              tone="guest"
              icon="👤"
            />

            <AccessCard
              badge="PREMIUM"
              title="HIISSA+"
              heading="Go deeper into your personal journey."
              body="Discover richer personal reflection, guidance, tools and growth experiences designed for greater depth."
              href="/plus/welcome"
              cta="Discover HIISSA+"
              tone="plus"
              icon="👑"
            />

            <AccessCard
              badge="SHARED"
              title="HIISSA TOGETHER"
              heading="Grow together."
              body="Explore shared conversations, relationship tools, shared experiences, goals and insights designed for two people."
              href="/together/welcome"
              cta="Discover HIISSA TOGETHER"
              tone="together"
              icon="🫶"
            />

            <section id="help-me-choose" style={{
              padding:"19px",borderRadius:21,background:"#f4f7ef",border:"1px solid #dbe5da"
            }}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span aria-hidden="true" style={{fontSize:27}}>💛</span>
                <div style={{flex:1}}>
                  <h2 style={{margin:"0 0 7px",fontSize:22}}>Not sure which one fits you?</h2>
                  <p style={{margin:"0 0 12px",lineHeight:1.55,color:"#617168"}}>
                    HIISSA can help you understand the differences without pressure. The interactive recommendation flow will be added after its questions and safeguards are approved.
                  </p>
                  <a href="#choose-guide" style={{color:green,fontWeight:900,textDecoration:"none"}}>Help me choose ↓</a>
                </div>
              </div>
            </section>

            <section id="choose-guide" style={{
              padding:"19px",borderRadius:21,background:"#fffdf7",border:"1px solid #e4dcc7"
            }}>
              <h2 style={{margin:"0 0 9px",fontSize:21}}>A simple way to think about it</h2>
              <p style={{margin:"0 0 7px",lineHeight:1.55,color:"#627168"}}><strong>HIISSA FREE</strong> — explore without an account.</p>
              <p style={{margin:"0 0 7px",lineHeight:1.55,color:"#627168"}}><strong>HIISSA Guest</strong> — create your free personal HIISSA account space.</p>
              <p style={{margin:"0 0 7px",lineHeight:1.55,color:"#627168"}}><strong>HIISSA+</strong> — go deeper in your individual journey.</p>
              <p style={{margin:0,lineHeight:1.55,color:"#627168"}}><strong>HIISSA TOGETHER</strong> — explore and grow with another person.</p>
            </section>

            <Link href="/free-access" style={{
              display:"block",textAlign:"center",padding:"15px 18px",borderRadius:18,
              border:"1px solid #bfcfc1",background:"#fffefa",color:green,
              textDecoration:"none",fontWeight:900,fontSize:17
            }}>Continue with HIISSA FREE</Link>

            <p style={{margin:"2px 8px 0",textAlign:"center",fontSize:13,lineHeight:1.45,color:"#718078"}}>
              HIISSA should earn your trust through value. You can keep using FREE access without being forced to upgrade.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
