import type { ProblemDetails } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly fieldErrors: Record<string, string[]>;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails = {}) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = problem.status ?? status;
    this.title = problem.title ?? "Request failed";
    this.detail = problem.detail ?? this.message;
    this.fieldErrors = problem.errors ?? {};
    this.problem = problem;
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isValidation() { return this.status === 400; }
  get isServerError() { return this.status >= 500; }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";
  let problem: ProblemDetails = {};

  if (contentType.includes("application/json") || contentType.includes("problem+json")) {
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = {};
    }
  } else {
    try {
      const detail = await response.text();
      if (detail) problem = { detail };
    } catch {
      problem = {};
    }
  }

  return new ApiError(response.status, problem);
}
