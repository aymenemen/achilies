import { useEffect } from "react";

/** Adds `is-visible` to all `.sw-fade` elements when they scroll into view. */
export function useFadeUp() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".sw-fade"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
