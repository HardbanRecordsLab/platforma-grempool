"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Phone,
  FileText,
  CheckSquare,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { SERVICE_LABELS, STATUS_LABELS } from "@/lib/supabase";
import { fetchCalendarEvents, pad, toISODate, type DayEvents } from "@/lib/calendar-data";

const daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
const months = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

export default function KalendarzPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toISODate(today));
  const [eventsByDay, setEventsByDay] = useState<Record<string, DayEvents>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ tytul: "", opis: "", godzina: "" });
  const [saving, setSaving] = useState(false);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const refresh = async () => {
    setLoading(true);
    try {
      const map = await fetchCalendarEvents(toISODate(monthStart), toISODate(monthEnd));
      setEventsByDay(map);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać kalendarza");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const todayISO = toISODate(today);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const selectedEvents = eventsByDay[selectedDate] ?? { orders: [], leads: [], tasks: [] };
  const selectedDayLabel = (() => {
    const d = new Date(selectedDate + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]}`;
  })();

  const openTaskModal = () => {
    setTaskForm({ tytul: "", opis: "", godzina: "" });
    setTaskModalOpen(true);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.tytul.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tytul: taskForm.tytul,
          opis: taskForm.opis || null,
          data: selectedDate,
          godzina: taskForm.godzina || null,
          status: "do_zrobienia",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nie udało się dodać zadania");
      setTaskModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się dodać zadania");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Usunąć to zadanie?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Kalendarz</h1>
        <button
          onClick={openTaskModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2"
        >
          <Plus size={16} /> Dodaj zadanie
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-montserrat font-bold flex items-center gap-2">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              {loading && <Loader2 size={16} className="animate-spin text-[#f0a500]" />}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[#b8c5d6] py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(day)}`;
              const isToday = iso === todayISO;
              const isSelected = iso === selectedDate;
              const dayEvents = eventsByDay[iso];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(iso)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                    isSelected ? "bg-[#f0a500] text-[#0f1419]" : isToday ? "bg-[#f0a500]/20 text-[#f0a500]" : "hover:bg-[#2a3a4a]"
                  }`}
                >
                  <span className="font-semibold">{day}</span>
                  {dayEvents && (
                    <div className="flex gap-1 mt-1">
                      {dayEvents.orders.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      {dayEvents.leads.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {dayEvents.tasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#f0a500]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Schedule */}
        <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <h3 className="text-lg font-montserrat font-bold mb-4">{selectedDayLabel}</h3>

          <div className="space-y-4">
            {selectedEvents.orders.length === 0 && selectedEvents.leads.length === 0 && selectedEvents.tasks.length === 0 && !loading && (
              <p className="text-sm text-[#b8c5d6]">Brak wydarzeń w tym dniu.</p>
            )}

            {selectedEvents.orders.map((order) => (
              <div key={order.id} className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-green-400" />
                  <span className="text-sm font-semibold">{new Date(order.termin).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-xs text-[#b8c5d6] ml-auto">Zlecenie {order.numer}</span>
                </div>
                <h4 className="font-semibold mb-1">{SERVICE_LABELS[order.usluga] ?? order.usluga}</h4>
                <p className="text-sm text-[#b8c5d6] mb-2">{STATUS_LABELS[order.status] ?? order.status}</p>
                <div className="flex items-center gap-1 text-xs text-[#b8c5d6]">
                  <MapPin size={12} /> {order.lokalizacja}
                </div>
              </div>
            ))}

            {selectedEvents.leads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-blue-400" />
                  <span className="text-xs text-[#b8c5d6] ml-auto">Zapytanie {lead.numer}</span>
                </div>
                <h4 className="font-semibold mb-1">
                  {SERVICE_LABELS[lead.usluga] ?? lead.usluga} — {lead.klient_imie} {lead.klient_nazwisko}
                </h4>
                <div className="flex items-center gap-4 text-xs text-[#b8c5d6]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {lead.lokalizacja}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {lead.klient_telefon}
                  </span>
                </div>
              </div>
            ))}

            {selectedEvents.tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg border-l-4 border-l-[#f0a500] bg-[#f0a500]/10 group">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare size={14} className="text-[#f0a500]" />
                  {task.godzina && <span className="text-sm font-semibold">{task.godzina.slice(0, 5)}</span>}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
                <h4 className="font-semibold mb-1">{task.tytul}</h4>
                {task.opis && <p className="text-sm text-[#b8c5d6]">{task.opis}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={openTaskModal}
            className="w-full mt-4 p-3 rounded-lg border-2 border-dashed border-[#2a3a4a] text-[#b8c5d6] hover:border-[#f0a500] hover:text-[#f0a500] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Dodaj zadanie na ten dzień
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4a]">
              <h2 className="text-xl font-montserrat font-bold">Nowe zadanie — {selectedDayLabel}</h2>
              <button onClick={() => setTaskModalOpen(false)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Tytuł *</label>
                <input
                  required
                  value={taskForm.tytul}
                  onChange={(e) => setTaskForm({ ...taskForm, tytul: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  placeholder="np. Przegląd busa 1"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Godzina</label>
                <input
                  type="time"
                  value={taskForm.godzina}
                  onChange={(e) => setTaskForm({ ...taskForm, godzina: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Notatka</label>
                <textarea
                  rows={3}
                  value={taskForm.opis}
                  onChange={(e) => setTaskForm({ ...taskForm, opis: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />} Dodaj zadanie
                </button>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-semibold border border-[#2a3a4a] text-[#b8c5d6] hover:text-white"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
