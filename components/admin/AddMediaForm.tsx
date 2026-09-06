"use client";

import { useRef, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";

const MAX_VIDEO = 8 * 1024 * 1024;

/**
 * Pour une vidéo : extrait dimensions + une frame de poster côté navigateur.
 * Retourne { width, height, poster } ou null si l'extraction échoue ou traîne
 * (certains MP4 de téléphone n'émettent jamais l'event `seeked`).
 */
async function probeVideo(
  file: File,
): Promise<{ width: number; height: number; poster: Blob } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    let settled = false;
    const finish = (
      value: { width: number; height: number; poster: Blob } | null,
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(value);
    };

    // Garde-fou : si aucun event utile ne se déclenche, on abandonne au bout
    // de 10 s et on laisse le serveur gérer l'absence de poster/dimensions.
    const timer = setTimeout(() => finish(null), 10_000);

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const t = Math.min(1, (video.duration || 2) / 2);
      video.currentTime = t;
      video.onseeked = () => {
        // Poster réduit (longueur max 1280 px) : sur un téléphone une frame 4K
        // brute peut être lente à encoder ou dépasser la limite du canvas.
        const scale = Math.min(1, 1280 / Math.max(width, height, 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            finish(blob ? { width, height, poster: blob } : null);
          },
          "image/jpeg",
          0.8,
        );
      };
    };
    video.onerror = () => finish(null);

    video.src = url;
  });
}

export default function AddMediaForm({
  onAdded,
}: {
  onAdded: (item: GalleryItem) => void;
}) {
  const [alt, setAlt] = useState("");
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
