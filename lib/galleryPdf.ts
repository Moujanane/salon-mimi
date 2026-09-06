// lib/galleryPdf.ts
//
// Génère un PDF récapitulatif de la galerie côté navigateur. jspdf est importé
// dynamiquement (lourd, ~350 Ko) — n'est chargé qu'au clic sur « Exporter ».

import type { GalleryItem } from "@/lib/gallery";

/** Charge une image et la réduit à `maxW` de large, retourne une data URL JPEG. */
async function toThumbDataUrl(src: string, maxW = 600): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export async function exportGalleryPdf(items: GalleryItem[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 12;
  const cols = 3;
  const gap = 6;
  const cellW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
  const imgH = cellW * 0.9;
  const captionH = 12;
  const rowH = imgH + captionH + gap;

  // En-tête
  doc.setFontSize(14);
  doc.text(
    `Galerie Salon Mimi — ${items.length} médias — ${new Date().toLocaleDateString("fr-FR")}`,
    margin,
    margin,
  );

  let x = margin;
  let y = margin + 8;
  let col = 0;

  for (const item of items) {
    if (y + rowH > pageH - margin) {
      doc.addPage();
      x = margin;
      y = margin;
      col = 0;
    }

    const src =
      item.type === "video" ? (item.poster_url ?? item.url) : item.url;
    try {
      const dataUrl = await toThumbDataUrl(src);
      doc.addImage(dataUrl, "JPEG", x, y, cellW, imgH, undefined, "FAST");
    } catch {
      doc.setDrawColor(200);
      doc.setFillColor(235, 235, 235);
      doc.rect(x, y, cellW, imgH, "FD");
      doc.setFontSize(8);
      doc.text("image indisponible", x + 2, y + imgH / 2);
    }

    doc.setFontSize(9);
    doc.text(`#${item.sort_order} · ${item.type}`, x, y + imgH + 4);
    doc.setFontSize(7);
    const caption = doc.splitTextToSize(item.alt, cellW);
    doc.text(caption.slice(0, 2), x, y + imgH + 8);

    col++;
    if (col >= cols) {
      col = 0;
      x = margin;
      y += rowH;
    } else {
      x += cellW + gap;
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`galerie-salon-mimi-${stamp}.pdf`);
}
