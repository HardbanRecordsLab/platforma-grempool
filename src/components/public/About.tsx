import { BUSINESS } from "@/lib/site";

export default function About() {
  return (
    <section id="o-nas" className="scroll-mt-24 py-20 bg-[#0a0a0a] border-y border-[#5c4716]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-8">
          O <span className="text-[#f5b52c]">NAS</span>
        </h2>
        <p className="text-[#e8dfcc] mb-4 leading-relaxed">
          GREMPOOL Maria Muczyńska działa w Raszówce na Dolnym Śląsku od 2013 roku. Zaczynaliśmy od skupu
          złomu, a z czasem rozszerzyliśmy działalność o transport, prace koparką, rozbiórki, sprzedaż
          materiałów budowlanych z odzysku oraz usługi brukarsko-tynkarskie. Nasza firma jest zweryfikowana
          w rejestrze GUS i figuruje w ewidencji działalności gospodarczej pod numerem NIP {BUSINESS.taxId.replace(/^(\d{3})(\d{2})(\d{2})(\d{3})$/, "$1-$2-$3-$4")}.
        </p>
        <p className="text-[#e8dfcc] leading-relaxed">
          Obsługujemy głównie okolice Lubina, Legnicy, Głogowa i Polkowic, ale dojeżdżamy też dalej na
          terenie Dolnego Śląska. Mamy własny tabor pojazdów i sprzęt do prac ziemnych, więc odbiór,
          transport i realizację zlecenia załatwiamy sami, bez pośredników. Materiały z rozbiórek segregujemy
          i sprzedajemy dalej, a każde zlecenie wyceniamy indywidualnie - bez ukrytych kosztów i niespodzianek
          w trakcie pracy.
        </p>
      </div>
    </section>
  );
}
