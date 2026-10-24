"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Listing = {
  id: number | string;
  title: string;
  price: number | null;
  currency: string | null;
  city: string | null;
  room_count: string | null;
  status: string | null;
  description?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  category?: string | null;
  listing_type?: string | null;
  net_sqm?: number | null;
  building_age?: string | null;
  floor_level?: string | null;
  heating?: string | null;
  coverPhoto?: string | null;
};

export default function Ilanlarim() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | number | null>(null);

  useEffect(() => {
    async function loadListings() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("İlanlarını görmek için giriş yapmalısın.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError("İlanlar yüklenemedi: " + queryError.message);
      } else {
        const listingRows = data ?? [];

        const { data: photoRows, error: photoError } = await supabase
          .from("listing_photos")
          .select("listing_id, storage_path, sort_order, is_cover")
          .order("sort_order", { ascending: true });

        if (photoError) {
          console.error("Fotoğraf listesi alınamadı:", photoError.message);
        }

        const listingsWithPhotos = await Promise.all(
          listingRows.map(async (listing: any) => {
            const photos = (photoRows ?? []).filter(
              (photo) => photo.listing_id === listing.id,
            );

            const cover = photos.find((photo) => photo.is_cover) ?? photos[0];

            let coverPhoto = "";

            if (cover?.storage_path) {
              const { data: imageData } = supabase.storage
                .from("listing-photos")
                .getPublicUrl(cover.storage_path);

              coverPhoto = imageData.publicUrl;
            }

            return {
              ...listing,
              coverPhoto,
            };
          }),
        );

        setListings(listingsWithPhotos as Listing[]);
      }

      setLoading(false);
    }

    loadListings();
  }, []);

  function formatPrice(price: number | null, currency: string | null) {
    if (price == null) return "Fiyat belirtilmedi";

    const currencyCode = currency === "TL" ? "TRY" : currency || "TRY";

    try {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${price.toLocaleString("tr-TR")} ${currencyCode}`;
    }
  }

  function statusText(status: string | null) {
    switch (status) {
      case "pending":
        return "Onay bekliyor";
      case "approved":
        return "Onaylandı";
      case "active":
        return "Yayında";
      case "rejected":
        return "Reddedildi";
      case "inactive":
        return "Pasif";
      default:
        return status || "Durum belirtilmedi";
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#203B32]">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold hover:text-[#E77D55]">
          ← Ana sayfa
        </a>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">İlanlarım</h1>
            <p className="mt-2 text-sm text-gray-600">
              Verdiğin ilanları buradan takip edebilirsin.
            </p>
          </div>

          <a
            href="/ilan-ver"
            className="rounded-lg bg-[#203B32] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            + İlan Ver
          </a>
        </div>

        {loading && (
          <p className="mt-8 text-gray-600">İlanların yükleniyor...</p>
        )}

        {error && (
          <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E8E3D8] bg-white p-8 text-center">
            <h2 className="text-xl font-bold">Henüz ilan vermedin.</h2>
            <p className="mt-2 text-gray-600">
              İlk ilanını oluşturmak için İlan Ver butonuna tıkla.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {listings.map((listing) => {
            const isOpen = openId === listing.id;

            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  <div className="h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {listing.coverPhoto ? (
                      <img
                        src={listing.coverPhoto}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Fotoğraf yok
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : listing.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left transition hover:bg-gray-50"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold">
                        {listing.title || "Başlıksız ilan"}
                      </h2>
                      <p className="mt-2 font-semibold text-[#47765D]">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {listing.city || "İl belirtilmedi"}
                        {listing.room_count ? ` · ${listing.room_count}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          listing.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : listing.status === "approved" ||
                                listing.status === "active"
                              ? "bg-green-100 text-green-800"
                              : listing.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusText(listing.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isOpen ? "Kapat ▲" : "Detaylar ▼"}
                      </span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#E8E3D8] bg-[#FCFBF8] p-5">
                    <h3 className="mb-4 font-bold">İlan detayları</h3>

                    <dl className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["İlan türü", listing.listing_type],
                        ["Kategori", listing.category],
                        ["İlçe", listing.district],
                        ["Semt / Mahalle", listing.neighborhood],
                        ["Açık adres", listing.address],
                        ["Oda sayısı", listing.room_count],
                        [
                          "Net metrekare",
                          listing.net_sqm != null
                            ? `${listing.net_sqm} m²`
                            : null,
                        ],
                        ["Bina yaşı", listing.building_age],
                        ["Bulunduğu kat", listing.floor_level],
                        ["Isıtma", listing.heating],
                      ]
                        .filter((item) => item[1] != null && item[1] !== "")
                        .map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-sm text-gray-500">{label}</dt>
                            <dd className="mt-1 font-medium">{value}</dd>
                          </div>
                        ))}
                    </dl>

                    {listing.description && (
                      <div className="mt-5">
                        <h4 className="text-sm text-gray-500">Açıklama</h4>
                        <p className="mt-1 whitespace-pre-wrap">
                          {listing.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
