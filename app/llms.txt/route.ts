// app/llms.txt/route.ts
//
// Sert /llms.txt : résumé du site pour les moteurs IA, généré depuis le
// catalogue (lib/llms.ts). Le middleware ignore les chemins contenant un point,
// donc cette route n'est ni redirigée vers une langue ni bloquée.
import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
