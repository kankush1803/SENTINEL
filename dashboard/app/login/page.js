"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Store user and token in localStorage
      localStorage.setItem("sentinel_token", data.token);
      localStorage.setItem("sentinel_user", JSON.stringify(data.user));

      // Redirect to War Room
      router.push("/dashboard");
      // Force a full refresh to update the layout state
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      setError(err.message);
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
            AUTHENTICATION REQUIRED
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>War Room Login</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
            Secure access for authorized personnel only.
          </p>
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
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
              Email Address
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
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 10 }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to System"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          New operator? <Link href="/register" className="glow-blue" style={{ textDecoration: "none" }}>Request Access</Link>
        </div>
      </div>
    </div>
  );
}
