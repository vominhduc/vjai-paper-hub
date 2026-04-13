import Link from "next/link";
import { Home, ArchiveIcon, Calendar, Map } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: "linear-gradient(160deg, #070c26 0%, #0e1550 50%, #070c26 100%)",
        color: "#e8eaf6",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 max-w-lg">
        {/* Giant 404 */}
        <p
          className="text-[9rem] font-black leading-none select-none"
          style={{
            background: "linear-gradient(135deg, #1A237E 0%, #FF5722 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </p>

        <div className="glow-line w-24" />

        <h1 className="text-2xl font-black text-white">Page Not Found</h1>
        <p className="text-sm max-w-sm" style={{ color: "rgba(232,234,246,0.55)" }}>
          Looks like this paper got lost between cycles. The page you're looking for
          doesn't exist or may have been moved.
        </p>

        {/* Navigation links */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold btn-orange text-white"
          >
            <Home size={14} /> Home
          </Link>
          <Link
            href="/cycle"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Calendar size={14} /> Cycles
          </Link>
          <Link
            href="/archive"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <ArchiveIcon size={14} /> Archive
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(232,234,246,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Map size={14} /> Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
