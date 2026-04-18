import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Home, FileText, Terminal } from "lucide-react";
import { Navbar } from "@/sections/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col relative overflow-hidden">
      <Navbar />
      
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 
            className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter bg-gradient-to-br from-white via-white/80 to-white/20 bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white/90">
            Page not found in memory
          </h2>
          
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            The page you are looking for doesn't exist, has been moved, or perhaps was never committed to our long-term memory.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors w-full sm:w-auto justify-center"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            
            <Link 
              href="/docs"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4 text-white/60" />
              Documentation
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}