import { MedivetVetAvailabilityDay } from "@/medivet-commons/enums/medivet-vet-availability.enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMilitaryTime, IsNotEmpty } from "class-validator";

export class MedivetCreateVetAvailabilityReceptionHourDto {
    @ApiProperty({
        required: true,
        enum: MedivetVetAvailabilityDay
    })
    @IsEnum(MedivetVetAvailabilityDay)
    @IsNotEmpty()
    day: MedivetVetAvailabilityDay;

    @ApiProperty({
        required: true,
        example: '09:00'
    })
    @IsNotEmpty()
    @IsMilitaryTime()
    hourFrom: string;

    @ApiProperty({
        required: true,
        example: '12:00'
    })
    @IsNotEmpty()
    @IsMilitaryTime()
    hourTo: string;

    // @ApiProperty({
    //     required: true,
    //     example: 1
    // })
    // @IsPositive()
    // @IsNumber()
    // @IsNotEmpty()
    // availabilityId: number;
}