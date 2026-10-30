import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../context/Store";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[80] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 md:bottom-6 md:left-auto md:right-5 md:translate-x-0">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => dismissToast(item.id)}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto rounded-2xl border border-white/10 bg-[#221f2b]/95 px-4 py-3 text-left text-sm text-cream shadow-2xl backdrop-blur"
          >
            {item.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
