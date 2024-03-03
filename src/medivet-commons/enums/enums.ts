export enum MedivetClinicAssignmentRequestStatus {
  TO_ASSIGN = "TO_ASSIGN",
  TO_UNASSIGN = "TO_UNASSIGN",
}

export enum MedivetGenderEnum {
  FEMALE = "FEMALE",
  MALE = "MALE",
  UNKNOWN = "UNKNOWN"
}

export enum MedivetSortingModeEnum {
  DESC = "DESC",
  ASC = "ASC",
}

export enum MedivetOpinionSortingModeEnum {
  NEWEST = "NEWEST",
  OLDEST = "OLDEST",
  HIGHEST_RATE = "HIGHEST-RATE",
  LOWEST_RATE = "LOWEST-RATE",
}

export enum MedivetAnimalStatusEnum {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED"
}

export enum MedivetVetAvailabilityDay {
  "MONDAY" = "MONDAY",
  "TUESDAY" = "TUESDAY",
  "WEDNESDAY" = "WEDNESDAY",
  "THURSDAY" = "THURSDAY",
  "FRIDAY" = "FRIDAY",
  "SATURDAY" = "SATURDAY",
  "SUNDAY" = "SUNDAY",
}

export enum MedivetVetAvailabilityDaySorter {
  "MONDAY" = 0,
  "TUESDAY" = 1,
  "WEDNESDAY" = 2,
  "THURSDAY" = 3,
  "FRIDAY" = 4,
  "SATURDAY" = 5,
  "SUNDAY" = 6,
}

export enum MedivetDayWeek {
  "SUNDAY" = 0,
  "MONDAY" = 1,
  "TUESDAY" = 2,
  "WEDNESDAY" = 3,
  "THURSDAY" = 4,
  "FRIDAY" = 5,
  "SATURDAY" = 6
}

export enum MedivetAvailableDatesFilter {
  "TODAY" = "TODAY",
  "WITHIN_3_DAYS" = "WITHIN_3_DAYS",
  "WHENEVER" = "WHENEVER",
}

export enum MedivetAppointmentStatus {
  "IN_PROGRESS" = "IN_PROGRESS",
  "CANCELLED" = "CANCELLED",
  "FINISHED" = "FINISHED"
}

export enum MedivetOpinionStatus {
  "ACTIVE" = "ACTIVE",
  "REPORTED" = "REPORTED",
  "REMOVED" = "REMOVED"
}

export enum MedivetVacationStatus {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
}

export enum MedivetPaymentMethodStatus {
  "ACTIVE" = "ACTIVE",
  "INACTIVE" = "INACTIVE",
}

export enum MedivetAnimalType {
  "DOG" = "DOG",
  "CAT" = "CAT",
  "BIRD" = "BIRD",
  "FUR_ANIMAL" = "FUR_ANIMAL",
}
