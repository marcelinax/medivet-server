import { NestFactory } from '@nestjs/core';
import { MedivetAppModule } from './medivet-app/medivet-app.module';

async function bootstrap() {
  const appListenPort = process.env.LISTEN_PORT || 3002;

  const app = await NestFactory.create(MedivetAppModule);
  await app.listen(appListenPort);
}
bootstrap();
