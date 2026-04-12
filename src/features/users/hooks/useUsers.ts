import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteUser, getUser, getUsers, inviteUser, toggleUserStatus, updateUser,
} from '../api/user.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { InviteUserRequest, UpdateUserRequest, UserListParams } from '../../../types/user.types';

export const useUserList = (params: UserListParams & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: [QUERY_KEYS.users, queryParams],
    queryFn: () => getUsers(queryParams),
    enabled,
  });
};

export const useUser = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.user, id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: InviteUserRequest) => inviteUser(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserRequest) => updateUser(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user, id] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
};