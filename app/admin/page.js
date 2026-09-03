"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [writtenFeedback, setWrittenFeedback] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const [statsError, setStatsError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [publicReviewsError, setPublicReviewsError] = useState("");

  useEffect(() => {
    async function loadAdminDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_hiissa_admin"
      );

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        window.location.replace("/admin/login");
        return;
      }

      setSignedIn(true);

      const { data: statsData, error: statsLoadError } = await supabase.rpc(
        "get_hiissa_feedback_stats"
      );

      if (statsLoadError) {
        setStatsError(
          "Your secure admin access is working, but the feedback statistics could not be loaded."
        );
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      const {
        data: distributionData,
        error: distributionError,
      } = await supabase.rpc("get_hiissa_rating_distribution");

      if (distributionError) {
        setStatsError(
          "Your main feedback statistics loaded, but the rating breakdown could not be loaded."
        );
      } else {
        setDistribution(distributionData || []);
      }

      const {
        data: writtenFeedbackData,
        error: writtenFeedbackError,
      } = await supabase.rpc("get_hiissa_written_feedback");

      if (writtenFeedbackError) {
        setFeedbackError(
          "Your written feedback could not be loaded."
        );
      } else {
        setWrittenFeedback(writtenFeedbackData || []);
      }

      const {
        data: publicReviewsData,
        error: publicReviewsLoadError,
      } = await supabase.rpc("get_hiissa_admin_public_reviews");

      if (publicReviewsLoadError) {
        setPublicReviewsError(
          "Your authorised public reviews could not be loaded."
        );
      } else {
        setPublicReviews(publicReviewsData || []);
      }

      setChecking(false);
    }

    loadAdminDashboard();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  if (checking) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#66706b" }}>Checking secure access…</p>
      </main>
    );
  }

  if (!signedIn) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={eyebrowStyle}>HIISSA • PRIVATE ADMIN</div>

        <h1 style={headingStyle}>Admin dashboard</h1>

        <p style={introStyle}>
          Private feedback insights for HIISSA RELATIONSHIP AI.
        </p>

        <div style={secureNoticeStyle}>
          <strong style={{ color: "#466f67" }}>
            Secure owner access confirmed ✓
          </strong>

          <p style={noticeTextStyle}>
            These figures are calculated from feedback currently stored in
            HIISSA&apos;s private feedback system.
          </p>
        </div>

        {statsError ? <p style={errorStyle}>{statsError}</p> : null}

        {stats ? (
          <div style={statsGridStyle}>
            <StatCard
              label="Total feedback"
              value={stats.total_feedback ?? 0}
            />

            <StatCard
              label="Average rating"
              value={
                stats.average_rating == null
                  ? "—"
                  : `${Number(stats.average_rating).toFixed(2)} / 5`
              }
            />

            <StatCard
              label="Helpful"
              value={
                stats.helpful_percentage == null
                  ? "—"
                  : `${Number(stats.helpful_percentage).toFixed(1)}%`
              }
            />
          </div>
        ) : null}

        {distribution.length > 0 ? (
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Rating breakdown</h2>

            <p style={sectionIntroStyle}>
              See how your genuine HIISSA feedback is distributed across each
              star rating.
            </p>

            <div style={ratingListStyle}>
              {distribution.map((item) => (
                <div key={item.rating} style={ratingRowStyle}>
                  <div style={starsStyle}>
                    {renderStars(Number(item.rating))}
                  </div>

                  <div style={ratingCountStyle}>
                    {Number(item.rating_count)}{" "}
                    {Number(item.rating_count) === 1
                      ? "response"
                      : "responses"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Written feedback</h2>

          <p style={sectionIntroStyle}>
            Private comments voluntarily submitted through HIISSA.
          </p>

          {feedbackError ? (
            <p style={errorStyle}>{feedbackError}</p>
          ) : writtenFeedback.length === 0 ? (
            <div style={emptyFeedbackStyle}>
              No written feedback has been submitted yet.
            </div>
          ) : (
            <div style={feedbackListStyle}>
              {writtenFeedback.map((item) => (
                <div key={item.id} style={feedbackCardStyle}>
                  <div style={feedbackTopStyle}>
                    <div style={starsStyle}>
                      {renderStars(Number(item.rating))}
                    </div>

                    <span style={helpfulBadgeStyle}>
                      {item.helpful ? "Helpful ✓" : "Not helpful"}
                    </span>
                  </div>

                  <div style={dateStyle}>
                    {formatFeedbackDate(item.created_at)}
                  </div>

                  {item.feedback_text ? (
                    <div style={feedbackTextStyle}>
                      {item.feedback_text}
                    </div>
                  ) : null}

                  {item.suggestion_text ? (
                    <div style={suggestionStyle}>
                      <strong>Suggestion:</strong>{" "}
                      {item.suggestion_text}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Public reviews</h2>

          <p style={sectionIntroStyle}>
            Reviews that have received separate permission for public sharing.
            Only the approved public wording is shown here.
          </p>

          {publicReviewsError ? (
            <p style={errorStyle}>{publicReviewsError}</p>
          ) : publicReviews.length === 0 ? (
            <div style={emptyFeedbackStyle}>
              No reviews currently have permission for public display.
            </div>
          ) : (
            <div style={feedbackListStyle}>
              {publicReviews.map((item) => (
                <div key={item.id} style={feedbackCardStyle}>
                  <div style={feedbackTopStyle}>
                    <div style={starsStyle}>
                      {renderStars(Number(item.rating))}
                    </div>

                    <span style={publicBadgeStyle}>
                      Public permission ✓
                    </span>
                  </div>

                  <div style={dateStyle}>
                    Permission given:{" "}
                    {formatFeedbackDate(item.permission_date)}
                  </div>

                  <div style={feedbackTextStyle}>
                    “{item.public_display_text}”
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            marginTop: "26px",
            border: 0,
            borderRadius: "14px",
            padding: "12px 18px",
            background: "#55786d",
            color: "#fffdf8",
            fontSize: "14px",
            fontWeight: "800",
            cursor: signingOut ? "default" : "pointer",
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>

        <div style={footerStyle}>
          HIISSA RELATIONSHIP AI
          <br />
          Healing is transformation, not erasure.
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, index) =>
    index < rating ? "★" : "☆"
  ).join(" ");
}

function formatFeedbackDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 16px 48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle = {
  width: "100%",
  maxWidth: "720px",
  background: "rgba(255, 253, 248, 0.94)",
  border: "1px solid rgba(80, 102, 93, 0.14)",
  borderRadius: "26px",
  padding: "clamp(24px, 5vw, 42px)",
  boxShadow: "0 24px 70px rgba(64, 86, 76, 0.14)",
};

const eyebrowStyle = {
  color: "#607d73",
  fontSize: "11px",
  letterSpacing: "0.17em",
  fontWeight: "850",
  marginBottom: "8px",
};

const headingStyle = {
  margin: "0 0 12px",
  color: "#29332f",
  fontSize: "clamp(30px, 7vw, 42px)",
  lineHeight: "1.08",
};

const introStyle = {
  margin: "0 0 26px",
  color: "#66706b",
  fontSize: "15px",
  lineHeight: "1.7",
};

const secureNoticeStyle = {
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(85, 120, 109, 0.08)",
  border: "1px solid rgba(85, 120, 109, 0.14)",
};

const noticeTextStyle = {
  margin: "8px 0 0",
  color: "#66706b",
  fontSize: "14px",
  lineHeight: "1.6",
};

const errorStyle = {
  margin: "18px 0 0",
  color: "#7a5d55",
  fontSize: "14px",
  lineHeight: "1.6",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: "14px",
  marginTop: "22px",
};

const statCardStyle = {
  padding: "18px",
  borderRadius: "16px",
  background: "#fffdf8",
  border: "1px solid rgba(80, 102, 93, 0.16)",
};

const statLabelStyle = {
  color: "#747d78",
  fontSize: "12px",
  fontWeight: "700",
  marginBottom: "7px",
};

const statValueStyle = {
  color: "#466f67",
  fontSize: "24px",
  fontWeight: "850",
  lineHeight: "1.2",
};

const sectionStyle = {
  marginTop: "28px",
  paddingTop: "26px",
  borderTop: "1px solid rgba(80, 102, 93, 0.14)",
};

const sectionHeadingStyle = {
  margin: "0 0 8px",
  color: "#29332f",
  fontSize: "21px",
};

const sectionIntroStyle = {
  margin: "0 0 18px",
  color: "#66706b",
  fontSize: "14px",
  lineHeight: "1.6",
};

const ratingListStyle = {
  display: "grid",
  gap: "10px",
};

const ratingRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  padding: "13px 15px",
  borderRadius: "14px",
  background: "rgba(85, 120, 109, 0.055)",
  border: "1px solid rgba(85, 120, 109, 0.11)",
};

const starsStyle = {
  color: "#8a7446",
  fontSize: "18px",
  letterSpacing: "2px",
  whiteSpace: "nowrap",
};

const ratingCountStyle = {
  color: "#66706b",
  fontSize: "13px",
  fontWeight: "700",
  textAlign: "right",
};

const emptyFeedbackStyle = {
  padding: "16px",
  borderRadius: "14px",
  background: "rgba(85, 120, 109, 0.055)",
  border: "1px solid rgba(85, 120, 109, 0.11)",
  color: "#66706b",
  fontSize: "14px",
};

const feedbackListStyle = {
  display: "grid",
  gap: "14px",
};

const feedbackCardStyle = {
  padding: "17px",
  borderRadius: "16px",
  background: "#fffdf8",
  border: "1px solid rgba(80, 102, 93, 0.16)",
};

const feedbackTopStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const helpfulBadgeStyle = {
  color: "#466f67",
  fontSize: "12px",
  fontWeight: "800",
  padding: "6px 9px",
  borderRadius: "999px",
  background: "rgba(85, 120, 109, 0.09)",
};

const publicBadgeStyle = {
  color: "#466f67",
  fontSize: "12px",
  fontWeight: "800",
  padding: "6px 9px",
  borderRadius: "999px",
  background: "rgba(85, 120, 109, 0.09)",
};

const dateStyle = {
  marginTop: "9px",
  color: "#8a918d",
  fontSize: "11px",
};

const feedbackTextStyle = {
  marginTop: "14px",
  color: "#414b47",
  fontSize: "14px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};

const suggestionStyle = {
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid rgba(80, 102, 93, 0.1)",
  color: "#66706b",
  fontSize: "13px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};

const footerStyle = {
  marginTop: "30px",
  paddingTop: "20px",
  borderTop: "1px solid rgba(80, 102, 93, 0.14)",
  color: "#747d78",
  fontSize: "12px",
  lineHeight: "1.7",
};
