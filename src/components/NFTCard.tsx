import React, { FC, useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createStakeInstruction, createUnstakeInstruction, decodeRarityData, getOwnerStakeSummaryAddress, Rarity } from "../utils/stake";

import { getStakeAddress, getPdaAddress, GetAccountData, decodeStakeData, getRarityAddress } from "../utils/stake";

import {
  STAKE_CONFIG_PUBKEY,
} from "../utils/ids";

import { useSnackbar } from "notistack";
import { useAtom } from "jotai"
import { configAtom } from "../utils/store";

type NFTProps = { nft: any, staked: boolean };

const NFTCard: FC<NFTProps> = ({nft, staked}) => {

    const [ imageLink, setImage] = React.useState("");
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { enqueueSnackbar } = useSnackbar();
    const [ rarity, setRarity ] = React.useState<Rarity>();

    const [ timeToUnstake, setUnstakeTime ] = React.useState(0);

    const [ config, setConfig] = useAtom(configAtom);

    const getRarityData = useCallback(async () => {
      if (!publicKey) throw new WalletNotConnectedError();  

        let rarityAccount = GetAccountData(connection, await getRarityAddress(new PublicKey(nft.mint)));
        console.log("Rarity key : " + rarityAccount);
        return rarityAccount.then(function (value: any) {
          if (value != null) {
            console.log(value.data);
            let rarity = decodeRarityData(value.data);
            setRarity(rarity);
            console.log("Rarity: " + rarity.rarity + " multiplier: " + rarity.multiplier);
            return rarity;
          }
          return undefined;
        });

  }, [connection, publicKey, rarity]);

  const getStakeInfo = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();  
      let stakeStorageAddress = await getStakeAddress(new PublicKey(nft.mint));
      let stakeAccount = GetAccountData(connection, stakeStorageAddress);
      return stakeAccount.then(function (value: any) {
        if (value != null) {
          console.log(value.data);
          let stake = decodeStakeData(value.data);
          
          console.log("Time: " + stake.time);
          let current_time = Math.floor(Date.now() / 1000);

          let timediff = current_time - stake.time;
          if (timediff > config.unstakeDuration) {
            setUnstakeTime(0);
          } else {
            setUnstakeTime(config.unstakeDuration - timediff);
          }
          return stake;
        }
        return undefined;
      });

  }, [connection, publicKey, rarity]);

    function getImage(link: string)  {
        return fetch(link)
        .then((response) => response.json())
        .then((responseJson) => {
            setImage(responseJson.image as string);
        })
        .catch((error) => {
          console.error(error);
        });
     }

    ///// Stake
    const stake = useCallback(async () => {
        if (!publicKey) {
          onFail("Wallet not connected!");
          throw new WalletNotConnectedError();
        }

        let mintKey = new PublicKey(nft.mint);

        let stakeStorageAddress = await getStakeAddress(mintKey);
        
        //TODO this is just a workaround to get the owner token address
        const largestAccounts = (
          await connection.getTokenLargestAccounts(mintKey)
        ).value;

        let ownerNftTokenAddress = largestAccounts[0].address;
        let ownerStakeSummaryAddress = await getOwnerStakeSummaryAddress(publicKey);

        //Get the image
        //Create instruction
        let instruction = await createStakeInstruction(
            publicKey,
            mintKey,
            STAKE_CONFIG_PUBKEY,
            stakeStorageAddress,
            ownerNftTokenAddress,
            ownerStakeSummaryAddress,
            await getRarityAddress(mintKey),
        );

        let transaction = new Transaction().add(instruction);
        onPending("Creating stake transaction...");
        console.log(instruction);
        try {
          const signature = await sendTransaction(transaction, connection);
        
          let result = await connection.confirmTransaction(signature, "processed");
  
          if(result.value.err) {
              onFail("Failed staking! Try again!");
          } else {
              onSuccess("Succesfully staked one NFT!");
          }
        } catch (error){
          onFail("Failed staking! Try again!");
        }
    }, [
        publicKey,
        sendTransaction,
        connection,
    ]);

    ///// Stake
    const unstake = useCallback(async () => {
      if (!publicKey) {
        onFail("Wallet not connected!");
        throw new WalletNotConnectedError();
      }

      let mintKey = new PublicKey(nft.mint);

      let stakeStorageAddress = await getStakeAddress(mintKey);
      let pdaAddress = await getPdaAddress(publicKey);
      
      //TODO this is just a workaround to get the owner token address
      const largestAccounts = (
        await connection.getTokenLargestAccounts(mintKey)
      ).value;

      let ownerNftTokenAddress = largestAccounts[0].address;
      let ownerStakeSummaryAddress = await getOwnerStakeSummaryAddress(publicKey);

      //Get the image
      //Create instruction
      let instruction = await createUnstakeInstruction(
          publicKey,
          mintKey,
          STAKE_CONFIG_PUBKEY,
          stakeStorageAddress,
          ownerNftTokenAddress,
          ownerStakeSummaryAddress,
          pdaAddress,
          await getRarityAddress(mintKey),
      );

      let transaction = new Transaction().add(instruction);
      onPending("Creating unstake transaction...");

      try {

        const signature = await sendTransaction(transaction, connection);

        let result = await connection.confirmTransaction(signature, "processed");

          if(result.value.err) {
              onFail("Failed unstaking! Try again!");
          } else {
              onSuccess("Succesfully unstaked one NFT!");
          }
      } catch (error){
        onFail("Failed unstaking! Try again!");
      }

  }, [
      publicKey,
      sendTransaction,
      connection,
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

     React.useEffect(() => {
        getImage(nft.data.uri);
        if (staked) {
          getStakeInfo();
        }
        getRarityData();
      },[]);


      //The card
      const nftCard = 
        (<div className="flex flex-col p-2">
        {staked && (<img className="rounded-xl shadow-stone-900 shadow-lg outline outline-gray-900 outline-2" src={imageLink} />)  || (<img className="rounded-xl shadow-stone-900 shadow-lg" src={imageLink} />) }
        <p className="text-center">{nft.data.name}</p>
        <p className="text-center"> Level: {rarity && rarity.level}</p>
        <p className="text-center"> Rarity: {rarity && ((rarity.rarity == 1)  && "Common" || "Legendary") || "No rarity"}</p>
        { (timeToUnstake > 0) && (<p className="text-center"> Hours to unstake: {(timeToUnstake / 3600).toFixed(0)}</p>) }
        {staked && 
          <button className="bg-purple-500 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full ml-4 mr-4 mt-1" onClick={unstake} disabled={(timeToUnstake > 0)}>Unstake</button>
         || 
          <button className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full ml-4 mr-4 mt-1" onClick={stake}>Stake</button>
         } 
        </div>);

    return ( 
      nftCard
    )
}

export default NFTCard;