import { ReplitConnectors } from "@replit/connectors-sdk";

const AIRTABLE_BASE_ID = "appg7vnqlSYnEIuKA";
const AIRTABLE_TABLE_ID = "tblKbMyoHQo74GGUs";

const QUESTIONS = [
  {
    label: "Proposals & Documents",
    answers: [
      "I manually build or update it, which takes hours (or days) off my schedule.",
      "I use a template, but still take 30+ minutes tweaking and formatting.",
      "I push one button (or let system triggers handle it completely).",
    ],
  },
  {
    label: "Scheduling",
    answers: [
      "Manual outreach—we swap available dates until something sticks.",
      "Basic scheduling link, but I still handle reminders and follow-ups myself.",
      "Fully automated. Booking, reminders, and calendar sync happen hands-free.",
    ],
  },
  {
    label: "Moving information",
    answers: [
      "Constantly. I'm manually updating 3+ tools every time a new lead or client comes in.",
      "Too often. I have some tools connected, but I still manually fill in the gaps.",
      "Never. My systems instantly sync data across every platform automatically.",
    ],
  },
  {
    label: "Follow-up",
    answers: [
      "100% manual—someone has to remember to check, write, and send.",
      "Hybrid—calendar alerts nudge us, but we still handle the messages.",
      "Fully automated—triggers send relevant updates without us touching a button.",
    ],
  },
  {
    label: "Finding out what is happening",
    answers: [
      "Search emails, ask someone, or check several places.",
      "I usually know where to look, but the information isn't all together.",
      "I can see what I need quickly in one place.",
    ],
  },
] as const;

function formatAnswers(answers: number[]): string {
  return answers
    .map((answer, index) => {
      const question = QUESTIONS[index];
      const selectedAnswer = question?.answers[answer] ?? `Answer ${answer}`;
      return `${index + 1}. ${question?.label ?? "Question"}: ${selectedAnswer}`;
    })
    .join("\n\n");
}

export async function createFlowScoreAirtableRecord(input: {
  name: string;
  email: string;
  score: number;
  answers: number[];
}): Promise<void> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy(
    "airtable",
    `/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Name: input.name,
              Email: input.email,
              "Flow Score": `${input.score}/10`,
              "Their Input in Questionnaire": formatAnswers(input.answers),
            },
          },
        ],
        typecast: true,
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Airtable returned ${response.status}: ${details}`);
  }
}