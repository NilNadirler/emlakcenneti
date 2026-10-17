import Link from "next/link";
import { House } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-[#203B32] text-white">
      <nav className="flex items-center justify-between px-10 py-4">
       <Link href="/" className="flex items-center gap-2">
        <House size={30} className="text-[#C58B58]" />
          <span className="text-2xl font-bold">
          Emlak <span className="text-[#C58B58]">Cenneti</span>
       </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/satilik">Satılık</Link>
          <Link href="/kiralik">Kiralık</Link>
          <Link href="/emlak">Emlak</Link>
          <Link href="/emlak">Üye Ol</Link>
          <Link href="/giris">Giriş Yap</Link>
          <Link href="/ilan-ver" className="rounded-xl bg-[#C58B58] px-4 py-2">+ İlan Ver</Link>
        </div>
      </nav>
    </header>
  );
}