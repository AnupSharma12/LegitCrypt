import { dev } from "$app/environment";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import { init as resourcesInit } from "$lib/server/custom_resources";
import { indexCollectons } from "$lib/server/db/mongo/index-collections";
import { intializeNEURepository, parseNEURepository } from "$lib/server/helper/NotEnoughUpdates/parseNEURepository";
import { contextLinesIntegration, extraErrorDataIntegration, handleErrorWithSentry, sentryHandle, init as sentryInit } from "@sentry/sveltekit";
import type { ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { getPrices, NetworthManager, UpdateManager } from "skyhelper-networth";
import { startMongo } from "./lib/server/db/mongo";
import { startRedis } from "./lib/server/db/redis";

sentryInit({
  dsn: PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,

  integrations: [contextLinesIntegration(), extraErrorDataIntegration()],

  // Disable Sentry during development
  enabled: !dev,
  environment: dev ? "development" : "production"
});

export const init: ServerInit = async () => {
  console.log("[SkyCrypt] Starting...");
  const timeNow = performance.now();

  await intializeNEURepository().then(() => {
    parseNEURepository();
  });

  await resourcesInit();

  await startMongo().then(() => {
    console.log("[MONGO] MongoDB successfully connected");

    indexCollectons();
  });

  await startRedis().then(() => {
    console.log("[REDIS] Redis successfully connected");
  });

  await getPrices(true).then(() => {
    console.log("[NETWORTH] Prices successfully fetched!");
  });

  NetworthManager.setItemsInterval(1000 * 60 * 60 * 24);
  NetworthManager.updateItems(3, 1000, 0).then(() => {
    console.log("[NETWORTH] Items successfully fetched!");
  });

  UpdateManager.disable();

  console.log(`[SkyCrypt] Started in ${(performance.now() - timeNow).toFixed(2)}ms`);
};
export const handleError = handleErrorWithSentry();
export const handle = sequence(sentryHandle());
