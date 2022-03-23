import { FC, useEffect, useState  } from 'react';
import { useWalletNfts } from "@nfteyez/sol-rayz-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { getPdaAddress } from "../utils/stake";

import NFTCard from '../components/NFTCard';
import { PublicKey } from "@solana/web3.js";

import { useAtom, atom } from "jotai"
import { configAtom } from "../utils/store";
import Claim from './Claim';


const Combined: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [ pdaAddress, setPdaAddress ] = useState<PublicKey>();

    const [ config, setConfig] = useAtom(configAtom);
    const { nfts: pdanfts, isLoading: pdaisLoading, error: pdaerror } = useWalletNfts({
        publicAddress: pdaAddress,
        connection,
    });
    const { nfts, isLoading, error } = useWalletNfts({
        publicAddress: publicKey,
        connection,
    });

    let nftCol: any = [];
    let count = 0;
    // let nft_activated = false;

    const maxStake = 4444;

    //NftTokenAccount
    function showNft(nft: any, staked: boolean) {
        if (
            config.isInitialized &&
            nft.data.creators &&
            // eslint-disable-next-line eqeqeq
            nft.data.creators[0].address == config.creator_key
            && 
            nft.data.creators[0].verified == 1
        ) {
            if(!nftCol.includes(nft.mint)){
                count++;
            }
            nftCol.push(nft.mint);
            return (
                // <div className="overflow grid grid-cols-3 gap-x-1 gap-y-1 m-2 border rounded-2xl w-2/3 bg">
                    <NFTCard key={nft.mint} nft={nft} staked={staked} />
                // </div>
            );
        } else{
            return null;
        }
    }

    // function setNftActive() {
    //     return !nft_activated;
    // }

    useEffect(() => {
        if(publicKey){
            getPdaAddress(publicKey).then(pda => {
                setPdaAddress(pda);
            });   
        }
        if(count > 0){
            setNftActive();
        }
    }, [publicKey]);

    return (
        <>
        <div className="flex mt-10 w-full justify-center">            
                {publicKey && (
                    <>
                        <>
                            <div className="flex m-10 mt-16">
                                <div className="overflow grid grid-cols-3 gap-x-1 gap-y-1 m-2 border rounded-2xl w-2/3 bg">
                                {nfts.map((nft: any) => (
                                    showNft(nft, false)
                                ))}
                                {pdanfts.map((nft: any) => (
                                    showNft(nft, true)
                                ))}
                                
                                </div>
                                {count > 0 && 
                                <div className="flex border w-1/3 place-content-center rounded-2xl m-2 bg p-5">
                                    <Claim/>
                                </div>}  
                                
                            </div>
                            {count == 0 && <div className="flex flex-col w-2/3 rounded-2xl bg">
                                <div className="grid rounded-2xl bg w-full">
                                    <div className="centered-component">
                                        <img className="gif" alt="NFT's Collection" width="500" height="500"/>
                                    </div>
                                <a href="/"
                                    className="text-white font-bold no-underline hover:underline"
                                    ><p className="centered-component text-xl justify-center w-full flex">
                                    You have no Verdant Vtopias, 
                                    buy here to Join
                                </p></a>
                                </div>
                            </div>}
                            
                            <div className="absolute top-2 flex-vertical m-3 text-center">
                                <p className="text-2xl bold">Verdant Vtopia Staking</p>
                                <p>Total NFTs in wallet: {count}</p>
                            </div>
                        </>
                    </>
                ) 
                ||
                (
                    <div className="flex flex-col w-2/3 border rounded-2xl bg">
                        <p className="text-center bold text-2xl mb-5 ml-32 mt-20 mr-32">{config.stakeCount * 1} out of {maxStake} Verdant Vtopians Communion so far</p>
                        <div className="w-full pl-32 pr-32 pb-20">
                            <div className="w-full bg-gray-800 rounded-full h-5 dark:bg-gray-800">
                                <div className="bg-purple-700 h-5 rounded-full" style={{ width: `${config.stakeCount / maxStake * 100}%`}} />
                            </div>
                        </div>
                    </div>
                )}
        </div>
        </>
    );
};
export default Combined;