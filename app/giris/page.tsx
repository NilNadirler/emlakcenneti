"use client";
import { supabaseBrowser } from "../lib/supabase-browser";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Giris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  async function girisYap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMesaj("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: sifre,
    });

    setLoading(false);

    if (error) {
      setMesaj("Giriş yapılamadı. E-posta ve şifreni kontrol et.");
      return;
    }
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user) {
      setMesaj("Giriş yapıldı ancak kullanıcı oturumu doğrulanamadı.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E3D8] bg-white p-7 shadow-sm">
        <Link href="/" className="text-sm text-[#203B32] hover:underline">
          ← Ana sayfa
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-[#203B32]">Giriş Yap</h1>
        <p className="mt-2 text-sm text-gray-600">
          EmlakCenneti hesabına giriş yap.
        </p>

        <form onSubmit={girisYap} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            E-posta
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CB] px-3 py-3"
              placeholder="ornek@email.com"
            />
          </label>

          <label className="block text-sm font-medium">
            Şifre
            <input
              required
              type="password"
              autoComplete="current-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CB] px-3 py-3"
              placeholder="Şifren"
            />
          </label>

          {mesaj && (
            <p role="alert" className="rounded-lg bg-[#F7E5D8] p-3 text-sm">
              {mesaj}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#203B32] py-3 font-semibold text-white hover:bg-[#2D5145] disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Henüz üye değil misin?{" "}
          <Link
            href="/uye-ol"
            className="font-semibold text-[#203B32] underline"
          >
            Üye Ol
          </Link>
        </p>
      </div>
    </main>
  );
}
