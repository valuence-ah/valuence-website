import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { ContentSection, SitePage } from "@shared/schema";

export function usePageContent(pageId: string) {
  const { data: sections = [], isLoading, isError, error } = useQuery<ContentSection[]>({
    queryKey: ["/api/sections", pageId],
    enabled: !!pageId,
  });

  const getSectionData = <T = Record<string, any>>(sectionType: string): T | null => {
    const section = sections.find(s => s.sectionType === sectionType);
    return section?.data as T || null;
  };

  const getSectionsByType = (sectionType: string): ContentSection[] => {
    return sections.filter(s => s.sectionType === sectionType);
  };

  const getAllSections = (): ContentSection[] => {
    return sections;
  };

  const hasSection = (sectionType: string): boolean => {
    return sections.some(s => s.sectionType === sectionType);
  };

  return {
    sections,
    isLoading,
    isError,
    error,
    getSectionData,
    getSectionsByType,
    getAllSections,
    hasSection,
  };
}

export function useAllPages() {
  return useQuery<SitePage[]>({
    queryKey: ["/api/pages"],
  });
}

export function invalidatePageContent(pageId: string) {
  queryClient.invalidateQueries({ queryKey: ["/api/sections", pageId] });
}

export function invalidateAllPages() {
  queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
}
