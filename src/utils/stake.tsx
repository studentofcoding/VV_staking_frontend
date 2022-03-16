import { deserializeUnchecked, serialize } from "borsh";
import {
  StringPublicKey,
  STAKE_PROGRAM_ID,
  SPL_TOKEN_PUBKEY,
  SPL_ASS_TOKEN_PUBKEY,
  TOKEN_METADATA_PUBKEY,
  toPublicKey,
  SOL_VAULT_PUBKEY,
  STAKE_CONFIG_PUBKEY,
} from "./ids";
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
  Connection,
} from "@solana/web3.js";

export * from "./borsh";

export const MAX_CONFIG_LENGTH = 1
+ 1     //Isinitialize bool
+ 32    //Update authority
+ 32    //rewardMint
+ 32    //rewardVault
+ 8    //reserved 1
+ 8    //reserved 2
+ 8    //unstakeDuration
+ 8    //Reserved int
+ 2 //pub stakeRequiredLevel1: u16, How much count to get this level
+ 2 //pub stakeRequiredLevel2: u16, 
+ 2 //pub stakeRequiredLevel3: u16, 
+ 2 //pub stakeRequiredLevel4: u16, 
+ 2 //pub stakeRequiredLevel5: u16, 
+ 8 //pub rewardRatePerToken_level1: u64, rate at level 1
+ 8 //pub rewardRatePerToken_level2: u64,  rate at level 2
+ 8 //pub rewardRatePerToken_level3: u64,  rate at level 3
+ 8 //pub rewardRatePerToken_level4: u64,  rate at level 4
+ 8 //pub rewardRatePerToken_level5: u64,  rate at level 5
+ 32 //Creator Key
+ 1;  //use-rarity

export const MAX_STAKE_LENGTH = 1
+ 32    //Owner 
+ 32    //Mint 
+ 32    //Authority
+ 32    //Token account
+ 8    //Time
+ 8;   //reserved_int

export const MAX_STAKE_SUMMARY_LENGTH = 1
+ 32 // owner
+ 4  // amount_staked how much tokens are staked
+ 8 //time: i64, //Time of last action
+ 8 // reward_earned_pending: u64, //Rewards open to be claimd prior to previous actions
+ 8 // reward_history: u64, //Reward history, updated when claiming
+ 4 //rarity multiplier
+ 8; //reserved_int: u64,

export class Config {
    isInitialized: number;
    updateAuthority: StringPublicKey;
    rewardMint: StringPublicKey;
    rewardVault: StringPublicKey;
    reserved_1: number;
    reserved_2: number;
    unstakeDuration: number;
    stakeRequiredLevel1: number; //1
    stakeRequiredLevel2: number; //2
    stakeRequiredLevel3: number; //3
    stakeRequiredLevel4: number; //4
    stakeRequiredLevel5: number; //5
    rewardRatePerToken_level1: number; //Per second, based on 9 decimals
    rewardRatePerToken_level2: number; 
    rewardRatePerToken_level3: number; 
    rewardRatePerToken_level4: number; 
    rewardRatePerToken_level5: number; 
    stakeCount: number;
    creator_key: StringPublicKey;
    use_rarity: number;

  constructor(args: { 
        isInitialized: number;
        updateAuthority: StringPublicKey;
        rewardMint: StringPublicKey;
        rewardVault: StringPublicKey;
        reserved_1: number;
        reserved_2: number;
        unstakeDuration: number;
        stakeRequiredLevel1: number; //1
        stakeRequiredLevel2: number; //2
        stakeRequiredLevel3: number; //3
        stakeRequiredLevel4: number; //4
        stakeRequiredLevel5: number; //5
        rewardRatePerToken_level1: number; //Per second, based on 9 decimals
        rewardRatePerToken_level2: number; 
        rewardRatePerToken_level3: number; 
        rewardRatePerToken_level4: number; 
        rewardRatePerToken_level5: number; 
        stakeCount: number;
        creator_key: StringPublicKey;
        use_rarity: number;
    }) {
    this.isInitialized = args.isInitialized;
    this.updateAuthority = args.updateAuthority;
    this.rewardMint = args.rewardMint;
    this.rewardVault = args.rewardVault;
    this.reserved_1 = args.reserved_1;
    this.reserved_2 = args.reserved_2;
    this.unstakeDuration = args.unstakeDuration;
    this.stakeRequiredLevel1 = args.stakeRequiredLevel1;
    this.stakeRequiredLevel2 = args.stakeRequiredLevel2;
    this.stakeRequiredLevel3 = args.stakeRequiredLevel3;
    this.stakeRequiredLevel4 = args.stakeRequiredLevel4;
    this.stakeRequiredLevel5 = args.stakeRequiredLevel5;
    this.rewardRatePerToken_level1 = args.rewardRatePerToken_level1;
    this.rewardRatePerToken_level2 = args.rewardRatePerToken_level2; 
    this.rewardRatePerToken_level3 = args.rewardRatePerToken_level3; 
    this.rewardRatePerToken_level4 = args.rewardRatePerToken_level4; 
    this.rewardRatePerToken_level5 = args.rewardRatePerToken_level5; 
    this.stakeCount = args.stakeCount;
    this.creator_key = args.creator_key;
    this.use_rarity = args.use_rarity;
  }
}

export class Stake {
  owner: StringPublicKey;
  mint: StringPublicKey;
  authority: StringPublicKey;
  token_account: StringPublicKey;
  time: number;
  reserved_int: number;

  constructor(args: { 
          owner: StringPublicKey;
          mint: StringPublicKey;
          authority: StringPublicKey;
          token_account: StringPublicKey;
          time: number;
          reserved_int: number;

    }) {
      this.owner = args.owner;
      this.mint = args.mint;
      this.authority = args.authority;
      this.token_account = args.token_account;
      this.time = args.time;
      this.reserved_int = args.reserved_int;
  }
}

export class StakeSummary {
  owner: StringPublicKey;
  amount_staked: number; //Amount how much tokens are staked
  time: number; //Time of last action
  reward_earned_pending: number; //Rewards open to be claimd prior to previous actions
  reward_history: number; //Reward history, updated when claiming
  multiplier: number; //Multiplier for staking * 1_000_000
  reserved_int: number;

  constructor(args: { 
    owner: StringPublicKey;
    amount_staked: number;
    time: number;
    reward_earned_pending: number;
    reward_history: number;
    multiplier: number;
    reserved_int: number;

    }) {
      this.owner = args.owner;
      this.amount_staked = args.amount_staked;
      this.time = args.time;
      this.reward_earned_pending = args.reward_earned_pending;
      this.multiplier = args.multiplier;
      this.reward_history = args.reward_history;
      this.reserved_int = args.reserved_int;
  }
}

export class Rarity {
  rarity: number; //Reward history, updated when claiming
  multiplier: number; //Multiplier for staking * 1_000_000
  level: number;
  reserved_int: number;

  constructor(args: { 
    rarity: number;
    multiplier: number;
    level: number;
    reserved_int: number;

    }) {
      this.rarity = args.rarity;
      this.multiplier = args.multiplier;
      this.level = args.level;
      this.reserved_int = args.reserved_int;
  }
}

export class StakeArgs {
    instruction: number = 1;
}

export class UnstakeArgs {
  instruction: number = 2;
}

export class ClaimArgs {
  instruction: number = 3;
}

export const STAKE_SCHEMA = new Map<any, any>([
  [
    Stake,
    {
      kind: "struct",
      fields: [
        ["owner", "pubkeyAsString"],
        ["mint", "pubkeyAsString"],
        ["authority", "pubkeyAsString"],
        ["token_account", "pubkeyAsString"],
        ["time", "u64"],
        ["reserved_int", "u64"],
      ],
    },
  ],
  [
    Rarity,
    {
      kind: "struct",
      fields: [
        ["rarity", "u16"],
        ["multiplier", "u32"],
        ["level", "u16"],
        ["reserved_int", "u16"],
      ],
    },
  ],
  [
    StakeSummary,
    {
      kind: "struct",
      fields: [
        ["owner", "pubkeyAsString"],
        ["amount_staked", "u16"],
        ["time", "u64"], 
        ["reward_earned_pending", "u64"],
        ["reward_history", "u64"],
        ["multiplier", "u32"],
        ["reserved_int", "u64"],
      ],
    },
  ],
  [
    Config,
    {
      kind: "struct",
      fields: [
        ["isInitialized", "u8"],
        ["updateAuthority", "pubkeyAsString"],
        ["rewardMint", "pubkeyAsString"],
        ["rewardVault", "pubkeyAsString"],
        ["reserved_1", "u64"],
        ["reserved_2", "u64"],
        ["unstakeDuration", "u64"],
        ["stakeRequiredLevel1", "u16"],
        ["stakeRequiredLevel2", "u16"],
        ["stakeRequiredLevel3", "u16"],
        ["stakeRequiredLevel4", "u16"],
        ["stakeRequiredLevel5", "u16"],
        ["rewardRatePerToken_level1", "u64"], 
        ["rewardRatePerToken_level2", "u64"], 
        ["rewardRatePerToken_level3", "u64"], 
        ["rewardRatePerToken_level4", "u64"], 
        ["rewardRatePerToken_level5", "u64"], 
        ["stakeCount", "u64"],
        ["creator_key", "pubkeyAsString"],
        ["use_rarity", "u8"],
      ],
    },
  ],
  [
    StakeArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
      ],
    },
  ],
  [
    UnstakeArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
      ],
    },
  ],
  [
    ClaimArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
      ],
    },
  ],
]);



export async function createStakeInstruction(
  ownerAddress: PublicKey,
  mintAddress: PublicKey,
  configAddress: PublicKey,
  stakeStorageAddress: PublicKey,
  ownerNftTokenAddress: PublicKey,
  ownerStakeSummaryAddress: PublicKey,
  rarityAddress: PublicKey,
) {
  const txnData = Buffer.from(serialize(STAKE_SCHEMA, new StakeArgs()));;

  //console.log(txnData);
  const keys = [
    {
      pubkey: toPublicKey(configAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(ownerAddress),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SPL_TOKEN_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(stakeStorageAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(ownerNftTokenAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(ownerStakeSummaryAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(rarityAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: await getMetadataAddress(mintAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SOL_VAULT_PUBKEY),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(SystemProgram.programId),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SYSVAR_RENT_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: toPublicKey(STAKE_PROGRAM_ID),
    data: txnData,
  });
}

export async function createUnstakeInstruction(
  ownerAddress: PublicKey,
  mintAddress: PublicKey,
  configAddress: PublicKey,
  stakeStorageAddress: PublicKey,
  ownerNftTokenAddress: PublicKey,
  ownerStakeSummaryAddress: PublicKey,
  escrow: PublicKey,
  rarityAddress: PublicKey,
) {
  const txnData = Buffer.from(serialize(STAKE_SCHEMA, new UnstakeArgs()));;

  //console.log(txnData);
  const keys = [
    {
      pubkey: toPublicKey(configAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(ownerAddress),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SPL_TOKEN_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(stakeStorageAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(ownerNftTokenAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(ownerStakeSummaryAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(rarityAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(escrow),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SOL_VAULT_PUBKEY),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(SystemProgram.programId),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SYSVAR_RENT_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: toPublicKey(STAKE_PROGRAM_ID),
    data: txnData,
  });
}

export async function createClaimInstruction(
  ownerAddress: PublicKey,
  ownerAssTokenAddress: PublicKey,
  vaultAssTokenAddress: PublicKey,
  configAddress: PublicKey,
  tokenAddress: PublicKey,
  tokenVaultAddress: PublicKey,
  ownerStakeSummaryAddress: PublicKey,
  pda: PublicKey,
) {
  const txnData = Buffer.from(serialize(STAKE_SCHEMA, new ClaimArgs()));;

  //console.log(txnData);
  const keys = [
    {
      pubkey: toPublicKey(configAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(ownerAddress),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(ownerAssTokenAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(vaultAssTokenAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(ownerStakeSummaryAddress),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(tokenAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(tokenVaultAddress),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SPL_TOKEN_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SPL_ASS_TOKEN_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SOL_VAULT_PUBKEY),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(SystemProgram.programId),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(SYSVAR_RENT_PUBKEY),
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: toPublicKey(STAKE_PROGRAM_ID),
    data: txnData,
  });
}

export const decodeRarityData = (buffer: Buffer): Rarity => {
  const rarityData = deserializeUnchecked(
    STAKE_SCHEMA,
    Rarity,
    buffer
  ) as Rarity;
  return rarityData;
};


export const decodeStakeData = (buffer: Buffer): Stake => {
  const stakeData = deserializeUnchecked(
    STAKE_SCHEMA,
    Stake,
    buffer
  ) as Stake;
  return stakeData;
};

export const decodeStakeSummaryData = (buffer: Buffer): StakeSummary => {
  const stakeData = deserializeUnchecked(
    STAKE_SCHEMA,
    StakeSummary,
    buffer
  ) as StakeSummary;
  return stakeData;
};

export const decodeConfigData = (buffer: Buffer): Config => {
  const configData = deserializeUnchecked(
    STAKE_SCHEMA,
    Config,
    buffer
  ) as Config;
  return configData;
};

export const getOwnerStakeSummaryAddress = async (owner: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("stakesum"),
        new PublicKey(STAKE_PROGRAM_ID).toBuffer(),
        owner.toBuffer(),
        STAKE_CONFIG_PUBKEY.toBuffer(),
      ],
      new PublicKey(STAKE_PROGRAM_ID)
    )
  )[0];
};

export const getStakeAddress = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("stake"),
        new PublicKey(STAKE_PROGRAM_ID).toBuffer(),
        mint.toBuffer(),
        STAKE_CONFIG_PUBKEY.toBuffer(),
      ],
      new PublicKey(STAKE_PROGRAM_ID)
    )
  )[0];
};

export const getMetadataAddress = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        new PublicKey(TOKEN_METADATA_PUBKEY).toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey(TOKEN_METADATA_PUBKEY),
    )
  )[0];
};

export const getPdaAddress = async (owner: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('stake'),
        new PublicKey(STAKE_PROGRAM_ID).toBuffer(),
        owner.toBuffer(),
        STAKE_CONFIG_PUBKEY.toBuffer(),
      ],
      new PublicKey(STAKE_PROGRAM_ID)
    )
  )[0];
};

export const getRarityAddress = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('rarity'),
        new PublicKey(STAKE_PROGRAM_ID).toBuffer(),
        mint.toBuffer(),
        STAKE_CONFIG_PUBKEY.toBuffer(),
      ],
      new PublicKey(STAKE_PROGRAM_ID)
    )
  )[0];
};

export const GetAccountData = function (conn: Connection, account: PublicKey) {
  return conn.getAccountInfo(account).then((data: any) => {
    return data;
  });
};
