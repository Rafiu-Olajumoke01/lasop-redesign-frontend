import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsapp() {
  return (
    <a
        href="https://wa.link/b5ut22"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] bg-green-500 text-white rounded-full shadow-xl hover:scale-105 transition"
    >
    {/* Mobile */}
    <div className="flex lg:hidden w-16 h-16 items-center justify-center text-3xl">
        <FaWhatsapp />
    </div>

    {/* Desktop */}
    <div className="hidden lg:flex items-center gap-2 px-5 py-4 font-medium">
        <FaWhatsapp size={24} />
        <span>Chat on WhatsApp</span>
    </div>
    </a>
  );
}