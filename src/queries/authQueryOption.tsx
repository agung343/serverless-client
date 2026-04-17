import { queryOptions } from "@tanstack/react-query";
import { getMe } from "../api/auth";

export const authQueryOptions = () => queryOptions({
    queryKey: ["auth", "me"],
    queryFn: () => getMe(),
    retry:false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true
})