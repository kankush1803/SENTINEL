'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>RCIO — Rapid Crisis Intelligence Operations</title>
        <meta name="description" content="Real-time crisis coordination for hospitality venues. AI triage, live floor maps, staff dispatch, and first responder coordination in one command center." />
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
  const links = [
    { href: '/',          label: 'Home'      },
    { href: '/dashboard', label: 'War Room'  },
    { href: '/triage',    label: 'AI Triage' },
    { href: '/sos',       label: 'Guest SOS' },
    { href: '/staff',     label: 'Staff Ops' },
    { href: '/report',    label: 'Reports'   },
  ];
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00c8ff" strokeWidth="1.5" fill="rgba(0,200,255,0.08)" />
          <circle cx="14" cy="14" r="5" fill="#00c8ff" opacity="0.9" />
          <circle cx="14" cy="14" r="8" stroke="#00c8ff" strokeWidth="0.5" fill="none" opacity="0.4" />
        </svg>
        RC<span>IO</span>
      </Link>

      <div className="nav-links">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link${pathname === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-alert">
        <span className="pulse-dot pulse-red" />
        2 Active Incidents
      </div>
    </nav>
  );
}
