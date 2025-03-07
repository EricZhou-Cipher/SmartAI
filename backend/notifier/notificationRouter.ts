import { RiskAnalysis } from '../types/events';
import { NormalizedEvent } from '../types/events';

export interface NotificationParams {
  event: NormalizedEvent;
  riskAnalysis: RiskAnalysis;
  channels: string[];
  traceId: string;
}

export class NotificationRouter {
  async route(params: NotificationParams): Promise<void> {
    throw new Error('Not implemented');
  }

  static async send(event: NormalizedEvent, riskAnalysis: RiskAnalysis, channels: string[]): Promise<void> {
    // TODO: 实现通知发送逻辑
    console.log('Sending notification:', { event, riskAnalysis, channels });
  }
} 