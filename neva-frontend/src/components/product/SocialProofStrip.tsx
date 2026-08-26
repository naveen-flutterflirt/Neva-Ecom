'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { apiClient } from '../../lib/api';

const InstagramIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export interface SocialPost {
  id: number;
  url: string;
  image?: string;
  title?: string;
}

const defaultPosts: SocialPost[] = [
  {
    id: 1,
    url: 'https://cdn.pixabay.com/video/2020/09/21/50630-462372061_tiny.mp4',
    title: 'Precision 3D Printing Showcase'
  },
  {
    id: 2,
    url: 'https://cdn.pixabay.com/video/2021/04/12/70868-536780709_tiny.mp4',
    title: 'Custom Filament Crafting'
  },
  {
    id: 3,
    url: 'https://cdn.pixabay.com/video/2022/10/24/136263-763442340_tiny.mp4',
    title: 'Smart IoT PCB Assembly'
  },
  {
    id: 4,
    url: 'https://cdn.pixabay.com/video/2020/05/25/40156-424930777_tiny.mp4',
    title: 'Final Quality Inspection'
  },
];

const getInstagramEmbedUrl = (url?: string) => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/p/${match[1]}/embed`;
  }
  return null;
};

export default function SocialProofStrip({ posts: initialPosts }: { posts?: SocialPost[] }) {
  const [livePosts, setLivePosts] = useState<SocialPost[]>([]);
  // Mute state: key = post.id, value = boolean (true = unmuted sound, false = muted sound)
  const [unmutedMap, setUnmutedMap] = useState<Record<number, boolean>>({});
  // Playing state: key = post.id, value = boolean (true = playing, false = stopped/paused)
  const [playingMap, setPlayingMap] = useState<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient('/social-posts')
      .then(res => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLivePosts(res.data.filter((p: any) => p.isActive !== false));
        }
      })
      .catch(err => console.warn('Failed to fetch live social posts:', err));
  }, []);

  const activePosts = (initialPosts && initialPosts.length > 0)
    ? initialPosts
    : (livePosts.length > 0 ? livePosts : defaultPosts);

  const pauseAllVideos = () => {
    activePosts.forEach((post) => {
      const vid = document.getElementById(`social-vid-${post.id}`) as HTMLVideoElement;
      if (vid) {
        vid.pause();
      }
    });
    setPlayingMap({});
  };

  // Pause videos when scrolling container out of view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        activePosts.forEach((post) => {
          const vid = document.getElementById(`social-vid-${post.id}`) as HTMLVideoElement;
          if (vid) {
            const rect = vid.getBoundingClientRect();
            const containerRect = el.getBoundingClientRect();
            if (rect.right < containerRect.left + 40 || rect.left > containerRect.right - 40) {
              vid.pause();
              setPlayingMap(prev => ({ ...prev, [post.id]: false }));
            }
          }
        });
      }, 150);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [activePosts]);

  const toggleMuteAudio = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUnmutedMap(prev => {
      const isCurrentlyUnmuted = !!prev[id];
      const nextUnmuted = !isCurrentlyUnmuted;

      const videoEl = document.getElementById(`social-vid-${id}`) as HTMLVideoElement;
      if (videoEl) {
        videoEl.muted = !nextUnmuted;
        if (nextUnmuted && videoEl.paused) {
          // Pause all other videos before playing
          activePosts.forEach(p => {
            if (p.id !== id) {
              const other = document.getElementById(`social-vid-${p.id}`) as HTMLVideoElement;
              if (other) other.pause();
            }
          });
          videoEl.play().catch(() => { });
          setPlayingMap({ [id]: true });
        }
      }
      return { ...prev, [id]: nextUnmuted };
    });
  };

  const togglePlayPause = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Pause all other playing videos
    activePosts.forEach(p => {
      if (p.id !== id) {
        const other = document.getElementById(`social-vid-${p.id}`) as HTMLVideoElement;
        if (other) other.pause();
      }
    });

    setPlayingMap(prev => {
      const isCurrentlyPlaying = !!prev[id];
      const nextPlaying = !isCurrentlyPlaying;

      const videoEl = document.getElementById(`social-vid-${id}`) as HTMLVideoElement;
      if (videoEl) {
        if (nextPlaying) {
          videoEl.muted = false; // Turn sound ON when user starts playing!
          setUnmutedMap({ [id]: true });
          videoEl.play().catch(() => { });
        } else {
          videoEl.pause();
        }
      }
      return { [id]: nextPlaying };
    });
  };

  const scrollLeft = () => {
    pauseAllVideos();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    pauseAllVideos();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden py-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_right,_rgba(34,211,238,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200/80 p-5 bg-white/30 backdrop-blur-md  dark:border-zinc-800/80 dark:bg-zinc-900/30 sm:p-8">

          {/* Section Header with Left/Right Slider Buttons */}
          <div className="mb-6 flex flex-col gap-3 border-b border-zinc-300/80 pb-4 dark:border-zinc-700/80 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                <InstagramIcon className="h-3.5 w-3.5" /> Live Customer Video Reels
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">Loved by our community</h3>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/nivashop.in?igsi=czBjeGRhMnRjdDhk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition cursor-pointer"
              >
                <InstagramIcon className="h-4 w-4" />
                @nivashop.in
              </a>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-pink-50 dark:hover:bg-zinc-700 transition shadow-sm cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-pink-50 dark:hover:bg-zinc-700 transition shadow-sm cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Touch/Finger Slide Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 pt-1 px-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {activePosts.map((post) => {
              const embedUrl = getInstagramEmbedUrl(post.url);
              const isUnmuted = !!unmutedMap[post.id];
              const isPlaying = !!playingMap[post.id];
              const videoSrc = post.url || 'https://cdn.pixabay.com/video/2020/09/21/50630-462372061_tiny.mp4';
              const instaRedirectUrl = (post.url && post.url.includes('instagram.com'))
                ? post.url
                : 'https://www.instagram.com/nivashop.in?igsi=czBjeGRhMnRjdDhk';

              return (
                <div
                  key={post.id}
                  className="group relative aspect-[9/16] sm:aspect-[4/5] min-h-[460px] sm:min-h-[480px] lg:min-h-[540px] w-[82vw] max-w-[340px] sm:max-w-none sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex-shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-950 shadow-xl transition-all duration-300 hover:border-pink-500/50"
                >
                  {/* TOP-RIGHT GLASSMORTIC MUTE / UNMUTE BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => toggleMuteAudio(post.id, e)}
                    className={`absolute top-3.5 right-3.5 z-30 p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center ${isUnmuted
                      ? 'bg-pink-600/90 border-pink-400 text-white ring-2 ring-pink-500/30 scale-105'
                      : 'bg-black/50 border-white/20 text-white/90 hover:bg-black/70'
                      }`}
                    title={isUnmuted ? "Mute Video" : "Unmute Video"}
                  >
                    {isUnmuted ? (
                      <Volume2 className="h-4 w-4 text-white" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-white/80" />
                    )}
                  </button>

                  {/* PROMINENT CENTER PLAY / PAUSE BUTTON */}
                  {!embedUrl && (
                    <button
                      type="button"
                      onClick={(e) => togglePlayPause(post.id, e)}
                      className={`absolute inset-0 m-auto z-30 h-16 w-16 rounded-full backdrop-blur-md border transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer ${isPlaying
                        ? 'bg-black/40 border-white/20 text-white/90 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-black/70'
                        : 'bg-pink-600/90 border-pink-400 text-white scale-110 ring-4 ring-pink-500/40 opacity-100 shadow-pink-600/50'
                        }`}
                      title={isPlaying ? "Pause Video" : "Play Video with Sound"}
                    >
                      {isPlaying ? (
                        <Pause className="h-7 w-7 text-white" />
                      ) : (
                        <Play className="h-7 w-7 fill-current text-white translate-x-0.5" />
                      )}
                    </button>
                  )}

                  {/* CLICKABLE INSTAGRAM LINK WRAPPER */}
                  <a
                    href={instaRedirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full cursor-pointer relative"
                    title="Watch on Instagram"
                  >
                    {/* HIGH DEFINITION VIDEO CANVAS */}
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="h-full w-full border-0 overflow-hidden rounded-3xl pointer-events-none"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        title={`Social Reel ${post.id}`}
                      />
                    ) : (
                      <video
                        id={`social-vid-${post.id}`}
                        src={videoSrc}
                        loop
                        muted={!isUnmuted}
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover rounded-3xl bg-zinc-950"
                      />
                    )}

                    {/* ELEGANT BOTTOM GLASS PILL LABEL */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl pointer-events-none" />

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 truncate max-w-[85%]">
                        {post.title || 'Customer Reel'}
                      </span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
