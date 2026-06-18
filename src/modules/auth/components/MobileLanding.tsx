import { Link } from "react-router-dom";
import { useAuthLandingCtaPath } from "../hooks/useAuthLandingCtaPath";

export default function MobileLanding() {
  const ctaPath = useAuthLandingCtaPath("/signin");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        background:
          "linear-gradient(160deg, #0E0E12 0%, #15151A 40%, #1A1A20 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Large lime glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-25%",
            width: "80%",
            height: "60%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(171,255,99,0.06) 0%, transparent 70%)",
          }}
        />
        {/* Secondary glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "35%",
            left: "-10%",
            width: "50%",
            height: "35%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(171,255,99,0.04) 0%, transparent 70%)",
          }}
        />
        {/* Accent glow center-right */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-5%",
            width: "35%",
            height: "40%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(205,167,252,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Logo ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "2rem",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "2.5rem 3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`}
            alt="Limes"
            style={{ height: "2rem", width: "auto", opacity: 0.9 }}
          />
          <div
            style={{
              width: "2.5rem",
              height: "1.5px",
              background: "rgba(171,255,99,0.4)",
              borderRadius: 1,
            }}
          />
          <p
            style={{
              fontFamily:
                "'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Prepaid · Subscription · eSIM
          </p>
        </div>
      </div>

      {/* ── CTA Card ── */}
      <div
        style={{
          width: "100%",
          position: "relative",
          zIndex: 1,
          padding: "0 1.25rem 1.25rem",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
        }}
      >
        <div
          style={{
            background: "#141419",
            borderRadius: "1.75rem",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "1.75rem 1.5rem",
          }}
        >
          <h1
            style={{
              fontFamily:
                "'Darker Grotesque', ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              margin: "0 0 0.5rem",
            }}
          >
            The smarter network{"\n"}that gives you more.
          </h1>
          <p
            style={{
              fontFamily:
                "'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.5,
              margin: "0 0 1.5rem",
            }}
          >
            Build your own plan. Keep your number. Only pay for what you use.
          </p>

          <Link
            to={ctaPath}
            style={{ display: "block", marginBottom: "0.875rem" }}
          >
            <button
              style={{
                width: "100%",
                height: "3.25rem",
                borderRadius: "1rem",
                border: "2px solid rgba(0,0,0,0.6)",
                background: "#ABFF63",
                color: "#0E0E12",
                fontFamily:
                  "'Darker Grotesque', ui-sans-serif, system-ui, -apple-system, sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "-0.01em",
                boxShadow: "4px 4px 0 0 rgba(0,0,0,0.6)",
              }}
            >
              Welcome to Limes
            </button>
          </Link>

          <Link to="/signin">
            <p
              style={{
                textAlign: "center",
                fontFamily:
                  "'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif",
                fontSize: "0.8125rem",
                color: "rgba(255,255,255,0.25)",
                margin: 0,
              }}
            >
              I already have an account
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
