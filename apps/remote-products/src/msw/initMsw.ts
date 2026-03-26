let started = false;

export async function ensureMsw(): Promise<void> {
  if (started) return;
  started = true;
  const { worker } = await import("./browser");
  await worker.start({
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });
}
