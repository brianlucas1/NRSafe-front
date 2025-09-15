export interface PageDTO<T> {
  content: T[];
  totalElements: number;
  page?: number;
  size?: number;
  totalPages?: number;
}