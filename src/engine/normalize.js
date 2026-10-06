export function normalizeLatinText(input = '') {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function lettersOnly(normalized = '') {
  return normalized.replace(/[^A-Z]/g, '').split('');
}
