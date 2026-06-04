import { supabaseAdmin } from "./supabaseAdmin";
import { sendPushNotification } from "./webpush";

export async function sendPushToMimi(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<void> {
  const { data } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, keys");

  if (!data || data.length === 0) return;

  await Promise.allSettled(
    data.map((sub) =>
      sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as { p256dh: string; auth: string },
        },
        payload,
      ).catch((err: { statusCode?: number }) => {
        // Supprimer les abonnements expirés (410 = Gone)
        if (err.statusCode === 410) {
          supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }),
    ),
  );
}
