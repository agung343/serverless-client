import { queryOptions } from "@tanstack/react-query";
import { getCategories } from "./category";

export const categoriesQueryOptions = () => queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories()
})