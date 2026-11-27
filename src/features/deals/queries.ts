import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDeal, listAllDeals, listDeals, updateDeal, type DealListParams } from '../../api/deals'
import type { DealFormValues } from '../../domain/deal'

export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (params: DealListParams) => [...dealKeys.lists(), params] as const,
  detail: (id: string) => [...dealKeys.all, 'detail', id] as const,
  everything: () => [...dealKeys.all, 'everything'] as const,
}

export const dealListOptions = (params: DealListParams) =>
  queryOptions({
    queryKey: dealKeys.list(params),
    queryFn: () => listDeals(params),
  })

export const dealDetailOptions = (id: string) =>
  queryOptions({
    queryKey: dealKeys.detail(id),
    queryFn: () => getDeal(id),
  })

export const allDealsOptions = () =>
  queryOptions({
    queryKey: dealKeys.everything(),
    queryFn: listAllDeals,
  })

export function useUpdateDeal(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: DealFormValues) => updateDeal(id, values),
    onSuccess: async (deal) => {
      queryClient.setQueryData(dealKeys.detail(id), deal)
      await queryClient.invalidateQueries({ queryKey: dealKeys.all, refetchType: 'active' })
    },
  })
}
