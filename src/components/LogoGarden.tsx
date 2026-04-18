const logos = [
  { file: "Stripe.svg", label: "Stripe" },
  { file: "OpenAI.svg", label: "OpenAI" },
  { file: "Linear.svg", label: "Linear" },
  { file: "Datadog.svg", label: "Datadog" },
  { file: "Nvidia.svg", label: "Nvidia" },
  { file: "Figma.svg", label: "Figma" },
  { file: "Ramp.svg", label: "Ramp" },
  { file: "Adobe.svg", label: "Adobe" },
];

export function LogoGarden() {
  return (
    <section className="section bg-theme-bg pb-v1.5 pt-0 text-theme-text" id="logo-garden">
      <div className="container flex flex-col items-center text-center">
        <h2 className="type-sm mb-v2">
          Trusted by product, ops, and engineering teams who ship every week
        </h2>
        <div className="logo-garden-responsive-8 w-full">
          {logos.map(({ file, label }) => (
            <div key={file} className="relative flex items-center justify-center">
              <div className="card-border bg-theme-card-hex flex h-[4rem] w-full items-center justify-center rounded-xs px-g0.75 sm:h-[4.5rem] md:h-[6.25rem]">
                <span className="contents" role="img" aria-label={label}>
                  <img
                    src={`/logos/${file}`}
                    alt=""
                    className="h-[2rem] w-auto object-contain sm:h-[2.25rem] md:h-[2.5rem]"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
