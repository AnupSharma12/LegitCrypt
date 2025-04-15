import type { GetItemsItems, Member, Profile } from "$types/global";
import { parseItems, ProfileNetworthCalculator, type Items, type NetworthOptions } from "skyhelper-networth";
import { FAIRY_SOULS } from "../constants/constants";
import { getId } from "../helper";

export async function getMainStats(userProfile: Member, profile: Profile, items: GetItemsItems) {
  const bank = profile.banking?.balance ?? 0;
  const networthOptions = { onlyNetworth: false, includeItemData: false, cachePrices: true, sortItems: false } as NetworthOptions;
  const newItems = (await parseItems(userProfile, null as unknown as object)) as Items;
  newItems.museum = items?.museumItems ?? [];

  const NetworthCalculator = ProfileNetworthCalculator.fromPreParsed(userProfile, newItems as Items, bank);
  const [networth, nonCosmeticNetworth] = await Promise.all([
    // prettier-ignore
    NetworthCalculator.getNetworth(networthOptions),
    NetworthCalculator.getNonCosmeticNetworth(networthOptions)
  ]);

  for (const type in networth.types) {
    const allItems = (items[type]?.[type] ?? items[type])?.filter((item) => getId(item).length) ?? [];
    const categoryItems = networth.types[type].items;
    for (const item of categoryItems) {
      console.log(item);
      console.log(categoryItems.indexOf(item));
      console.log(allItems.at(categoryItems.indexOf(item)));
      break;
    }
  }

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
