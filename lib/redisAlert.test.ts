// lib/redisAlert.test.ts
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { alertRedisFailure, _resetAlertStateForTests } from "./redisAlert";

/** Laisse la promesse interne (non awaitée par alertRedisFailure) se résoudre. */
function flush(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

test("premier échec d'un type : un e-mail est envoyé", async () => {
  _resetAlertStateForTests();
  const sent: string[] = [];
  alertRedisFailure("anti-spam", new Error("boom"), {
    now: () => 1000,
    sendEmail: async (subject) => {
      sent.push(subject);
    },
  });
  await flush();
  assert.equal(sent.length, 1);
});

test("deux échecs rapprochés du même type : un seul e-mail (débounce 15 min)", async () => {
  _resetAlertStateForTests();
  const sent: string[] = [];
  const sendEmail = async (subject: string) => {
    sent.push(subject);
  };
  alertRedisFailure("pin-mimi", new Error("1"), { now: () => 1000, sendEmail });
  alertRedisFailure("pin-mimi", new Error("2"), {
    now: () => 1000 + 60_000,
    sendEmail,
  });
  await flush();
  assert.equal(sent.length, 1);
});

test("même type, après la fenêtre de 15 minutes : un nouvel e-mail", async () => {
  _resetAlertStateForTests();
  const sent: string[] = [];
  const sendEmail = async (subject: string) => {
    sent.push(subject);
  };
  alertRedisFailure("pin-mimi", new Error("1"), { now: () => 0, sendEmail });
  alertRedisFailure("pin-mimi", new Error("2"), {
    now: () => 16 * 60 * 1000,
    sendEmail,
  });
  await flush();
  assert.equal(sent.length, 2);
});

test("deux types de panne différents ne partagent pas le même débounce", async () => {
  _resetAlertStateForTests();
  const sent: string[] = [];
  const sendEmail = async (subject: string) => {
    sent.push(subject);
  };
  alertRedisFailure("anti-spam", new Error("1"), { now: () => 1000, sendEmail });
  alertRedisFailure("pin-mimi", new Error("2"), { now: () => 1000, sendEmail });
  await flush();
  assert.equal(sent.length, 2);
});

test("un échec d'envoi de l'e-mail n'est jamais propagé à l'appelant", async () => {
  _resetAlertStateForTests();
  assert.doesNotThrow(() => {
    alertRedisFailure("anti-spam", new Error("1"), {
      now: () => 1000,
      sendEmail: async () => {
        throw new Error("Resend indisponible");
      },
    });
  });
  await flush();
});
