import { FC, useCallback, useState, useEffect  } from 'react';
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import { PublicKey, Transaction, Connection, clusterApiUrl } from "@solana/web3.js";
import {
    StringPublicKey,
    STAKE_PROGRAM_ID,
    SPL_TOKEN_PUBKEY,
    SPL_ASS_TOKEN_PUBKEY,
    STAKE_VAULT_PUBKEY,
    STAKE_CONFIG_PUBKEY,
    toPublicKey,
  } from "../utils/ids";

import NFTCard from '../components/NFTCard';
import { 
  decodeStakeSummaryData, 
  StakeSummary, 
  getOwnerStakeSummaryAddress, 
  GetAccountData, 
  decodeConfigData, 
  Config, 
  createClaimInstruction,
  getPdaAddress,
} from '../utils/stake';

import { useAtom, atom } from "jotai"
import { configAtom } from "../utils/store";

const StakeBar: FC = () => {

    const [ config, setConfig] = useAtom(configAtom)
    const [ stakeCount, setStakeCount ] = useState(0);
    const [ stakePercentage, setStakePercentage ] = useState(0);

    const maxStake = 4444;

    useEffect(() => {
      setStakeCount(config.stakeCount * 1);
      setStakePercentage(config.stakeCount / maxStake * 100);
    }, [config]);

    return (
        <div className="absolute top-0 left-0 flex space-x-6 m-4">
          <div className="w-40">
            Staked {stakeCount}/{maxStake}
            <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700">
              <div className="bg-purple-700 h-5 rounded-full" style={{ width: `${stakePercentage}%`}} />
            </div>
          </div>
        </div>
    )
}

export default StakeBar;