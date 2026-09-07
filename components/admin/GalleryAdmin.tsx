"use client";

import { useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import AddMediaForm from "./AddMediaForm";
import SortableGrid from "./SortableGrid";
import { exportGalleryPdf } from "@/lib/galleryPdf";

export default function GalleryAdmin({
  initialItems,
}: {
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function persistOrder(next: GalleryItem[]) {
    // rendu optimiste : réindexe localement d'abord
    const reindexed = next.map((it, i) => ({ ...it, sort_order: i }));
    setItems(reindexed);
    const res = await fetch("/api/gallery/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reindexed.map((it) => ({
          id: it.id,
          sort_order: it.sort_order,
        })),
      }),
    });
    if (!res.ok) {
      setNotice("Échec de la sauvegarde de l'ordre. Rechargement…");
      const fresh = await fetch("/api/gallery");
      if (fresh.ok) setItems((await fresh.json()) as GalleryItem[]);
    } else {
      setNotice("");
    }
  }

  async function handleDelete(id: string) {
    const prev = items;
    setItems(items.filter((it) => it.id !== id));
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setNotice("Échec de la suppression.");
      setItems(prev);
    }
  }

  // Édition des métadonnées d'un média (description et/ou catégorie).
  // Rendu optimiste + rollback si l'API échoue. Retourne true si sauvegardé.
  async function handleEditMeta(
    id: string,
    patch: { alt?: string; category?: string | null },
  ): Promise<boolean> {
    const prev = items;
    setItems((cur) =>
      cur.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
    setNotice("");
    const res = await fetch(`/api/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setNotice(json.error ?? "Échec de l'enregistrement.");
      setItems(prev);
      return false;
    }
    const fresh = (await res.json()) as GalleryItem;
    setItems((cur) => cur.map((it) => (it.id === id ? fresh : it)));
    return true;
  }

  async function handleExport() {
    setPdfBusy(true);
    setNotice("");
    try {
      await exportGalleryPdf(items);
    } catch {
      setNotice("Échec de la génération du PDF.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-brun">Galerie</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} médias · glisser pour réordonner · survoler pour
            supprimer
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={pdfBusy || items.length === 0}
          className="rounded border border-brun px-4 py-2 text-sm text-brun disabled:opacity-50"
        >
          {pdfBusy ? "Génération…" : "Exporter le PDF"}
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      <AddMediaForm onAdded={(item) => setItems((cur) => [...cur, item])} />

      <SortableGrid
        items={items}
        onReorder={persistOrder}
        onDelete={handleDelete}
        onEditMeta={handleEditMeta}
      />
    </div>
  );
}
