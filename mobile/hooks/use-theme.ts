import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme() {
  const scheme = useColorScheme() ?? "dark";
  return {
    colors: Colors[scheme],
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
    isDark: scheme === "dark",
  };
}
