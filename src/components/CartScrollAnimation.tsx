import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";

interface CartScrollAnimationProps {
  onScrollToInput?: () => void;
}

const TOTAL_FRAMES = 65;

const getFrameUrl = (index: number) => {
  const padded = String(index + 1).padStart(3, "0");
  return `/cart-sequence/ezgif-frame-${padded}.jpg`;
};

export function CartScrollAnimation({ onScrollToInput }: CartScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Render current frame to canvas using contain-fit scaling and DPR support
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    // Adjust canvas buffer resolution to physical pixels
    if (canvas.width !== viewportWidth * dpr || canvas.height !== viewportHeight * dpr) {
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Pure black background fill
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Contain scaling calculation (16:9 cinematic frame preservation)
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const scale = Math.min(viewportWidth / imgWidth, viewportHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = (viewportWidth - drawWidth) / 2;
    const drawY = (viewportHeight - drawHeight) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    ctx.restore();
  }, []);

  // Request animation frame helper to avoid duplicate draws
  const requestDraw = useCallback((frameIndex: number) => {
    currentFrameRef.current = frameIndex;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      renderFrame(frameIndex);
      rafIdRef.current = null;
    });
  }, [renderFrame]);

  // Preload all 65 frames in memory
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      const onImageLoad = () => {
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoading(false);
          // Initial frame draw once fully loaded
          requestAnimationFrame(() => {
            renderFrame(0);
          });
        }
      };

      img.onload = onImageLoad;
      img.onerror = () => {
        // Fallback progress to avoid locking the UI if single frame network hitch occurs
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoading(false);
          requestAnimationFrame(() => {
            renderFrame(0);
          });
        }
      };

      images.push(img);
    }

    return () => {
      isCancelled = true;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [renderFrame]);

  // Scroll scrubbing listener (no React state updates during scroll)
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance <= 0) return;

      // Scrolled progress from 0.0 to 1.0
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      // Calculate target frame index
      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * TOTAL_FRAMES))
      );

      if (targetFrame !== currentFrameRef.current) {
        requestDraw(targetFrame);
      }
    };

    const handleResize = () => {
      requestDraw(currentFrameRef.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial sync
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading, requestDraw]);

  const handleScrollClick = () => {
    if (onScrollToInput) {
      onScrollToInput();
    } else {
      const inputSection = document.getElementById("shopping-input");
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-black text-white selection:bg-accent selection:text-white">
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-black px-6 py-8">
        
        {/* Top Hero Typography (Subtle, HTML, non-intrusive) */}
        <div className="relative z-20 flex flex-col items-center text-center pt-2 select-none pointer-events-none">
          <h1 className="font-display text-2xl font-normal tracking-[0.25em] text-white/90 sm:text-3xl md:text-4xl uppercase">
            Shop the Future
          </h1>
          <p className="mt-2 text-xs font-light tracking-widest text-white/50 sm:text-sm uppercase">
            A smarter way to discover what you need.
          </p>
        </div>

        {/* HTML5 Canvas Area */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            className="h-full w-full block bg-black"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Minimal Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-700">
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-xs font-medium tracking-[0.3em] text-white/70 uppercase">
                Loading Experience
              </span>
              <div className="h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-accent transition-all duration-150 ease-out"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Interactive Scroll Prompt */}
        <div className="relative z-20 flex flex-col items-center pb-2 select-none">
          <button
            type="button"
            onClick={handleScrollClick}
            className="group flex flex-col items-center gap-1.5 text-white/40 transition-colors hover:text-white/80 cursor-pointer focus:outline-none"
            aria-label="Scroll down to begin search"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.25em]">
              Scroll to explore
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-white/40 group-hover:text-white/80 transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
}
