import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword, getApiErrorMessage } from "../../api/auth";
import Login from "./Login";
import { InlineSpinner } from "../../components/common/InlineSpinner";
import backgroundImage from "../../assets/images/dyp.jpeg";
import iqacLogo from "../../assets/images/IQAS.png";
import universityLogo from "../../assets/images/image.png";

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "");
  const [loading, setLoading] = useState(false);

  // If no token is provided in URL query params, show default forgot password view from Login component
  if (!token) {
    return <Login initialMode="forgot" />;
  }

  const handleSubmit = async () => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    const password = newPassword.trim();
    const confirmation = confirmPassword.trim();

    if (!password || !confirmation) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmation) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      navigate("/login", {
        replace: true,
        state: { message: "Password reset successfully. Please login with your new credentials." },
      });
    } catch (resetError) {
      setError(getApiErrorMessage(resetError, "Could not reset password."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', system-ui, sans-serif; }

        .dyp-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid rgba(255,255,255,0.45);
          border-radius: 6px;
          font-size: 14px;
          color: white;
          background: rgba(255,255,255,0.09);
          margin-bottom: 14px;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .dyp-input::placeholder { color: rgba(255,255,255,0.55); }
        .dyp-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.25);
        }
        .dyp-btn {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
          margin-bottom: 12px;
          letter-spacing: 0.2px;
        }
        .dyp-btn:hover:not(:disabled) { background: #1d4ed8; }
        .dyp-btn:disabled { opacity: 0.72; cursor: not-allowed; }
        .dyp-link {
          background: none;
          border: none;
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          text-align: center;
          width: 100%;
          transition: color 0.2s;
        }
        .dyp-link:hover { color: white; text-decoration: underline; }

        @media (max-width: 900px) {
          .school-reset-card {
            width: min(100%, 520px) !important;
            flex-direction: column;
          }
          .school-reset-left {
            padding: 110px 24px 24px !important;
          }
          .school-reset-right {
            width: 100% !important;
            border-left: 0 !important;
            border-top: 1px solid rgba(255,255,255,0.15);
          }
          .school-reset-logo {
            height: 64px !important;
          }
        }
      `}</style>

      <div style={s.wrap}>
        <img className="school-reset-logo" src={universityLogo} alt="University Logo" style={s.topLeftLogo} />
        <img className="school-reset-logo" src={iqacLogo} alt="IQAC Logo" style={s.topRightLogo} />
        <div style={s.overlay} />

        <div className="school-reset-card" style={s.card}>
          <div className="school-reset-left" style={s.left}>
            <h1 style={s.uniName}>Reset Password</h1>
            <h2 style={s.subUniName}>D. Y. Patil International University, Akurdi, Pune, Maharashtra</h2>
            <p style={s.desc}>
              Create a new secure password for your NBA Attainment & Academic Portal account.
            </p>
          </div>

          <div className="school-reset-right" style={s.right}>
            <h2 style={s.panelTitle}>Create your new password</h2>

            {error && <div style={s.error}>{error}</div>}

            <input
              className="dyp-input"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
              disabled={!token || loading}
            />

            <input
              className="dyp-input"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
              disabled={!token || loading}
            />

            <button className="dyp-btn" type="button" onClick={handleSubmit} disabled={!token || loading} aria-busy={loading}>
              {loading && <InlineSpinner label="Resetting password" />}
              {loading ? "Resetting password..." : "Reset Password"}
            </button>

            <button className="dyp-link" type="button" onClick={() => navigate("/login", { replace: true })}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  topLeftLogo: {
    position: "absolute",
    top: 20,
    left: 24,
    height: 90,
    maxWidth: 220,
    objectFit: "contain",
    zIndex: 2,
    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
  },
  topRightLogo: {
    position: "absolute",
    top: 20,
    right: 24,
    height: 90,
    maxWidth: 220,
    objectFit: "contain",
    zIndex: 2,
    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
  },
  wrap: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.45) 0%, rgba(8, 16, 38, 0.75) 100%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "72%",
    maxWidth: 1180,
    display: "flex",
    alignItems: "stretch",
    borderRadius: 12,
    background: "rgba(15, 23, 42, 0.82)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.65)",
    overflow: "hidden",
    minHeight: 380,
  },
  left: {
    flex: 1,
    color: "white",
    padding: "36px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    justifyContent: "center",
  },
  uniName: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.25,
    color: "white",
  },
  subUniName: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.4,
    color: "rgba(255,255,255,0.9)",
  },
  desc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 500,
  },
  right: {
    width: 360,
    flexShrink: 0,
    background: "rgba(8, 14, 28, 0.55)",
    borderLeft: "1px solid rgba(255,255,255,0.15)",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "white",
    marginBottom: 20,
    marginTop: 0,
    lineHeight: 1.4,
  },
  error: {
    background: "rgba(220, 38, 38, 0.25)",
    border: "1px solid rgba(248, 113, 113, 0.5)",
    color: "#fca5a5",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 12.5,
    marginBottom: 16,
    lineHeight: 1.5,
  },
};
