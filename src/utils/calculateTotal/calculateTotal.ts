export function calculateTotal(input: string): number {
  if (!input) return 0;
  const parts = input.split(/[\n,]+/);
  const numbers = parts.map((part) => parseFloat(part.trim())).filter((n) => !isNaN(n));
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total;
}
