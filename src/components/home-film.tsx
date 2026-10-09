"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Arrow from "./arrow";
export default function HomeFilm({
  title,
  eyebrow,
  poster,
  video,
  locale,
  mode = "scroll",
}: {
  title: string;
  eyebrow: string;
  poster: string;
  video: string;
  locale: string;
  mode?: string;
}) {
  const tr = locale === "tr",
    prefix = tr ? "/tr" : "";
  const root = useRef<HTMLElement>(null),
    film = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false),
    [failed, setFailed] = useState(false),
    [manual, setManual] = useState(false),
    [playing, setPlaying] = useState(false);
  const scrolling = mode === "scroll" && !reduced;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const element = film.current,
      section = root.current;
    if (!element || !section || reduced || failed || !video) return;
    let frame = 0,
      target = 0;
    const seek = () => {
      if (
        scrolling &&
        !manual &&
        !element.seeking &&
        Number.isFinite(element.duration) &&
        element.duration > 0 &&
        Math.abs(element.currentTime - target) > 0.045
      )
        element.currentTime = target;
    };
    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect(),
        distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / distance));
      section.style.setProperty("--film-progress", `${progress * 100}%`);
      if (Number.isFinite(element.duration))
        target = progress * Math.max(0, element.duration - 0.08);
      seek();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.pause();
      else if (!scrolling && !manual) element.play().catch(() => {});
    });
    observer.observe(section);
    element.addEventListener("loadedmetadata", schedule);
    element.addEventListener("seeked", seek);
    if (scrolling && !manual) element.pause();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("loadedmetadata", schedule);
      element.removeEventListener("seeked", seek);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [scrolling, manual, reduced, failed, video]);
  return (
    <section
      ref={root}
      className={`home-hero home-film ${scrolling ? "scroll-film" : "loop-film"}`}
      data-mode={scrolling ? "scroll" : "static"}
    >
      <div className="hero-stage">
        <Image
          className="film-poster"
          src={poster}
          alt={
            tr
              ? "HTY Global için mobilya ve mekân konsepti"
              : "A furniture and interior concept for HTY Global"
          }
          fill
          preload
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        {video && !reduced && !failed && (
          <video
            ref={film}
            className="hero-video"
            src={video}
            poster={poster}
            muted
            playsInline
            preload="auto"
            loop={!scrolling}
            onError={() => setFailed(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label={
              tr
                ? "Mobilya ve üretim filmi"
                : "Furniture and manufacturing film"
            }
          />
        )}
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <Link className="hero-link" href={`${prefix}/products`}>
            {tr ? "Koleksiyonu keşfedin" : "Discover the collection"}
            <Arrow />
          </Link>
          <p className="hero-sectors">
            {tr
              ? "Hastane · Otel · Restoran & Kafe · Ofis"
              : "Healthcare · Hospitality · Restaurants & Cafés · Workplace"}
          </p>
        </div>
        <div className="film-bottom">
          <span>HTY GLOBAL / ISTANBUL</span>
          <a href="#our-story">
            {tr ? "KEŞFETMEK İÇİN KAYDIRIN" : "SCROLL TO DISCOVER"}
            <Arrow direction="down" />
          </a>
          {video && !reduced && !failed && (
            <button
              type="button"
              className="film-control"
              aria-label={
                playing
                  ? tr
                    ? "Filmi duraklat"
                    : "Pause film"
                  : tr
                    ? "Filmi oynat"
                    : "Play film"
              }
              onClick={() => {
                const element = film.current;
                if (!element) return;
                if (playing) {
                  element.pause();
                  setManual(false);
                } else {
                  setManual(true);
                  element.play().catch(() => setManual(false));
                }
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                {playing ? (
                  <path d="M3 2h3v12H3zM10 2h3v12h-3z" />
                ) : (
                  <path d="M4 2v12l10-6z" />
                )}
              </svg>
              <span>
                {playing
                  ? tr
                    ? "Duraklat"
                    : "Pause"
                  : tr
                    ? "Filmi izle"
                    : "Play film"}
              </span>
            </button>
          )}
        </div>
        <div className="film-progress" aria-hidden="true" />
      </div>
    </section>
  );
}
