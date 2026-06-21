"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface StxAddress {
  address: string;
  publicKey: string;
}

interface WalletProviderAPI {
  connect: () => Promise<{ addresses: StxAddress[] }>;
  disconnect: () => Promise<void>;
  getAddresses: () => Promise<{ addresses: StxAddress[] }>;
  request: (method: string, params: Record<string, unknown>) => Promise<unknown>;
}

interface WindowWithWallets {
  LeatherProvider?: WalletProviderAPI;
  XverseProviders?: { STX?: WalletProviderAPI };
}

declare const window: WindowWithWallets;

interface WalletContextType {
  connected: boolean;
  stxAddress: string | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransfer: (recipient: string, amountMicro: string, memo?: string) => Promise<{ txId: string }>;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  stxAddress: null,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  sendTransfer: async () => ({ txId: "" }),
});

export function useWallet() {
  return useContext(WalletContext);
}

function getProvider(): WalletProviderAPI | null {
  if (typeof window === "undefined") return null;
  if (window.LeatherProvider) return window.LeatherProvider;
  if (window.XverseProviders?.STX) return window.XverseProviders.STX;
  return null;
}

const STORAGE_KEY = "stx_dispense_wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConnected(true);
        setStxAddress(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      alert("No Stacks wallet found. Please install Leather or Xverse.");
      return;
    }
    try {
      setConnecting(true);
      const response = await provider.connect();
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
    setConnected(false);
    setStxAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendTransfer = useCallback(
    async (recipient: string, amountMicro: string, memo?: string) => {
      const provider = getProvider();
      if (!provider) throw new Error("No wallet connected");

      const result = await provider.request("stx_transferStx", {
        recipient,
        amount: amountMicro,
        memo: memo || "",
        network: "mainnet",
      });

      return result as { txId: string };
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
