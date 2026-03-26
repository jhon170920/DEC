import { useWindowDimensions, Platform, StatusBar } from "react-native";

export const useResponsiveLayout = () => {

  const { width, height } = useWindowDimensions();

  const statusH = Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ?? 24);
  const usableH = height - statusH;

  const isSmall = usableH < 680;
  const isMed = usableH >= 680 && usableH < 780;

  const sp = (pct) => usableH * pct;

  return {

    sp,
    hPad: width * 0.072,

    logoRingS: isSmall ? 68 : isMed ? 80 : 92,
    logoImgS: isSmall ? 44 : isMed ? 54 : 50,
    headlineS: isSmall ? 26 : isMed ? 30 : 34,
    sublineS: isSmall ? 12 : 13.5,
    fieldH: isSmall ? 52 : isMed ? 56 : 60,
    btnH: isSmall ? 46 : isMed ? 50 : 56,
    ghostH: isSmall ? 40 : isMed ? 44 : 50,
    socialH: isSmall ? 42 : isMed ? 46 : 52,
    iconS: isSmall ? 18 : 22,
    brandS: isSmall ? 15 : 17,

  };
};