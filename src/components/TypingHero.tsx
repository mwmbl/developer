"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["ethical", "human-centred", "open-source"];
const INTERVAL = 2800; // ms each word is shown

export function TypingHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center px-4"
      style={{ fontFamily: "'Hind Vadodara', sans-serif", fontWeight: 500 }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground">
        Your gateway to the
        <br />
        {/* Animated word with slide-up transition */}
        <span className="inline-flex items-center justify-center mt-2 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={WORDS[index]}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="inline-block bg-brand-gradient px-3 py-1 rounded-sm text-black font-semibold"
            >
              {WORDS[index]}
            </motion.span>
          </AnimatePresence>
        </span>{" "}
        web
      </h1>
    </motion.div>
  );
}
