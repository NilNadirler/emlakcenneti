"use client";
import Navbar from "@/component/Navbar";
import Link from "next/link";
import { MapPin, Home, Building2, Search } from "lucide-react";
import Sidebar from "@/component/sidebar";
import { supabase } from "@/app/lib/supabase";
import React from "react";

export default function HomePage() {
  const [balance, setBalance] = React.useState<number | null>(null);
  React.useEffect(() => {
    async function loadBalance() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBalance(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        setBalance(0);
      } else {
        setBalance(Number(data.balance ?? 0));
      }
    }

    loadBalance();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadBalance();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#203B32]">
      <Navbar />
      <div className="flex items-start gap-6 px-6 py-6">
        <div className="pt-12">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="relative overflow-hidden rounded-3xl">
              {balance !== null && (
                <div className="absolute right-4 top-4 z-20 rounded-xl bg-white p-4 shadow-lg">
                  <p className="text-sm text-gray-500">Hesap bakiyen</p>

                  <p className="text-xl font-bold text-[#203B32]">
                    {balance.toLocaleString("tr-TR")} TL
                  </p>

                  <Link
                    href="/bakiye-yukle"
                    className="mt-2 inline-block rounded-lg bg-[#D77C59] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Bakiye Yükle
                  </Link>
                </div>
              )}

              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85"
                alt="Modern ev"
                className="h-[600px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                <p className="mb-4 font-semibold tracking-widest text-[#F2B477]">
                  EMLAKCENNETİ'NE HOŞ GELDİN
                </p>
                <h1 className="max-w-2xl text-4xl font-bold text-white md:text-6xl">
                  Hayalindeki evi keşfet.
                </h1>
                <p className="mt-4 text-lg text-white">
                  Satılık ve kiralık emlak ilanlarını kolayca bul.
                </p>
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-7xl px-6 pb-16">
            <h2 className="mb-6 text-2xl font-bold">Popüler Kategoriler</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                ["Konut", "Evini keşfet"],
                ["Villa", "Müstakil yaşam"],
                ["Arsa", "Yatırım fırsatları"],
                ["İşyeri", "İş alanları"],
                ["Projeler", "Yeni projeler"],
                ["Günlük Kiralık", "Kısa süreli konaklama"],
              ].map(([name, description]) => (
                <Link
                  key={name}
                  href="/emlak"
                  className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E8D9] text-[#C58B58]">
                    <Home size={25} />
                  </div>
                  <h3 className="font-bold">{name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
