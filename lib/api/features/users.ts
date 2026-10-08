import type { ApiTransport } from "@/lib/api/transport";
import type { AdminCreateUserRequest, AdminUpdateUserRequest, PaginatedResponse, UpdateUserStatusRequest, UserProfileDto, UserQuery } from "@/types/api";

export function createUsersApi(request: ApiTransport) {
  return {
    getProfile: (userId: string) => request<UserProfileDto>(`/users/${userId}/profile`),
    list: (query?: UserQuery) => request<PaginatedResponse<UserProfileDto>>("/users", { query }),
    create: (body: AdminCreateUserRequest) => request<UserProfileDto>("/users", { method: "POST", body }),
    update: (userId: string, body: AdminUpdateUserRequest) => request<UserProfileDto>(`/users/${userId}`, { method: "PUT", body }),
    updateStatus: (userId: string, body: UpdateUserStatusRequest) => request<UserProfileDto>(`/users/${userId}/status`, { method: "PATCH", body }),
  };
}

export type UsersApi = ReturnType<typeof createUsersApi>;
