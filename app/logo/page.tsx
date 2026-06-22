import Image from "next/image";
import logo from "@/public/ChatGPT Image Jun 22, 2026, 01_48_53 AM.png";

export default function LogoPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <Image
        src={logo}
        alt="Pay Split Logo"
        priority
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
