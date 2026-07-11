import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => [],
    staleTime: 5 * 60 * 1000, // cache 5 mins
  });
};
