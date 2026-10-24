import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { appPath } from '@/lib/app-path';
import { ArrowLeft } from 'lucide-react';
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

export default function GiveawayRulesPage() {
  return (
    <LegalShell title="Official Giveaway Rules" lastUpdated="July 2025">
      <p><strong>NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING.</strong></p>

      <h2>1. Sponsor</h2>
      <p>
        This giveaway ("Promotion") is sponsored by Resonance Strategies, LLC dba TymFlo ("Sponsor").
        <br />
        28475 Greenfield Rd. Suit #113  7246
        <br />
        Southfield, MI 48076
        <br />
        Contact: <a href="mailto:hello@tymflo.com">hello@tymflo.com</a>.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        Open to legal residents of the United States who are 18 years of age or older at the time of entry and
        who represent a business, practice, or nonprofit organization. Employees of TymFlo, its affiliates,
        subsidiaries, advertising and promotion agencies, and their immediate family members and/or those living
        in the same household are not eligible to participate.
      </p>

      <h2>3. Promotion Period</h2>
      <p>
        The Promotion begins at the participating vending event and ends the same day.
        Participants complete the assessment and enter the giveaway during the event.
      </p>

      <h2>4. How to Enter</h2>
      <p>
        To enter, complete the TymFlo "Where Is Your Time Going?" assessment at tymflo.com and check the optional
        giveaway opt-in box before submitting your results. You may also request a paper entry form by mailing a
        request to TymFlo at the address provided at the event. Limit one entry per person. Multiple entries will
        be disqualified.
      </p>
      <p>
        <strong>No purchase is required to enter or to win.</strong> Completing or booking any TymFlo service
        does not increase your chances of winning.
      </p>

      <h2>5. Prize</h2>
      <p>
        Prizes are valued at $120.
        Prize is non-transferable and has no cash equivalent. Sponsor reserves the right to substitute a prize
        of equal or greater value if the advertised prize becomes unavailable.
      </p>

      <h2>6. Drawing and Winner Selection</h2>
      <p>
        One (1) winner will be selected by random drawing from all eligible entries received during the
        Promotion Period. The drawing will take place on the same day participants complete the assessment
        at the vending event. Odds of winning depend on the number of eligible entries received.
      </p>

      <h2>7. Winner Notification</h2>
      <p>
        The potential winner will be notified by email or phone using the contact information provided at entry
        on the same day as the assessment and drawing. If the potential winner cannot be contacted
        that day, or if the winner is found ineligible, an alternate winner may
        be selected.
      </p>

      <h2>8. Conditions of Participation</h2>
      <p>
        By entering, participants agree to be bound by these Official Rules and the decisions of Sponsor, which
        are final and binding. Sponsor reserves the right to disqualify any individual who tampers with the
        entry process or who acts in a disruptive manner.
      </p>

      <h2>9. Release</h2>
      <p>
        By participating, entrants release and hold harmless TymFlo, its officers, directors, employees, agents,
        and assigns from and against any and all claims, damages, or liabilities arising from participation in
        the Promotion or the use of any prize.
      </p>

      <h2>10. Privacy</h2>
      <p>
        Information collected through this Promotion will be used in accordance with TymFlo's{' '}
        <a href={appPath("/privacy")}>Privacy Notice</a>. Optional giveaway opt-in is separate from any marketing
        communications opt-in.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        This Promotion is governed by the laws of the state in which TymFlo is domiciled.
      </p>

      <h2>12. Winner List</h2>
      <p>
        To request the name of the winner, send a self-addressed, stamped envelope to TymFlo at the address
        provided at the event after the close of the Promotion Period.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about this Promotion may be directed to{' '}
        <a href="mailto:hello@tymflo.com">hello@tymflo.com</a>.
      </p>
    </LegalShell>
  );
}
