export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path
        d="M13.3 20v-6.2h2.1l.3-2.5h-2.4V9.8c0-.7.2-1.2 1.2-1.2h1.3V6.4c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.6v2.5h2.1V20z"
        fill="#1877f2"
      />
    </svg>
  );
}

/** The scattered leaf from the flyer, used as a small accent. */
export function Leaf({
  className,
  fill,
}: {
  className?: string;
  fill: string;
}) {
  return (
    <svg viewBox="0 -3 46 27" aria-hidden="true" className={className}>
      <path d="M0 8 c18 -10 40 -4 44 14 c-20 6 -34 4 -44 -14z" fill={fill} />
    </svg>
  );
}
