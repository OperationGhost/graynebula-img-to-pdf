import Link from "next/link";

export default function HomeNavbar() {
  return (
    <nav className="flex items-center px-10 h-16 bg-black/95 backdrop-blur-md border-b border-white/10 relative overflow-hidden">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />

      {/* Logo */}
      <Link
        href="/"
        className="font-bold tracking-[0.05em] text-xl text-white select-none"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Image to PDF
      </Link>
    </nav>
  );
}