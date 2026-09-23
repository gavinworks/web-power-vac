import { apply, setAttr, remove } from "@directus/visual-editing";
import { directusUrl } from "./directus";

let isApplied = false;

/**
 * Sends lightweight probe messages to the parent Directus frame until it responds
 * with a "confirm" — proving its postMessage listener is ready. This guarantees
 * that apply() will succeed on the first attempt.
 *
 * For the preview pane (Directus already loaded), resolves on the first probe.
 * For the visual editor module (Directus loading concurrently), waits until ready.
 */
function waitForDirectus(): Promise<void> {
  return new Promise((resolve) => {
    const origin = new URL(directusUrl).origin;

    function onMessage(event: MessageEvent) {
      if (event.origin !== origin) return;
      if (event.data?.action === "confirm") {
        clearInterval(probeInterval);
        window.removeEventListener("message", onMessage);
        resolve();
      }
    }

    window.addEventListener("message", onMessage);

    // Send first probe immediately, then every 500ms
    window.parent.postMessage({ action: "connect" }, directusUrl);
    const probeInterval = setInterval(() => {
      window.parent.postMessage({ action: "connect" }, directusUrl);
    }, 500);
  });
}

async function triggerRevalidation(collection: string): Promise<boolean> {
  try {
    const response = await fetch("/api/revalidate-visual-editor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collection }),
    });

    if (!response.ok) {
      console.error("Revalidation request failed:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("Revalidation successful:", data);
    return true;
  } catch (error) {
    console.error("Revalidation error:", error);
    return false;
  }
}

export async function initializeVisualEditor() {
  if (typeof window === "undefined" || isApplied) return;
  if (window.self === window.top) return;

  try {
    await waitForDirectus();

    const result = await apply({
      directusUrl,
      onSaved: async ({ collection }) => {
        await triggerRevalidation(collection);

        // Delay to ensure Directus has committed the change
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force reload with cache-busting to get fresh content
        const url = new URL(window.location.href);
        url.searchParams.set("_t", Date.now().toString());
        window.location.href = url.toString();
      },
    });

    if (result) {
      isApplied = true;
    }
  } catch (error) {
    console.error("Failed to initialize visual editor:", error);
  }
}

export function cleanupVisualEditor() {
  if (typeof window !== "undefined" && isApplied) {
    remove();
    isApplied = false;
  }
}

export { setAttr };
