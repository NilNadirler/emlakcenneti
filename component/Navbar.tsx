
"use client";

import Link from "next/link";
import { House } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../app/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        setUserName(
          data?.full_name || user.user_metadata?.full_name || ""
        );
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">
                Hoş geldin,{" "}
                {userName || user.email?.split("@")[0] || "Kullanıcı"}
              </span>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="text-white hover:text-[#C58B58]"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <>
              <Link href="/uye-ol">Üye Ol</Link>
              <Link href="/giris">Giriş Yap</Link>
            </>
          )}

          <Link
            href="/ilan-ver"
            className="rounded-xl bg-[#C58B58] px-4 py-2"
          >
            + İlan Ver
          </Link>
        </div>
      </nav>
    </header>
  );
}
