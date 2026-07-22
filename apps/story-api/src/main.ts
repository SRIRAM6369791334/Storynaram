import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { GlobalValidationPipe } from './common/pipes/validation.pipe.js';
import { RequestIdMiddleware } from './middleware/request-id.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(new RequestIdMiddleware().use);

  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Storynaram API')
    .setDescription('Storynaram Story API Platform')
    .setVersion('3.4.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  const port = process.env.STORY_API_PORT ?? process.env.PORT ?? 3002;
  await app.listen(port);

  logger.log(`Storynaram Story API running on http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
