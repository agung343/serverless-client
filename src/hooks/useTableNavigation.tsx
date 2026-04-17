import { useNavigate, type RegisteredRouter, type ValidateNavigateOptions } from "@tanstack/react-router";
import { useDebounceCallback } from "./debounce";

type TableNavigateOptions<TRouter extends RegisteredRouter = RegisteredRouter, TOptions = unknown> =
  ValidateNavigateOptions<TRouter, TOptions>

export function useTableNavigation(fullPath: string) {
    const navigate = useNavigate();

  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page })} as TableNavigateOptions)

  const setLimit = (limit: number) => {
    navigate({search: (prev) => ({...prev, page: 1, limit})} as TableNavigateOptions)
  }

  const setDateRange = (startDate?:string, endDate?: string) => {
    navigate({search: (prev) => ({...prev, startDate, endDate, page: 1})} as TableNavigateOptions)
  }

  const setSearch = useDebounceCallback((key: string, value: string) => {
    navigate({search: (prev) => ({...prev, [key]: value || undefined, page: 1})} as TableNavigateOptions)
  })

  return {
    setPage,
    setLimit,
    setDateRange,
    setSearch
  }
}
