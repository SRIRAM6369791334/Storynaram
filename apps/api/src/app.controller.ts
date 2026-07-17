import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root(): Record<string, string> {
    return {
      service: 'storynaram-api',
      version: '2.1.0',
      status: 'running',
    };
  }
}
