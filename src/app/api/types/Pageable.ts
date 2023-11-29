export interface PageableResults<T> {
    data: T[];
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
    offset: number;
}

export interface Paging {
  page: number;
  size: number;
}

export const defaultPaging: Paging = {
    page: 0,
    size: -1
};
