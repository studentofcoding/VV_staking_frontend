import { FC, useCallback, useState, useEffect  } from 'react';
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
    SPL_ASS_TOKEN_PUBKEY,
    STAKE_VAULT_PUBKEY,
    STAKE_CONFIG_PUBKEY,
    toPublicKey,
    STAKE_VAULT_ASS_PUBKEY,
  } from "../utils/ids";

import { 
  decodeStakeSummaryData, 
  StakeSummary, 
  getOwnerStakeSummaryAddress, 
  GetAccountData, 
  decodeConfigData, 
  Config, 
  createClaimInstruction,
  getPdaAddress
} from '../utils/stake';

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { useSnackbar } from "notistack";


const Claim: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [ pending_rewards, setPendingRewards ] = useState<number>(0);
    const [ amount_staked, setAmountStaked ] = useState(0);
    const [ rewardPerDay, setRewardPerDay ] = useState(0);
    const [ reward_history, setRewardHistory ] = useState(0);
    const [ config, setConfigData ] = useState<Config>();
    const { enqueueSnackbar } = useSnackbar();
    const [ stakeSummary, setStakeSummary ] = useState<StakeSummary>();
    const [ rewardPerToken, setRewardPerToken] = useState(0);
    const [ delay, setDelay ] = useState(999);

    function calcReward(reward_pending: number, previous_time: number, multiplier: number, reward_per_token: number) {
        let current_time = Math.floor(Date.now() / 1000);
        let delta_time = current_time - previous_time;
        let total_reward = (((reward_per_token * multiplier / 1_000_000) * delta_time  )) / 1_000_000_000 + reward_pending;
        return total_reward;
    }

    const getConfigData = useCallback(async () => {
      if (!publicKey) throw new WalletNotConnectedError();

      let vault_pubkey = toPublicKey(STAKE_VAULT_PUBKEY);
      
      let configDataAccount = GetAccountData(connection, STAKE_CONFIG_PUBKEY);
      return configDataAccount.then(function (value: any) {
        if (value != null) {
          let config = decodeConfigData(value.data);
          setConfigData(config);
          console.log("Initialized: " + config?.isInitialized);
          return config;
        }
        return undefined;
      });
    }, [connection, publicKey, config]);

    const getStakeSummaryFromChain = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        let currentConfig = await getConfigData();

        return getOwnerStakeSummaryAddress(publicKey).then((value: PublicKey) => {    
          let stakeAccountData = GetAccountData(connection, value);
          return stakeAccountData.then(function (value: any) {
            if (value != null) {
              if(!currentConfig) return;
              let stakeSummaryData = decodeStakeSummaryData(value.data);
              let reward_history_readable = (stakeSummaryData.reward_history / 1_000_000_000);

              let rewardPerToken = 0;
              if (stakeSummaryData.amount_staked >= currentConfig.stakeRequiredLevel5){

                rewardPerToken = currentConfig.rewardRatePerToken_level5;
              } else if (stakeSummaryData.amount_staked >= currentConfig.stakeRequiredLevel4){

                rewardPerToken = currentConfig.rewardRatePerToken_level4;
              } else if (stakeSummaryData.amount_staked >= currentConfig.stakeRequiredLevel3){

                rewardPerToken = currentConfig.rewardRatePerToken_level3;
              } else if (stakeSummaryData.amount_staked >= currentConfig.stakeRequiredLevel2){

                rewardPerToken = currentConfig.rewardRatePerToken_level2;
              } else {
                rewardPerToken = currentConfig.rewardRatePerToken_level1;
              }
              
              setRewardPerToken(rewardPerToken);
              setRewardPerDay((rewardPerToken * stakeSummaryData.multiplier / 1_000_000) * 86400 / 1_000_000_000);
              setAmountStaked(stakeSummaryData.amount_staked); 
              setRewardHistory(reward_history_readable);
              setStakeSummary(stakeSummaryData);
              setDelay(100);
            }
          });
        });
    }, [connection, publicKey, config]);

    const claim = useCallback(async () => {
      if (!publicKey) throw new WalletNotConnectedError();
      
      if (!config) return;
      
      let tokenAddress = toPublicKey(config.rewardMint);
      let ownerStakeSummaryAddress = await getOwnerStakeSummaryAddress(publicKey);
      let pdaAddress = await getPdaAddress(publicKey);

      let ownerAssTokenAddress = await Token.getAssociatedTokenAddress(
        toPublicKey(SPL_ASS_TOKEN_PUBKEY),
        TOKEN_PROGRAM_ID,
        tokenAddress,
        publicKey
      );

      let instruction = await createClaimInstruction(
          publicKey,
          ownerAssTokenAddress,
          STAKE_VAULT_ASS_PUBKEY,
          STAKE_CONFIG_PUBKEY,
          tokenAddress,
          STAKE_VAULT_PUBKEY,
          ownerStakeSummaryAddress,
          pdaAddress,
      );

      let transaction = new Transaction().add(instruction);
      onPending("Creating claiming transaction...");

      const signature = await sendTransaction(transaction, connection );

      let result = await connection.confirmTransaction(signature, "processed");

      if(result.value.err) {
          onFail("Failed claiming! Try again!");
      } else {
          onSuccess("Succesfully claimed some Verdant!");
      }
    }, [
        publicKey,
        sendTransaction,
        connection,
        config,
    ]);

    const onSuccess = useCallback(
      (message: String) => {
        enqueueSnackbar(
          message,
          { variant: "success" }
        );
      },
      [enqueueSnackbar]
    );

    const onPending = useCallback(
      (message: String) => {
        enqueueSnackbar(
          message,
          { variant: "info" }
        );
      },
      [enqueueSnackbar]
    );

    const onFail = useCallback(
      (message: String) => {
        enqueueSnackbar(
          message,
          { variant: "error" }
        );
      },
      [enqueueSnackbar]
    );
  
    useEffect(() => {
      function tick() {
        if(!stakeSummary) return;
  
        let total_reward = calcReward(stakeSummary.reward_earned_pending / 1_000_000_000, stakeSummary.time * 1, stakeSummary.multiplier, rewardPerToken);             
  
        setPendingRewards(total_reward);
      }

        getStakeSummaryFromChain();
        setInterval(tick, delay);
    },[publicKey, delay]);

    return (
        <div className="flex flex-col justify-center items-center">
            {/* <p className="text-2xl">Claiming</p>  */}
            <table className="table-fixed content-center">
            <tbody>
            <tr>
            <td className="p-1 text-right">NFT's in Union:</td>
            <td className="p-1">{amount_staked}</td>
            </tr>
            <tr>
            <td className="p-1 text-right">Lockup period:</td>
            <td className="p-1">14 days</td>
            </tr>
            <tr>
            <td className="p-1 text-right">Rewards per day:</td>
            <td className="p-1">{(rewardPerDay).toFixed(2)} $verdant</td>
            </tr>
            <tr>
            <td className="p-1 text-right">Rewards payout history:</td>
            <td className="p-1">{reward_history.toFixed(2)} $verdant</td>
            </tr>
            <tr>
            <td className="p-1 text-right">Pending rewards: </td>
            <td className="p-1">{pending_rewards.toFixed(2)} $verdant</td>
            </tr>
            </tbody>
            </table>
            <button className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full ml-8 mr-8 mt-6 pr-16 pl-16" onClick={claim}>Claim {pending_rewards.toFixed(2)} $verdant</button>
            {/* <button disabled className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full ml-8 mr-8 mt-6 pr-16 pl-16" onClick={claim}>Claimed are disabled</button> */}
        </div>
    );
};
export default Claim;