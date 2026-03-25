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

    // ── Logo / marca ───────────────────────────────────────
    logoRingS : isSmall ? 68  : isMed ? 80  : 92,
    logoImgS  : isSmall ? 44  : isMed ? 54  : 62,

    // ── Tipografía ─────────────────────────────────────────
    headlineS   : isSmall ? 26   : isMed ? 30   : 34,
    sublineS    : isSmall ? 12   : isMed ? 13   : 13.5,
    greetingS   : isSmall ? 22   : isMed ? 26   : 28,   // texto "Bienvenido"
    greetingSubS: isSmall ? 12.5 : isMed ? 13   : 13.5, // subtítulo greeting
    brandS      : isSmall ? 15   : isMed ? 16   : 17,

    // ── Campos / botones (otras pantallas) ─────────────────
    fieldH  : isSmall ? 52 : isMed ? 56 : 60,
    btnH    : isSmall ? 46 : isMed ? 50 : 56,
    ghostH  : isSmall ? 40 : isMed ? 44 : 50,
    socialH : isSmall ? 42 : isMed ? 46 : 52,
    iconS   : isSmall ? 18 : isMed ? 20 : 22,

    // ── Header (MainApp) ───────────────────────────────────
    headerPV      : isSmall ? 10 : isMed ? 13 : 16,   // paddingVertical header
    avatarInnerS  : isSmall ? 34 : isMed ? 38 : 42,   // tamaño círculo avatar
    avatarIconS   : isSmall ? 17 : isMed ? 19 : 21,   // ícono dentro del avatar

    // ── Greeting block (MainApp) ───────────────────────────
    greetingMT    : isSmall ? 10 : isMed ? 16 : 22,   // marginTop del bloque
    greetingMB    : isSmall ? 12 : isMed ? 16 : 20,   // marginBottom del bloque

    // ── Imagen principal (MainApp) ─────────────────────────
    imageH        : isSmall ? 180 : isMed ? 210 : 240, // alto de la imagen
    imageBR       : isSmall ? 16  : isMed ? 20  : 24,  // borderRadius card imagen
    imageMB       : isSmall ? 14  : isMed ? 18  : 22,  // marginBottom card imagen

    // ── Botón Scan (MainApp) ───────────────────────────────
    scanBtnH      : isSmall ? 48 : isMed ? 54 : 60,   // alto del botón scan
    scanBtnMB     : isSmall ? 20 : isMed ? 24 : 28,   // marginBottom botón scan
    scanBtnBR     : isSmall ? 14 : isMed ? 16 : 18,   // borderRadius botón scan
    scanIconS     : isSmall ? 18 : isMed ? 20 : 22,   // ícono cámara
    scanTextS     : isSmall ? 14 : isMed ? 15 : 16,   // texto "Escanear planta"

    // ── Sección ACCIONES (MainApp) ─────────────────────────
    sectionLabelS : isSmall ? 10 : isMed ? 11 : 12,   // tamaño label "ACCIONES"

    // ── Menu cards (MainApp) ───────────────────────────────
    menuCardPV    : isSmall ? 12 : isMed ? 14 : 16,   // paddingVertical card
    menuCardPH    : isSmall ? 14 : isMed ? 16 : 18,   // paddingHorizontal card
    menuCardMB    : isSmall ? 8  : isMed ? 10 : 12,   // marginBottom entre cards
    menuCardBR    : isSmall ? 14 : isMed ? 16 : 18,   // borderRadius card
    menuIconWrapS : isSmall ? 38 : isMed ? 42 : 46,   // tamaño contenedor ícono
    menuIconWrapBR: isSmall ? 10 : isMed ? 12 : 14,   // borderRadius contenedor
    menuIconS     : isSmall ? 20 : isMed ? 22 : 24,   // tamaño ícono
    menuTitleS    : isSmall ? 13.5: isMed ? 14.5: 15.5,// título card
    menuSubS      : isSmall ? 11 : isMed ? 11.5: 12,  // subtítulo card
    menuChevronS  : isSmall ? 14 : isMed ? 15 : 16,   // ícono chevron derecho

    // ── Dropdown (MainApp) ─────────────────────────────────
    dropItemPV    : isSmall ? 10 : isMed ? 12 : 14,   // paddingVertical ítem drop
    dropIconS     : isSmall ? 15 : isMed ? 16 : 17,   // ícono dentro del drop
    dropTitleS    : isSmall ? 13 : isMed ? 13.5: 14,  // título ítem drop
    dropSubS      : isSmall ? 10.5: isMed ? 11 : 11.5,// subtítulo ítem drop
  };
};