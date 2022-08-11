import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { ethers } from "ethers";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";

import styles from "./index.module.css";
import contractInterface from "abi/contract-abi.json";
import { success } from "helpers/effects";

const PRICE = 0.001;

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [quantity, setQuantity] = useState<number>(3);

  const { address } = useAccount();

  const { config, error: contractError } = usePrepareContractWrite({
    addressOrName: "0x9E33B16db8F972E57b9cB0da9438d840A5C9f7A0",
    contractInterface: contractInterface,
    functionName: "mint",
    args: [quantity],
    overrides: {
      from: address,
      value: ethers.utils.parseEther((quantity * PRICE).toString()),
    },
  });

  const {
    isLoading,
    isSuccess: isStarted,
    error: mintError,
    data: mintData,
    write,
  } = useContractWrite(config);

  const { isSuccess: isMinted } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const handleChange = (event: Event, newValue: number | number[]) => {
    setQuantity(newValue as number);
  };

  useEffect(() => {
    setIsConnected(!!address);
  }, [address]);

  useEffect(() => {
    if (isMinted) {
      success();
    }
  }, [isMinted]);

  return (
    <>
      <Head>
        <title>Stupid Faces NFT</title>
        <meta
          name="description"
          content="1,000 very stupid faces on the Ethereum blockchain. No website. No Twitter. No Discord. No utility. No roadmap. No bullshit."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoContainer}>
            <Image src="/img/logo.svg" alt="Stupid Faces logo" layout="fill" />
          </div>
          <ConnectButton showBalance={false} chainStatus="none" />
          {isConnected && (
            <>
              {isMinted ? (
                <>
                  <div className={styles.status}>Success!</div>
                  <div className={styles.action}>
                    <a
                      href={`https://opensea.io/${address}?tab=collected`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on OpenSea
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <Slider
                    color="secondary"
                    value={quantity}
                    onChange={handleChange}
                    aria-label="Quantity"
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={10}
                    disabled={!!contractError || isLoading || isStarted}
                  />
                  <div className={styles.price}>
                    {Math.round(quantity * PRICE * 1000) / 1000} ETH
                  </div>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => {
                      write?.();
                    }}
                    disabled={!!contractError || isLoading || isStarted}
                  >
                    Mint
                  </Button>
                  {isLoading && (
                    <div className={styles.status}>Waiting for approval...</div>
                  )}
                  {isStarted && <div className={styles.status}>Minting...</div>}
                  {mintData && (
                    <div className={styles.action}>
                      <a
                        href={`https://etherscan.io/tx/${mintData.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View transaction
                      </a>
                    </div>
                  )}
                  {contractError && (
                    <div className={styles.error}>{contractError.message}</div>
                  )}
                  {mintError && (
                    <div className={styles.error}>{mintError.message}</div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
