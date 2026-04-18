import { avatarUrl } from "../site";

export const testimonials = [
  {
    quote:
      "We replaced three tools and a dozen Slack rituals with Klick. Adoption went from skeptical to default in one quarter because the AI actually respects our Linear workflow.",
    name: "Elena Voss",
    title: "VP Product",
    org: "Northwind Labs",
    avatar: avatarUrl("ElenaVoss"),
  },
  {
    quote:
      "Klick is the first ‘AI productivity’ stack our security team didn’t fight. Agents stay inside guardrails, and every orchestration leaves a paper trail we can audit.",
    name: "Marcus Chen",
    title: "Head of IT",
    org: "Brightline Health",
    avatar: avatarUrl("MarcusChen"),
  },
  {
    quote:
      "It feels like Linear for execution, Notion for narrative, and Slack for motion—except Klick is the place where they finally agree with each other.",
    name: "Priya Nair",
    title: "Director of Ops",
    org: "Cedar & Co.",
    avatar: avatarUrl("PriyaNair"),
  },
  {
    quote:
      "Our PMs live in docs, engineers live in issues, and GTM lives in chat. Klick’s orchestration layer is the only thing that keeps those worlds in sync without heroics.",
    name: "Jordan Blake",
    title: "Chief of Staff",
    org: "Atlas Robotics",
    avatar: avatarUrl("JordanBlake"),
  },
  {
    quote:
      "We spin up agent playbooks for onboarding, incident response, and launch readiness. What used to take a wiki and ten pings now runs with one command in Klick.",
    name: "Samira Okonkwo",
    title: "Engineering Manager",
    org: "Riverstone",
    avatar: avatarUrl("SamiraOkonkwo"),
  },
  {
    quote:
      "If you’re serious about the agentic era, you need orchestration—not another chat window. Klick is the first tool that treats agents like teammates with roles, not toys.",
    name: "Noah Reeves",
    title: "Founder",
    org: "Signalforge",
    avatar: avatarUrl("NoahReeves"),
  },
] as const;
