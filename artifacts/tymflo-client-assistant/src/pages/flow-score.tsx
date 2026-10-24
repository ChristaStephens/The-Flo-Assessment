import { useState, useRef, useCallback, type ReactNode, type FormEvent } from 'react';
import { Link, useSearch } from 'wouter';
import { appPath } from '@/lib/app-path';
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Loader2,
  LockKeyhole,
  AlertTriangle,
} from 'lucide-react';
import { useSubmitFlowScore } from '@workspace/api-client-react';
import type { FlowScoreResult } from '@workspace/api-client-react';
import { cn } from '@workspace/tymflo-design-system/lib/utils';
import { Button } from '@workspace/tymflo-design-system/components/ui/button';
import { Input } from '@workspace/tymflo-design-system/components/ui/input';
import { Label } from '@workspace/tymflo-design-system/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@workspace/tymflo-design-system/components/ui/radio-group';
import { Progress } from '@workspace/tymflo-design-system/components/ui/progress';
import { Card, CardContent } from '@workspace/tymflo-design-system/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/tymflo-design-system/components/ui/alert';
import tymfloHorizontalLogo from '@assets/Tymflo-horizontal-crlPng_1787530309600.png';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    topic: 'Proposals and documents',
    question: 'When a new lead asks for a proposal or report, what’s your real workflow?',
    options: [
      { label: 'I manually build or update it, which takes hours (or days) off my schedule.', value: '0' },
      { label: 'I use a template, but still take 30+ minutes tweaking and formatting.', value: '1' },
      { label: 'I push one button (or let system triggers handle it completely).', value: '2' },
    ],
  },
  {
    id: 2,
    topic: 'Scheduling',
    question: 'How do clients and prospects book time with you?',
    options: [
      { label: 'Manual outreach—we swap available dates until something sticks.', value: '0' },
      { label: 'Basic scheduling link, but I still handle reminders and follow-ups myself.', value: '1' },
      { label: 'Fully automated. Booking, reminders, and calendar sync happen hands-free.', value: '2' },
    ],
  },
  {
    id: 3,
    topic: 'Moving information',
    question: 'How much manual copy-pasting is happening across your emails, CRM, spreadsheets, and invoices?',
    options: [
      { label: "Constantly. I'm manually updating 3+ tools every time a new lead or client comes in.", value: '0' },
      { label: 'Too often. I have some tools connected, but I still manually fill in the gaps.', value: '1' },
      { label: 'Never. My systems instantly sync data across every platform automatically.', value: '2' },
    ],
  },
  {
    id: 4,
    topic: 'Follow-up',
    question: 'How are follow-ups and next steps managed in your pipeline?',
    options: [
      { label: '100% manual—someone has to remember to check, write, and send.', value: '0' },
      { label: 'Hybrid—calendar alerts nudge us, but we still handle the messages.', value: '1' },
      { label: 'Fully automated—triggers send relevant updates without us touching a button.', value: '2' },
    ],
  },
  {
    id: 5,
    topic: 'Finding out what is happening',
    question:
      'When you need to know the status of a client, project, lead, or task, what do you usually have to do?',
    options: [
      { label: 'Search emails, ask someone, or check several places.', value: '0' },
      { label: "I usually know where to look, but the information isn't all together.", value: '1' },
      { label: 'I can see what I need quickly in one place.', value: '2' },
    ],
  },
];

const TOTAL_QUESTION_STEPS = 5;
const FLOW_CALL_URL = 'https://tidycal.com/team/TymFlo/discovery-call-event';

// ─── Level config — semantic token classes only ───────────────────────────────

function getLevelConfig(level: string) {
  if (level === 'needs-relief') {
    return {
      label: 'Needs Relief',
      scoreClass: 'flow-score-relief',
      fillClass: 'flow-result-fill-relief',
    };
  }
  if (level === 'gaining-flow') {
    return {
      label: 'Gaining Flow',
      scoreClass: 'flow-score-gaining',
      fillClass: 'flow-result-fill-gaining',
    };
  }
  return {
    label: 'Flowing Strong',
    scoreClass: 'flow-score-flowing',
    fillClass: 'flow-result-fill-flowing',
  };
}

// ─── Background decoration ────────────────────────────────────────────────────
// Two large soft orbs (pale lavender + blush) cropped at page edges,
// matching the sign-in reference. No diagonal stripe.

function FlowBackground() {
  return (
    <>
      <div className="flow-orb-1" aria-hidden="true" />
      <div className="flow-orb-2" aria-hidden="true" />
    </>
  );
}

// ─── Public shell ─────────────────────────────────────────────────────────────

function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <FlowBackground />
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="flow-header">
        <Link href="/" className="flex items-center">
          <img src={tymfloHorizontalLogo} alt="TymFlo" className="tymflo-logo" />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Site navigation">
          <a href={appPath("/privacy")} className="flow-nav-link">Privacy</a>
          <a href={appPath("/terms")} className="flow-nav-link">Terms</a>
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-[1] flex flex-1 flex-col items-center justify-start px-4 py-8 md:py-14"
      >
        {children}
      </main>

      <footer className="flow-footer relative z-[1]">
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

// ─── Progress bar ─────────────────────────────────────────────────────────────

function FlowProgress({ step }: { step: number }) {
  const pct = Math.min(Math.round((step / TOTAL_QUESTION_STEPS) * 100), 100);
  return (
    <div
      className="flow-progress-wrap flow-progress"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={0}
      aria-valuemax={TOTAL_QUESTION_STEPS}
      aria-label={`Question ${step} of ${TOTAL_QUESTION_STEPS}`}
    >
      <Progress value={pct} className="flex-1 h-[3px]" />
      <span className="flow-progress-label">{step} / {TOTAL_QUESTION_STEPS}</span>
    </div>
  );
}

// ─── Intro step ───────────────────────────────────────────────────────────────

function IntroStep({ onStart, isEventMode }: { onStart: () => void; isEventMode: boolean }) {
  return (
    <div className="flow-card page-enter w-full max-w-xl text-center">
      {/* Live badge */}
      <div className="flex justify-center mb-5">
        <div className="flow-intro-badge">
          <div className="flow-intro-badge-dot" aria-hidden="true" />
          <span className="eyebrow" style={{ color: 'hsl(var(--primary))', letterSpacing: '.1em' }}>
            Two-minute assessment
          </span>
        </div>
      </div>

      {/* Hero */}
      <h1 className="flow-display mb-5">
        Where is your<br />
        <em>time</em> going?
      </h1>

      {/* Sub-copy — Spectral */}
      <p className="mb-6 text-base leading-relaxed text-muted-foreground mx-auto max-w-sm font-serif">
        The average business owner loses 14 hours a week to manual admin. Answer 5 questions to see where your hours are leaking.
      </p>

      {/* Topic chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-7">
        {QUESTIONS.map((q) => (
          <span key={q.id} className="flow-topic-chip">{q.topic}</span>
        ))}
      </div>

      {isEventMode && (
        <p className="mb-6 text-sm text-muted-foreground mx-auto max-w-xs font-serif">
          You may enter the event giveaway after completing the assessment. No purchase required.
        </p>
      )}

      {/* CTA — DS Button with flow-btn overrides */}
      <Button
        size="lg"
        onClick={onStart}
        className={cn('flow-btn flow-btn-start gap-2')}
        data-testid="button-start-assessment"
        type="button"
      >
        Calculate My Flow Score
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <span className="flow-trust-item">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          100% free
        </span>
        <span className="flow-trust-divider" aria-hidden="true">|</span>
        <span className="flow-trust-item">Instant result</span>
      </div>
    </div>
  );
}

// ─── Question step ────────────────────────────────────────────────────────────

function QuestionStep({
  questionIndex,
  answers,
  onAnswer,
  onNext,
  onBack,
}: {
  questionIndex: number;
  answers: string[];
  onAnswer: (index: number, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const q = QUESTIONS[questionIndex];
  const selected = answers[questionIndex];
  const radioName = `q${q.id}`;

  return (
    <div className="flow-card page-enter w-full max-w-xl" key={questionIndex}>
      {/* Topic */}
      <div className="flow-topic-label" aria-label={`Topic: ${q.topic}`}>{q.topic}</div>

      {/* Question */}
      <h2 className="flow-question" id={`question-${q.id}`}>{q.question}</h2>

      {/* Answer options via DS RadioGroup */}
      <RadioGroup
        value={selected}
        onValueChange={(val) => onAnswer(questionIndex, val)}
        className="gap-3 mb-8"
        aria-labelledby={`question-${q.id}`}
        name={radioName}
      >
        {q.options.map((opt) => {
          const isSelected = selected === opt.value;
          const itemId = `${radioName}-${opt.value}`;
          return (
            <Label
              key={opt.value}
              htmlFor={itemId}
              className={cn(
                'flow-option-label',
                isSelected && 'flow-option-label'
              )}
              data-selected={isSelected ? 'true' : 'false'}
              style={{
                borderColor: isSelected ? 'hsl(var(--primary))' : undefined,
                background: isSelected ? 'hsl(var(--primary) / .06)' : undefined,
                boxShadow: isSelected
                  ? '0 0 0 3px hsl(var(--primary) / .15), 0 4px 20px hsl(var(--primary) / .12)'
                  : undefined,
              }}
            >
              <RadioGroupItem
                id={itemId}
                value={opt.value}
                className="flow-radio-item shrink-0"
              />
              <span className="flow-option-text">{opt.label}</span>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {questionIndex > 0 ? (
          <Button
            variant="outline"
            onClick={onBack}
            type="button"
            className="flow-btn-back gap-2"
            data-testid="button-question-back"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={onNext}
          disabled={!selected}
          type="button"
          className="flow-btn gap-2"
          data-testid="button-question-next"
        >
          {questionIndex < QUESTIONS.length - 1 ? 'Next question' : 'Continue'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ─── Contact + consent step ───────────────────────────────────────────────────

interface ContactData {
  name: string;
  email: string;
}

function ContactStep({
  contact,
  onChange,
  onSubmit,
  onBack,
  isPending,
  error,
  isEventMode,
}: {
  contact: ContactData;
  onChange: (updates: Partial<ContactData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isPending: boolean;
  error: string;
  isEventMode: boolean;
}) {
  const canSubmit =
    !isPending &&
    contact.name.trim().length >= 2 &&
    contact.email.trim().length >= 5;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <div className="flow-card page-enter w-full max-w-xl">
      <div className="flow-topic-label">Your results are ready</div>
      <h2 className="flow-question">Where should we send your result?</h2>
      <p className="mb-7 text-sm leading-relaxed text-muted-foreground font-serif">
        Enter your details to reveal your Flow Score and get a personalized report.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* First name + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="fs-name" className="flow-field-label">
              First name <span aria-hidden="true">*</span>
            </label>
            <Input
              id="fs-name"
              type="text"
              value={contact.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Enter your first name"
              required
              autoComplete="given-name"
              className="flow-input-field"
              data-testid="input-name"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fs-email" className="flow-field-label">
              Email address <span aria-hidden="true">*</span>
            </label>
            <Input
              id="fs-email"
              type="email"
              value={contact.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="you@business.com"
              required
              autoComplete="email"
              className="flow-input-field"
              data-testid="input-email"
            />
          </div>
        </div>

        <p className="flow-submission-consent" data-testid="text-submission-consent">
          By submitting, you agree to our{' '}
          <a href={appPath("/terms")} target="_blank" rel="noreferrer">Terms of Use</a> &amp;{' '}
          <a href={appPath("/privacy")} target="_blank" rel="noreferrer">Privacy Policy</a> and consent to receive
          helpful automation tips from TymFlo. Unsubscribe anytime.
          {isEventMode && (
            <>
              {' '}Event entries are subject to the{' '}
              <a href={appPath("/giveaway-rules")} target="_blank" rel="noreferrer">Giveaway Rules</a>.
            </>
          )}
        </p>

        {/* Submission error */}
        {error && (
          <Alert variant="destructive" data-testid="text-submission-error">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Submission failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="flow-btn-back gap-2"
            data-testid="button-contact-back"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="flow-btn gap-2"
            data-testid="button-submit-flow-score"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Calculating...</>
            ) : (
              <>See my Flow Score <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--app-font-mono)', letterSpacing: '.05em' }}>
          <LockKeyhole className="inline mr-1 h-3 w-3" aria-hidden="true" />
          Your information is protected. See our{' '}
          <a href={appPath("/privacy")} style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }}>
            Privacy Notice
          </a>.
        </p>
      </form>
    </div>
  );
}

// ─── Result step ──────────────────────────────────────────────────────────────

function ResultStep({
  result,
  giveawayEntered,
}: {
  result: FlowScoreResult;
  giveawayEntered: boolean;
}) {
  const cfg = getLevelConfig(result.level);
  const pct = Math.min(Math.round((result.score / 10) * 100), 100);

  return (
    <div className="w-full max-w-xl space-y-5 page-enter">
      {/* Score hero — white card */}
      <Card className="flow-card border-0 p-0">
        <CardContent className="pt-6">
          <p className="eyebrow mb-3" style={{ color: 'hsl(var(--primary))' }}>Your Flow Score</p>

          {/* Score numeral + bar */}
          <div className="flex items-end gap-6 mb-5">
            <div>
              <span
                className={cn('flow-score-numeral', cfg.scoreClass)}
                aria-label={`Score: ${result.score} out of 10`}
              >
                {result.score}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">/10</span>
            </div>
            <div className="flex-1 pb-3">
              <div className="flow-result-track mb-2">
                <div
                  className={cn('flow-result-fill', cfg.fillClass)}
                  style={{ width: `${pct}%` }}
                  role="presentation"
                />
              </div>
              <p className={cn('eyebrow', cfg.scoreClass)}>{cfg.label}</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--app-font-sans)', letterSpacing: '-.03em' }}>
            {result.headline}
          </h2>

          {/* Message — Spectral */}
          <p className="text-base leading-relaxed text-muted-foreground font-serif">
            {result.message}
          </p>
        </CardContent>
      </Card>

      {/* Opportunity — DS Card with left-accent treatment */}
      <Card className="flow-opportunity-panel fade-up border shadow-none">
        <CardContent className="pt-5 pb-5">
          <p className="eyebrow mb-1.5" style={{ color: 'hsl(var(--primary))' }}>Your biggest opportunity</p>
          <p className="text-lg font-bold tracking-tight mb-1.5" style={{ fontFamily: 'var(--app-font-sans)', letterSpacing: '-.03em' }}>
            {result.opportunity}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground font-serif">
            {result.opportunityMessage}
          </p>
        </CardContent>
      </Card>

      {/* Event raffle invitation — entry requires booking a Flow Call */}
      {giveawayEntered && (
        <div className="flow-giveaway-banner fade-up-delay" data-testid="banner-giveaway-entered">
          <div className="flow-giveaway-icon">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5" style={{ color: 'hsl(var(--primary))' }}>Book a Flow Call to enter the raffle</p>
            <p className="text-sm leading-relaxed text-muted-foreground font-serif">
              Booking your free 20-minute Flow Call is how you enter. Open to eligible U.S. residents 18 and older. No purchase required or implied.{' '}
              <a href={appPath("/giveaway-rules")} style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }}>
                See Official Rules
              </a>{' '}
              for eligibility and prize details.
            </p>
          </div>
        </div>
      )}

      {/* CTA Block */}
      <div className="flow-cta-block fade-up-delay-2">
        <p className="flow-cta-eyebrow">Next step</p>
        <h3 className="flow-cta-heading">
          See what better flow<br />
          <em>looks like for you.</em>
        </h3>
        <p className="flow-cta-sub">
          A free 20-minute conversation. No pitch. Just clarity on where your time is going and what to do about it.
        </p>
        <a
          href={FLOW_CALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flow-cta-btn"
          data-testid="link-book-flow-call"
        >
          Book a Free Flow Call
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <p className="flow-cta-note">No commitment. No credit card. Just a conversation.</p>
        {giveawayEntered && (
          <p className="flow-cta-sub mt-3 mb-0" data-testid="text-raffle-booking-note">
            Book your free 20-minute Flow Call to enter the raffle.
          </p>
        )}
      </div>

      {/* Restart */}
      <div className="text-center pb-2 fade-up-delay-3">
        <Button
          variant="ghost"
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          style={{ fontFamily: 'var(--app-font-mono)', letterSpacing: '.05em', textTransform: 'uppercase' }}
          data-testid="button-restart"
        >
          Take the assessment again
        </Button>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

type FlowStep = 'intro' | `q${number}` | 'contact' | 'result';

export default function FlowScorePage() {
  const search = useSearch();
  const isEventMode = new URLSearchParams(search).get('event') === '1';

  const [flowStep, setFlowStep] = useState<FlowStep>('intro');
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [contact, setContact] = useState<ContactData>({
    name: '',
    email: '',
  });
  const [result, setResult] = useState<FlowScoreResult | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [giveawayEntered, setGiveawayEntered] = useState(false);

  const submitMutation = useSubmitFlowScore();
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const questionIndex = flowStep.startsWith('q') ? parseInt(flowStep.slice(1)) : -1;

  const handleAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const goToQuestion = (idx: number) => {
    setFlowStep(`q${idx}` as FlowStep);
    scrollTop();
  };

  const handleQuestionNext = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      goToQuestion(questionIndex + 1);
    } else {
      setFlowStep('contact');
      scrollTop();
    }
  };

  const handleQuestionBack = () => {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
    } else {
      setFlowStep('intro');
      scrollTop();
    }
  };

  const handleSubmit = () => {
    setSubmitError('');
    const numericAnswers = answers.map((a) => (a === '' ? 0 : Number(a)));
    const giveawayOptIn = isEventMode;

    submitMutation.mutate(
      {
        data: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          answers: numericAnswers,
          acceptedTerms: true,
          acceptedPrivacy: true,
          marketingConsent: true,
          giveawayOptIn,
        },
      },
      {
        onSuccess: (res) => {
          setResult(res);
          setGiveawayEntered(giveawayOptIn);
          setFlowStep('result');
          scrollTop();
        },
        onError: (err) => {
          const msg =
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again or email hello@tymflo.com.';
          setSubmitError(msg);
        },
      },
    );
  };

  const progressStep =
    flowStep === 'intro'   ? 0
    : flowStep === 'contact' ? TOTAL_QUESTION_STEPS + 1
    : flowStep === 'result'  ? TOTAL_QUESTION_STEPS + 2
    : questionIndex + 1;

  const showProgress = flowStep !== 'intro' && flowStep !== 'result';

  return (
    <PublicShell>
      <div ref={topRef} className="w-full flex flex-col items-center">
        {showProgress && (
          <div className="w-full max-w-xl mb-1">
            <FlowProgress step={Math.min(progressStep, TOTAL_QUESTION_STEPS)} />
          </div>
        )}

        {flowStep === 'intro' && (
          <IntroStep
            isEventMode={isEventMode}
            onStart={() => { setFlowStep('q0'); scrollTop(); }}
          />
        )}

        {flowStep.startsWith('q') && (
          <QuestionStep
            questionIndex={questionIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleQuestionNext}
            onBack={handleQuestionBack}
          />
        )}

        {flowStep === 'contact' && (
          <ContactStep
            contact={contact}
            onChange={(updates) => setContact((prev) => ({ ...prev, ...updates }))}
            onSubmit={handleSubmit}
            onBack={() => { setFlowStep('q4'); scrollTop(); }}
            isPending={submitMutation.isPending}
            error={submitError}
            isEventMode={isEventMode}
          />
        )}

        {flowStep === 'result' && result && (
          <ResultStep result={result} giveawayEntered={giveawayEntered} />
        )}
      </div>
    </PublicShell>
  );
}
