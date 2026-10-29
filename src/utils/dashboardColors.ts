const scale = ["#d9cfe5", "#c4b3d7", "#9476b4", "#4f2078"];

function channels(hex: string): number[] {
    return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

export interface ConsumptionColors { fill: string; text: "#000000" | "#ffffff"; }

export function consumptionColors(value: number, maximum: number): ConsumptionColors {
    const position = Math.max(0, Math.min(1, value / Math.max(1, maximum))) * (scale.length - 1);
    const lower = Math.min(Math.floor(position), scale.length - 2);
    const start = channels(scale[lower]);
    const end = channels(scale[lower + 1]);
    const rgb = start.map((channel, index) => Math.round(channel + (end[index] - channel) * (position - lower)));
    const fill = `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
    const linear = rgb.map((channel) => { const value = channel / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; });
    const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    // Seleciona o maior contraste entre preto e branco (sempre ao menos 4,5:1).
    return { fill, text: (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000000" : "#ffffff" };
}
