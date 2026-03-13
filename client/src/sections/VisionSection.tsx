import { motion } from "framer-motion";
import { Brain, Network, Database, GitMerge, Workflow, Sparkles } from "lucide-react";
import { RevealSection } from "../components/shared/RevealSection";

export function VisionSection() {
  return (
    <section className="relative py-40 bg-[#030303] overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        
        {/* Header */}
        <RevealSection className="text-center max-w-3xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium text-white/60 uppercase tracking-widest bg-white/[0.03] border border-white/10">
            <Sparkles className="w-4 h-4 text-white/80" />
            The Vision
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Intelligence requires <span className="text-white/30">memory.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/40 leading-relaxed max-w-2xl mx-auto">
            A system that forgets is just a sophisticated autocomplete. True autonomy requires the ability to compound knowledge and context over time.
          </p>
        </RevealSection>

        {/* Crisp 2D Core Visual (Replaces the blurry 3D scene) */}
        <RevealSection className="relative h-[400px] md:h-[500px] mb-32 flex items-center justify-center" delay={0.2}>
            {/* Concentric rings */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] border border-white/5 rounded-full" 
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
              className="absolute w-[400px] h-[400px] md:w-[560px] md:h-[560px] border border-white/10 border-dashed rounded-full" 
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
              className="absolute w-[520px] h-[520px] md:w-[760px] md:h-[760px] border border-white/[0.03] rounded-full" 
            />
            
            {/* Connecting crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute h-full max-h-[600px] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            </div>

            {/* Pulses on crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ x: ["-400px", "400px"], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
                <motion.div 
                    animate={{ y: ["-300px", "300px"], opacity: [0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute h-24 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent"
                />
            </div>

            {/* Central Xmem Node */}
            <div className="relative z-20 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[#060606] border border-white/20 flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.05)] overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
               <Database className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10" />
               {/* Inner pulse */}
               <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/5 rounded-3xl"
               />
            </div>

            {/* Orbiting Satellite Nodes */}
            <div className="absolute z-10 w-[400px] h-[400px] md:w-[560px] md:h-[560px] pointer-events-none">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                 className="w-full h-full relative"
               >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <Workflow className="w-6 h-6 text-white/60" />
                 </div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <Brain className="w-6 h-6 text-white/60" />
                 </div>
                 <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <Network className="w-6 h-6 text-white/60" />
                 </div>
                 <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <GitMerge className="w-6 h-6 text-white/60" />
                 </div>
               </motion.div>
            </div>
        </RevealSection>

        {/* Bento Box Manifesto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Main large card */}
          <RevealSection className="md:col-span-2 p-10 rounded-[32px] bg-white/[0.02] border border-white/10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.3}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
              <Database className="w-5 h-5 text-white/80" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Memory is infrastructure</h3>
              <p className="text-lg text-white/50 leading-relaxed max-w-xl">
                Just as compute and networking became foundational primitives, memory must become a core layer of the AI stack. Without it, agents remain isolated and ephemeral.
              </p>
            </div>
          </RevealSection>
          
          {/* Smaller card 1 */}
          <RevealSection className="p-10 rounded-[32px] bg-white/[0.02] border border-white/10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.4}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
              <Network className="w-5 h-5 text-white/80" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Continuity enables growth</h3>
              <p className="text-white/50 leading-relaxed">
                Agents that remember can learn, adapt, and compound their context over time, rather than starting from scratch every run.
              </p>
            </div>
          </RevealSection>

          {/* Smaller card 2 */}
          <RevealSection className="p-10 rounded-[32px] bg-white/[0.02] border border-white/10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.5}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
              <GitMerge className="w-5 h-5 text-white/80" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Universal Context</h3>
              <p className="text-white/50 leading-relaxed">
                Xmem acts as the universal substrate, allowing data to flow seamlessly between disparate tools, runtimes, and sessions.
              </p>
            </div>
          </RevealSection>

          {/* Wide bottom card */}
          <RevealSection className="md:col-span-2 p-10 rounded-[32px] bg-white/[0.02] border border-white/10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.6}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
              <Brain className="w-5 h-5 text-white/80" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The future is infinite</h3>
              <p className="text-lg text-white/50 leading-relaxed max-w-xl">
                We are moving away from session-based chat windows toward persistent, always-on autonomous systems. Memory is the fuel that allows these infinite loops to run safely and effectively.
              </p>
            </div>
          </RevealSection>
        </div>

      </div>
    </section>
  );
}