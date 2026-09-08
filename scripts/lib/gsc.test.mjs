import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGscRows, buildQueryBody } from "./gsc.mjs";

test("buildQueryBody: assemble le corps de requête searchAnalytics", () => {
  const body = buildQueryBody({
    startDate: "2026-08-09",
    endDate: "2026-09-05",
    dimensions: ["query"],
    rowLimit: 100,
  });
  assert.equal(body.startDate, "2026-08-09");
  assert.equal(body.endDate, "2026-09-05");
  assert.deepEqual(body.dimensions, ["query"]);
  assert.equal(body.rowLimit, 100);
});

test("buildQueryBody: sans dimensions => tableau vide, rowLimit par défaut 25000", () => {
  const body = buildQueryBody({ startDate: "a", endDate: "b" });
  assert.deepEqual(body.dimensions, []);
  assert.equal(body.rowLimit, 25000);
});

test("parseGscRows: retourne rows ou [] si absent", () => {
  assert.deepEqual(parseGscRows({ rows: [{ keys: ["x"], clicks: 1 }] }), [
    { keys: ["x"], clicks: 1 },
  ]);
  assert.deepEqual(parseGscRows({}), []);
});
