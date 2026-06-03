import { hydrateClaims } from "@/lib/claims";
import { spanOf } from "@/lib/spans";
import type {
  Claim,
  Message,
  MessageEvaluation,
  RecommendedAction,
  Session,
  SignalSet,
} from "@/types";

type ClaimDraft = Omit<Claim, "text">;

function evaluationFor(message: Message, drafts: ClaimDraft[]): MessageEvaluation {
  return { messageId: message.id, claims: hydrateClaims(message, drafts) };
}

function signals(
  partial: SignalSet & { recommendedAction: RecommendedAction },
): { signals: SignalSet; recommendedAction: RecommendedAction } {
  const { recommendedAction, ...signals } = partial;
  return { signals, recommendedAction };
}

// ——— Fixture 1: caffeine / health ———

const CAFFEINE_USER: Message = {
  id: "msg-u-caffeine",
  role: "user",
  content: "Is it okay to drink several cups of coffee every day?",
  createdAt: "2026-05-31T10:00:00.000Z",
};

const CAFFEINE_ASSISTANT_CONTENT =
  "Moderate coffee consumption (about 3–4 cups per day) is generally considered safe for most healthy adults. Caffeine can improve alertness and concentration for several hours. However, high intake may increase anxiety and disrupt sleep if consumed late in the day. Pregnant people are usually advised to limit caffeine to roughly 200 mg per day. Individual sensitivity varies, so some people feel effects from a single espresso while others tolerate more.";

const CAFFEINE_ASSISTANT: Message = {
  id: "msg-a-caffeine",
  role: "assistant",
  content: CAFFEINE_ASSISTANT_CONTENT,
  createdAt: "2026-05-31T10:00:01.000Z",
};

const caffeineDrafts: ClaimDraft[] = [
  {
    id: "claim-caf-1",
    messageId: CAFFEINE_ASSISTANT.id,
    span: spanOf(
      CAFFEINE_ASSISTANT_CONTENT,
      "Moderate coffee consumption (about 3–4 cups per day) is generally considered safe for most healthy adults.",
    ),
    ...signals({
      source: "Dietary Guidelines references and major health agency summaries (FDA, EFSA) on moderate caffeine intake.",
      reasoning:
        "Aggregates population studies where ~400 mg/day caffeine is not associated with elevated cardiovascular risk in healthy adults; maps cups to mg approximately.",
      assumptions: [
        "User is a healthy adult without arrhythmia or uncontrolled hypertension.",
        "Cup size is typical (~80–100 mg caffeine per cup).",
      ],
      confidence: "medium",
      uncertainty:
        "Does not account for energy drinks, supplements, or medical conditions that lower safe thresholds.",
      recommendedAction: "verify",
    }),
  },
  {
    id: "claim-caf-2",
    messageId: CAFFEINE_ASSISTANT.id,
    span: spanOf(
      CAFFEINE_ASSISTANT_CONTENT,
      "Caffeine can improve alertness and concentration for several hours.",
    ),
    ...signals({
      source: "Well-established psychostimulant literature; caffeine half-life ~3–5 hours in adults.",
      reasoning:
        "Adenosine receptor antagonism increases perceived alertness; effect duration tied to dose and metabolism.",
      assumptions: ["User has normal caffeine metabolism and no acute tolerance washout."],
      confidence: "high",
      uncertainty: "Magnitude varies with sleep debt, dose, and habitual use.",
      recommendedAction: "trust",
    }),
  },
  {
    id: "claim-caf-3",
    messageId: CAFFEINE_ASSISTANT.id,
    span: spanOf(
      CAFFEINE_ASSISTANT_CONTENT,
      "high intake may increase anxiety and disrupt sleep if consumed late in the day",
    ),
    ...signals({
      source: "Clinical reviews linking high caffeine to anxiety symptoms and delayed sleep onset.",
      reasoning: "Dose-dependent CNS stimulation and circadian disruption when taken within ~6h of bedtime.",
      assumptions: ["“High intake” means above individual tolerance, often >400 mg/day or late dosing."],
      confidence: "medium",
      uncertainty: "Genetic CYP1A2 variants strongly modify sleep impact at the same dose.",
      recommendedAction: "trust",
    }),
  },
  {
    id: "claim-caf-4",
    messageId: CAFFEINE_ASSISTANT.id,
    span: spanOf(
      CAFFEINE_ASSISTANT_CONTENT,
      "Pregnant people are usually advised to limit caffeine to roughly 200 mg per day.",
    ),
    ...signals({
      source: "ACOG and similar guidance recommending ≤200 mg/day during pregnancy.",
      reasoning: "Precautionary threshold from observational studies on miscarriage/low birth weight at higher intake.",
      assumptions: ["Applies to pregnant users; guidance may differ by country and year."],
      confidence: "medium",
      uncertainty: "Recent studies debate whether very low intake still carries risk; not personalized medical advice.",
      recommendedAction: "verify",
    }),
  },
  {
    id: "claim-caf-5",
    messageId: CAFFEINE_ASSISTANT.id,
    span: spanOf(
      CAFFEINE_ASSISTANT_CONTENT,
      "some people feel effects from a single espresso while others tolerate more",
    ),
    ...signals({
      source: "Known inter-individual variability in caffeine sensitivity and tolerance.",
      reasoning: "Tolerance from chronic use and metabolism speed change subjective response at identical doses.",
      assumptions: ["Espresso shot ~63 mg caffeine (typical café serving)."],
      confidence: "high",
      uncertainty: "No quantitative prediction for this specific user without history.",
      recommendedAction: "trust",
    }),
  },
];

// ——— Fixture 2: renewables ———

const SOLAR_USER: Message = {
  id: "msg-u-solar",
  role: "user",
  content: "Can solar alone power most countries soon?",
  createdAt: "2026-05-31T11:00:00.000Z",
};

const SOLAR_ASSISTANT_CONTENT =
  "Solar capacity has grown rapidly over the last decade, but most grids still need storage, transmission upgrades, or dispatchable sources for reliability. In sunny regions, solar often provides the cheapest new electricity. Seasonal and nighttime gaps mean “solar alone” is unlikely to supply most countries without large batteries or imports in the near term. Policy, land use, and permitting timelines strongly affect how fast deployment can scale.";

const SOLAR_ASSISTANT: Message = {
  id: "msg-a-solar",
  role: "assistant",
  content: SOLAR_ASSISTANT_CONTENT,
  createdAt: "2026-05-31T11:00:01.000Z",
};

const solarDrafts: ClaimDraft[] = [
  {
    id: "claim-sol-1",
    messageId: SOLAR_ASSISTANT.id,
    span: spanOf(SOLAR_ASSISTANT_CONTENT, "Solar capacity has grown rapidly over the last decade"),
    ...signals({
      source: "IEA / IRENA deployment statistics through 2024–2025 reporting cycles.",
      reasoning: "Year-over-year GW additions and LCOE declines support “rapid growth” characterization.",
      assumptions: ["“Last decade” refers to roughly 2015–2025 global trends."],
      confidence: "high",
      uncertainty: "National curves differ; some markets plateaued temporarily.",
      recommendedAction: "trust",
    }),
  },
  {
    id: "claim-sol-2",
    messageId: SOLAR_ASSISTANT.id,
    span: spanOf(
      SOLAR_ASSISTANT_CONTENT,
      "most grids still need storage, transmission upgrades, or dispatchable sources for reliability",
    ),
    ...signals({
      source: "Grid operator and energy-system modeling literature on variability and inertia.",
      reasoning:
        "High renewable penetration raises ramping and adequacy challenges unless flexibility resources are added.",
      assumptions: ["Discussing national-scale bulk power grids, not isolated microgrids."],
      confidence: "medium",
      uncertainty: "Emerging long-duration storage and demand flexibility could change the mix faster than models assume.",
      recommendedAction: "verify",
    }),
  },
  {
    id: "claim-sol-3",
    messageId: SOLAR_ASSISTANT.id,
    span: spanOf(
      SOLAR_ASSISTANT_CONTENT,
      "In sunny regions, solar often provides the cheapest new electricity.",
    ),
    ...signals({
      source: "Lazard LCOE and auction results in high-irradiance markets.",
      reasoning: "Compares levelized cost of new solar vs. new gas/coal on a marginal basis.",
      assumptions: ["Excludes full system integration and transmission costs unless noted in study."],
      confidence: "medium",
      uncertainty: "Not true in low-irradiance or high-financing-cost regions without subsidies.",
      recommendedAction: "verify",
    }),
  },
  {
    id: "claim-sol-4",
    messageId: SOLAR_ASSISTANT.id,
    span: spanOf(
      SOLAR_ASSISTANT_CONTENT,
      "“solar alone” is unlikely to supply most countries without large batteries or imports in the near term",
    ),
    ...signals({
      source: "Integrated resource plans and 2030 horizon scenarios from multiple energy agencies.",
      reasoning:
        "Seasonal/diurnal mismatch plus electrification load growth implies multi-resource portfolios on observed timelines.",
      assumptions: ["“Near term” ≈ 5–10 years; “most countries” means typical mid-latitude nations."],
      confidence: "low",
      uncertainty: "Breakthrough storage cost curves or unprecedented build rates could invalidate “unlikely.”",
      recommendedAction: "skip",
    }),
  },
  {
    id: "claim-sol-5",
    messageId: SOLAR_ASSISTANT.id,
    span: spanOf(
      SOLAR_ASSISTANT_CONTENT,
      "Policy, land use, and permitting timelines strongly affect how fast deployment can scale.",
    ),
    ...signals({
      source: "Reports on interconnection queues, siting conflicts, and incentive regimes.",
      reasoning: "Deployment bottlenecks increasingly administrative rather than purely technological.",
      assumptions: ["User cares about national-scale rollout speed, not rooftop-only niche."],
      confidence: "high",
      uncertainty: "Political shifts can accelerate or stall permitting independent of technology.",
      recommendedAction: "trust",
    }),
  },
];

const caffeineEval = evaluationFor(CAFFEINE_ASSISTANT, caffeineDrafts);
const solarEval = evaluationFor(SOLAR_ASSISTANT, solarDrafts);

export const FIXTURE_SESSION_CAFFEINE: Session = {
  id: "session-caffeine",
  title: "Coffee consumption",
  messages: [CAFFEINE_USER, CAFFEINE_ASSISTANT],
  evaluations: [caffeineEval],
  createdAt: "2026-05-31T10:00:00.000Z",
  updatedAt: "2026-05-31T10:00:01.000Z",
};

export const FIXTURE_SESSION_SOLAR: Session = {
  id: "session-solar",
  title: "Solar grid feasibility",
  messages: [SOLAR_USER, SOLAR_ASSISTANT],
  evaluations: [solarEval],
  createdAt: "2026-05-31T11:00:00.000Z",
  updatedAt: "2026-05-31T11:00:01.000Z",
};

export const FIXTURE_SESSIONS: Session[] = [FIXTURE_SESSION_CAFFEINE, FIXTURE_SESSION_SOLAR];

export function getFixtureSession(id: string): Session | undefined {
  return FIXTURE_SESSIONS.find((s) => s.id === id);
}

export function getClaimsForMessage(session: Session, messageId: string): Claim[] {
  const evaluation = session.evaluations.find((e) => e.messageId === messageId);
  return evaluation?.claims ?? [];
}
