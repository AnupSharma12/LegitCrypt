import type { GetItemsItems, Member, Profile } from "$types/global";
import { parseItems, ProfileNetworthCalculator } from "skyhelper-networth";
import { FAIRY_SOULS } from "../constants/constants";

export async function getMainStats(userProfile: Member, profile: Profile, items: GetItemsItems) {
  const bank = profile.banking?.balance ?? 0;
  const networthOptions = { onlyNetworth: true, includeItemData: false, cachePrices: true };
  /*
  'armor',
  'equipment',
  'wardrobe',
  'inventory',
  'enderchest',
  'accessories',
  'personal_vault',
  'fishing_bag',
  'potion_bag',
  'sacks_bag',
  'candy_inventory',
  'carnival_mask_inventory',
  'quiver',
  'storage',
  'museum',
  'sacks',
  'essence',
  'pets'
  */
  const timeNowv2 = Date.now();
  const newItems = await parseItems(userProfile, null);
  newItems.museum = items.museumItems;
  console.log(`Parsing items took ${Date.now() - timeNowv2}ms`);

  const timeNow = Date.now();
  const NetworthCalculator = ProfileNetworthCalculator.fromPreParsed(userProfile, newItems, bank);
  const [networth, nonCosmeticNetworth] = await Promise.all([
    // prettier-ignore
    NetworthCalculator.getNetworth(networthOptions),
    NetworthCalculator.getNonCosmeticNetworth(networthOptions)
  ]);

  console.log(`Networth calculation took ${Date.now() - timeNow}ms`);

  return {
    joined: userProfile.profile?.first_join ?? 0,
    cookieBuffActive: userProfile.profile?.cookie_buff_active ?? false,
    purse: userProfile.currencies?.coin_purse ?? 0,
    bank: profile.banking?.balance ?? 0,
    personalBank: userProfile.profile?.bank_account ?? 0,
    fairySouls: {
      found: userProfile.fairy_soul?.total_collected ?? 0,
      total: FAIRY_SOULS[profile.game_mode ?? "normal"] ?? FAIRY_SOULS["normal"]
    },
    networth: {
      ...networth,
      nonCosmeticNetworth: nonCosmeticNetworth.networth,
      unsoulboundNonCosmeticNetworth: nonCosmeticNetworth.unsoulboundNetworth
    }
  };
}
