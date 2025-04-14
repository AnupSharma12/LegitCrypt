import type { GetItemsItems, Member, Profile } from "$types/global";
import { parseItems, ProfileNetworthCalculator, type Items } from "skyhelper-networth";
import { FAIRY_SOULS } from "../constants/constants";

export async function getMainStats(userProfile: Member, profile: Profile, items: GetItemsItems) {
  const bank = profile.banking?.balance ?? 0;
  const networthOptions = { onlyNetworth: true, includeItemData: false, cachePrices: true };
  const newItems = (await parseItems(userProfile, null as unknown as object)) as Items;
  newItems.museum = items.museumItems;

  const NetworthCalculator = ProfileNetworthCalculator.fromPreParsed(userProfile, newItems as Items, bank);
  const [networth, nonCosmeticNetworth] = await Promise.all([
    // prettier-ignore
    NetworthCalculator.getNetworth(networthOptions),
    NetworthCalculator.getNonCosmeticNetworth(networthOptions)
  ]);

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
    networth: networth,
    nonCosmeticNetworth: nonCosmeticNetworth
  };
}
