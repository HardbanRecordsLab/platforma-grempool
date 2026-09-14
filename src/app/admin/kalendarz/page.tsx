"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MapPin,
  Clock,
  Truck,
  Wrench
} from "lucide-react";

const events = [
  {
    id: 1,
    title: "Odbiór złomu",
    client: "Jan Kowalski",
    time: "08:00 - 10:00",
    location: "Raszówka",
    type: "skup",
    worker: "Marek",
    vehicle: "Bus 1",
  },
  {
    id: 2,
    title: "Transport materiału",
    client: "Firma XYZ",
    time: "10:30 - 13:00",
    location: "Legnica",
    type: "transport",
    worker: "Piotr",
    vehicle: "Ciężarówka",
  },
  {
    id: 3,
    title: "Prace koparką",
    client: "Anna Nowak",
    time: "13:00 - 16:00",
    location: "Lubin",
    type: "koparka",
    worker: "Jan",
    machine: "Koparka #01",
  },
  {
    id: 4,
    title: "Klimatyzacja auta",
    client: "Marek Wiśniewski",
    time: "14:00 - 15:00",
    location: "Raszówka",
    type: "klimatyzacja",
    worker: "Tomek",
  },
];

const typeColors: Record<string, string> = {
  skup: "border-l-green-500 bg-green-500/10",
  transport: "border-l-blue-500 bg-blue-500/10",
  koparka: "border-l-orange-500 bg-orange-500/10",
  rozbiorka: "border-l-red-500 bg-red-500/10",
  klimatyzacja: "border-l-cyan-500 bg-cyan-500/10",
  materialy: "border-l-purple-500 bg-purple-500/10",
};

const daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
const months = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

export default function KalendarzPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 13)); // September 13, 2026
  const [selectedDate, setSelectedDate] = useState(13);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Kalendarz</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Nowe zlecenie
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-montserrat font-bold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[#b8c5d6] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 13 && currentDate.getMonth() === 8 && currentDate.getFullYear() === 2026;
              const isSelected = day === selectedDate;
              const hasEvents = day === 13 || day === 14 || day === 15;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                    isSelected ? 'bg-[#f0a500] text-[#0f1419]' :
                    isToday ? 'bg-[#f0a500]/20 text-[#f0a500]' :
                    'hover:bg-[#2a3a4a]'
                  }`}
                >
                  <span className="font-semibold">{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="flex gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Schedule */}
        <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <h3 className="text-lg font-montserrat font-bold mb-4">
            {selectedDate} {months[currentDate.getMonth()]}
          </h3>
          
          <div className="space-y-4">
            {events.map((event) => (
              <div 
                key={event.id} 
                className={`p-4 rounded-lg border-l-4 ${typeColors[event.type]} transition-colors hover:opacity-80`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-[#f0a500]" />
                  <span className="text-sm font-semibold">{event.time}</span>
                </div>
                <h4 className="font-semibold mb-1">{event.title}</h4>
                <p className="text-sm text-[#b8c5d6] mb-2">{event.client}</p>
                <div className="flex items-center gap-4 text-xs text-[#b8c5d6]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                  </span>
                  {event.vehicle && (
                    <span className="flex items-center gap-1">
                      <Truck size={12} />
                      {event.vehicle}
                    </span>
                  )}
                  {event.machine && (
                    <span className="flex items-center gap-1">
                      <Wrench size={12} />
                      {event.machine}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 p-3 rounded-lg border-2 border-dashed border-[#2a3a4a] text-[#b8c5d6] hover:border-[#f0a500] hover:text-[#f0a500] transition-colors flex items-center justify-center gap-2">
            <Plus size={16} />
            Dodaj zlecenie
          </button>
        </div>
      </div>
    </div>
  );
}
