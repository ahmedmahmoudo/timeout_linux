const HEX_COLOR_PATTERN = /^[0-9a-fA-F]{6}$/;

export function hexToRgb(hex: string): [number, number, number] | null {
  const trimmed = hex.trim().replace(/^#/, "");
  const normalized =
    trimmed.length === 3
      ? trimmed
          .split("")
          .map((char) => char + char)
          .join("")
      : trimmed;

  if (!HEX_COLOR_PATTERN.test(normalized)) {
    return null;
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;

  return [r, g, b];
}

export function rgbToHex(rgb: number[] | undefined): string {
  if (!rgb || rgb.length < 3) {
    return "#ef4444";
  }

  const hex = rgb
    .slice(0, 3)
    .map((channel) => {
      const value = Math.max(0, Math.min(255, Math.round(channel)));
      return value.toString(16).padStart(2, "0");
    })
    .join("");

  return `#${hex}`;
}

export function colorsEqual(
  a: [number, number, number],
  b: [number, number, number],
): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
