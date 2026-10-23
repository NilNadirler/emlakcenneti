"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Listing = {
  id: string | number;
  title: string;
  description: string | null;
  price: number | null;
  city: string | null;
  district: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminIlanlarPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      const user = authData.user;

      if (authError || !user) {
        router.replace("/giris");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      await loadListings();
    }

    async function loadListings() {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, description, price, city, district, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("İlanlar yüklenemedi: " + error.message);
      } else {
        setListings((data ?? []) as Listing[]);
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  async function updateStatus(
    listingId: Listing["id"],
    status: "published" | "rejected"
  ) {
    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId);

    if (error) {
      setMessage("İşlem başarısız: " + error.message);
      return;
    }

    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId ? { ...listing, status } : listing
      )
    );

    if (selected?.id === listingId) {
      setSelected({ ...selected, status });
    }

    setMessage(status === "published" ? "İlan onaylandı." : "İlan reddedildi.");
  }

  if (loading) {
    return <main className="p-8">Yetki kontrol ediliyor...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Admin – İlan Yönetimi</h1>
      <p className="mb-6 text-gray-600">
        İlanları incele, detaylarını aç ve onayla veya reddet.
      </p>

      {message && (
        <p className="mb-4 rounded bg-gray-100 p-3">{message}</p>
      )}

      {selected && (
        <section className="mb-6 rounded-xl border p-5">
          <button
            className="mb-4 text-sm underline"
            onClick={() => setSelected(null)}
          >
            ← İlan listesine dön
          </button>

          <h2 className="mb-2 text-xl font-semibold">{selected.title}</h2>
          <p className="mb-2">{selected.description || "Açıklama yok."}</p>
          <p>Fiyat: {selected.price?.toLocaleString("tr-TR") ?? "Belirtilmemiş"} TL</p>
          <p>
            Konum: {[selected.district, selected.city].filter(Boolean).join(", ") || "Belirtilmemiş"}
          </p>
          <p>Durum: {selected.status || "pending"}</p>

          <div className="mt-5 flex gap-3">
            <button
              className="rounded bg-green-700 px-4 py-2 text-white"
              onClick={() => updateStatus(selected.id, "published")}
            >
              Onayla
            </button>
            <button
              className="rounded bg-red-700 px-4 py-2 text-white"
              onClick={() => updateStatus(selected.id, "rejected")}
            >
              Reddet
            </button>
          </div>
        </section>
      )}

      {!selected && (
        <div className="space-y-3">
          {listings.length === 0 && (
            <p className="rounded-xl border p-5">
              Henüz ilan yok. Yeni ilanlar burada görünecek.
            </p>
          )}

          {listings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => setSelected(listing)}
              className="block w-full rounded-xl border p-4 text-left hover:bg-gray-50"
            >
              <span className="block font-semibold">{listing.title}</span>
              <span className="mt-1 block text-sm text-gray-600">
                {listing.price?.toLocaleString("tr-TR") ?? "Fiyat yok"} TL ·{" "}
                {[listing.district, listing.city].filter(Boolean).join(", ")}
              </span>
              <span className="mt-2 inline-block text-sm">
                Durum: {listing.status || "pending"} · Detayları aç →
              </span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}