"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  connect,
  disconnect,
  isConnected,
  request,
} from "@stacks/connect";
import { verifyMessageSignatureRsv } from "@stacks/encryption";
import type { ClarityValue, TupleCV } from "@stacks/transactions";

interface WalletContextType {
  connected: boolean;
  stxAddress: string | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransfer: (
    recipient: string,
    amountMicro: string,
    memo?: string
  ) => Promise<{ txid: string }>;
  signMessage: (message: string) => Promise<{ signature: string; publicKey: string }>;
  signStructuredMessage: (domain: TupleCV, message: ClarityValue) => Promise<{ signature: string; publicKey: string }>;
  verifySignature: (message: string, signature: string, publicKey: string) => boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  stxAddress: null,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  sendTransfer: async () => ({ txid: "" }),
  signMessage: async () => ({ signature: "", publicKey: "" }),
  signStructuredMessage: async () => ({ signature: "", publicKey: "" }),
  verifySignature: () => false,
});

export function useWallet() {
  return useContext(WalletContext);
}

const STORAGE_KEY = "stx_dispense_wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = useCallback(() => {
    try {
      if (isConnected()) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setConnected(true);
          setStxAddress(stored);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = useCallback(async () => {
    try {
      setConnecting(true);
      const response = await connect();
      const addr = response.addresses[0]?.address;
      if (addr) {
        setConnected(true);
        setStxAddress(addr);
        localStorage.setItem(STORAGE_KEY, addr);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setConnected(false);
    setStxAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendTransfer = useCallback(
    async (recipient: string, amountMicro: string, memo?: string) => {
      const result = await request("sendTransfer", {
        recipients: [{ address: recipient, amount: amountMicro }],
        network: "mainnet",
      });

      return result as { txid: string };
    },
    []
  );

  const signMessage = useCallback(async (message: string) => {
    const result = await request("stx_signMessage", {
      message,
    });

    return result as { signature: string; publicKey: string };
  }, []);

  const signStructuredMessage = useCallback(
    async (domain: TupleCV, message: ClarityValue) => {
      const result = await request("stx_signStructuredMessage", {
        domain,
        message,
      });

      return result as { signature: string; publicKey: string };
    },
    []
  );

  const verifySignature = useCallback(
    (message: string, signature: string, publicKey: string) => {
      try {
        return verifyMessageSignatureRsv({
          message,
          signature,
          publicKey,
        });
      } catch {
        return false;
      }
    },
    []
  );

  return (
    <WalletContext.Provider
      value={{
        connected,
        stxAddress,
        connecting,
        connectWallet,
        disconnectWallet,
        sendTransfer,
        signMessage,
        signStructuredMessage,
        verifySignature,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
