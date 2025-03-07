export interface AddressProfile {
  address: string;
  type: 'normal' | 'new' | 'blacklist' | 'whitelist';
  riskScore: number;
  lastUpdated: Date;
  metadata?: Record<string, any>;
} 