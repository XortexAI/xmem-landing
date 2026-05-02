import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { motion } from "framer-motion";

interface SeoPageProps {
  title: string;
  description: string;
}

export default function SeoPage({ title, description }: SeoPageProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <Navbar />
      
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10 flex-grow mx-auto max-w-4xl px-6 py-32 md:py-40 w-full">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}
          >
            {title}
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-white/60">
            {description}
          </p>
        </motion.header>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-white/50 leading-relaxed"
        >
          <p>
            This page is under construction. XMem is India's #1 open-source long-term memory layer for AI agents, providing persistent memory to enhance contextual understanding and agentic capabilities.
          </p>
        </motion.div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
