export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface PostSummary {
  id: string;
  title: string;
  postedAt: string;
  postedBy: string;
  tags: string[];
}

export interface PostDetail extends PostSummary {
  content: string;
}

export interface PaginatedPosts {
  items: PostSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
