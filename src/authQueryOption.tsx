import { queryOptions } from "@tanstack/react-query";
import { getMe } from "./api/auth";

export const authQueryOptions = () => queryOptions({
    queryKey: ["auth"],
    queryFn: () => getMe(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
})