import Link from "next/link";

export default function HomeNavbar() {
  return (
    <nav className="flex items-center px-10 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#00ffc8]/10 relative overflow-hidden">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ffc8] to-transparent opacity-60" />

      {/* Logo */}
      <Link
        href="/"
        className="font-bold tracking-[0.18em] text-xl bg-gradient-to-r from-[#00ffc8] to-[#00b8ff] bg-clip-text text-transparent select-none"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        CYBERLITY
      </Link>
    </nav>
  );
}