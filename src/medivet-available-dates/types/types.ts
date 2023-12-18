import { MedivetVetAvailabilityDay } from "@/medivet-commons/enums/enums";

export interface MedivetAvailableDate {
  dates: Date[];
  day: MedivetVetAvailabilityDay;
  date: Date;
}
