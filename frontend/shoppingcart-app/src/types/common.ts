export interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data?: T;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  succeeded: boolean;
  message?: string;
}
