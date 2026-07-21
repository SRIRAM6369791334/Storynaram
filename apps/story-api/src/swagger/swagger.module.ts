import { Injectable } from '@nestjs/common';
import { SwaggerModule as NestSwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Injectable()
export class SwaggerConfigService {
  createConfig() {
    return new DocumentBuilder()
      .setTitle('Storynaram Story API')
      .setDescription('Complete Story API Platform for Storynaram')
      .setVersion('3.4.0')
      .setContact('Storynaram Team', 'https://storynaram.com', 'team@storynaram.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
      .addServer('http://localhost:4000', 'Development')
      .build();
  }
}

export { NestSwaggerModule, DocumentBuilder };
