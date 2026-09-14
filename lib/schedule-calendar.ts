import type { ServiceOrder } from "@/lib/types";

export type ScheduleDayPhase = "single" | "start" | "middle" | "end";

export interface ScheduleDayEntry {
  order: ServiceOrder;
  phase: ScheduleDayPhase;
}

export function calendarDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupScheduledOrdersByDay(orders: ServiceOrder[]) {
  const grouped = new Map<string, ScheduleDayEntry[]>();

  for (const order of orders) {
    if (!order.scheduledStartAt) continue;
    const start = new Date(order.scheduledStartAt);
    const end = new Date(order.scheduledEndAt ?? order.scheduledStartAt);
    const firstDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    for (const cursor = new Date(firstDay); cursor <= lastDay; cursor.setDate(cursor.getDate() + 1)) {
      const first = calendarDayKey(cursor) === calendarDayKey(firstDay);
      const last = calendarDayKey(cursor) === calendarDayKey(lastDay);
      const phase: ScheduleDayPhase = first && last ? "single" : first ? "start" : last ? "end" : "middle";
      const key = calendarDayKey(cursor);
      grouped.set(key, [...(grouped.get(key) ?? []), { order, phase }]);
    }
  }

  grouped.forEach((entries) => entries.sort((a, b) =>
    a.order.scheduledStartAt!.localeCompare(b.order.scheduledStartAt!)));
  return grouped;
}
