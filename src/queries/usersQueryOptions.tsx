import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "../api/users";

export const usersQueryOptions = () => queryOptions({
    queryKey: ["users"],
    queryFn: () => getUsers()
})