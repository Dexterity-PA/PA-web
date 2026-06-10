export default function PendingMark() {
  return (
    <span className="flex items-end gap-[0.18em] text-21 leading-none">
      <svg
        className="mb-[0.1em] h-[0.8em] w-[0.8em] shrink-0"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M12 2 L4 10 M4 10 L9 10 M4 10 L4 5"
          stroke="#4ade80"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-mono text-accent">pending</span>
    </span>
  );
}
