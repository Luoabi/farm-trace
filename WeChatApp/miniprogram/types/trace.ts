// 溯源相关类型定义

export interface GrowthRecord {
  id: string;
  batchId: string;
  recordDate: string;
  recordType: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface BatchInfo {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  productionDate: string;
  expiryDate?: string;
  status: string;
  farmInfo?: {
    name: string;
    location: string;
    certification?: string;
  };
  blockchainTxHash?: string;
  createdAt?: string;
}

export interface TraceResponse {
  batch: BatchInfo;
  growthRecords: GrowthRecord[];
  blockchainVerified: boolean;
}

export interface BlockchainVerifyResponse {
  verified: boolean;
  txHash: string;
  timestamp?: string;
  blockNumber?: string;
}
