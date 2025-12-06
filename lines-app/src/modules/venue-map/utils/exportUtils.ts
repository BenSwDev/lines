/**
 * Export Utilities
 * Functions for exporting floor plan to image/PDF
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export canvas to PNG image
 */
export async function exportToPNG(
  element: HTMLElement,
  filename: string = "floor-plan.png"
): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2, // Higher quality
    logging: false
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Export canvas to JPEG image
 */
export async function exportToJPEG(
  element: HTMLElement,
  filename: string = "floor-plan.jpg",
  quality: number = 0.9
): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/jpeg", quality);
  link.click();
}

/**
 * Export canvas to PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = "floor-plan.pdf"
): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

/**
 * Export canvas to SVG (simplified version)
 */
export function exportToSVG(
  elements: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    name: string;
  }>,
  canvasSize: { width: number; height: number },
  filename: string = "floor-plan.svg"
): void {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}">`;

  elements.forEach((element) => {
    svg += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.color || "#3B82F6"}" stroke="#000" stroke-width="1"/>`;
    svg += `<text x="${element.x + element.width / 2}" y="${element.y + element.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12">${element.name}</text>`;
  });

  svg += "</svg>";

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
