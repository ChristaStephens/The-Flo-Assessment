import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { appPath } from '@/lib/app-path';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import tymfloHorizontalLogo from '@assets/Tymflo-horizontal-crlPng_1787530309600.png';

function LegalShell({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative" style={{ background: 'hsl(var(--background))' }}>
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
          <Link href="/" className="legal-back-link" data-testid="link-back-to-assessment">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to assessment
          </Link>

          <div className="legal-disclaimer-banner" role="note">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Informational template — not legal advice</p>
              <p className="mt-1">This is a working draft provided for informational purposes only. It has not been reviewed by an attorney. TymFlo recommends consulting qualified legal counsel before publishing or relying on this document.</p>
            </div>
          </div>

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

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" lastUpdated="July 2025">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using TymFlo's website or the "Where Is Your Time Going?" assessment
        (collectively, the "Services"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree,
        please do not use the Services.
      </p>

      <h2>2. Description of Services</h2>
      <p>
        TymFlo provides a free, interactive lead-magnet assessment that asks five questions about your business
        workflows and returns a personalized "Flow Score" result. The Services are informational in nature. They do
        not constitute professional, legal, financial, or medical advice.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        The Services are intended for individuals who are at least 18 years of age and who represent a business,
        practice, or nonprofit organization. By using the Services, you represent that you meet these requirements.
      </p>

      <h2>4. User Responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate, current, and complete information when requested.</li>
        <li>Use the Services only for lawful purposes and in a manner consistent with these Terms.</li>
        <li>Not attempt to circumvent, disable, or otherwise interfere with any security feature of the Services.</li>
        <li>Not use automated means to access or scrape the Services without TymFlo's prior written consent.</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        All content, graphics, logos, text, and software on the Services are owned by or licensed to TymFlo and
        are protected by applicable intellectual property laws. You may not reproduce, distribute, or create
        derivative works without TymFlo's prior written permission.
      </p>

      <h2>6. Disclaimer of Warranties</h2>
      <p>
        THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
        NON-INFRINGEMENT. TYMFLO DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE
        OF VIRUSES OR OTHER HARMFUL COMPONENTS.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, TYMFLO SHALL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES,
        EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>

      <h2>8. Third-Party Links</h2>
      <p>
        The Services may contain links to third-party websites. TymFlo is not responsible for the content,
        privacy practices, or availability of any third-party site.
      </p>

      <h2>9. Privacy</h2>
      <p>
        Your use of the Services is also governed by our <a href={appPath("/privacy")}>Privacy Notice</a>, which is
        incorporated into these Terms by reference.
      </p>

      <h2>10. Modifications</h2>
      <p>
        TymFlo reserves the right to modify these Terms at any time. Changes will be posted here with an updated
        "Last updated" date. Your continued use of the Services after any modification constitutes acceptance of
        the revised Terms.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the state in which TymFlo is
        domiciled, without regard to its conflict of law principles. [<em>Jurisdiction to be confirmed by counsel.</em>]
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Reach us at{' '}
        <a href="mailto:hello@tymflo.com">hello@tymflo.com</a>.
      </p>
    </LegalShell>
  );
}
