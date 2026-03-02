import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REMINDER_MINUTES = [15, 5]; // Remind 15min and 5min before
const CHECK_INTERVAL_MS = 60_000; // Check every minute
const NOTIFIED_KEY = "puntualometro_notified_events";

function getNotified(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "{}");
  } catch {
    return {};
  }
}

function markNotified(eventId: string, minutesBefore: number) {
  const notified = getNotified();
  if (!notified[eventId]) notified[eventId] = [];
  notified[eventId].push(minutesBefore);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
}

function wasNotified(eventId: string, minutesBefore: number): boolean {
  const notified = getNotified();
  return notified[eventId]?.includes(minutesBefore) ?? false;
}

async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: title, // prevent duplicates
    });
  }
}

export function useEventReminders() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkUpcoming = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const endWindow = new Date(now.getTime() + 20 * 60_000); // next 20 minutes

    const { data: events } = await supabase
      .from("events")
      .select("id, title, start_time")
      .gte("start_time", now.toISOString())
      .lte("start_time", endWindow.toISOString())
      .order("start_time", { ascending: true });

    if (!events || events.length === 0) return;

    for (const event of events) {
      const start = new Date(event.start_time);
      const diffMin = (start.getTime() - now.getTime()) / 60_000;

      for (const reminder of REMINDER_MINUTES) {
        if (diffMin <= reminder && diffMin > reminder - 1.5 && !wasNotified(event.id, reminder)) {
          const timeStr = start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
          showNotification(
            `⏰ ${event.title} en ${Math.round(diffMin)} min`,
            `Tu evento comienza a las ${timeStr}. ¡No llegues tarde!`
          );
          markNotified(event.id, reminder);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Request permission on mount
    requestPermission();

    // Initial check
    checkUpcoming();

    // Periodic check
    intervalRef.current = setInterval(checkUpcoming, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, checkUpcoming]);
}
