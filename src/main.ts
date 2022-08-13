import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MedivetAppModule } from './medivet-app/medivet-app.module';

async function bootstrap() {
  const appListenPort = process.env.LISTEN_PORT || 3002;

  const app = await NestFactory.create(MedivetAppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(appListenPort);
}
bootstrap();
