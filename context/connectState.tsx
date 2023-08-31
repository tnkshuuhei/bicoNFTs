"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
const ConnectStateContext = createContext<any>(null);

export const ConnectStateProvider = ({ children }: any) => {
  const { address } = useAccount();
  const { data: signer, isError, isLoading } = useWalletClient();
  const [smartAddress, setSmartAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );

  const bundler: IBundler = new Bundler({
    bundlerUrl:
      "https://bundler.biconomy.io/api/v2/420/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.OPTIMISM_GOERLI_TESTNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl:
      "https://paymaster.biconomy.io/api/v1/420/RycDnxYDM.adac302a-1f7c-4db2-9cdd-6eb38f566277",
  });
  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: "dab3c7f3-16da-4ef2-a870-20b6e242fe6d",
    clientKey: "c3UgxFmOMrMmZzV2EaQpxrUBU6SAEhLvyDCD0lDS",
    appId: "scuUAaA11PGWIhERF8F1q3XaYwjImbM3sV8HCkc1",
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const connect = async () => {
    try {
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
      setProvider(web3Provider);
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.OPTIMISM_GOERLI_TESTNET,
        bundler: bundler,
        paymaster: paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(
        biconomySmartAccountConfig
      );
      biconomySmartAccount = await biconomySmartAccount.init();
      setSmartAddress(await biconomySmartAccount.getSmartAccountAddress());
      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ConnectStateContext.Provider
      value={{ address, signer, connect, smartAccount, smartAddress, provider }}
    >
      {children}
    </ConnectStateContext.Provider>
  );
};
export const useConnectState = () => useContext(ConnectStateContext);
