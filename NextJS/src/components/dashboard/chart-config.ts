export function truncateLabel(text: string, max = 20): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

export function generateChartColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 37 + 210) % 360;
    const sat = 70 + (i % 3) * 10;
    const light = 48 + (i % 5) * 4;
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }
  return colors;
}
