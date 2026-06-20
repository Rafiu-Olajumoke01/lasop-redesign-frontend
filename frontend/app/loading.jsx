import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 bg-[#071224] flex flex-col items-center justify-center z-[9999]"
    >
      <Image
        src="/logo.webp"
        alt="LASOP"
        width={180}
        height={180}
        priority
      />
    </div>
  );
}