/**
 * 溯源相关接口
 */

import { get } from '../utils/request';

export interface BatchInfo {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  organization: string;
  farmName: string;
  farmAddress: string;
  cultivationArea: string;
  plantingTime: string;
  harvestTime: string;
  plannedQuantity: number;
  actualQuantity: number;
  status: number;
  remark?: string;
  chainStatus?: number;
  txHash?: string;
  chainTime?: string;
  createTime: string;
  updateTime: string;
}

export interface GrowthRecord {
  id: string;
  batchId: string;
  recordTime: string;
  growthStage: string;
  temperature?: string;
  humidity?: string;
  weather?: string;
  pestControl?: string;
  fertilization?: string;
  irrigation?: string;
  description: string;
  images?: string;
  recordBy: string;
  chainStatus?: number;
  txHash?: string;
  chainTime?: string;
  createTime: string;
  updateTime: string;
}

export interface BlockchainVerification {
  isVerified: boolean;
  message: string;
  txHash?: string;
  chainTime?: string;
}

export interface TraceInfo {
  batchInfo: BatchInfo;
  growthRecords: GrowthRecord[];
  verification: BlockchainVerification;
}

/**
 * 获取批次溯源信息
 */
export function getTraceInfo(batchNumber: string): Promise<TraceInfo> {
  return get(`/trace/batch/${batchNumber}`);
}

/**
 * 验证区块链交易
 */
export function verifyTransaction(txHash: string): Promise<BlockchainVerification> {
  return get(`/trace/verify/${txHash}`);
}

/**
 * 生成批次二维码
 */
export function generateQRCode(batchNumber: string): Promise<{
  batchNumber: string;
  qrCode: string;
}> {
  return get(`/trace/qrcode/${batchNumber}`);
}
