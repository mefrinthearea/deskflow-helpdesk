import test from "node:test";
import assert from "node:assert/strict";
import { filterAndSortTickets } from "../src/utils/tickets.js";

const tickets = [
  { id: "DF-0001", subject: "WiFi problem", customer: "Anna",
    category: "Connectivity", description: "Internet unavailable",
    ownerId: 1, status: "Open", priority: "High",
    updatedAt: "2026-11-20T10:00:00Z" },
  { id: "DF-0002", subject: "Keyboard problem", customer: "Nika",
    category: "Hardware", description: "Broken keys",
    ownerId: 2, status: "Resolved", priority: "Low",
    updatedAt: "2026-11-22T10:00:00Z" },
  { id: "DF-0003", subject: "Password reset", customer: "Anna",
    category: "Account access", description: "Cannot login",
    ownerId: 1, status: "In progress", priority: "Medium",
    updatedAt: "2026-11-21T10:00:00Z" }
];

const search = (options = {}) => filterAndSortTickets(tickets, {
  mine: false, userId: 1, query: "", status: "",
  priority: "", sort: "newest", ...options
});

test("search ignores case", () => {
  assert.equal(search({ query: "wifi" }).length, 1);
});

test("search matches ticket ID", () => {
  assert.equal(search({ query: "DF-0003" })[0].id, "DF-0003");
});

test("filters by status", () => {
  assert.equal(search({ status: "Resolved" })[0].id, "DF-0002");
});

test("filters by priority", () => {
  assert.equal(search({ priority: "High" })[0].id, "DF-0001");
});

test("customer only sees own tickets", () => {
  assert.equal(search({ mine: true, userId: 1 }).length, 2);
});

test("sorts newest first", () => {
  assert.equal(search()[0].id, "DF-0002");
});

test("sorts oldest first", () => {
  assert.equal(search({ sort: "oldest" })[0].id, "DF-0001");
});

test("sorts by priority", () => {
  assert.equal(search({ sort: "priority" })[0].id, "DF-0001");
});

test("does not mutate original array", () => {
  const before = tickets.map(t => t.id);
  search({ sort: "priority" });
  assert.deepEqual(tickets.map(t => t.id), before);
});
