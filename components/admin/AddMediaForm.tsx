"use client";

import { useRef, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { GALLERY_CATEGORIES } from "@/lib/gallery-categories";

const MAX_VIDEO = 8 * 1024 * 1024;

/**
 * Pour une vidéo : extrait dimensions + une frame de poster côté navigateur.
 * Retourne { width, height, poster } ou null si l'extraction échoue.
 *
 * Les MP4 de téléphone (iPhone/Android) n'émettent pas toujours `seeked` de
 * façon fiable sur un élément en pause. On lance donc `play()` en muet pour
 * forcer le décodage, on capture une frame dès `timeupdate`, puis on met en
 * pause. Fallback : capture à `loadeddata` (première frame) si `timeupdate`
 * ne vient pas.
 */
async function probeVideo(
  file: File,
): Promise<{ width: number; height: number; poster: Blob } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    // hors écran, mais dans le DOM : certains navigateurs ne décodent pas une
    // <video> jamais attachée
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    document.body.appendChild(video);

    let settled = false;
    const finish = (
      value: { width: number; height: number; poster: Blob } | null,
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        video.pause();
      } catch {
        /* ignore */
      }
      video.remove();
      URL.revokeObjectURL(url);
      resolve(value);
    };

    // Garde-fou global : 12 s puis on abandonne, le serveur gère l'absence
    // de poster/dimensions.
    const timer = setTimeout(() => finish(null), 12_000);

    const capture = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) return; // pas encore prêt
      const scale = Math.min(1, 1280 / Math.max(width, height, 1));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finish(null);
        return;
      }
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        finish(null);
        return;
      }
      canvas.toBlob(
        (blob) => {
          finish(blob ? { width, height, poster: blob } : null);
        },
        "image/jpeg",
        0.8,
      );
    };

    video.onloadeddata = () => {
      // 1re tentative : la première frame est déjà là
      capture();
      if (!settled) {
        // 2e tentative : lecture muette pour forcer le décodage, capture au
        // premier timeupdate (~quelques dizaines de ms de lecture)
        video.play().catch(() => {
          /* autoplay bloqué : on reste sur loadeddata / le timeout */
        });
      }
    };
    video.ontimeupdate = () => {
      if (video.currentTime > 0) capture();
    };
    video.onerror = () => finish(null);

    video.src = url;
    video.load();
  });
}

export default function AddMediaForm({
  onAdded,
}: {
  onAdded: (item: GalleryItem) => void;
}) {
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez un fichier.");
      return;
    }
    if (alt.trim().length < 10) {
      setError("La description doit faire au moins 10 caractères.");
      return;
    }
    const isVideo = file.type === "video/mp4";
    if (isVideo && file.size > MAX_VIDEO) {
      setError(
        "Vidéo trop lourde, compressez-la avant l'envoi — 8 Mo maximum.",
      );
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt.trim());
      if (category) fd.append("category", category);

      if (isVideo) {
        const probed = await probeVideo(file);
        if (probed) {
          fd.append("poster", probed.poster, "poster.jpg");
          fd.append("width", String(probed.width));
          fd.append("height", String(probed.height));
        } else {
          setNotice(
            "L'aperçu de la vidéo n'a pas pu être généré automatiquement. La vidéo sera quand même ajoutée.",
          );
        }
      }

      const res = await fetch("/api/gallery", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Échec de l'ajout.");
        return;
      }
      onAdded(json as GalleryItem);
      setAlt("");
      setCategory("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Erreur réseau pendant l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Fichier (photo JPEG/PNG/WebP ou vidéo MP4 ≤ 8 Mo)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          className="block w-full text-sm text-gray-900 file:mr-3 file:rounded file:border-0 file:bg-brun file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description (pour Google, 10 caractères min.)
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="ex : Box braids bohème Salon Mimi Marrakech"
          className="block w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <div className="sm:w-44">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Catégorie (optionnel)
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
        >
          <option value="">Non classé</option>
          {GALLERY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-brun px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Envoi en cours…" : "Ajouter"}
      </button>
      {error && (
        <p className="w-full text-sm font-medium text-red-600 sm:basis-full">
          {error}
        </p>
      )}
      {notice && (
        <p className="w-full text-sm text-amber-700 sm:basis-full">{notice}</p>
      )}
    </form>
  );
}
