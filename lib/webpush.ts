import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:mouj.business@gmail.com",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? "",
);

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}

export default webpush;
