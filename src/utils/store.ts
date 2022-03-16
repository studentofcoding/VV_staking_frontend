import { atom } from "jotai"

import { Config } from './stake';

export const configAtom = atom(new Config({ 
    isInitialized: 0,
    updateAuthority: "null",
    rewardMint: "null",
    rewardVault: "null",
    reserved_1: 0,
    reserved_2: 0,
    unstakeDuration: 0,
    stakeRequiredLevel1: 0,
    stakeRequiredLevel2: 0,
    stakeRequiredLevel3: 0,
    stakeRequiredLevel4: 0,
    stakeRequiredLevel5: 0,
    rewardRatePerToken_level1: 0,
    rewardRatePerToken_level2: 0,
    rewardRatePerToken_level3: 0,
    rewardRatePerToken_level4: 0,
    rewardRatePerToken_level5: 0,
    stakeCount: 0,
    creator_key: "null",
    use_rarity: 0,
  }));