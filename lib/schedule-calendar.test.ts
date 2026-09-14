import { describe, expect, it } from "vitest";
import { groupScheduledOrdersByDay } from "./schedule-calendar";
import type { ServiceOrder } from "./types";

function order(start: Date, end: Date): ServiceOrder {
  return {
    id: "order-1", tenantId: "tenant-1", customerId: "customer-1", serviceIds: [], quoteLines: [],
    title: "Maintenance", status: "OPEN", priority: "NORMAL", openedAt: start.toISOString(),
    scheduledStartAt: start.toISOString(), scheduledEndAt: end.toISOString(),
    createdAt: start.toISOString(), updatedAt: start.toISOString(),
  };
}

describe("groupScheduledOrdersByDay", () => {
  it("keeps a same-day appointment in one calendar cell", () => {
    const start = new Date(2026, 8, 11, 9);
    const grouped = groupScheduledOrdersByDay([order(start, new Date(2026, 8, 11, 12))]);
    expect([...grouped.keys()]).toEqual(["2026-09-11"]);
    expect(grouped.get("2026-09-11")?.[0].phase).toBe("single");
  });

  it("fills every day from the start through the end of a reservation", () => {
    const start = new Date(2026, 8, 11, 18, 48);
    const grouped = groupScheduledOrdersByDay([order(start, new Date(2026, 8, 14, 10))]);
    expect([...grouped.keys()]).toEqual(["2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14"]);
    expect([...grouped.values()].map((entries) => entries[0].phase))
      .toEqual(["start", "middle", "middle", "end"]);
  });
});
