"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [authMode, setAuthMode] = useState("password"); // "password" or "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Handle OTP flow
    if (authMode === "otp" && !otpSent) {
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
      }, 1500);
      return;
    }

    if (authMode === "otp" && otpSent) {
      if (otpCode === "123456") {
        // Mock successful OTP login
        const mockUser = { id: "otp-user", name: "Guest User", email: formData.email, role: "GUEST" };
        localStorage.setItem("sentinel_token", "mock-otp-token");
        localStorage.setItem("sentinel_user", JSON.stringify(mockUser));
        router.push("/dashboard");
        setTimeout(() => window.location.reload(), 100);
        return;
      } else {
        setError("Invalid OTP code. Please try 123456 for the demo.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("sentinel_token", data.token);
      localStorage.setItem("sentinel_user", JSON.stringify(data.user));

      router.push("/dashboard");
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      if (err.message === "Failed to fetch" && window.location.protocol === "https:") {
        setError("Network Error: Cannot connect to local backend (localhost:3001) from a live HTTPS site. Please test on http://localhost:3003/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "80vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px"
    }} className="grid-bg">
      <div className="glass" style={{ maxWidth: 400, width: "100%", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>
            SECURE ACCESS PORTAL
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>War Room Login</h1>
          
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 8, marginTop: 20 }}>
            <button 
              onClick={() => {setAuthMode("password"); setOtpSent(false);}}
              style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, background: authMode === "password" ? "var(--blue)" : "transparent", color: "#fff" }}
            >PASSWORD</button>
            <button 
              onClick={() => setAuthMode("otp")}
              style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, background: authMode === "otp" ? "var(--blue)" : "transparent", color: "#fff" }}
            >GOOGLE OTP</button>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: "rgba(255, 59, 92, 0.1)", 
            border: "1px solid var(--red)", 
            color: "var(--red)", 
            padding: "12px", 
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {!otpSent ? (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                {authMode === "otp" ? "Google Email" : "Email Address"}
              </label>
              <input 
                type="email" 
                required
                className="input-field" 
                placeholder="operator@sentinel.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: "100%", padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", borderRadius: 6 }}
              />
            </div>
          ) : (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                Verification Code (OTP)
              </label>
              <input 
                type="text" 
                required
                className="input-field" 
                placeholder="Enter 6-digit code"
                value={otpCode}
                maxLength={6}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", borderRadius: 6, textAlign: "center", fontSize: 24, letterSpacing: 8 }}
              />
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
                Sent to {formData.email} (Use 123456 for demo)
              </p>
            </div>
          )}

          {authMode === "password" && (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                Password
              </label>
              <input 
                type="password" 
                required
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: "100%", padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", borderRadius: 6 }}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 10 }}
            disabled={loading}
          >
            {loading ? "Processing..." : (authMode === "otp" ? (otpSent ? "Verify Code" : "Send OTP to Google") : "Login to System")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          New operator? <Link href="/register" className="glow-blue" style={{ textDecoration: "none" }}>Request Access</Link>
        </div>
      </div>
    </div>
  );
}
