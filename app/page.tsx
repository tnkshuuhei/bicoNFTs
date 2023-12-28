"use client";
import Head from "next/head";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import styles from "./Home.module.css";
import { useEffect, useState } from "react";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import Minter from "./Minter";
import { Web3AuthModalPack, Web3AuthConfig } from "@safe-global/auth-kit";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );

  // const particle = new ParticleAuthModule.ParticleNetwork({
  //   projectId: "bb8d58f8-0d3c-4306-a5f1-6cc7aa73b012",
  //   clientKey: "c9rwyb2a3pQhHapL1EphoNKYnFsVQkAEHgWP5TRm",
  //   appId: "bd23aa64-ef27-4054-a823-25aa32d903a4",
  //   wallet: {
  //     displayWalletEntry: true,
  //     defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
  //   },
  // });

  const bundler: IBundler = new Bundler({
    bundlerUrl:
      "https://bundler.biconomy.io/api/v2/5/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.GOERLI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl:
      "https://paymaster.biconomy.io/api/v1/5/dFBow1V_u.18b023eb-3536-4e26-8ec2-21f216c4dfe8",
  });

  const connect = async () => {
    try {
      setLoading(true);

      const options: Web3AuthOptions = {
        clientId:
          "BMOD7z3dTdBopQZzlXvLZiE6NbASeu0BrWd-YHFgGUgUHVp_jfJEPTfC0PjO0q3Vq8iQRGBs7sNdpW2AUgKY_S8", // https://dashboard.web3auth.io/
        web3AuthNetwork: "testnet",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x5",
          // https://chainlist.org/
          rpcTarget: "https://rpc.ankr.com/eth_goerli",
        },
      };

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: "metamask",
          showOnDesktop: true,
          showOnMobile: false,
        },
      };

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: "mandatory",
        },
        adapterSettings: {
          uxMode: "popup",
          whiteLabel: {
            appName: "Based Account Abstraction",
          },
        },
      });

      const web3AuthConfig: Web3AuthConfig = {
        txServiceUrl: "https://safe-transaction-goerli.safe.global",
      };

      // Instantiate and initialize the pack
      const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig);
      await web3AuthModalPack.init({
        options,
        openloginAdapter,
        modalConfig,
      });
      const web3provider: any = await web3AuthModalPack.getProvider();
      const provider = new ethers.providers.Web3Provider(web3provider);
      const provider_signer = await provider.getSigner();
      console.log({ provider_signer });
      setProvider(provider);

      const authKitSignData = await web3AuthModalPack.signIn();
      console.log(authKitSignData);
      if (!provider_signer) {
        console.error("Signer not found");
      } else {
        const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
          signer: provider_signer,
          chainId: ChainId.GOERLI,
          bundler: bundler,
          paymaster: paymaster,
        };
        let biconomySmartAccount = new BiconomySmartAccount(
          biconomySmartAccountConfig
        );
        biconomySmartAccount = await biconomySmartAccount.init();
        setAddress(await biconomySmartAccount.getSmartAccountAddress());
        setSmartAccount(biconomySmartAccount);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Based Account Abstraction</title>
        <meta name="description" content="Based Account Abstraction" />
      </Head>
      <main className={styles.main}>
        <h1>Based Account Abstraction</h1>
        <h2>Connect and Mint your AA powered NFT now</h2>
        {!loading && !address && (
          <button onClick={connect} className={styles.connect}>
            Connect to Based Web3
          </button>
        )}
        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
        {smartAccount && provider && (
          <Minter
            smartAccount={smartAccount}
            address={address}
            provider={provider}
          />
        )}
      </main>
    </>
  );
}
// 0xf14a9e76733686877dc7d073fb2b08ba7b0393ea
