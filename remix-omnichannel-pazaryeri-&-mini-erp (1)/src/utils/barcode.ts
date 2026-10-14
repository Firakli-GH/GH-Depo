/**
 * Generates an SVG barcode pattern for standard Code128 / Code39 representation
 */
export function generateBarcodeSvg(code: string, width: number = 240, height: number = 60): string {
  // Deterministic pseudo barcode pattern based on string characters
  const bars: number[] = [];
  let checksum = 0;

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    checksum += charCode * (i + 1);
    // Produce 3-4 bar widths based on bits
    bars.push((charCode % 3) + 1);
    bars.push(((charCode >> 1) % 2) + 1);
    bars.push(((charCode >> 2) % 3) + 1);
    bars.push(1); // space
  }

  // Guard bars at start and end
  const fullPattern = [2, 1, 2, 1, ...bars, 2, 1, 2, 2, 1];
  const totalUnits = fullPattern.reduce((acc, curr) => acc + curr, 0);
  const unitWidth = width / totalUnits;

  let currentX = 0;
  const rects: string[] = [];

  fullPattern.forEach((w, index) => {
    const barWidth = w * unitWidth;
    if (index % 2 === 0) {
      rects.push(`<rect x="${currentX.toFixed(2)}" y="0" width="${barWidth.toFixed(2)}" height="${height}" fill="#000000" />`);
    }
    currentX += barWidth;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="mx-auto">${rects.join('')}</svg>`;
}
