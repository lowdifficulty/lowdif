export interface ProofOfListenResult {
  txHash: string;
  tokens: number;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  tokenSymbol: string;
}
