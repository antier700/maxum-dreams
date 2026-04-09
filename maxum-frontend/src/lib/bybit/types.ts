export interface BybitEarnProduct {
  category: string;
  estimateApr: string;
  coin: string;
  minStakeAmount: string;
  maxStakeAmount: string;
  precision: string;
  productId: string;
  status: string;
  duration?: string;
  term?: number;
  swapCoin?: string;
  rewardDistributionType?: string;
  bonusEvents?: Array<{ apr?: string; coin?: string; announcement?: string }>;
}

export interface BybitEarnProductsResponse {
  list: BybitEarnProduct[];
  updatedAt: number;
}
