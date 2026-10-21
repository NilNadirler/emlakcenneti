
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function UyeOl() {
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMesaj("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: {
        data: { full_name: adSoyad },
      },
    });

    setLoading(false);

    if (error) {
      setMesaj(error.message);
      return;
    }

    if (data.session) {
      window.location.href = "/";
    } else {
      setMesaj(
        "Kayıt oluşturuldu. E-posta doğrulaması açıksa gelen kutunu kontrol et."
      );
    }
    setTimeout(() => {
    window.location.href = "/giris";
  }, 3000);
  }

  const inputClass =
    "w-full rounded-lg border border-[#DCD6CB] px-3 py-3 outline-none focus:border-[#C58B58]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E3D8] bg-white p-7 shadow-sm">
        <Link href="/" className="text-sm text-[#203B32] hover:underline">
          ← Ana sayfa
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-[#203B32]">Üye Ol</h1>
        <p className="mt-2 text-sm text-gray-600">
          EmlakCenneti'ne katıl, ilanlarını yönet.
        </p>

        <form onSubmit={kayitOl} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Ad Soyad
            <input
              required
              autoComplete="name"
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="Adınız Soyadınız"
            />
          </label>

          <label className="block text-sm font-medium">
            E-posta
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="ornek@email.com"
            />
          </label>

          <label className="block text-sm font-medium">
            Şifre
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="En az 6 karakter"
            />
          </label>

          {mesaj && (
            <p role="status" className="rounded-lg bg-[#F7E5D8] p-3 text-sm">
              {mesaj}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#203B32] py-3 font-semibold text-white hover:bg-[#2D5145] disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Üye Ol"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Zaten üye misin?{" "}
          <Link href="/giris" className="font-semibold text-[#203B32] underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </main>
  );
}
