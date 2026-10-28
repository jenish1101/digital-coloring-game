import type { Scene } from "./types";

/** Rasterise a live <svg> node into a data URL (JPEG by default to keep DB rows small). */
export async function svgToDataUrl(
  svg: SVGSVGElement,
  opts: { width?: number; paper?: string; format?: "image/jpeg" | "image/png"; quality?: number } = {},
): Promise<string> {
  const { width = 720, paper, format = "image/jpeg", quality = 0.85 } = opts;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const ratio = 300 / 400;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(Math.round(width * ratio)));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  clone.querySelectorAll("[data-fx]").forEach((node) => node.remove());

  const markup = new XMLSerializer().serializeToString(clone);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(width * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  if (format === "image/jpeg") {
    ctx.fillStyle = paper ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(format, quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not rasterise artwork"));
    img.src = src;
  });
}

export async function imageDataUrlToPng(dataUrl: string): Promise<string> {
  if (dataUrl.startsWith("data:image/png")) return dataUrl;
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function sceneFileName(scene: Scene, title: string) {
  const slug = (title || scene.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `color-my-world-${slug || scene.id}.png`;
}
