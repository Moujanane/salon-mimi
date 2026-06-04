self.addEventListener("push", function (event) {
  var data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Mimi Coiffure", body: event.data ? event.data.text() : "Nouvelle notification" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Mimi Coiffure", {
      body: data.body || "",
      icon: "/mimi-icon-192.png",
      badge: "/mimi-icon-192.png",
      data: { url: data.url || "/mimi.html" },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/mimi.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes("/mimi") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
