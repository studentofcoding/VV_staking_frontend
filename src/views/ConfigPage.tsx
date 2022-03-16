import React, { FC, useCallback, useState  } from 'react';
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    STAKE_CONFIG_PUBKEY,
  } from "../utils/ids";

import { 
  GetAccountData, 
  decodeConfigData, 
  Config, 
} from '../utils/stake';

const ConfigPage: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [ config, setConfigData ] = useState<Config>();

    const getConfigData = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();    
          let configDataAccount = GetAccountData(connection, STAKE_CONFIG_PUBKEY);
          console.log("Config : " + STAKE_CONFIG_PUBKEY);
          return configDataAccount.then(function (value: any) {
            console.log(value.data);
            if (value != null) {
              let config = decodeConfigData(value.data);
              setConfigData(config);
              console.log("Initialized: " + config?.isInitialized);
              return config;
            }
            return undefined;
          });

    }, [connection, publicKey, config]);

    React.useEffect(() => {
        getConfigData();
    },[connection, publicKey]);


    function configData() {
        if (config) {
            console.log("Stake count: " + config.stakeCount);

            let stakeCount = config.stakeCount * 1;            

            return (
                <div>
                <table className="table-auto">
                <tbody>
                <tr>
                <td>Initialized:</td>
                <td>{config.isInitialized && "Yes" || "No"}</td>
                </tr>
                <tr>
                <td>Total staked:</td>
                <td>{stakeCount}</td>
                </tr>
                <tr>
                <td>Creator CMv2 id:</td>
                <td>{config.creator_key}</td>
                </tr>
                <tr>
                <td>Reward vault:</td>
                <td>{config.rewardVault}</td>
                </tr>
                <tr>
                <td>Reward token mint:</td>
                <td>{config.rewardMint}</td>
                </tr>
                <tr>
                <td>Use rarity:</td>
                <td>{config.use_rarity && "Yes" || "No"}</td>
                </tr>
                <tr>
                <td>Unstake duration days:</td>
                <td>{config.unstakeDuration / 86400}</td>
                </tr>
                </tbody>
                </table>


                <table className="table-auto">
                <thead>
                  <tr>
                    <td><b>Reward Level</b></td>
                    <td><b>Stakes Required</b></td>
                    <td><b>Reward per hour</b></td>
                  </tr>
                </thead>
                <tbody>
                <tr>
                <td>Level 1</td>
                <td>{config.stakeRequiredLevel1}</td>
                <td>{(config.rewardRatePerToken_level1 * 3600 / 1_000_000_000).toFixed(5)}</td>
                </tr>
                <tr>
                <td>Level 2</td>
                <td>{config.stakeRequiredLevel2}</td>
                <td>{(config.rewardRatePerToken_level2 * 3600 / 1_000_000_000).toFixed(5)}</td>
                </tr>
                <tr>
                <td>Level 3</td>
                <td>{config.stakeRequiredLevel3}</td>
                <td>{(config.rewardRatePerToken_level3 * 3600 / 1_000_000_000).toFixed(5)}</td>
                </tr>
                <tr>
                <td>Level 4</td>
                <td>{config.stakeRequiredLevel4}</td>
                <td>{(config.rewardRatePerToken_level4 * 3600 / 1_000_000_000).toFixed(5)}</td>
                </tr>
                <tr>
                <td>Level 5</td>
                <td>{config.stakeRequiredLevel5}</td>
                <td>{(config.rewardRatePerToken_level5 * 3600 / 1_000_000_000).toFixed(5)}</td>
                </tr>
                </tbody>
                </table>
                </div>
            )
        } else{
            return null;
        }
    }

    return (
        <div>
                    {configData()}
        </div>
    );
};
export default ConfigPage;