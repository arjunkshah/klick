import { testimonials } from "../data/testimonials";
import { Reveal } from "./Reveal";
import { RevealHeadingByWords } from "./RevealHeadingByWords";

export function TestimonialsSection() {
  return (
    <section className="section overflow-hidden bg-theme-bg text-theme-text">
      <div className="container">
        <div className="mx-auto mb-v2 max-w-prose-medium-wide text-center">
          <RevealHeadingByWords
            text="Where teams orchestrate work in the open."
            as="h2"
            className="type-lg mx-auto text-balance"
          />
        </div>
      </div>
      <div className="container">
        <Reveal kind="blurUp" delay={0.2} amount={0.15}>
          <div className="grid grid-cols-1 items-stretch gap-g1 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
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
        </Reveal>
      </div>
    </section>
  );
}
