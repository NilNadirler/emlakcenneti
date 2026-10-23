"use client";

import Link from "next/link";
import { House } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../app/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      setUser(user);

      if (!user) {
        setUserName("");
        setIsAdmin(false);
        setPendingCount(0);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      setUserName(
        profile?.full_name || user.user_metadata?.full_name || ""
      );

      const admin = profile?.role === "admin";
      setIsAdmin(admin);

      if (admin) {
        const { count, error } = await supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");

        if (active && !error) {
          setPendingCount(count ?? 0);
        }
      } else {
        setPendingCount(0);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
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

          {user && isAdmin && (
            <Link
              href="/admin/ilanlar"
              className="flex items-center gap-2 hover:text-[#C58B58]"
            >
              İlanlar
              {pendingCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}

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