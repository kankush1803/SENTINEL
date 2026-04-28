"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>RCIO — Rapid Crisis Intelligence Operations</title>
        <meta
          name="description"
          content="Real-time crisis coordination for hospitality venues. AI triage, live floor maps, staff dispatch, and first responder coordination in one command center."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="scanlines">
        <Nav />
        {children}
      </body>
    </html>
  );
}

function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("sentinel_user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sentinel_user");
    localStorage.removeItem("sentinel_token");
    setUser(null);
    window.location.href = "/login";
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "War Room" },
    { href: "/triage", label: "AI Triage" },
    { href: "/venue", label: "Venue" },
    { href: "/sos", label: "Guest SOS" },
    { href: "/staff", label: "Staff Ops" },
    { href: "/report", label: "Reports" },
  ];
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,8 26,20 14,26 2,20 2,8"
            stroke="#00c8ff"
            strokeWidth="1.5"
            fill="rgba(0,200,255,0.08)"
          />
          <circle cx="14" cy="14" r="5" fill="#00c8ff" opacity="0.9" />
          <circle
            cx="14"
            cy="14"
            r="8"
            stroke="#00c8ff"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
        RC<span>IO</span>
      </Link>

      <div className="nav-links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link${pathname === l.href ? " active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-alert" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {user ? (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              OP: <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>
            </span>
            <button 
              onClick={handleLogout}
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}
