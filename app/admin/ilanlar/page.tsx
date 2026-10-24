"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  city: string | null;
  district: string | null;
  status: string;
  created_at: string;
  user_id: string;
  listing_photos?: {
    storage_path: string;
    sort_order: number;
    is_cover: boolean;
  }[];
};

export default function AdminIlanlarPage() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdminAndLoad() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

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
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          id,
          title,
          description,
          price,
          city,
          district,
          status,
          created_at,
          user_id,
          listing_photos (
            storage_path,
            sort_order,
            is_cover
          )
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("İlanlar yüklenemedi: " + error.message);
        setListings([]);
      } else {
        setListings((data ?? []) as Listing[]);
      }

      setLoading(false);
    }

    void checkAdminAndLoad();
  }, [router]);

  async function updateStatus(
    listingId: string,
    status: "published" | "rejected",
  ) {
    const action = status === "published" ? "onaylamak" : "reddetmek";

    if (!window.confirm(`Bu ilanı ${action} istediğine emin misin?`)) {
      return;
    }

    setUpdatingId(listingId);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId)
      .eq("status", "pending");

    if (error) {
      setMessage("İşlem başarısız: " + error.message);
      setUpdatingId(null);
      return;
    }

    setListings((current) =>
      current.filter((listing) => listing.id !== listingId),
    );

    setMessage(
      status === "published"
        ? "İlan onaylandı ve yayına alındı."
        : "İlan reddedildi.",
    );

    setUpdatingId(null);
  }

  if (loading) {
    return <main className="p-8">İlanlar yükleniyor...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin - İlan Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          İlanları incele, detaylarını gör ve onayla veya reddet.
        </p>
      </div>

      {message && (
        <div role="status" className="mb-6 rounded-lg border p-4">
          {message}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-gray-600">
          Bekleyen ilan yok.
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => {
            const photos = [...(listing.listing_photos ?? [])].sort(
              (a, b) =>
                Number(b.is_cover) - Number(a.is_cover) ||
                a.sort_order - b.sort_order,
            );

            const coverPhoto = photos[0]?.storage_path
              ? supabase.storage
                  .from("listing-photos")
                  .getPublicUrl(photos[0].storage_path.trim()).data.publicUrl
              : null;
              
            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="flex flex-col gap-5 p-4 md:flex-row md:p-6">
                  <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-56 md:w-72">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        Fotoğraf yok
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                        Onay bekliyor
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(listing.created_at).toLocaleDateString(
                          "tr-TR",
                        )}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                      {listing.title}
                    </h2>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {Number(listing.price).toLocaleString("tr-TR")} TL
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {[listing.city, listing.district]
                        .filter(Boolean)
                        .join(" · ") || "Konum belirtilmemiş"}
                    </p>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {listing.description || "Açıklama girilmemiş."}
                    </p>

                    {photos.length > 1 && (
                      <p className="mt-3 text-sm text-gray-500">
                        Toplam {photos.length} fotoğraf
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-3 pt-6">
                      <button
                        type="button"
                        disabled={updatingId === listing.id}
                        onClick={() => updateStatus(listing.id, "published")}
                        className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === listing.id ? "İşleniyor..." : "Onayla"}
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === listing.id}
                        onClick={() => updateStatus(listing.id, "rejected")}
                        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
