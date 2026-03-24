import { useQuery } from "@tanstack/react-query";
import type { SiteContent } from "@shared/schema";

const defaultContent: Record<string, Record<string, string>> = {
  hero: {
    title: "CREATING A CLEANER AND HEALTHIER FUTURE THROUGH THE POWER OF",
    highlight: "DEEPTECH",
    subtitle: "We invest in visionary founders developing world-changing technologies that accelerate planetary and human health.",
    button1: "Our Focus",
    button2: "View Portfolio",
  },
  focus: {
    label: "Our Focus",
    title: "DEEPTECH ACCELERATING",
    highlight: "CLEANTECH & TECHBIO",
    description: "Deeptech is the unsung hero powering a greener future and accelerating medical breakthroughs that refine global healthcare.",
  },
  team: {
    label: "Team",
    title: "We have built, scaled & exited",
    highlight: "businesses.",
    point1: "with 5 successful exits",
    point2: "who scaled cleantech & techbio businesses",
    point3: "who actively support visionary founders",
  },
  portfolio: {
    label: "Portfolio",
    title: "Investing in the Future",
    description: "World-changing technologies accelerating planetary and human health.",
  },
};

export function useSiteContent() {
  const { data: content = [], isLoading } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const contentMap = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = {};
    }
    acc[item.section][item.key] = item.value;
    return acc;
  }, {} as Record<string, Record<string, string>>);

  const getValue = (section: string, key: string): string => {
    if (contentMap[section]?.[key]) {
      return contentMap[section][key];
    }
    if (defaultContent[section]?.[key]) {
      return defaultContent[section][key];
    }
    return "";
  };

  return {
    getValue,
    isLoading,
    contentMap,
  };
}
