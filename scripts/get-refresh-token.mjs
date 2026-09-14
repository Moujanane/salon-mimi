#!/usr/bin/env node
// Script one-shot : obtient un refresh token OAuth Google pour un client
// "Application de bureau" (loopback flow, RFC 8252). Usage :
//
//   GSC_OAUTH_CLIENT_ID=... GSC_OAUTH_CLIENT_SECRET=... node scripts/get-refresh-token.mjs
//
// Ouvre un navigateur, demande la connexion Google, récupère le refresh
// token sur http://localhost:<port>/callback et l'affiche dans le terminal.
// Ne rien coller dans un chat — copier directement dans .env.seo / Railway.

import { OAuth2Client } from "google-auth-library";
import http from "node:http";
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, "..", ".env.seo.tmp");

function loadCreds() {
  if (process.env.GSC_OAUTH_CLIENT_ID && process.env.GSC_OAUTH_CLIENT_SECRET) {
    return {
      clientId: process.env.GSC_OAUTH_CLIENT_ID,
      clientSecret: process.env.GSC_OAUTH_CLIENT_SECRET,
    };
  }
  if (!fs.existsSync(credsPath)) {
    console.error(
      `Aucune variable d'env et fichier introuvable : ${credsPath}\n` +
        `Crée-le avec deux lignes :\n` +
        `GSC_OAUTH_CLIENT_ID=...\nGSC_OAUTH_CLIENT_SECRET=...\n`,
    );
    process.exit(1);
  }
  const content = fs.readFileSync(credsPath, "utf8");
  const clientId = content.match(/^GSC_OAUTH_CLIENT_ID=(.*)$/m)?.[1]?.trim();
  const clientSecret = content
    .match(/^GSC_OAUTH_CLIENT_SECRET=(.*)$/m)?.[1]
    ?.trim();
  if (!clientId || !clientSecret) {
    console.error(
      `${credsPath} doit contenir GSC_OAUTH_CLIENT_ID= et GSC_OAUTH_CLIENT_SECRET=`,
    );
    process.exit(1);
  }
  return { clientId, clientSecret };
}

const { clientId, clientSecret } = loadCreds();

const PORT = 51789;
const redirectUri = `http://localhost:${PORT}/callback`;
const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith("/callback")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Erreur OAuth : ${error}`);
    console.error(`\nErreur OAuth : ${error}`);
    server.close();
    process.exit(1);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Authentification réussie, tu peux fermer cet onglet.");

    if (tokens.refresh_token) {
      const outPath = path.join(__dirname, "..", ".env.seo.refresh-token.tmp");
      fs.writeFileSync(outPath, tokens.refresh_token + "\n", { mode: 0o600 });
      console.log(`\nRefresh token écrit dans ${outPath}`);
    } else {
      console.log(
        "\nAucun refresh_token renvoyé : ce compte a probablement déjà autorisé " +
          "ce client. Révoque l'accès sur https://myaccount.google.com/permissions " +
          "puis relance ce script.",
      );
    }
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Erreur lors de l'échange du code.");
    console.error("\nErreur lors de l'échange du code :", err.message);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`Ouverture du navigateur pour l'autorisation Google...`);
  console.log(`Si rien ne s'ouvre, va sur :\n${authUrl}\n`);
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${opener} "${authUrl}"`);
});
