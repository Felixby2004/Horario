export function formatearTextoVisualOracion(valor: unknown, fallback = '') {
  const texto = String(valor ?? '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!texto) {
    return fallback;
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
