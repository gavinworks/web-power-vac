"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EVENT = "pv:coming-soon";

/**
 * A link to a page that doesn't exist yet. It carries the real future URL
 * (so the site structure is visible) but stays on the homepage and says so.
 */
export function PrototypeLink({
  href,
  page,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
  page: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    onClick?.();
    window.dispatchEvent(new CustomEvent(EVENT, { detail: page }));
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}

/** Shows which page a clicked prototype link will lead to. Mount once per page. */
export function ComingSoonToast() {
  const [page, setPage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (e: Event) => {
      setPage((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setPage(null), 2800);
    };
    window.addEventListener(EVENT, show);
    return () => {
      window.removeEventListener(EVENT, show);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center">
      <AnimatePresence>
        {page && (
          <motion.p
            key={page}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-white px-6 py-3.5 font-pv-display text-lg font-bold text-pv-navy shadow-2xl"
          >
            {page === "Home"
              ? "You're on the homepage."
              : `The ${page} page comes next. This preview is the homepage only.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
