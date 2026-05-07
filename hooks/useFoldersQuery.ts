import { useQuery } from "@tanstack/react-query";
import { Folder } from "@/types";

export function useFoldersQuery() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async (): Promise<Folder[]> => {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}
