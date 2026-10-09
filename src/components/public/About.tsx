import { getSiteSettings } from "@/lib/site-settings-server";

export default async function About() {
  const { about } = await getSiteSettings();
  return (
    <section id="o-nas" className="scroll-mt-24 py-20 bg-[#0a0a0a] border-y border-[#5c4716]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-8">
          O <span className="text-[#f5b52c]">NAS</span>
        </h2>
        {about.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-[#e8dfcc] mb-4 last:mb-0 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
