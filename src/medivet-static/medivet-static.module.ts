import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "../..", "medivet-static/static"),
            serveRoot: "/static"
        })
    ]
})
export class MedivetStaticModule {}