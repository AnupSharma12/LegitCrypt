import { getArmor } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, cookies }) => {
  const { type, color } = params;

  try {
    const packs = JSON.parse(cookies.get("disabledPacks") || "[]");
    const newTexture = !packs.includes("VANILLA_LTS");
    const attachment = await getArmor(type, color, newTexture);

    return new Response(attachment, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
