import { QueryKey, useQueryClient } from "@tanstack/react-query";

interface PrefetchConfig {
    queryKey: QueryKey,
    queryFn: () => Promise<unknown>
    staleTime?: number
}

export function usePrefetch() {
    const queryClient = useQueryClient()

    return (queries: PrefetchConfig[]) => {
        queries.forEach(({queryKey, queryFn, staleTime}) => {
            queryClient.prefetchQuery({
                queryKey,
                queryFn,
                staleTime
            })
        })
    }
}