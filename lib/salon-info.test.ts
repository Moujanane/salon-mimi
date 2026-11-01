// lib/salon-info.test.ts
//
// Horaires du salon : une seule source (SALON.hours), confirmée par Mouj le
// 31 oct 2026 : tous les jours de 9h à 23h. Le JSON-LD, llms.txt et le texte
// visible doivent tous dire la même chose.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { SALON, openingHoursLd } from "./salon-info";
import { llmsTxt } from "./llms";

const SEPT_JOURS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

test("horaires : 7 jours sur 7, de 09:00 à 23:00", () => {
  assert.deepEqual([...SALON.hours.days], SEPT_JOURS);
  assert.equal(SALON.hours.opens, "09:00");
  assert.equal(SALON.hours.closes, "23:00");
});

test("JSON-LD : openingHoursSpecification reprend SALON.hours", () => {
  const spec = openingHoursLd();
  assert.equal(spec.length, 1);
  assert.equal(spec[0]["@type"], "OpeningHoursSpecification");
  assert.deepEqual([...spec[0].dayOfWeek], SEPT_JOURS);
  assert.equal(spec[0].opens, "09:00");
  assert.equal(spec[0].closes, "23:00");
});

test("llms.txt annonce les mêmes horaires", () => {
  assert.match(llmsTxt(), /Horaires : tous les jours de 9h à 23h/);
});
