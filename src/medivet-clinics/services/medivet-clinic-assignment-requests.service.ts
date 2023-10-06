import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MedivetCreateClinicAssignmentRequestDto } from "@/medivet-clinics/dto/medivet-create-clinic-assignment-request.dto";
import { MedivetSearchClinicAssignmentRequestDto } from "@/medivet-clinics/dto/medivet-search-clinic-assignment-request.dto";
import { MedivetClinicAssignmentRequest } from "@/medivet-clinics/entities/medivet-clinic-assignment-request.entity";
import { MedivetClinicsService } from "@/medivet-clinics/services/medivet-clinics.service";
import { ErrorMessagesConstants } from "@/medivet-commons/constants/error-messages.constants";
import { SuccessMessageConstants } from "@/medivet-commons/constants/success-message.constants";
import { OkMessageDto } from "@/medivet-commons/dto/ok-message.dto";
import { MedivetClinicAssignmentRequestStatus } from "@/medivet-commons/enums/enums";
import { paginateData } from "@/medivet-commons/utils";
import { MedivetUser } from "@/medivet-users/entities/medivet-user.entity";
import { MedivetUsersService } from "@/medivet-users/services/medivet-users.service";

@Injectable()
export class MedivetClinicAssignmentRequestService {
    constructor(
    @InjectRepository(MedivetClinicAssignmentRequest) private assignmentRequestsRepository: Repository<MedivetClinicAssignmentRequest>,
    @InjectRepository(MedivetUser) private usersRepository: Repository<MedivetUser>,
    private clinicsService: MedivetClinicsService,
    private usersService: MedivetUsersService
    ) {
    }

    async findClinicAssignmentRequestById(id: number, include?: string[]): Promise<MedivetClinicAssignmentRequest> {
        const clinicAssignmentRequest = await this.assignmentRequestsRepository.findOne({
            where: { id },
            relations: include ?? []
        });

        if (!clinicAssignmentRequest) {
            throw new NotFoundException([
                {
                    message: ErrorMessagesConstants.CLINIC_ASSIGNMENT_REQUEST_WITH_THIS_ID_DOES_NOT_EXIST,
                    property: "all"
                }
            ]);
        }
        return clinicAssignmentRequest;
    }

    async requestToAssignClinic(vet: MedivetUser, clinicId: number): Promise<OkMessageDto> {
        const clinic = await this.clinicsService.findClinicById(clinicId, [ "vets" ]);
        const isAlreadyAssigned = this.clinicsService.checkIfClinicIsAlreadyAssignedToVet(clinic, vet);

        if (isAlreadyAssigned) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.THIS_CLINIC_IS_ALREADY_ASSIGNED,
                    property: "all"
                }
            ]);
        }

        const existingRequest = await this.checkIfAssignmentRequestAlreadyExists(clinicId, vet.id, MedivetClinicAssignmentRequestStatus.TO_ASSIGN);
        if (existingRequest) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CLINIC_ASSIGNMENT_REQUEST_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        await this.createClinicAssignmentRequest({
            clinicId,
            userId: vet.id,
            status: MedivetClinicAssignmentRequestStatus.TO_ASSIGN
        });
        return { message: SuccessMessageConstants.REQUEST_HAS_BEEN_SEND };
    }

    async requestToUnassignToClinic(vet: MedivetUser, clinicId: number): Promise<OkMessageDto> {
        const clinic = await this.clinicsService.findClinicById(clinicId, [ "vets" ]);
        const isAlreadyAssigned = this.clinicsService.checkIfClinicIsAlreadyAssignedToVet(clinic, vet);

        if (!isAlreadyAssigned) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_UNASSIGN_NOT_ASSIGNED_CLINIC,
                    property: "all"
                }
            ]);
        }

        const existingRequest = await this.checkIfAssignmentRequestAlreadyExists(clinicId, vet.id, MedivetClinicAssignmentRequestStatus.TO_UNASSIGN);
        if (existingRequest) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CLINIC_ASSIGNMENT_REQUEST_ALREADY_EXISTS,
                    property: "all"
                }
            ]);
        }

        await this.createClinicAssignmentRequest({
            clinicId,
            userId: vet.id,
            status: MedivetClinicAssignmentRequestStatus.TO_UNASSIGN
        });
        return { message: SuccessMessageConstants.REQUEST_HAS_BEEN_SEND };
    };

    async cancelClinicUnassignment(clinicId: number, vet: MedivetUser): Promise<OkMessageDto> {
        const doesRequestExist = await this.checkIfAssignmentRequestAlreadyExists(clinicId, vet.id, MedivetClinicAssignmentRequestStatus.TO_UNASSIGN);

        if (!doesRequestExist) {
            throw new BadRequestException([
                {
                    message: ErrorMessagesConstants.CANNOT_CANCEL_CLINIC_ASSIGNMENT_REQUEST,
                    property: "all"
                }
            ]);
        }
        const requestToUnassign = await this.assignmentRequestsRepository.findOne({
            where: {
                clinic: { id: clinicId },
                user: { id: vet.id },
                status: MedivetClinicAssignmentRequestStatus.TO_UNASSIGN
            },
        });
        await this.removeClinicRequestAssignment(requestToUnassign);

        return { message: SuccessMessageConstants.CLINIC_UNASSIGNMENT_REQUEST_HAS_BEEN_CANCELLED };
    }

    async searchClinicRequestAssignments(searchDto: MedivetSearchClinicAssignmentRequestDto): Promise<MedivetClinicAssignmentRequest[]> {
        const requests = await this.assignmentRequestsRepository.find({ relations: [ "user", "clinic" ] });

        return paginateData(requests, {
            pageSize: searchDto.pageSize,
            offset: searchDto.offset
        });

    }

    async confirmClinicAssignment(clinicAssignmentRequestId: number)
    : Promise<OkMessageDto> {
        const request = await this.findClinicAssignmentRequestById(clinicAssignmentRequestId, [ "user", "clinic", "user.clinics" ]);

        const user = { ...request.user };
        user.clinics = [ ...user.clinics, request.clinic ];
        await this.usersRepository.save(user);
        await this.removeClinicRequestAssignment(request);

        return { message: SuccessMessageConstants.CLINIC_HAS_BEEN_ASSIGNED_TO_VET };
    }

    async rejectClinicAssignment(clinicAssignmentRequestId: number): Promise<OkMessageDto> {
        const request = await this.findClinicAssignmentRequestById(clinicAssignmentRequestId, [ "user", "clinic" ]);
        await this.removeClinicRequestAssignment(request);

        return { message: SuccessMessageConstants.REQUEST_HAS_BEEN_REJECTED };
    }

    async confirmClinicUnassignment(clinicAssignmentRequestId: number)
    : Promise<OkMessageDto> {
        const request = await this.findClinicAssignmentRequestById(clinicAssignmentRequestId, [ "user", "clinic", "user.clinics" ]);

        const user = { ...request.user };
        const clinicToRemove = { ...request.clinic };
        const userClinics = [ ...user.clinics ];
        const indexOfClinicToRemove = userClinics.indexOf(clinicToRemove);

        if (indexOfClinicToRemove !== -1) {
            userClinics.splice(indexOfClinicToRemove, 1);
            user.clinics = [ ...userClinics ];
            await this.usersRepository.save(user);
            await this.removeClinicRequestAssignment(request);
            return { message: SuccessMessageConstants.CLINIC_HAS_BEEN_UNASSIGNED_TO_VET };
        }
    }

    async rejectClinicUnassignment(clinicAssignmentRequestId: number): Promise<OkMessageDto> {
        const request = await this.findClinicAssignmentRequestById(clinicAssignmentRequestId, [ "user", "clinic" ]);
        await this.removeClinicRequestAssignment(request);

        return { message: SuccessMessageConstants.REQUEST_HAS_BEEN_REJECTED };
    }

    private async checkIfAssignmentRequestAlreadyExists(clinicId: number, userId: number, status: MedivetClinicAssignmentRequestStatus): Promise<boolean> {
        return !!(await this.assignmentRequestsRepository.findOne({
            where: {
                clinic: { id: clinicId },
                user: { id: userId },
                status
            },
        }));
    }

    private async createClinicAssignmentRequest(createClinicAssignmentRequestDto: MedivetCreateClinicAssignmentRequestDto): Promise<MedivetClinicAssignmentRequest> {
        const { clinicId, userId, status } = createClinicAssignmentRequestDto;
        const clinic = await this.clinicsService.findClinicById(clinicId);
        const user = await this.usersService.findOneById(userId);

        const newRequest = this.assignmentRequestsRepository.create({
            clinic,
            user,
            status
        });
        await this.assignmentRequestsRepository.save(newRequest);

        return newRequest;
    }

    private async removeClinicRequestAssignment(clinicAssignmentRequest: MedivetClinicAssignmentRequest): Promise<void> {
        await this.assignmentRequestsRepository.remove(clinicAssignmentRequest);
    }
}
