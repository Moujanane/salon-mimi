import webpush from "web-push";

function getWebPush(): typeof webpush {
  const subject = process.env.VAPID_SUBJECT ?? "mailto:mouj.business@gmail.com";
  const publicKey = process.env.VAPID_PUBLIC_KEY ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY doivent être définis dans les variables d'environnement.",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  const wp = getWebPush();
  await wp.sendNotification(subscription, JSON.stringify(payload));
}

export default webpush;
