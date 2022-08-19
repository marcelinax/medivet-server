import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MedivetMailerSubjectsConstants } from '@/medivet-mailer/constants/medivet-mailer-subjects.constants';

@Injectable()
export class MedivetMailerService {
    constructor(private mailerService: MailerService) { }
    
    async sendResetPasswordLinkMail(
        recipientEmail: string,
        name: string,
        resetPasswordLink: string
    ): Promise<void> {
        await this.mailerService.sendMail({
            to: recipientEmail,
            subject: MedivetMailerSubjectsConstants.RESET_PASSWORD,
            template: 'reset-password',
            context: {
                name,
                resetPasswordLink
            }
        })
    }
}