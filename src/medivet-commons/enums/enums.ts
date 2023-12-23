export enum MedivetClinicAssignmentRequestStatus {
  TO_ASSIGN = "TO_ASSIGN",
  TO_UNASSIGN = "TO_UNASSIGN",
}

export enum MedivetGenderEnum {
  FEMALE = "female",
  MALE = "male",
  UNKNOWN = "unknown"
}

export enum MedivetSortingModeEnum {
  DESC = "desc",
  ASC = "asc",
  NEWEST = "newest",
  OLDEST = "oldest",
  HIGHEST_RATE = "highest-rate",
  LOWEST_RATE = "lowest-rate",
  MOST_OPINIONS = "most-opinions",
  LEAST_OPINIONS = "least-opinions",
  NEAREST_AVAILABILITY = "nearest-availability"
}

export enum MedivetStatusEnum {
  ACTIVE = "active",
  ARCHIVED = "archived"
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
