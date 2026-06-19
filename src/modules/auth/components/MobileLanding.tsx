import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function MobileLanding() {
  return (
    <section className="relative h-dvh overflow-hidden bg-[#D995C7]">
      <div className="mx-auto flex h-dvh max-w-md flex-col items-center px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 mt-6"
        >
          <img
            src={`${import.meta.env.BASE_URL}images/favicon.svg`}
            alt="Limes"
            className="h-24 w-auto"
          />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-grotesque text-[64px] font-black leading-[0.9] tracking-[-0.06em] text-[#1A1920]"
        >
          Meet Limes
          <br />
          Mobile.
        </motion.h1>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <h2 className="font-grotesque text-[72px] font-bold leading-[0.88] tracking-[-0.06em] text-[#1A1920]">
            <div>
              The{" "}
              <span className="inline-flex items-center rounded-3xl bg-[#ABFF63] px-4 py-1 -rotate-3">
                smarter
              </span>
            </div>

            <div>network.</div>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xs font-sans text-base font-semibold text-[#1A1920]/75"
        >
          Fast, affordable mobile plans designed for modern life.
        </motion.p>

        <Link to="/signup" className="mt-6 block">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-full bg-[#1A1920] px-8 py-4 font-sans text-base font-semibold text-[#ABFF63]"
          >
            Get Started →
          </motion.button>
        </Link>

        <Link
          to="/signin"
          className="mt-3 rounded-full py-3 font-sans text-base font-medium text-[#1A1920]/50 transition-colors active:text-[#1A1920]/70"
        >
          I already have an account
        </Link>

        <div className="mt-auto pb-6 pt-8">
          <img
            src={`${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`}
            alt="Limes Mobile"
            className="h-6 w-auto"
          />
        </div>
      </div>
    </section>
  );
}
