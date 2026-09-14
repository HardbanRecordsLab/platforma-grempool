import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function KontaktPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            <span className="text-[#f0a500]">KONTAKT</span>
          </h1>
          <p className="text-[#b8c5d6] text-lg max-w-2xl mx-auto">
            Masz pytanie? Zadzwoń lub napisz do nas. Jesteśmy do Twojej dyspozycji.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DANE <span className="text-[#f0a500]">KONTAKTOWE</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adres</h3>
                    <p className="text-[#b8c5d6]">ul. Kolejowa 5a<br />59-307 Raszówka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Phone className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <a href="tel:+48123456789" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                      +48 123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Mail className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:biuro@grempool.pl" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                      biuro@grempool.pl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Clock className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Godziny otwarcia</h3>
                    <p className="text-[#b8c5d6]">
                      Poniedziałek - Piątek: 7:00 - 17:00<br />
                      Sobota: 8:00 - 14:00<br />
                      Niedziela: zamknięte
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#0f1419] p-8 rounded-2xl border border-[#2a3a4a]">
              <h2 className="text-2xl font-montserrat font-bold mb-6">
                NAPISZ DO <span className="text-[#f0a500]">NAS</span>
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Imię *</label>
                    <input type="text" required className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" placeholder="Jan" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Nazwisko *</label>
                    <input type="text" required className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" placeholder="Kowalski" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Email *</label>
                  <input type="email" required className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" placeholder="jan@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Telefon</label>
                  <input type="tel" className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" placeholder="+48 123 456 789" />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Temat *</label>
                  <select required className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white">
                    <option value="">Wybierz temat...</option>
                    <option value="skup">Skup złomu</option>
                    <option value="transport">Transport</option>
                    <option value="koparki">Usługi koparką</option>
                    <option value="materialy">Materiały budowlane</option>
                    <option value="klimatyzacja">Klimatyzacja</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Wiadomość *</label>
                  <textarea required rows={4} className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" placeholder="Treść wiadomości..." />
                </div>
                <button type="submit" className="w-full btn-primary py-4 rounded-lg font-semibold text-[#0f1419] flex items-center justify-center gap-2">
                  <Send size={20} /> WYŚLIJ WIADOMOŚĆ
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-96 bg-[#2a3a4a]">
        <div className="w-full h-full flex items-center justify-center text-[#b8c5d6]">
          <div className="text-center">
            <MapPin className="text-[#f0a500] size-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Mapa dojazdu</p>
            <p className="text-sm">ul. Kolejowa 5a, 59-307 Raszówka</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
