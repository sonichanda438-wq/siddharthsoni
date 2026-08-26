"use client";

// GSAP MacBook Scroll Sequence — fixed mobile blank-gap + progressive frame loading

import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DEFAULT_SPRING_OPTIONS = Object.freeze({
  stiffness: 280,
  damping: 18,
  mass: 0.3,
});

function ScrollProgress({ containerRef, springOptions = DEFAULT_SPRING_OPTIONS }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    let animationFrame;
    let current = 0;
    let target = 0;

    const updateTarget = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      target = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
    };

    const animate = () => {
      const stiffness = Math.max(0.08, Math.min(0.45, (springOptions.stiffness || 280) / 1000));
      const damping = Math.max(0.05, Math.min(0.95, (springOptions.damping || 18) / 100));
      const mass = Math.max(0.1, springOptions.mass || 0.3);
      const ease = (stiffness * (1 - damping)) / mass;

      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.001) current = target;

      setProgress(current);
      animationFrame = requestAnimationFrame(animate);
    };

    updateTarget();
    container.addEventListener("scroll", updateTarget, { passive: true });
    animationFrame = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("scroll", updateTarget);
      cancelAnimationFrame(animationFrame);
    };
  }, [containerRef, springOptions]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] overflow-hidden rounded-full">
      <div
        className="h-full origin-left rounded-full bg-[linear-gradient(90deg,transparent_0%,var(--primary)_35%,var(--surface-tint)_70%,transparent_100%)] shadow-[0_0_14px_var(--primary)] transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

function DynamicReviewCard({ rev, index }) {
  const scrollRef = useRef(null);
  const stars = Math.max(0, Math.min(5, parseInt(rev["Star Rating"], 10) || 5));
  const imageUrl = rev["Your Photo"]?.trim() || "/MyImages/rahul.webp";

  return (
    <div key={`dyn-${index}`} className="anim-card relative rounded-[2rem] overflow-hidden shrink-0 snap-center w-[85vw] max-w-[360px] opacity-0 translate-y-[30px] duration-700 transition-all">
      <div className="bg-surface-container-low/90 backdrop-blur-md border border-border-color rounded-[2rem] p-6 flex flex-col gap-5 h-[320px] relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
            <img alt={rev["Your Name"]} className="w-full h-full object-cover" src={imageUrl} />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-[18px] text-white font-semibold">{rev["Your Name"]}</span>
            <span className="font-code-sm text-[12px] text-primary">Verified Client</span>
          </div>
        </div>

        <div className="flex text-primary">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0"}}>
              {i < stars ? "star" : "star_border"}
            </span>
          ))}
        </div>

        <div className="relative h-full overflow-hidden">
          <ScrollProgress containerRef={scrollRef} springOptions={DEFAULT_SPRING_OPTIONS} />
          <div ref={scrollRef} className="h-full overflow-y-auto pr-2 scroll-fade-mask" style={{scrollbarWidth:"thin"}}>
            <p className="font-body-md text-on-surface-variant font-light leading-relaxed py-4">"{rev["Your Review Message"]}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const roles = [
    "Interactive UI Specialist",
    "Lightning-Fast Web Maker",
    "Motion UI Expert",
    "Conversion Optimizer"
  ];
  
  const [roleIndex, setRoleIndex] = useState(0);
  const [fadeRole, setFadeRole] = useState(true);
  const [reviewCount, setReviewCount] = useState(1);
  const [dynamicReviews, setDynamicReviews] = useState([]);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalRating, setModalRating] = useState(0);
  
  const [messageText, setMessageText] = useState("");
  const [reviewData, setReviewData] = useState({ name: "", email: "", feedback: "", file: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
  const [weather, setWeather] = useState({ temp: "--", icon: "☀️" });

  useEffect(() => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTlSvAsPemum4cCEFOXNIBQZZw3gYwTz8feK4DhxXcV6hSORxjlglG7_6uScgCDUKVRWR6xLbuZ1y5A/pub?output=csv";

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = Array.isArray(results.data) ? results.data : [];
        const validReviews = data.filter(
          (rev) => rev["Your Name"]?.trim() && rev["Your Review Message"]?.trim()
        );

        setDynamicReviews(validReviews);
        setReviewCount(24 + validReviews.length);
      },
      error: (error) => {
        console.error("Reviews CSV fetch failed:", error);
      },
    });
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const rahulReviewRef = useRef(null);
  const emilyReviewRef = useRef(null);
  const marcusReviewRef = useRef(null);

  const subtitleWords = "I specialize in building lightning-fast, high-converting websites and modern UI layouts with smooth animations.".split(" ");

  const songs = [
    "/MySongs/kinna_sona.mp3",
    "/MySongs/pehli_baar.mp3",
    "/MySongs/o_saathi.mp3",
    "/MySongs/raftaarein.mp3",
    "/MySongs/love_me.mp3",
    "/MySongs/one_two.mp3",
    "/MySongs/pal_pal.mp3",
    "/MySongs/housefull.mp3",
    "/MySongs/Perfect.mp3",
    "/MySongs/Señorita.mp3",
    "/MySongs/Imagine Dragons.mp3"
  ];

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=26.9196&longitude=75.7878&current_weather=true")
      .then(res => res.json())
      .then(data => {
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        const isDay = data.current_weather.is_day;
        let icon = "☀️";
        if (code >= 1 && code <= 3) icon = isDay ? "⛅" : "☁️";
        if (code >= 51 && code <= 67) icon = "🌧️";
        if (code >= 71 && code <= 77) icon = "❄️";
        if (code >= 95) icon = "⛈️";
        if (!isDay && code === 0) icon = "🌙";
        setWeather({ temp, icon });
      }).catch(() => console.error("Weather fetch failed silently."));
  }, []);

  // 1. Initial Load Random Song
  useEffect(() => {
    setCurrentSongIndex(Math.floor(Math.random() * songs.length));
  }, []);

  // 2. Play/Pause toggle with Promise
  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsAudioLoading(true); // लोडिंग शुरू
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.log("Play blocked by mobile browser:", e);
        setIsPlaying(false);
      } finally {
        setIsAudioLoading(false); // लोडिंग ख़त्म
      }
    }
  };

  // 3. Handle Next Song
  const handleNextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  // 4. Force load and play when index changes
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch(e => console.log("Auto-next blocked", e));
    }
  }, [currentSongIndex]);

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);

  const canvas = canvasRef.current;
  const stage = document.getElementById("canvas-container");
  const story = document.getElementById("visual-story");
  const projects = document.getElementById("projects");

  if (!canvas || !stage || !story || !projects) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  // Keep all GSAP work inside a context so React 18 Strict Mode can
  // safely mount/unmount the component without leaving orphaned tweens
  // or ScrollTriggers behind.
  let destroyed = false;
  let autoplay = null;
  let collapseTrigger = null;
  let fadeTrigger = null;
  let resizeHandler = null;
  const images = new Array(156);

  const ctx = gsap.context(() => {

  const frameCount = 156;
  const currentFrame = (index) =>
    `/scroll-frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.webp`;

  const sequence = { frame: 0 };
  let collapseStartFrame = 0;
  let firstFrameReady = false;
  let canvasDpr = 1;

  const getImage = (index) => {
    const wanted = Math.max(0, Math.min(frameCount - 1, Math.floor(index)));
    if (images[wanted]?.complete && images[wanted]?.naturalWidth) return images[wanted];

    // During early loading, draw the closest frame that is already available.
    for (let distance = 1; distance < frameCount; distance++) {
      const before = wanted - distance;
      const after = wanted + distance;
      if (before >= 0 && images[before]?.complete && images[before]?.naturalWidth) return images[before];
      if (after < frameCount && images[after]?.complete && images[after]?.naturalWidth) return images[after];
    }
    return null;
  };

  const drawFrame = (index = sequence.frame) => {
    if (destroyed) return;
    const image = getImage(index);
    if (!image) return;

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > canvasRatio) {
      drawHeight = width / imageRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imageRatio;
      offsetX = (width - drawWidth) / 2;
    }

    context.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * canvasDpr));
    canvas.height = Math.max(1, Math.round(rect.height * canvasDpr));
    drawFrame(sequence.frame);
  };

  const loadFrame = (index) => {
    if (images[index]) return images[index];
    const img = new Image();
    img.decoding = "async";
    img.src = currentFrame(index);
    img.onload = () => {
      if (!destroyed) drawFrame(sequence.frame);
    };
    img.onerror = () => {};
    images[index] = img;
    return img;
  };

  // Load the first small batch immediately so autoplay can begin quickly.
  const firstBatch = Math.min(28, frameCount);
  for (let i = 0; i < firstBatch; i++) loadFrame(i);

  // Continue loading the rest without blocking the page.
  const loadRest = () => {
    for (let i = firstBatch; i < frameCount; i++) loadFrame(i);
  };

  const startAutoplay = () => {
    if (destroyed || autoplay) return;
    autoplay = gsap.to(sequence, {
      frame: frameCount - 1,
      duration: 8.5,
      ease: "none",
      repeat: -1,
      yoyo: true,
      overwrite: true,
      onUpdate: () => drawFrame(sequence.frame),
    });
  };

  const stopAutoplay = () => {
    if (!autoplay) return;
    autoplay.pause();
  };

  const resumeAutoplay = () => {
    if (!autoplay) return;
    autoplay.resume();
  };

  const setup = () => {
    if (destroyed || !firstFrameReady) return;

    resizeCanvas();
    canvas.style.opacity = "1";
    drawFrame(0);

    // Normal page-load animation: it does NOT depend on scrolling.
    startAutoplay();

    /*
     * Project cards are the hand-off point:
     * - autoplay runs normally before the cards arrive;
     * - once Projects reaches the visual-story area, autoplay pauses;
     * - the canvas then scrubs backward with scroll until frame 0;
     * - scrolling back above Projects hands control to autoplay again.
     *
     * We deliberately start from the frame autoplay was showing when the
     * hand-off happened instead of forcing frame 196. That avoids a visible
     * frame jump while still giving the intended reverse-to-zero effect.
     */
    collapseTrigger = ScrollTrigger.create({
      trigger: projects,
      start: "top 30%",
      end: "bottom 30%",
      scrub: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        collapseStartFrame = Math.round(sequence.frame);
        stopAutoplay();
      },
      onEnterBack: () => {
        // Returning from below, scrub forward from frame 0 to the end.
        collapseStartFrame = frameCount - 1;
        stopAutoplay();
      },
      onUpdate: (self) => {
        const progress = gsap.utils.clamp(0, 1, self.progress);
        const targetFrame = Math.floor(
          collapseStartFrame * (1 - progress)
        );

        sequence.frame = targetFrame;
        drawFrame(targetFrame);
      },
      onLeave: () => {
        sequence.frame = 0;
        drawFrame(0);
      },
      onLeaveBack: () => {
        resumeAutoplay();
      },
    });

    /*
     * Once the last project card is approaching the end of the Projects
     * section, fade the canvas out. Because this is scrubbed, scrolling
     * upward naturally brings the canvas back.
     */
    fadeTrigger = gsap.to(canvas, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: projects,
        start: "bottom 30%",
        end: "bottom 5%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    ScrollTrigger.refresh(true);
    loadRest();
  };

  const firstImage = loadFrame(0);
  firstImage.onload = () => {
    if (destroyed) return;
    firstFrameReady = true;
    setup();
  };

  if (firstImage.complete && firstImage.naturalWidth) {
    firstFrameReady = true;
    setup();
  }

  let windowWidth = window.innerWidth;

  resizeHandler = () => {
    // Only refresh when the viewport width changes. Mobile browser
    // address-bar height changes must not rebuild ScrollTrigger.
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;
      resizeCanvas();
      ScrollTrigger.refresh(true);
    }
  };

  window.addEventListener("resize", resizeHandler);

  }, canvasRef);

  return () => {
    destroyed = true;
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }

    // gsap.context() owns every tween/ScrollTrigger created above.
    // Reverting it prevents Strict Mode double-mount leaks.
    ctx.revert();

    images.forEach((image) => {
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    });
  };
}, []);

  const showSuccess = (msg) => {
    setSuccessPopup({ show: true, message: msg });
    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const gfData = new URLSearchParams();
      gfData.append("entry.1237936850", messageText);

      await Promise.all([
        fetch("https://formspree.io/f/moeapbyy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText })
        }),
        fetch("https://docs.google.com/forms/d/e/1FAIpQLScFSO5JUIb6BiKzMhKDIDliZ2KnCP_YK_i06BGY5WCiQWu82Q/formResponse", {
          method: "POST",
          mode: "no-cors",
          body: gfData
        })
      ]);

      setMessageText("");
      setIsMessageOpen(false);
      showSuccess("Thank You! Your message has been sent.");
    } catch (error) {
      console.error(error);
      alert("There was an error submitting your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = "No image uploaded";
      if (reviewData.file) {
        const formData = new FormData();
        formData.append("image", reviewData.file);
                const imgRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

         // Check if the API request failed (e.g., Cloudflare returns 404 HTML instead of JSON)
        if (!imgRes.ok) {
          const errorText = await imgRes.text();
          console.error("Cloudflare API Error:", errorText);
          throw new Error(`API failed with status: ${imgRes.status}`);
        }

        const imgJson = await imgRes.json();
        if (imgJson.success) imageUrl = imgJson.data.url;
      }

      const combinedFeedback = `${reviewData.feedback} | Image: ${imageUrl}`;
      
      const gfData = new URLSearchParams();
      gfData.append("entry.1735470949", reviewData.name);
      gfData.append("entry.1323945661", reviewData.email);
      gfData.append("entry.740721479", modalRating.toString());
      gfData.append("entry.601522081", combinedFeedback);

      await Promise.all([
        fetch("https://formspree.io/f/mwlewzyg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...reviewData, rating: modalRating, imageUrl })
        }),
        fetch("https://docs.google.com/forms/d/e/1FAIpQLScbkiAJ8Jjez7eGKzYr7t2PA6Fd_Xlg_3H8_dV3a3oJI7jOkg/formResponse", {
          method: "POST",
          mode: "no-cors",
          body: gfData
        })
      ]);

      const newlyAddedReview = {
        "Your Name": reviewData.name,
        "Star Rating": modalRating.toString(),
        "Your Review Message": reviewData.feedback,
        "Your Photo": imageUrl !== "No image uploaded" ? imageUrl : ""
      };

      setDynamicReviews(prev => [...prev, newlyAddedReview]);
      setReviewCount(prev => prev + 1);

      setReviewData({ name: "", email: "", feedback: "", file: null });
      setModalRating(0);
      setIsReviewModalOpen(false);
      showSuccess("Thank You! Your review has been submitted.");
    } catch (error) {
      console.error(error);
      alert("There was an error submitting your review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
    const handleDockClick = (e, targetId) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const iconBubble = btn.querySelector(".icon-bubble");
    
    btn.blur();
    btn.classList.add("animate-dock-bump");
    
    if(iconBubble) {
      iconBubble.classList.remove("text-on-surface-variant");
      iconBubble.classList.add("text-primary");
    }

    setTimeout(() => {
      btn.classList.remove("animate-dock-bump");
      if(iconBubble) {
        iconBubble.classList.add("text-on-surface-variant");
        iconBubble.classList.remove("text-primary");
      }
    }, 400);

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    let timeout;

    const changeRole = () => {
      setFadeRole(false);
      setTimeout(() => {
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setFadeRole(true);
        // After the first change, continue every 3 seconds.
        timeout = setTimeout(changeRole, 3000);
      }, 500);
    };

    // First role change happens 1 second after load.
    timeout = setTimeout(changeRole, 1000);

    let countInterval = null;
    const countObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let current = 1;
        const targetCount = 24 + dynamicReviews.length;
        clearInterval(countInterval);
        countInterval = setInterval(() => {
          current++;
          setReviewCount(current);
          if (current >= targetCount) {
            clearInterval(countInterval);
            countInterval = null;
            setReviewCount(targetCount);
          }
        }, 60);
        countObserver.disconnect();
      }
    }, { threshold: 1, rootMargin: "0px 0px -15% 0px" });
    
    const statsEl = document.getElementById("review-stats");
    if (statsEl) countObserver.observe(statsEl);

    const observerOptions = { threshold: 0.1 };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(".anim-card");
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.remove("opacity-0", "translate-y-[30px]");
              card.classList.add("opacity-100", "translate-y-0");
            }, index * 150);
          });
          sectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll(".observe-section").forEach(sec => sectionObserver.observe(sec));

    return () => {
      clearTimeout(timeout);
      clearInterval(countInterval);
      countObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [dynamicReviews.length]);

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var hour = new Date().getHours();
          document.documentElement.dataset.theme = (hour >= 6 && hour < 18) ? 'day' : 'night';
        })();
      `}} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "background": "var(--bg)", "surface": "var(--surface)", "primary-container": "#f59e0b", "surface-tint": "var(--surface-tint)", "surface-bright": "var(--surface-bright)", "on-surface-variant": "var(--on-surface-variant)", "on-primary": "#472a00", "on-background": "var(--on-surface)", "surface-variant": "var(--surface-variant)", "on-surface": "var(--on-surface)", "surface-container-low": "var(--surface-container-low)", "primary": "var(--primary)", "surface-container": "var(--surface-container)", "border-color": "var(--border-color)"
                  },
                  fontFamily: { "display-xl": ["Sora"], "body-md": ["Inter"], "label-caps": ["Inter"], "headline-md": ["Sora"], "headline-lg": ["Sora"], "body-lg": ["Inter"], "code-sm": ["JetBrains Mono"] }
                }
              }
            }
          `,
        }}
      />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;700&family=JetBrains+Mono&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              /* Navy is the default so there is no white flash on mobile. */
              --bg: #07152f;
              --surface: #0a1d3d;
              --primary: #f2b84b;
              --on-surface: #f5f8ff;
              --on-surface-variant: #b9c8df;
              --surface-container: #102a50;
              --surface-container-low: #0d2447;
              --surface-bright: #173a68;
              --surface-tint: #ffd27a;
              --surface-variant: #27466d;
              --border-color: rgba(170,202,255,0.16);
              color-scheme: dark;
            }
            html[data-theme="day"] {
              --bg: #0a1f43;
              --surface: #0d2852;
              --primary: #ffd06b;
              --on-surface: #f8fbff;
              --on-surface-variant: #c7d6ec;
              --surface-container: #12345f;
              --surface-container-low: #102e57;
              --surface-bright: #1a4677;
              --surface-tint: #ffe09a;
              --surface-variant: #31557f;
              --border-color: rgba(185,216,255,0.19);
            }
            html[data-theme="night"] {
              --bg: #040d20;
              --surface: #07152e;
              --primary: #eeb451;
              --on-surface: #eef4ff;
              --on-surface-variant: #aebfd8;
              --surface-container: #0b2041;
              --surface-container-low: #091b38;
              --surface-bright: #12325b;
              --surface-tint: #ffd27b;
              --surface-variant: #203e63;
              --border-color: rgba(164,194,235,0.12);
            }

            @layer base { html, body { scroll-behavior: smooth; background-color: var(--bg); color: var(--on-surface); overflow-x: hidden; transition: background-color 0.3s, color 0.3s; } }
            ::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            
            @keyframes text-reveal { 0% { opacity: 0; filter: blur(10px); transform: translateY(-10px); } 100% { opacity: 1; filter: blur(0px); transform: translateY(0); } }
            .animate-text-reveal { animation: text-reveal 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; }

            @keyframes bounce-horizontal { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
            .animate-bounce-horizontal { animation: bounce-horizontal 1.2s infinite ease-in-out; }
            
            @keyframes dock-bump { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.3); } 100% { transform: translateY(0) scale(1); } }
            .animate-dock-bump { animation: dock-bump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

            @keyframes morph-expand { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-morph-expand { animation: morph-expand 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

            @keyframes conic-glow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .animate-conic-glow { animation: conic-glow 3s linear infinite; }

            @keyframes eq { 0% { height: 4px; } 50% { height: 14px; } 100% { height: 4px; } }
            .eq-bar { width: 3px; background: var(--primary); border-radius: 2px; animation: eq 1s infinite ease-in-out; }
            .eq-bar:nth-child(2) { animation-delay: 0.2s; }
            .eq-bar:nth-child(3) { animation-delay: 0.4s; }
            
            .marquee-container { overflow: hidden; white-space: nowrap; width: 100px; position: relative; }
            .marquee-text { display: inline-block; padding-left: 100%; animation: marquee 8s linear infinite; }
            @keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            
            .text-fade-mask {
              -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
              mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
            }
          `,
        }}
      />

      <div className="bg-background font-body-md text-on-surface antialiased w-full transition-colors duration-500">
        
      <header className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 bg-background/70 backdrop-blur-2xl border-b border-border-color">
                  <div className="h-full w-full px-5 lg:px-6 max-w-[1280px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-[24px] text-primary tracking-tight font-semibold animate-text-reveal inline-block">
                S.S. CREATIVE
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-6 animate-fade-in-up">
              <a className="font-label-caps text-[12px] text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider" href="#about">About</a>
              <a className="font-label-caps text-[12px] text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider" href="#projects">Web Design</a>
              <a className="font-label-caps text-[12px] text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider" href="#reviews">Reviews</a>
              <a className="font-label-caps text-[12px] text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider" href="#contact">Contact</a>
            </nav>
            <div className="flex items-center gap-4 animate-fade-in-up">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container/50 backdrop-blur-md border border-border-color shadow-sm">
                <span className="text-[16px]">{weather.icon}</span>
                <span className="font-code-sm text-[12px] text-on-surface tracking-wide">{weather.temp}°C • Jaipur</span>
              </div>

              <a href="https://wa.me/919636598226" target="_blank" rel="noreferrer" className="hidden md:block px-6 py-2 rounded-full bg-primary/10 text-primary font-label-caps text-[12px] uppercase tracking-wider border border-primary/20 hover:bg-primary hover:text-on-primary transition-all">
                Hire Me
              </a>
              <div className="w-10 h-10 rounded-full border-2 border-primary/50 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <img alt="Profile" className="w-full h-full object-cover" src="https://i.ibb.co/QF8pR5Wd/IMG-20260606-163321-435.webp" />
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 bg-surface transition-colors duration-500">
          <div className="flex flex-col w-full relative" id="about">
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
              <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient cx="50%" cy="50%" id="glow1" r="50%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1"></stop><stop offset="100%" stopColor="var(--bg)" stopOpacity="0"></stop>
                  </radialGradient>
                </defs>
                <circle cx="50%" cy="20%" fill="url(#glow1)" r="50%"></circle>
              </svg>
            </div>

            <section className="relative flex items-center justify-center px-5 lg:px-6 max-w-[1280px] mx-auto w-full pt-12 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                <div className="lg:col-span-7 flex flex-col gap-6 z-10 order-2 lg:order-1">
                  <div className="flex flex-col gap-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-3">
                      <span className="h-[1px] w-8 bg-primary"></span>
                      <span className="font-code-sm text-[14px] text-primary tracking-widest uppercase">Hi, I'm Siddharth Soni</span>
                    </div>
                    
                    <h1 className="font-display-xl text-[40px] lg:text-[64px] text-on-surface font-semibold tracking-tight leading-[1.1]">
                      High-Performance Web Developer, <span className="text-primary">Designer</span> & <br/>
                      <span className={`inline-block min-w-[300px] text-surface-tint transition-all duration-500 ${fadeRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px]'}`}>
                        {roles[roleIndex]}
                      </span>
                    </h1>

                    <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl leading-relaxed font-light">
                      {subtitleWords.map((word, i) => (
                        <span key={i} className="inline-block animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'forwards' }}>
                          {word}&nbsp;
                        </span>
                      ))}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {["HTML/CSS", "React & Next.js", "WordPress", "Responsive Design", "Speed Optimization", "Motion UI", "UI/UX Layouts"].map((tag, i) => (
                        <span key={i} className="px-4 py-2 rounded-full bg-surface-container-low border border-border-color font-code-sm text-[13px] text-on-surface-variant transition-colors">{tag}</span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <a className="group px-8 py-4 rounded-full bg-primary text-on-primary font-label-caps text-[12px] uppercase tracking-wider transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] font-semibold flex items-center justify-center gap-2" href="#timeout-project">
                        View My Work
                        <span className="material-symbols-outlined text-[18px] animate-bounce-horizontal">arrow_forward</span>
                      </a>
                      <a className="px-8 py-4 rounded-full border border-border-color text-white font-label-caps text-[12px] uppercase tracking-wider hover:bg-surface-container transition-all flex items-center justify-center" href="#contact">
                        Let's Talk
                      </a>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end z-10 order-1 lg:order-2 mb-8 lg:mb-0 relative">
                  <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[420px] lg:h-[420px]">
                    <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/50 shadow-[0_0_40px_rgba(245,158,11,0.3)] z-20">
                      <img alt="S.S. Creative" className="w-full h-full object-cover" src="https://i.ibb.co/QF8pR5Wd/IMG-20260606-163321-435.webp" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* VISUAL STORY: the animation is a background layer, not a separate visible section. */}
        <div id="visual-story" className="relative w-full overflow-visible">
          <div
            id="canvas-container"
            className="pointer-events-none sticky top-[12vh] z-0 h-[44vh] min-h-[300px] max-h-[520px] w-full overflow-visible bg-transparent"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-contain block"
              style={{ opacity: 0 }}
            />
          </div>

          {/* PROJECTS stay in normal document flow and slide over the animation. */}
          <section
            className="relative z-20 bg-transparent px-5 lg:px-6 w-full pt-10 pb-16 observe-section border-0 shadow-none"
            id="projects"
          >
          <div className="max-w-[1280px] mx-auto w-full">
            <div className="flex flex-col gap-2 mb-10">
              <span className="font-code-sm text-[14px] text-primary tracking-widest uppercase flex items-center gap-2">
                <span className="w-4 h-[1px] bg-primary"></span> Expertise & Featured Work
              </span>
              <h2 className="font-headline-lg text-[32px] text-white font-semibold tracking-tight">Featured Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="anim-card group flex flex-col bg-surface-container-low/90 backdrop-blur-md rounded-2xl overflow-hidden border border-border-color opacity-0 translate-y-[30px] duration-700 relative">
                <div className="relative h-[240px] overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('/MyImages/ui-ux-layout.webp')" }}></div>
                </div>
                <div className="p-6 flex flex-col flex-grow bg-surface-container-low">
                  <h3 className="font-headline-md text-[24px] text-white mb-2 font-semibold">Custom UI/UX & Layout</h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant font-light">Wireframing, responsive grids, conversion-focused UI</p>
                </div>
              </div>

              <div className="anim-card group flex flex-col bg-surface-container-low/90 backdrop-blur-md rounded-2xl overflow-hidden border border-border-color opacity-0 translate-y-[30px] duration-700 relative">
                <div className="relative h-[240px] overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('/MyImages/js-experience.webp')" }}></div>
                </div>
                <div className="p-6 flex flex-col flex-grow bg-surface-container-low">
                  <h3 className="font-headline-md text-[24px] text-white mb-2 font-semibold">Interactive JS Experience</h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant font-light">Lightweight, custom coded, micro-interactions optimized.</p>
                </div>
              </div>

                            <div className="anim-card group flex flex-col bg-surface-container-low/90 backdrop-blur-md rounded-2xl overflow-hidden border border-border-color opacity-0 translate-y-[30px] duration-700 relative">
                <div className="relative h-[240px] overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('/MyImages/wordpress-project.webp')" }}></div>
                </div>
                <div className="p-6 flex flex-col flex-grow bg-surface-container-low">
                  <h3 className="font-headline-md text-[24px] text-white mb-2 font-semibold">WordPress Customization</h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant font-light">Theme tweaking, Core Web Vitals optimization.</p>
                </div>
              </div>

              <div id="timeout-project" className="anim-card group flex flex-col bg-surface-container-low/90 backdrop-blur-md rounded-2xl overflow-hidden border border-border-color opacity-0 translate-y-[30px] duration-700 relative mt-8 md:mt-0">
                <div className="relative h-[240px] overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('/MyImages/timeout-cafe.webp')" }}></div>
                  <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 bg-black/60 text-primary backdrop-blur-md rounded-full font-code-sm text-[11px] border border-primary/30 uppercase tracking-widest font-bold">LATEST PROJECT</span></div>
                  </div>
                <div className="p-6 flex flex-col flex-grow bg-surface-container-low">
                  <h3 className="font-headline-md text-[24px] text-white mb-2 font-semibold">The Time Out Cafe</h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant mb-6 font-light">A premium web destination engineered for a high-end modern cafe.</p>
                  
                  <div className="mt-auto">
                    <div className="relative inline-flex p-[1.5px] rounded-[13px] overflow-hidden group/btn">
                       <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,var(--primary)_50%,transparent_100%)] animate-conic-glow opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                       <a className="relative z-10 flex items-center gap-2 px-6 py-3 bg-surface-container text-white font-label-caps text-[12px] uppercase tracking-wider rounded-xl transition-all hover:bg-surface-bright" href="https://joyful-pika-9b2a28.netlify.app/" target="_blank" rel="noreferrer">
                         Launch Live Site <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_outward</span>
                       </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </div>

        {/* REVIEWS SECTION */}
        <section className="relative z-20 bg-background px-5 lg:px-6 w-full py-16 border-t border-border-color observe-section" id="reviews">
          <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
            
            <div className="lg:col-span-4 flex flex-col items-start lg:sticky lg:top-32 h-fit mb-12 lg:mb-0 opacity-0 translate-y-[30px] duration-700 anim-card" id="review-header">
              <span className="font-code-sm text-[14px] text-primary tracking-widest uppercase flex items-center gap-2 mb-2">
                <span className="w-4 h-[1px] bg-primary"></span> Testimonials
              </span>
              <h2 className="font-headline-lg text-[32px] text-white mb-8 font-semibold tracking-tight">Client Feedback</h2>

              <div className="p-6 rounded-2xl bg-surface-container-low/80 border border-border-color backdrop-blur-md w-full mb-8" id="review-stats">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[40px] font-bold text-primary">4.7</span>
                    <div className="flex text-primary">{[1,2,3,4].map(n=><span key={n} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}<span className="material-symbols-outlined text-[18px]">star_half</span></div>
                  </div>
                  <div className="w-[1px] h-12 bg-border-color"></div>
                  <div className="flex flex-col justify-center">
                    <p className="font-label-caps text-[10px] text-primary tracking-widest uppercase mb-1">AVERAGE RATING</p>
                    <p className="font-body-md text-sm text-on-surface-variant whitespace-nowrap">Based on <span className="inline-block min-w-[2ch] font-bold text-primary text-[24px] leading-none align-middle">{reviewCount}</span> reviews</p>
                  </div>
                </div>
              </div>

              <button className="w-full px-6 py-4 rounded-full bg-primary text-on-primary font-label-caps text-[12px] uppercase tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 font-semibold" onClick={() => setIsReviewModalOpen(true)}>
                <span className="material-symbols-outlined text-[20px]">edit_square</span> Write a Review
              </button>
            </div>

            <div className="lg:col-span-8 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 pt-2 px-2" id="review-cards" style={{ WebkitOverflowScrolling: "touch" }}>
              
              <div className="anim-card relative rounded-[2rem] overflow-hidden shrink-0 snap-center w-[85vw] max-w-[360px] opacity-0 translate-y-[30px] duration-700 transition-all">
                <div className="bg-surface-container-low/90 backdrop-blur-md border border-border-color rounded-[2rem] p-6 flex flex-col gap-5 h-[320px] relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0"><img alt="Rahul" className="w-full h-full object-cover" src="/MyImages/rahul.webp"/></div>
                    <div className="flex flex-col"><span className="font-headline-md text-[18px] text-white font-semibold">Rahul Sharma</span><span className="font-code-sm text-[12px] text-primary">Cafe Owner, Jaipur</span></div>
                  </div>
                  <div className="flex text-primary">{[1,2,3,4,5].map(n=><span key={n} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}</div>
                  
                  {/* मोशन प्रिमिटिव्स: स्क्रॉल प्रोग्रेस ग्रेडिएंट (Top Bar + Edge Mask) */}
                  <div className="relative h-full overflow-hidden">
                    <ScrollProgress containerRef={rahulReviewRef} springOptions={DEFAULT_SPRING_OPTIONS} />
                    <div ref={rahulReviewRef} className="h-full overflow-y-auto pr-2 scroll-fade-mask" style={{scrollbarWidth:'thin'}}>
                      <p className="font-body-md text-on-surface-variant font-light leading-relaxed py-4">"Siddharth completely transformed our online presence. His attention to detail in UI combined with deep performance optimization resulted in a site that loads instantly. Highly recommend him for modern web projects!"</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="anim-card relative rounded-[2rem] overflow-hidden shrink-0 snap-center w-[85vw] max-w-[360px] opacity-0 translate-y-[30px] duration-700 transition-all">
                <div className="bg-surface-container-low/90 backdrop-blur-md border border-border-color rounded-[2rem] p-6 flex flex-col gap-5 h-[320px] relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0"><img alt="Emily" className="w-full h-full object-cover" src="/MyImages/emily.webp"/></div>
                    <div className="flex flex-col"><span className="font-headline-md text-[18px] text-white font-semibold">Emily Chen</span><span className="font-code-sm text-[12px] text-primary">Startup Founder</span></div>
                  </div>
                  <div className="flex text-primary">{[1,2,3,4,5].map(n=><span key={n} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}</div>
                  
                  {/* मोशन प्रिमिटिव्स: स्क्रॉल प्रोग्रेस ग्रेडिएंट */}
                  <div className="relative h-full overflow-hidden">
                    <ScrollProgress containerRef={emilyReviewRef} springOptions={DEFAULT_SPRING_OPTIONS} />
                    <div ref={emilyReviewRef} className="h-full overflow-y-auto pr-2 scroll-fade-mask" style={{scrollbarWidth:'thin'}}>
                      <p className="font-body-md text-on-surface-variant font-light leading-relaxed py-4">"Exceptional UI/UX skills and lightning-fast delivery. The frontend components were perfectly structured and visually stunning. I have worked with many developers, but this level of quality is rare."</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="anim-card relative rounded-[2rem] overflow-hidden shrink-0 snap-center w-[85vw] max-w-[360px] opacity-0 translate-y-[30px] duration-700 transition-all">
                <div className="bg-surface-container-low/90 backdrop-blur-md border border-border-color rounded-[2rem] p-6 flex flex-col gap-5 h-[320px] relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0"><img alt="Marcus" className="w-full h-full object-cover" src="/MyImages/marcus.webp"/></div>
                    <div className="flex flex-col"><span className="font-headline-md text-[18px] text-white font-semibold">Marcus JD</span><span className="font-code-sm text-[12px] text-primary">Creative Director</span></div>
                  </div>
                  <div className="flex text-primary">{[1,2,3,4,5].map(n=><span key={n} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}</div>
                  
                  {/* मोशन प्रिमिटिव्स: स्क्रॉल प्रोग्रेस ग्रेडिएंट */}
                  <div className="relative h-full overflow-hidden">
                    <ScrollProgress containerRef={marcusReviewRef} springOptions={DEFAULT_SPRING_OPTIONS} />
                    <div ref={marcusReviewRef} className="h-full overflow-y-auto pr-2 scroll-fade-mask" style={{scrollbarWidth:'thin'}}>
                      <p className="font-body-md text-on-surface-variant font-light leading-relaxed py-4">"Brilliant work! The animations are buttery smooth and the coding architecture is extremely clean. Siddharth knows exactly how to make a website feel alive. Truly a premium developer."</p>
                    </div>
                  </div>
                </div>
              </div>

              {dynamicReviews.length > 0 && (
                dynamicReviews.map((rev, index) => (
                  <DynamicReviewCard key={`dyn-${index}`} rev={rev} index={index} />
                ))
              )}

              </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="relative z-20 bg-background px-5 lg:px-6 w-full flex flex-col items-center text-center border-t border-border-color pt-10 pb-12" id="contact">
          <div className="max-w-[1280px] mx-auto w-full">
            <span className="font-code-sm text-[14px] text-primary tracking-widest uppercase flex items-center justify-center gap-2 mb-4">
              <span className="w-4 h-[1px] bg-primary"></span> Contact <span className="w-4 h-[1px] bg-primary"></span>
            </span>
            <h2 className="font-headline-lg text-[32px] text-white mb-8 max-w-2xl mx-auto font-semibold tracking-tight">Let's Grow Your Business Together</h2>

            <div className="flex justify-center mt-2 w-full z-40">
              <div className="magnetic-wrap inline-block cursor-pointer" onClick={() => setIsMessageOpen(true)}>
                <button className="magnetic-inner px-8 py-3 rounded-[2rem] bg-surface-container border border-border-color text-white font-label-caps text-[13px] uppercase tracking-wider transition-all duration-300 hover:bg-surface-bright hover:border-white/30 shadow-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">chat_bubble</span> Drop a Message
                </button>
              </div>
            </div>
          </div>
        </section>

                {/* MESSAGE MODAL */}
        {isMessageOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity animate-fade-in-up" onClick={() => setIsMessageOpen(false)}></div>
            <div className="relative bg-surface-container border border-border-color rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col animate-morph-expand">
              <h3 className="text-white font-headline-md text-[20px] mb-1">Send a Message</h3>
              <p className="font-body-md text-primary/90 text-[13px] mb-4">
                *Please include your email or phone number in the message below so I can get back to you.
              </p>
              <form onSubmit={handleContactSubmit}>
                <textarea 
                  value={messageText} 
                  onChange={(e)=>setMessageText(e.target.value)} 
                  required 
                  className="w-full bg-surface border border-border-color rounded-lg px-4 py-3 font-body-md text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50 resize-none mb-4" 
                  placeholder="Hi Siddharth, I want to discuss a project. You can reach me at: example@email.com..." 
                  rows="5"
                ></textarea>
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setIsMessageOpen(false)} className="text-on-surface-variant hover:text-white font-code-sm text-[13px]">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-[12px] uppercase font-bold hover:bg-surface-tint transition-colors disabled:opacity-50">
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
                {/* REVIEW MODAL */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity animate-fade-in-up" onClick={() => {setIsReviewModalOpen(false); setModalRating(0);}}></div>
            <div className="relative bg-surface-container border border-border-color rounded-2xl w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-morph-expand">
              <div className="p-6 flex justify-between items-center border-b border-border-color">
                <h3 className="font-headline-md text-[20px] text-white">Submit a Review</h3>
                <button className="text-on-surface-variant hover:text-white transition-colors" onClick={() => {setIsReviewModalOpen(false); setModalRating(0);}}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-wider">Your Name *</label>
                  <input value={reviewData.name} onChange={e=>setReviewData({...reviewData, name: e.target.value})} className="w-full bg-surface border border-border-color rounded-lg px-4 py-3 font-body-md text-white focus:outline-none focus:border-primary/50" placeholder="Jane Doe" type="text" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-wider">Email Address *</label>
                  <input value={reviewData.email} onChange={e=>setReviewData({...reviewData, email: e.target.value})} className="w-full bg-surface border border-border-color rounded-lg px-4 py-3 font-body-md text-white focus:outline-none focus:border-primary/50" placeholder="jane@example.com" type="email" required />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-wider">Rating *</label>
                  <div className="flex gap-2 text-primary cursor-pointer">
                    {[1,2,3,4,5].map(n=>(
                      <span key={n} onClick={() => setModalRating(n)} className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: n <= modalRating ? "'FILL' 1" : "'FILL' 0"}}>
                        {n <= modalRating ? 'star' : 'star_border'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-wider">Feedback *</label>
                  <textarea value={reviewData.feedback} onChange={e=>setReviewData({...reviewData, feedback: e.target.value})} className="w-full bg-surface border border-border-color rounded-lg px-4 py-3 font-body-md text-white focus:outline-none focus:border-primary/50 resize-none" placeholder="Share your experience..." rows="3" required></textarea>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-wider">Upload Photo *</label>
                  <input onChange={e=>setReviewData({...reviewData, file: e.target.files[0]})} className="w-full text-on-surface-variant font-body-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer" type="file" required />
                </div>
                <button disabled={isSubmitting || modalRating === 0} className="mt-2 w-full py-3 rounded-lg bg-primary text-on-primary font-label-caps text-[12px] uppercase tracking-wider hover:bg-surface-tint transition-all font-semibold disabled:opacity-50" type="submit">
                  {isSubmitting ? "Uploading..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* THANK YOU POPUP */}
        {successPopup.show && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
            <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-morph-expand pointer-events-auto">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-[28px]">check_circle</span>
              </div>
              <p className="text-white font-headline-md text-[18px] tracking-wide text-center">
                {successPopup.message}
              </p>
            </div>
          </div>
        )}

        {/* MOBILE DOCK */}
        <div className="fixed bottom-6 left-0 w-full flex justify-center z-[90] pointer-events-none">
          <nav className="pointer-events-auto flex items-end gap-3 px-6 py-3 bg-surface-container/30 backdrop-blur-md border border-border-color rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] lg:hidden" id="mobile-nav">
            {[ {href:"#about", icon:"person", label:"About"}, {href:"#projects", icon:"work", label:"Projects"}, {href:"#reviews", icon:"reviews", label:"Reviews"}, {href:"#contact", icon:"mail", label:"Contact"} ].map(item => (
              <a key={item.href} href={item.href} onClick={(e) => handleDockClick(e, item.href.substring(1))} className="nav-item group relative flex flex-col items-center justify-end w-12 h-12 transition-all duration-300 origin-bottom focus:outline-none">
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-surface-bright text-white text-[10px] font-label-caps tracking-wider rounded-md opacity-0 scale-90 transition-all duration-300 pointer-events-none tooltip shadow-lg">
                  {item.label}
                </span>
                <div className="icon-bubble flex items-center justify-center w-11 h-11 rounded-full bg-transparent transition-all duration-300 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                </div>
              </a>
            ))}
          </nav>
        </div>

        {/* Background Audio Player in DOM */}
        <audio
          ref={audioRef}
          src={songs[currentSongIndex]}
          onEnded={handleNextSong}
          preload="auto"
        />

        {/* MUSIC WIDGET (COMPACT SIZE) */}
        <div className="fixed bottom-[90px] lg:bottom-6 left-4 lg:left-6 z-[100] flex items-center gap-2 bg-surface-container/60 backdrop-blur-xl border border-border-color rounded-full px-3 py-1.5 shadow-lg">
          <button onClick={togglePlay} className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-on-primary hover:scale-105 transition-transform focus:outline-none shrink-0">
            <span className="material-symbols-outlined text-[16px]">{isPlaying ? "pause" : "play_arrow"}</span>
          </button>
          
          <div className="flex flex-col justify-center w-[90px]">
            <span className="font-label-caps text-[8px] text-primary tracking-widest uppercase mb-0.5">
              {isAudioLoading ? "LOADING..." : "Now Playing"}
            </span>
            <div className="marquee-container w-full">
              <span className="marquee-text font-code-sm text-[10px] text-white">
                {songs[currentSongIndex].split('/').pop().replace('.mp3', '').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3 ml-1">
              <div className="eq-bar"></div>
              <div className="eq-bar"></div>
              <div className="eq-bar"></div>
            </div>
          )}
        </div>

        {/* WHATSAPP BUTTON */}
        <div className="fixed bottom-[100px] right-4 lg:bottom-10 lg:right-10 z-[100]">
          <a href="https://wa.me/919636598226" target="_blank" rel="noreferrer" className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] transition-shadow">
            <span className="material-symbols-outlined text-[24px] lg:text-[28px]">chat</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>
          </a>
        </div>

        {/* FOOTER */}
        <footer className="w-full bg-surface border-t border-border-color py-6 pb-[140px] lg:pb-6 relative z-20 transition-colors duration-500">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-on-surface-variant font-body-md text-[13px] font-light text-center md:text-left">
              © 2026 S.S. Creative. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://www.linkedin.com/in/siddharth-soni-b92970429" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[11px] uppercase tracking-wider flex items-center gap-1 group">
                LinkedIn <span className="material-symbols-outlined text-[14px] opacity-50 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </a>
              <a href="mailto:siddharthsoni8226@gmail.com" className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[11px] uppercase tracking-wider flex items-center gap-1 group">
                Email <span className="material-symbols-outlined text-[14px] opacity-50 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}