"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getCalendarTasksAction } from "@/components/tasks/actions";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarTask {
  id: number;
  title: string;
  start: Date;
  end: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
  project?: {
    id: number;
    name: string;
    color: string;
  };
}

interface TaskCalendarProps {
  token: string;
  onTaskClick?: (taskId: number) => void;
}

const priorityColors = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
};

export default function TaskCalendar({ token, onTaskClick }: TaskCalendarProps) {
  const [events, setEvents] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

  const loadTasks = useCallback(async (date: Date) => {
    setLoading(true);
    const start = startOfMonth(subMonths(date, 1));
    const end = endOfMonth(addMonths(date, 1));

    const response = await getCalendarTasksAction(
      token,
      start.toISOString(),
      end.toISOString()
    );

    if (response.success && response.tasks) {
      const calendarEvents = response.tasks.map((task: any) => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end),
      }));
      setEvents(calendarEvents);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadTasks(currentDate);
  }, [currentDate, loadTasks]);

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleSelectEvent = (event: CalendarTask) => {
    onTaskClick?.(event.id);
  };

  const eventStyleGetter = (event: CalendarTask) => {
    const backgroundColor = event.project?.color || priorityColors[event.priority];
    const style = {
      backgroundColor,
      borderRadius: "4px",
      opacity: event.completed ? 0.6 : 1,
      color: "white",
      border: "none",
      display: "block",
      textDecoration: event.completed ? "line-through" : "none",
    };
    return { style };
  };

  const CustomToolbar = ({ date, onNavigate, label }: any) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("PREV")}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("NEXT")}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
        >
          Hoy
        </Button>
      </div>

      <h2 className="text-lg font-semibold capitalize">{label}</h2>

      <div className="flex items-center gap-2">
        <Button
          variant={view === Views.MONTH ? "default" : "outline"}
          size="sm"
          onClick={() => setView(Views.MONTH)}
        >
          Mes
        </Button>
        <Button
          variant={view === Views.WEEK ? "default" : "outline"}
          size="sm"
          onClick={() => setView(Views.WEEK)}
        >
          Semana
        </Button>
        <Button
          variant={view === Views.DAY ? "default" : "outline"}
          size="sm"
          onClick={() => setView(Views.DAY)}
        >
          Día
        </Button>
      </div>
    </div>
  );

  const messages = {
    today: "Hoy",
    previous: "Anterior",
    next: "Siguiente",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "No hay tareas en este rango",
    showMore: (total: number) => `+ ${total} más`,
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calendario de Tareas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={view}
              onView={(v) => setView(v)}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: CustomToolbar,
              }}
              messages={messages}
              culture="es"
              popup
              selectable
            />
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Prioridad:</span>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: priorityColors.high }}
            />
            <span className="text-xs">Alta</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: priorityColors.medium }}
            />
            <span className="text-xs">Media</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: priorityColors.low }}
            />
            <span className="text-xs">Baja</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
