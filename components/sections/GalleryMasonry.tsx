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
      ) : near ? (
        // Pas de poster : 1re frame de la vidéo (chargée seulement à l'approche)
        <video
          src={`${item.url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
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

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Handlers courants gardés dans une ref : la lightbox ne rattache pas ses
  // effets quand le parent re-render (il passe de nouvelles closures à chaque
  // fois). Sans ça, le verrou de scroll pourrait se figer sur "hidden".
  const handlers = useRef({ onClose, onPrev, onNext });
  handlers.current = { onClose, onPrev, onNext };

  useEffect(() => {
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handlers.current.onClose();
      if (e.key === "ArrowLeft") handlers.current.onPrev();
      if (e.key === "ArrowRight") handlers.current.onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Média en plein écran"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Précédent"
        className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 md:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Suivant"
        className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 md:right-6"
      >
        ›
      </button>

      <div
        className="max-h-[88vh] max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            key={item.id}
            src={item.url}
            poster={item.poster_url ?? undefined}
            controls
            autoPlay
            muted
            playsInline
            className="max-h-[88vh] max-w-[92vw] rounded-lg bg-black"
          />
        ) : (
          <img
            key={item.id}
            src={item.url}
            alt={item.alt}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
          />
        )}
      </div>
    </div>
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

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onPrev={() =>
            setOpenIndex((i) =>
              i === null ? null : (i - 1 + items.length) % items.length,
            )
          }
          onNext={() =>
            setOpenIndex((i) => (i === null ? null : (i + 1) % items.length))
          }
        />
      )}
    </div>
  );
}
