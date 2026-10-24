import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { appPath } from '@/lib/app-path';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import tymfloHorizontalLogo from '@assets/Tymflo-horizontal-crlPng_1787530309600.png';

function LegalShell({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative" style={{ background: 'hsl(var(--background))' }}>
      {/* Background decoration — matches flow assessment energy */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 80% 0%, rgba(246,150,121,.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 10% 100%, rgba(70,49,118,.09) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0, transparent 18px, rgba(70,49,118,.025) 18px, rgba(70,49,118,.025) 19px)',
        }}
      />

      {/* Header */}
      <header className="flow-header">
        <Link href="/" className="flex items-center">
          <img src={tymfloHorizontalLogo} alt="TymFlo" className="tymflo-logo" />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Site navigation">
          <a href={appPath("/privacy")} className="flow-nav-link">Privacy</a>
          <a href={appPath("/terms")} className="flow-nav-link">Terms</a>
        </nav>
      </header>

      <main className="relative z-1 flex flex-1 flex-col items-center px-4 py-10 md:py-16">
        <div className="legal-container">
          {/* Back */}
          <Link href="/" className="legal-back-link" data-testid="link-back-to-assessment">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to assessment
          </Link>

          {/* Disclaimer */}
          <div className="legal-disclaimer-banner" role="note">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Informational template — not legal advice</p>
              <p className="mt-1">This is a working draft provided for informational purposes only. It has not been reviewed by an attorney. TymFlo recommends consulting qualified legal counsel before publishing or relying on this document.</p>
            </div>
          </div>

          {/* Header */}
          <div className="legal-header">
            <div className="legal-accent-bar" aria-hidden="true" />
            <p className="eyebrow" style={{ color: '#f69679' }}>Legal document</p>
            <h1 className="legal-title">{title}</h1>
            <p className="legal-date">Last updated: {lastUpdated}</p>
          </div>

          <div className="legal-body prose">
            {children}
          </div>
        </div>
      </main>

      <footer className="flow-footer relative z-1">
        <p>
          &copy; {new Date().getFullYear()} TymFlo. All rights reserved.{' '}
          <a href={appPath("/privacy")}>Privacy Notice</a>
          {' · '}
          <a href={appPath("/terms")}>Terms of Use</a>
          {' · '}
          <a href={appPath("/giveaway-rules")}>Giveaway Rules</a>
        </p>
      </footer>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Notice" lastUpdated="July 2025">
      <h2>1. Who We Are</h2>
      <p>
        TymFlo ("TymFlo," "we," "our," or "us") provides marketing, operational technology, and custom AI tools to
        physicians, service providers, and nonprofits. This Privacy Notice describes how we collect, use, share, and
        protect personal information when you use our "Where Is Your Time Going?" assessment, our website, or any
        related services (collectively, the "Services").
      </p>

      <h2>2. Information We Collect</h2>
      <p>We may collect the following categories of personal information:</p>
      <ul>
        <li><strong>Identification data:</strong> name, email address, phone number.</li>
        <li><strong>Business data:</strong> business name, industry, professional role.</li>
        <li><strong>Assessment responses:</strong> your answers to the five assessment questions and your computed Flow Score.</li>
        <li><strong>Consent records:</strong> timestamps and records of your acceptance of these terms, our Privacy Notice, and any optional marketing or giveaway opt-ins.</li>
        <li><strong>Usage data:</strong> IP address, browser type, device identifiers, and page interaction data collected automatically via cookies and similar technologies.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your personal information to:</p>
      <ul>
        <li>Deliver and personalize your Flow Score result.</li>
        <li>Contact you to schedule a Flow Discovery Call, if you choose to book one.</li>
        <li>Send marketing communications, if you have opted in.</li>
        <li>Administer event giveaways, if you have opted in.</li>
        <li>Improve our Services, conduct internal analytics, and develop new offerings.</li>
        <li>Comply with applicable laws and regulations.</li>
      </ul>

      <h2>4. Legal Basis for Processing (where applicable)</h2>
      <p>
        Where data protection law requires a legal basis, we rely on: (a) your consent, where you have provided it;
        (b) our legitimate interests in improving our services and communicating with prospective clients; and
        (c) compliance with legal obligations.
      </p>

      <h2>5. Sharing Your Information</h2>
      <p>
        We do not sell your personal information. We may share it with trusted service providers who assist in
        delivering the Services (e.g., email platforms, CRM software, analytics tools) under confidentiality
        agreements. We may also disclose information if required by law or to protect our legal rights.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal information for as long as necessary to fulfill the purposes described in this Notice,
        or as required by applicable law. You may request deletion at any time by contacting us at
        <a href="mailto:hello@tymflo.com"> hello@tymflo.com</a>.
      </p>

      <h2>7. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal information.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Withdraw consent at any time, without affecting processing already completed.</li>
        <li>Lodge a complaint with a supervisory authority.</li>
      </ul>
      <p>To exercise any of these rights, contact us at <a href="mailto:hello@tymflo.com">hello@tymflo.com</a>.</p>

      <h2>8. Cookies and Tracking</h2>
      <p>
        We use cookies and similar technologies to operate our Services and understand how visitors use them.
        You may adjust your browser settings to decline cookies, though some features may not function as expected.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal
        information from minors. If we learn that we have done so, we will delete it promptly.
      </p>

      <h2>10. Changes to This Notice</h2>
      <p>
        We may update this Privacy Notice from time to time. We will post the revised version here with an updated
        "Last updated" date. Your continued use of the Services after any change constitutes acceptance of the
        updated Notice.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have questions about this Privacy Notice or our data practices, please contact us at:
        <br />
        <strong>TymFlo</strong>
        <br />
        <a href="mailto:hello@tymflo.com">hello@tymflo.com</a>
      </p>
    </LegalShell>
  );
}
