import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { MedivetAppModule } from "@/medivet-app/medivet-app.module";

import { version } from "../package.json";

async function bootstrap() {
    const appListenPort = process.env.LISTEN_PORT || 3002;

    const app = await NestFactory.create(MedivetAppModule);

    const config = new DocumentBuilder()
        .setTitle("Medivet API")
        .setVersion(version)
        .addSecurity("bearer", {
            type: "http",
            scheme: "bearer"
        })
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document, { customSiteTitle: "Medivet :: Swagger v" + version });

    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (errors) => {
                const result = errors.map((error) => ({
                    property: error.property,
                    message: error.constraints[Object.keys(error.constraints)[0]],
                }));
                return new BadRequestException(result);
            },
            stopAtFirstError: true,
            transform: true
        }),
    );

    await app.listen(appListenPort);
}

bootstrap();
