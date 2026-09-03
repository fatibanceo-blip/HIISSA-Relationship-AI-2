export const metadata = {
  title: "Privacy | HIISSA Relationship AI",
  description: "Privacy information for HIISSA Relationship AI.",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 48px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "22px",
            color: "#55786d",
            fontSize: "14px",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          ← Back to HIISSA
        </a>

        <section
          style={{
            background: "rgba(255, 253, 248, 0.92)",
            border: "1px solid rgba(80, 102, 93, 0.14)",
            borderRadius: "26px",
            padding: "clamp(24px, 5vw, 42px)",
            boxShadow: "0 24px 70px rgba(64, 86, 76, 0.14)",
          }}
        >
          <div
            style={{
              color: "#607d73",
              fontSize: "11px",
              letterSpacing: "0.17em",
              fontWeight: "850",
              marginBottom: "8px",
            }}
          >
            HIISSA • RELATIONSHIP AI
          </div>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(32px, 7vw, 46px)",
              lineHeight: "1.05",
              letterSpacing: "-0.035em",
              color: "#29332f",
            }}
          >
            Privacy
          </h1>

          <p style={introStyle}>
            Your privacy matters when using HIISSA Relationship AI. Please read
            this information before sharing personal experiences, questions, or
            feedback.
          </p>

          <PrivacySection title="What you should avoid sharing">
            Please do not share identifying or highly sensitive personal
            information such as your full name, home address, phone number,
            passwords, financial details, private account information, or other
            information that could unnecessarily identify you or another
            person.
          </PrivacySection>

          <PrivacySection title="How your messages are used">
            When you send a message, it is processed so HIISSA Relationship AI
            can generate a response to your question or situation.
            <br />
            <br />
            Because HIISSA uses third-party technology to provide AI responses,
            information you submit may be processed by service providers
            involved in operating the service.
          </PrivacySection>

          <PrivacySection title="Feedback">
            HIISSA may invite you to provide optional feedback about your
            experience. You do not need to provide feedback to continue using
            HIISSA.
            <br />
            <br />
            Feedback may include your rating, whether you found HIISSA helpful,
            any optional written feedback you choose to provide, the date and
            time of the submission, and an internal database identifier.
            Feedback is stored and processed using Supabase, a service provider
            used to operate the feedback system.
            <br />
            <br />
            Please do not include names, contact details, or other identifying
            or highly sensitive personal information in written feedback.
            Your conversation is not automatically copied into your feedback
            submission.
          </PrivacySection>

          <PrivacySection title="Public reviews and permission">
            Feedback submitted through HIISSA is not automatically displayed
            publicly. If HIISSA offers you a separate option to allow a review
            to be shared publicly, you will be asked for explicit permission
            before that review is used publicly.
            <br />
            <br />
            When feedback is submitted, HIISSA may create a random technical
            permission token and store that token in your browser. A hashed
            version of the token may be stored with the feedback in Supabase.
            This helps HIISSA recognise the same browser later if it offers you
            a separate choice about public sharing.
            <br />
            <br />
            The permission token does not contain your name, contact details,
            conversation, or the text of your feedback. Only the review text
            you separately approve for public sharing may be used publicly.
          </PrivacySection>

          <PrivacySection title="Share only what is necessary">
            You can usually describe a relationship, emotional concern, grief,
            or life situation without providing names or other identifying
            details. Share only the information needed to explain what you
            would like help thinking through.
          </PrivacySection>

          <PrivacySection title="Important">
            HIISSA Relationship AI provides reflective AI guidance. It is not
            an emergency service and does not replace medical, legal,
            mental-health, safeguarding, or other qualified professional
            support.
            <br />
            <br />
            If you or someone else is in immediate danger, contact the
            appropriate emergency service or trusted real-world support in your
            location.
          </PrivacySection>

          <div
            style={{
              marginTop: "34px",
              paddingTop: "22px",
              borderTop: "1px solid rgba(80, 102, 93, 0.14)",
              color: "#747d78",
              fontSize: "13px",
              lineHeight: "1.7",
            }}
          >
            <strong
              style={{
                color: "#55786d",
                letterSpacing: "0.08em",
              }}
            >
              HIISSA RELATIONSHIP AI
            </strong>
            <br />
            Healing is transformation, not erasure.
          </div>
        </section>
      </div>
    </main>
  );
}

const introStyle = {
  margin: "0 0 30px",
  color: "#66706b",
  fontSize: "16px",
  lineHeight: "1.75",
};

function PrivacySection({ title, children }) {
  return (
    <section style={{ marginTop: "28px" }}>
      <h2
        style={{
          margin: "0 0 9px",
          color: "#466f67",
          fontSize: "clamp(19px, 4.5vw, 24px)",
          lineHeight: "1.25",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#5f6964",
          fontSize: "15px",
          lineHeight: "1.75",
        }}
      >
        {children}
      </p>
    </section>
  );
}
