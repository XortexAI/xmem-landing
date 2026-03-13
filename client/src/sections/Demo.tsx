import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const demoVideoSrc = "/Xmem.mp4";

export function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 25%"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 0.45], [0.82, 1]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.3], [0.45, 1]);
  const videoBlur = useTransform(scrollYProgress, [0, 0.35], [18, 0]);
  const frameY = useTransform(scrollYProgress, [0, 0.45], [80, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.55], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.55], [36, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#080808] py-28 md:py-40"
    >
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div
        className="absolute inset-x-0 top-24 mx-auto h-[420px] w-[85%] max-w-6xl rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(84,38,255,0.18) 0%, rgba(68,154,255,0.12) 35%, transparent 72%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-white/50"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Product Demo
          </div>
        </div>

        <div className="grid gap-10 lg:min-h-[120vh] lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <div className="lg:sticky lg:top-[12vh]">
            <motion.div
              style={{
                scale: videoScale,
                opacity: videoOpacity,
                y: frameY,
                filter: useTransform(videoBlur, (value) => `blur(${value}px)`),
              }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#5a4dff]/20 via-transparent to-[#45a2ff]/12 blur-2xl" />

              <div
                className="relative overflow-hidden rounded-[32px] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(84,38,255,0.75), rgba(88,120,255,0.3), rgba(69,162,255,0.82))",
                  boxShadow:
                    "0 40px 120px rgba(0,0,0,0.55), 0 0 80px rgba(84,38,255,0.14)",
                }}
              >
                <div className="rounded-[31px] bg-[#07070b]/96 p-3 md:p-4">
                  <div className="mb-3 flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.24em] text-white/35">
                    <span>Xmem runtime walkthrough</span>
                    <span>Portable memory</span>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black">
                    <video
                      className="aspect-video h-full w-full object-cover"
                      src={demoVideoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center lg:min-h-[100vh]">
            <motion.div
              style={{ opacity: textOpacity, y: textY }}
              className="w-full rounded-[28px] border border-white/10 bg-white/[0.025] p-8 backdrop-blur-sm md:p-10"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                Why it matters
              </div>
              <h3
                className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-5xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Keep your memory unified and use it anywhere.
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-white/42">
                Portability should not be a second-class problem. Xmem keeps
                memory structured, portable, and available across runtimes,
                tools, and agent workflows.
              </p>
              <div className="mt-8 space-y-3 text-sm text-white/34">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                  One memory layer across local tools, cloud agents, and production systems.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                  The same context follows the agent instead of being rebuilt every time.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
