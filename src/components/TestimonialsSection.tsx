import { avatarUrl } from "../site";

const items = [
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
];

export function TestimonialsSection() {
  return (
    <section className="section overflow-hidden bg-theme-bg text-theme-text">
      <div className="container">
        <div className="mx-auto mb-v2.5 max-w-prose-medium-wide text-center">
          <h2 className="type-lg text-balance mx-auto">Where teams orchestrate work in the open.</h2>
        </div>
      </div>
      <div className="container">
        <div className="grid grid-cols-1 items-stretch gap-g1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.name}>
              <div className="card relative flex h-full min-h-[180px] w-full shrink-0 flex-col">
                <figure className="flex h-full flex-col">
                  <blockquote className="grow overflow-hidden">
                    <p className="type-base line-clamp-4 whitespace-pre-wrap md:line-clamp-5">
                      “{t.quote}”
                    </p>
                  </blockquote>
                  <div className="mt-v2 flex items-center space-x-grid-gap">
                    <div className="avatar-border-container h-[2.5rem] w-[2.5rem] shrink-0">
                      <img
                        src={t.avatar}
                        alt=""
                        width={42}
                        height={42}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <figcaption>
                      <div className="type-sm">
                        {t.name}{" "}
                        <span className="type-sm text-theme-text-sec block">
                          {t.title}, {t.org}
                        </span>
                      </div>
                    </figcaption>
                  </div>
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
