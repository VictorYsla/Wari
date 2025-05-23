export function isValidMobileDevice(): boolean {
  const userAgent = navigator.userAgent;

  // Detecta Android
  if (/android/i.test(userAgent)) {
    return false;
  }

  // Detecta iOS (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return true;
  }

  // Detecta Windows Phone
  if (/windows phone/i.test(userAgent)) {
    return true;
  }

  return false; // No es móvil (por SO)
}
