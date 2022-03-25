import { PublicKey } from "@solana/web3.js";

//Adapted from TS
const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== "string") {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export type StringPublicKey = string;
 //Settings
export const STAKE_VAULT_PUBKEY =   toPublicKey("CuPP5AWUVXsWiRZH1VS8mnTZGgVB6KWJY1ZpMA1s6sTD");
export const STAKE_VAULT_ASS_PUBKEY = toPublicKey("FmSdegyc5BM2udiM3MxKPESxxKt1CtdYTRtPhd3v7ZwZ");
export const STAKE_CONFIG_PUBKEY =  toPublicKey("8KqVWz7Pqiw9VyUdxHwVKFUVhDwUALi73PwmcDVMn3ce");
// export const SOL_VAULT_PUBKEY =     toPublicKey("vAULTcAJXLfkoF8tHAqBTA23XQr92ivpRK2cJx9Xrab");
export const SOL_VAULT_PUBKEY = toPublicKey("HePangCziif8HcnyozkNvyBnWfpZSZWbZFfzNjYr4xZT");
export const STAKE_PROGRAM_ID =     toPublicKey("Verdi2Gnn5bCCxUFkEw2HPLmDc4KJ5m27VqkAbeHRjs");

//Static items
export const SPL_TOKEN_PUBKEY =
"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export const SPL_ASS_TOKEN_PUBKEY =
 "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

 export const TOKEN_METADATA_PUBKEY =
 "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";




