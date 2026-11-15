export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex select-none flex-col items-start leading-none ${className}`}
      aria-label="Project Decode"
    >
      <span className="text-[0.38em] font-bold tracking-[0.38em] text-ink-soft">
        PROJECT
      </span>
      <span className="display mt-[0.04em] flex items-start text-[1em]">
        DECODE
        <span
          aria-hidden
          className="ml-[0.1em] mt-[0.68em] inline-block h-[0.17em] w-[0.17em] rounded-full bg-hot"
        />
      </span>
    </span>
  );
}
