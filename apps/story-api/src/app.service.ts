import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): Record<string, string> {
    return {
      service: 'storynaram-story-api',
      version: '3.4.0',
      status: 'running',
    };
  }
}
