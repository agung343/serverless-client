import { queryOptions } from "@tanstack/react-query";
import { getMe } from "./auth";

export const authQueryOptions = () => queryOptions({
    queryKey: ["auth"],
    queryFn: () => getMe(),
})