import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5EA]/60 bg-white">
      <div className="max-w-[980px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-[#1C1C1E] no-underline tracking-[-0.02em]"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            <Logo size={32} />
            KleanHQ
          </Link>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-[#AEAEB2]">
            <span>&copy; 2026</span>
            <span className="text-[#E5E5EA]">&middot;</span>
            <Link
              href="/terms"
              className="hover:text-[#1C1C1E] transition-colors no-underline"
            >
              Terms
            </Link>
            <span className="text-[#E5E5EA]">&middot;</span>
            <Link
              href="/privacy"
              className="hover:text-[#1C1C1E] transition-colors no-underline"
            >
              Privacy
            </Link>
          </div>

          {/* Built in Miami */}
          <div className="text-sm text-[#AEAEB2]">
            Built in Miami{" "}
            <span role="img" aria-label="palm tree">
              🌴
            </span>
          </div>
        </div>

        {/* Share hook */}
        <div className="mt-6 pt-6 border-t border-[#E5E5EA]/40 text-center">
          <p
            className="text-sm text-[#AEAEB2]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Know someone who&apos;d love KleanHQ?{" "}
            <a
              href="#waitlist"
              className="text-[#007AFF] font-medium hover:underline no-underline"
            >
              Share the waitlist
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
