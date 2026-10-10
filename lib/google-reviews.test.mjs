import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidRating } from "./google-reviews-validation.ts";

test("isValidRating: accepte une note et un total positifs", () => {
  assert.equal(isValidRating(4.5, 6), true);
  assert.equal(isValidRating(5, 1), true);
});

test("isValidRating: rejette rating 0 ou négatif", () => {
  assert.equal(isValidRating(0, 6), false);
  assert.equal(isValidRating(-1, 6), false);
});

test("isValidRating: rejette un rating hors plage ]0, 5]", () => {
  assert.equal(isValidRating(5.1, 6), false);
  assert.equal(isValidRating(10, 6), false);
});

test("isValidRating: rejette reviewCount 0, négatif ou absent", () => {
  assert.equal(isValidRating(4.5, 0), false);
  assert.equal(isValidRating(4.5, -3), false);
  assert.equal(isValidRating(4.5, undefined), false);
});

test("isValidRating: rejette des valeurs non numériques (réponse API malformée)", () => {
  assert.equal(isValidRating(null, 6), false);
  assert.equal(isValidRating("4.5", 6), false);
  assert.equal(isValidRating(4.5, "6"), false);
});
