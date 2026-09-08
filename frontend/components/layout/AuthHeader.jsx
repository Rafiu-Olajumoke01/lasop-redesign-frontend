import Link from "next/link";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-[#071224]/95 via-[#0B1730]/95 to-[#0A1A38]/95 backdrop-blur-xl border-b border-blue-900/40">
      <div className="container-width h-20 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.webp" alt="LASOP Logo" width={45} height={45} />
          <h1 className="text-2xl font-bold text-[#8BB8FF] tracking-wide">LASOP</h1>
        </Link>
      </div>
    </header>
  );
}