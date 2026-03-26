import { queryOptions } from "@tanstack/react-query";
import { getCategories } from "./api/category";

export const categoriesQueryOptions = () => queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories()
})