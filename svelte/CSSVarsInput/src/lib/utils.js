import { CSS_COLOR_NAMES } from "./consts";

export const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string)


export function fixCSSUrl(value) {
    // Buscar el primer contenido entre paréntesis
    const match = value.match(/\(([^()]*)\)/); // Captura contenido no anidado dentro del primer paréntesis
    return match ? `${match[1]}` : `${value}`; // Devuelve el contenido si hay coincidencia; si no, devuelve una cadena vacía
}

export function isValidCSSUrl(value) {
    // Regex para encontrar "url(...)" con cualquier contenido dentro de los paréntesis
    const urlRegex = /^url\(([^)]+)\)$/;
  
    // Verificar si el valor coincide completamente con el formato "url(...)"
    return urlRegex.test(value.trim());
}

export function getHref(value) {
  // Regex para encontrar URLs en formato "url(http://...)" o "url(https://...)"
  const urlRegex = /^url\(([^)]+)\)$/;

  // Verificar si hay una URL válida en el texto
  const match = urlRegex.exec(value);
  return match ? match[1] : null;
}

export function formatColor(value) {
  const color = CSS_COLOR_NAMES[value.toLowerCase()];
  return color || value;
}

export function isValidColor(value) {
  // Verificar si es un nombre de color válido
  if (CSS_COLOR_NAMES[value.toLowerCase()]) {
    return true;
  }

  // Expresión regular para verificar valores hexadecimales de 3, 6 o 8 dígitos
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

  // Verificar si es un valor hexadecimal válido
  if (hexRegex.test(value)) {
    return true;
  }

  return false;
}
