import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import { MedivetAppModule } from '@/medivet-app/medivet-app.module';

async function bootstrap() {
  const appListenPort = process.env.LISTEN_PORT || 3002;

  const app = await NestFactory.create(MedivetAppModule);

  const config = new DocumentBuilder()
    .setTitle('Medivet API')
    .setVersion(version)
    .addSecurity('bearer', {
    type: 'http',
    scheme: 'bearer'
    })
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {customSiteTitle: 'Medivet :: Swagger v' + version});

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(appListenPort);
}
bootstrap();
