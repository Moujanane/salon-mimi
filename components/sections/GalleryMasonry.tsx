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

/**
 * Une cellule vidéo. Tant qu'on n'a pas cliqué : poster (ou 1re frame) + badge
 * ▶, aucun octet de vidéo chargé. Au clic : la vidéo se charge et joue DANS la
 * vignette, avec le son et les contrôles, dans son ratio réel (pas de plein
 * écran). Un 2e clic met en pause via les contrôles natifs.
 */
function VideoCell({ item }: { item: GalleryItem }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);

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

  if (playing) {
    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: ratioOf(item) }}
      >
        <video
          src={item.url}
          poster={item.poster_url ?? undefined}
          controls
          autoPlay
          playsInline
          className="h-full w-full bg-black object-contain"
        />
      </div>
    );
  }

  return (
    <button
      ref={ref as unknown as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-800"
      style={{ aspectRatio: ratioOf(item) }}
      aria-label={item.alt || "Lire la vidéo"}
    >
      {near && item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : near ? (
        // Pas de poster : 1re frame de la vidéo (métadonnées seulement)
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
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white text-lg transition-transform group-hover:scale-110">
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
        {/* La lightbox n'affiche que des photos (les vidéos se lisent dans
            leur vignette). */}
        <img
          key={item.id}
          src={item.url}
          alt={item.alt}
          className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

export default function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  // La lightbox ne concerne que les photos ; les vidéos se lisent dans leur
  // vignette. On travaille donc sur la sous-liste des photos et son index.
  const photos = items.filter((it) => it.type === "photo");
  const [openPhoto, setOpenPhoto] = useState<number | null>(null);

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
        {items.map((item) => (
          <div key={item.id} className="mb-3 break-inside-avoid">
            {item.type === "video" ? (
              <VideoCell item={item} />
            ) : (
              <PhotoCell
                item={item}
                onOpen={() =>
                  setOpenPhoto(photos.findIndex((p) => p.id === item.id))
                }
              />
            )}
          </div>
        ))}
      </div>

      {openPhoto !== null && photos.length > 0 && (
        <Lightbox
          items={photos}
          index={openPhoto}
          onClose={() => setOpenPhoto(null)}
          onPrev={() =>
            setOpenPhoto((i) =>
              i === null ? null : (i - 1 + photos.length) % photos.length,
            )
          }
          onNext={() =>
            setOpenPhoto((i) => (i === null ? null : (i + 1) % photos.length))
          }
        />
      )}
    </div>
  );
}
