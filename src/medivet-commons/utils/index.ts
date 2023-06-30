import { OffsetPaginationDto } from '@/medivet-commons/dto/offset-pagination.dto';

export const paginateData = (data: any[], paginationDto: OffsetPaginationDto): any[] => {
    const pageSize = paginationDto.pageSize || 10;
    const offset = paginationDto.offset || 0;

    return data.filter((_, index) => index >= offset && index < offset + pageSize);
};
