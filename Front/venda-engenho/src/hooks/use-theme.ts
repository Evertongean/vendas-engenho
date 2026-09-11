import { useSettings } from "@/context/SettingsContext";

export function useTheme() {
  const { colors } = useSettings();

  return colors;
}
