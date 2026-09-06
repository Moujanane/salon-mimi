"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";

const DEFAULT_RATIO = "4 / 5";

function ratioOf(item: GalleryItem): string {
  if (item.width && item.height && item.width > 0 && item.height > 0) {
    return `${item.width} / ${item.height}`;
  }
  return DEFAULT_RATIO;
}

/** Une cellule vidéo : poster + badge lecture, fichier chargé seulement à l'approche. */
function VideoCell({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-800"
      style={{ aspectRatio: ratioOf(item) }}
      aria-label={item.alt || "Voir la vidéo"}
    >
      {near && item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="absolute inset-0 bg-gray-800" />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white text-lg">
          ▶
        </span>
      </span>
    </button>
  );
}

/** Une cellule photo. */
function PhotoCell({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-800"
      style={{ aspectRatio: ratioOf(item) }}
      aria-label={item.alt || "Agrandir la photo"}
    >
      <Image
        src={item.url}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
        loading="lazy"
      />
    </button>
  );
}

export default function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-brun/50">
        La galerie sera bientôt disponible.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="[column-fill:balance] [column-gap:12px] [columns:2] md:[columns:3]">
        {items.map((item, i) => (
          <div key={item.id} className="mb-3 break-inside-avoid">
            {item.type === "video" ? (
              <VideoCell item={item} onOpen={() => setOpenIndex(i)} />
            ) : (
              <PhotoCell item={item} onOpen={() => setOpenIndex(i)} />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox ajoutée en Task 4 — placeholder d'état pour l'instant */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setOpenIndex(null)}
        >
          <p className="text-white">Lightbox — Task 4</p>
        </div>
      )}
    </div>
  );
}
