const GRADIENTS = [
  ["#289ad1", "#1e7fb5"],
  ["#a0669e", "#7a4a7a"],
  ["#e67e22", "#c0582a"],
  ["#27ae60", "#1a7a42"],
  ["#e74c3c", "#b03030"],
  ["#8e44ad", "#6a2f85"],
  ["#16a085", "#0e6e5c"],
  ["#2c3e50", "#1a252f"],
  ["#d35400", "#a04000"],
  ["#1abc9c", "#12907a"],
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

interface BookCoverPlaceholderProps {
  title: string;
  author?: string;
}

export default function BookCoverPlaceholder({ title, author }: BookCoverPlaceholderProps) {
  const idx = hashString(title) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      <p className="text-white text-center font-bold leading-tight line-clamp-4"
         style={{ fontSize: "clamp(0.5rem, 2.5cqw, 0.85rem)", wordBreak: "break-word" }}>
        {title}
      </p>
      {author && (
        <p className="text-white/70 text-center mt-1 leading-tight line-clamp-2"
           style={{ fontSize: "clamp(0.4rem, 2cqw, 0.7rem)" }}>
          {author}
        </p>
      )}
    </div>
  );
}
