import { MailerModule } from "@nestjs-modules/mailer";
import { Global, Module } from "@nestjs/common";
import { MedivetMailerService } from "@/medivet-mailer/services/medivet-mailer.service";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Global()
    @Module({
        imports: [
    MailerModule.forRoot({
            transport: {
                host: process.env.MAIL_HOST,
                secure: false,
                auth: {
                    user:process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD
                }
            },
            defaults: {
                from: "Medivet <medivetnotify@gmail.com>"
            },
            preview: true,
            template: {
                dir: process.cwd() + '/dist/medivet-mailer/templates',
                adapter: new HandlebarsAdapter(),
                options: {strict: true}
            }
            })
        ],
        providers: [MedivetMailerService],
        exports: [MedivetMailerService]
})
export class MedivetMailerModule {}