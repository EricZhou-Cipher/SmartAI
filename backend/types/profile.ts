export interface AddressProfile {
  address: string;
  riskScore: number;
  lastUpdated: string;
  tags: string[];
  category: string;
  transactionCount: number;
  totalValue: string;
  firstSeen: string;
  lastSeen: string;
  relatedAddresses: string[];
}

export interface ProfileFetchError {
  address: string;
  error: string;
  timestamp: string;
} 