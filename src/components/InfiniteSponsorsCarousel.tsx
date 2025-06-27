"use client";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

export interface FrameImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Frame {
  key?: string;
  website?: string;
  mobile?: { image?: FrameImage };
  desktop?: { image?: FrameImage };
}

interface InfiniteCarouselProps {
  frames: Frame[];
  slideDuration?: number; // in ms
  autoplay?: boolean;
  controls?: boolean;
  ariaLabel?: string;
}

const DEFAULT_DURATION = 5000;
const DEFAULT_ASPECT_RATIO = [16, 9];
const VISIBLE_COUNT = 3;
const ROWS = 2;

// Agrupa los frames en slides de 3x2 (6 por slide), SIN rellenar con nulls
function groupFrames(frames: Frame[], perSlide: number) {
  const slides: Frame[][] = [];
  for (let i = 0; i < frames.length; i += perSlide) {
    slides.push(frames.slice(i, i + perSlide));
  }
  return slides;
}

export const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({
  frames,
  slideDuration = DEFAULT_DURATION,
  autoplay = true,
  controls = true,
  ariaLabel = "Promotional carousel",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Agrupa en slides de 6 (3x2), solo los reales
  const slides = groupFrames(frames, VISIBLE_COUNT * ROWS);

  // Duplica para loop infinito solo si hay más de 1 slide
  const infiniteSlides =
    slides.length >= 1 ? [slides[slides.length - 1], ...slides, slides[0]] : [];

  // Index inicial para mostrar el primer slide real
  const [index, setIndex] = useState(slides.length > 1 ? 1 : 0);
  const [disableAnimation, setDisableAnimation] = useState(false);
  const [playingAnimation, setPlayingAnimation] = useState(false);
  const [willResetAnimStateOnAnimEnd, setWillResetAnimStateOnAnimEnd] =
    useState(false);

  const firstFrame = frames[0];

  const desktopAspectRatio =
    (firstFrame?.desktop?.image?.width || DEFAULT_ASPECT_RATIO[0]) /
    (firstFrame?.desktop?.image?.height || DEFAULT_ASPECT_RATIO[1]);
  const mobileAspectRatio =
    (firstFrame?.mobile?.image?.width || DEFAULT_ASPECT_RATIO[0]) /
    (firstFrame?.mobile?.image?.height || DEFAULT_ASPECT_RATIO[1]);

  const incIndex = () => {
    if (playingAnimation) return;
    setPlayingAnimation(true);
    setIndex((i) => i + 1);
  };

  const decIndex = () => {
    if (playingAnimation) return;
    setPlayingAnimation(true);
    setIndex((i) => i - 1);
  };

  // Loop infinito: salta sin animación cuando llegas a los extremos duplicados
  useEffect(() => {
    if (slides.length <= 1) return;
    if (index === 0 || index === infiniteSlides.length - 1) {
      setWillResetAnimStateOnAnimEnd(true);
    }
  }, [index, infiniteSlides.length, slides.length]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (playingAnimation) {
      timeout = setTimeout(() => setPlayingAnimation(false), 500);
    }
    if (!playingAnimation && willResetAnimStateOnAnimEnd && slides.length > 1) {
      // Si está en los clones, salta al real
      if (index === 0) {
        setIndex(infiniteSlides.length - 2);
      } else if (index === infiniteSlides.length - 1) {
        setIndex(1);
      }
      setDisableAnimation(true);
      setWillResetAnimStateOnAnimEnd(false);
      requestAnimationFrame(() => {
        setDisableAnimation(false);
      });
    }
    return () => timeout && clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    playingAnimation,
    willResetAnimStateOnAnimEnd,
    index,
    infiniteSlides.length,
    slides.length,
  ]);

  const isLocked = frames.length <= 6;

  useEffect(() => {
    if (isLocked) return;
    if (!autoplay || slides.length < 2) return;
    const interval = setInterval(() => {
      incIndex();
    }, slideDuration);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, slideDuration, slides.length, isLocked]);

  useEffect(() => {
    if (isLocked && index !== 0) {
      setIndex(0);
    }
    // Si el carrusel se bloquea, asegúrate de que el índice sea 0
    if (isLocked && index !== 0) {
      setIndex(0);
    }
    // Si el carrusel se desbloquea y el index es 0, ponlo en 1 (para loop infinito)
    if (!isLocked && index === 0 && slides.length > 1) {
      setIndex(1);
    }
  }, [isLocked, slides.length, index]);

  // Si no hay suficientes frames, muestra solo los que hay
  if (!frames || frames.length === 0) {
    return null;
  }

  // Renderiza cada slide como una grid de 2 filas x 3 columnas (o 1 fila si <=3)
  return (
    <section
      className="overflow-hidden w-full relative"
      ref={containerRef}
      onDragStart={(e) => e.preventDefault()}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Mobile */}
      <div
        className={clsx("sm:hidden flex transition-transform duration-500", {
          "transition-none": disableAnimation,
        })}
        style={{
          width: `${infiniteSlides.length * 100}%`,
          transform: `translateX(-${index * (100 / infiniteSlides.length)}%)`,
        }}
      >
        {infiniteSlides.map((slide, slideIdx) => (
          <div
            key={`mobile-slide-${slideIdx}`}
            className={clsx(
              slide.length <= 3
                ? "grid grid-cols-3 grid-rows-1 gap-2 w-full"
                : "grid grid-cols-3 grid-rows-2 gap-2 w-full"
            )}
            style={{
              width: `${100 / infiniteSlides.length}%`,
            }}
            aria-hidden={slideIdx !== index}
          >
            {slide.map((frame, i) =>
              frame ? (
                <div
                  key={deriveFrameKey({
                    frame,
                    i,
                    isMobile: true,
                    total: slide.length,
                  })}
                  className="relative flex items-center justify-center"
                  style={{
                    aspectRatio: mobileAspectRatio,
                  }}
                >
                  {frame.website ? (
                    <a
                      href={frame.website}
                      tabIndex={0}
                      aria-label={
                        frame.mobile?.image?.alt ||
                        frame.desktop?.image?.alt ||
                        "Sponsor"
                      }
                      className="flex items-center justify-center w-full h-full"
                      style={{ display: "flex" }}
                    >
                      <FrameRenderer image={frame?.mobile?.image} />
                    </a>
                  ) : (
                    <FrameRenderer image={frame?.mobile?.image} />
                  )}
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div
        className={clsx("hidden sm:flex transition-transform duration-500", {
          "transition-none": disableAnimation,
        })}
        style={{
          width: `${infiniteSlides.length * 100}%`,
          transform: `translateX(-${index * (100 / infiniteSlides.length)}%)`,
        }}
      >
        {infiniteSlides.map((slide, slideIdx) => (
          <div
            key={`desktop-slide-${slideIdx}`}
            className={clsx(
              slide.length <= 3
                ? "grid grid-cols-3 grid-rows-1 gap-8 w-full"
                : "grid grid-cols-3 grid-rows-2 gap-8 w-full"
            )}
            style={{
              width: `${100 / infiniteSlides.length}%`,
            }}
            aria-hidden={slideIdx !== index}
          >
            {slide.map((frame, i) =>
              frame ? (
                <div
                  key={deriveFrameKey({
                    frame,
                    i,
                    isMobile: false,
                    total: slide.length,
                  })}
                  className={clsx(
                    "relative flex items-center justify-center transition-all duration-300",
                    "bg-white/80 border border-gray-200 rounded-xl shadow-sm",
                    "hover:shadow-lg hover:bg-white"
                  )}
                  style={{
                    aspectRatio: desktopAspectRatio,
                  }}
                >
                  {frame.website ? (
                    <a
                      href={frame.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={0}
                      aria-label={
                        frame.desktop?.image?.alt ||
                        frame.mobile?.image?.alt ||
                        "Sponsor"
                      }
                      className="flex items-center justify-center w-full h-full"
                      style={{ display: "flex" }}
                    >
                      <FrameRenderer image={frame?.desktop?.image} />
                    </a>
                  ) : (
                    <FrameRenderer image={frame?.desktop?.image} />
                  )}
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const FrameRenderer = ({ image }: { image?: FrameImage }) => {
  if (!image?.src) return null;
  return (
    <Image
      src={image.src}
      alt={image.alt || ""}
      width={image.width}
      height={image.height}
      className="h-16 md:h-24 object-contain max-w-[220px] md:max-w-[280px] mx-auto"
      loading="eager"
      unoptimized
    />
  );
};

const deriveFrameKey = ({
  frame,
  i,
  isMobile,
  total,
}: {
  frame: Frame | undefined;
  i: number;
  isMobile: boolean;
  total: number;
}) => {
  if (!frame) return `empty-frame-${i}`;
  let base =
    frame.key ||
    (isMobile ? frame.mobile?.image?.src : frame.desktop?.image?.src) ||
    `frame-${i}`;
  return `${base}-${i}`;
};
