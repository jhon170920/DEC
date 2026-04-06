import { useWindowDimensions, Platform, StatusBar } from "react-native";

export const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();

  const statusH = Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ?? 24);
  const usableH = height - statusH;

  // ── Breakpoints ───────────────────────────────────────────
  const isSmall = usableH < 680;          // ej. iPhone SE, Galaxy A03
  const isMed   = usableH >= 680 && usableH < 780; // ej. iPhone 13 mini, Pixel 5
  // isLarge → todo lo demás (iPhone 14 Pro Max, Galaxy S23 Ultra, tablets)

  // Función utilitaria: porcentaje del alto usable
  const sp = (pct) => usableH * pct;
  // Función utilitaria: porcentaje del ancho
  const wp = (pct) => width * pct;

  return {
    // ── Utilidades ─────────────────────────────────────────
    sp,
    wp,

    // ── Layout general ─────────────────────────────────────
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

    // ── Dropdown (MainApp) ─────────────────────────────────
    dropItemPV    : isSmall ? 10 : isMed ? 12 : 14,   // paddingVertical ítem drop
    dropIconS     : isSmall ? 15 : isMed ? 16 : 17,   // ícono dentro del drop
    dropTitleS    : isSmall ? 13 : isMed ? 13.5: 14,  // título ítem drop
    dropSubS      : isSmall ? 10.5: isMed ? 11 : 11.5,// subtítulo ítem drop
  };
};