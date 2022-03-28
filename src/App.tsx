import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { FC, ReactNode, useMemo, useCallback, useEffect } from 'react';
import NavBar from './components/NavBar';
import StakeBar from './components/StakeBar';
import ConfigPage from './views/ConfigPage';
import { SnackbarProvider } from 'notistack';
import Combined from './views/Combined';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
    STAKE_CONFIG_PUBKEY,
} from "./utils/ids";

import { 
    GetAccountData, 
    decodeConfigData, 
  } from './utils/stake';

import { useAtom, atom } from "jotai"
import { configAtom } from "./utils/store";

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

export interface AppProps {
    page: string;
  }

export const App: FC<AppProps> = (props) => {
   
    switch (props.page) {
        case "config":
        return (
            <Context>
                <SnackbarProvider>
                    <ConfigContent />
                </SnackbarProvider>
            </Context>
        );
        case "combined":
        return (
            <Context>
                <SnackbarProvider>
                    <CombinedContent />
                </SnackbarProvider>
            </Context>
        );
    }
   
    return (
        <Context>
            <SnackbarProvider>
                Unknown
            </SnackbarProvider>
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const [ config, setConfig] = useAtom(configAtom)


    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;
    const connectionWithoutWallet  = new Connection(
        clusterApiUrl('mainnet-beta'),
        'confirmed',
    );

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const getConfigData = useCallback(async () => {   
        let configDataAccount = GetAccountData(connectionWithoutWallet, STAKE_CONFIG_PUBKEY);
        return configDataAccount.then(function (value: any) {
          if (value != null) {
            let newconfig = decodeConfigData(value.data);
            setConfig(newconfig);
            
            return newconfig;
          }
          return undefined;
        });
    }, [config]);

    useEffect(() => {
        if(!config.isInitialized) {
          getConfigData();
        }
    });

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const ConfigContent: FC = () => {
    const { publicKey, sendTransaction } = useWallet();

    return (
        <div className="App">
            {publicKey && <StakeBar />}
            <NavBar />
            <div className="absolute top-0 right-0 flex space-x-4 m-3"><WalletMultiButton /></div>
            
            <ConfigPage />
        </div>
    );
};

const CombinedContent: FC = () => {
    const { publicKey, sendTransaction } = useWallet();
    return (
        <div className="App">
            {publicKey && <StakeBar />}
            <div className="absolute top-0 right-0 flex space-x-4 m-3"><WalletMultiButton /></div>
            
            <Combined />
        </div>
    );
};