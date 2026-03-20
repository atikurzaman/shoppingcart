import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useApiQuery<T>(key: string[], queryFn: () => Promise<T>, options?: any) {
  return useQuery({
    queryKey: key,
    queryFn,
    ...options,
  })
}

export function useApiMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export { api }
