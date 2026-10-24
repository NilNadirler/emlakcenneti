"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

const odaSecenekleri = [
  "Stüdyo (1+0)", "1+1", "1.5+1", "2+0", "2+1", "2.5+1",
  "3+1", "3.5+1", "4+1", "4.5+1", "5+1", "6+1 ve üzeri",
];

const ozellikler: Record<string, string[]> = {
  "Bina Yaşı": ["0 (Oturuma Hazır)", "0 (Yapım Aşamasında)", "1", "2", "3", "4", "5-10", "11-15", "16-20", "21 ve üzeri"],
  "Kat Sayısı": ["1", "2", "3", "4", "5", "6-10", "11 ve üzeri"],
  "Bulunduğu Kat": ["Bodrum", "Giriş Katı", "Yüksek Giriş", "Bahçe Katı", "Zemin Kat", "1. Kat", "2. Kat", "3. Kat", "4. Kat ve üzeri"],
  "Ara Kat": ["Evet", "Hayır"],
  "Isıtma": ["Kombi (Doğalgaz)", "Merkezi", "Yerden Isıtma", "Klima", "Elektrikli", "Soba", "Yok"],
  "Banyo Sayısı": ["1", "2", "3", "4 ve üzeri"],
  "Mutfak": ["Açık (Amerikan)", "Kapalı"],
  "Balkon": ["Var", "Yok"],
  "Asansör": ["Var", "Yok"],
  "Otopark": ["Açık Otopark", "Kapalı Otopark", "Açık ve Kapalı", "Yok"],
  "Eşyalı": ["Evet", "Hayır"],
  "Kullanım Durumu": ["Boş", "Kiracılı", "Mülk Sahibi Oturuyor"],
  "Site İçerisinde": ["Evet", "Hayır"],
  "Krediye Uygun": ["Evet", "Hayır"],
  "Tapu Durumu": ["Kat Mülkiyetli", "Kat İrtifaklı", "Arsa Tapulu", "Hisseli Tapu"],
  "Kimden": ["Sahibinden", "Emlak Ofisinden", "İnşaat Firmasından"],
  "Takaslı": ["Evet", "Hayır"],
  "Fotoğraf / Video": ["Fotoğraflı", "Videolu", "Sanal Turlu"],
};

export default function IlanVer() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [mesaj, setMesaj] = useState("");

  const inputClass =
    "w-full rounded-lg border border-[#DCD6CB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C58B58]";

  function fotoEkle(files: FileList | null) {
    if (!files) return;

    const secilenler = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    const kalan = 20 - photos.length;
    const eklenecekler = secilenler.slice(0, kalan);

    setPhotos((onceki) => [...onceki, ...eklenecekler]);

    if (secilenler.length > kalan) {
      setMesaj("En fazla 20 fotoğraf ekleyebilirsin.");
    } else {
      setMesaj("");
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#203B32]">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold hover:text-[#E77D55]">
          ← Ana sayfa
        </a>

        <h1 className="mt-5 text-3xl font-bold">İlan Ver</h1>
        <p className="mt-2 text-sm text-gray-600">
          İlanını oluşturmak için aşağıdaki bilgileri doldur.
        </p>

        <form lang="tr"
        onInvalidCapture={(e) => {
  const alan = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  if (alan.validity.valueMissing) {
    alan.setCustomValidity("Lütfen bu alanı doldurun.");
  }
}}
onInputCapture={(e) => {
  const alan = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  alan.setCustomValidity("");
}}
  className="mt-6 space-y-6"
  onSubmit={async (e) => {
    e.preventDefault();
    setMesaj("İlan kaydediliyor...");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMesaj("İlan vermek için önce giriş yapmalısın.");
      return;
    }

    console.log("Giriş yapan kullanıcı ID:", user.id);
    console.log("Gönderilecek ilan durumu:", "pending");
    const fiyat = Number(formData.get("fiyat"));


    const {
  data: { user: authUser },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !authUser) {
  setMesaj("Oturum bulunamadı. Lütfen tekrar giriş yap.");
  return;
}
    const { data: sessionData } = await supabase.auth.getSession();

console.log("Oturum ID:", sessionData.session?.user.id);
console.log("Kayıt user_id:", authUser.id);
console.log(
  "Access token var mı:",
  Boolean(sessionData.session?.access_token)
);
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id: authUser.id,
        status: "pending",
        title: String(formData.get("baslik") || ""),
        description: String(formData.get("aciklama") || ""),
        category: String(formData.get("kategori") || ""),
        listing_type: String(formData.get("ilanTuru") || ""),
        price: fiyat,
        currency: String(formData.get("paraBirimi") || "TRY"),
        city: String(formData.get("İl") || ""),
        district: String(formData.get("İlçe") || ""),
        neighborhood: String(formData.get("Semt / Mahalle") || ""),
        net_sqm: Number(formData.get("netMetrekare")) || null,
        open_area_sqm: Number(formData.get("acikAlan")) || null,
        room_count: String(formData.get("odaSayisi") || ""),
        building_age: String(formData.get("Bina Yaşı") || ""),
        floor_count: String(formData.get("Kat Sayısı") || ""),
        floor_level: String(formData.get("Bulunduğu Kat") || ""),
        is_middle_floor: formData.get("Ara Kat") === "Evet",
        heating: String(formData.get("Isıtma") || ""),
        bathroom_count: String(formData.get("Banyo Sayısı") || ""),
        kitchen_type: String(formData.get("Mutfak") || ""),
        balcony: String(formData.get("Balkon") || ""),
        elevator: String(formData.get("Asansör") || ""),
        parking: String(formData.get("Otopark") || ""),
        furnished: String(formData.get("Eşyalı") || ""),
        occupancy_status: String(formData.get("Kullanım Durumu") || ""),
        in_complex: formData.get("Site İçerisinde") === "Evet",
        mortgage_eligible: formData.get("Krediye Uygun") === "Evet",
        deed_status: String(formData.get("Tapu Durumu") || ""),
        seller_type: String(formData.get("Kimden") || ""),
        exchange_possible: formData.get("Takaslı") === "Evet",
        media_type: String(formData.get("Fotoğraf / Video") || ""),
      })
      .select("id")
      .single();

    if (error) {
      console.error("İlan kaydetme hatası:", error);
      console.log("HATA DETAYI:", JSON.stringify(error, null, 2));
      setMesaj(`İlan kaydedilemedi: ${error.message}`);
      return;
    }

    if (photos.length > 0) {
      setMesaj("İlan kaydedildi, fotoğraflar yükleniyor...");

      const photoRows = [];

      for (const photo of photos) {
        const filePath = `${user.id}/${data.id}/${crypto.randomUUID()}-${photo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(filePath, photo);

        if (uploadError) {
          console.error("Fotoğraf yükleme hatası:", uploadError);
          setMesaj(`İlan kaydedildi ama fotoğraf yüklenemedi: ${uploadError.message}`);
          return;
        }

  

        photoRows.push({
  listing_id: data.id,
  storage_path: filePath,
  sort_order: photoRows.length,
  is_cover: photoRows.length === 0,
});
      }

      const { error: photoError } = await supabase
        .from("listing_photos")
        .insert(photoRows);

      if (photoError) {
        console.error("Fotoğraf kayıt hatası:", photoError);
        setMesaj(`İlan kaydedildi ama fotoğraf bilgileri kaydedilemedi: ${photoError.message}`);
        return;
      }
    }


    setMesaj("İlan başarıyla kaydedildi!");
    window.location.href = "/ilanlarim";
  }}
>
          <section className="rounded-2xl border border-[#E8E3D8] bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">1. İlan Bilgileri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                İlan türü
                <select name="ilanTuru" required className={`${inputClass} mt-1.5`}>
                  <option value="">Seçiniz</option>
                  <option>Satılık</option>
                  <option>Kiralık</option>
                  <option>Turistik Günlük Kiralık</option>
                  <option>Devren Satılık Konut</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                Kategori
                <select name="kategori" required className={`${inputClass} mt-1.5`}>
                  <option value="">Seçiniz</option>
                  <option>Konut</option>
                  <option>İş Yeri</option>
                  <option>Arsa</option>
                  <option>Konut Projeleri</option>
                  <option>Bina</option>
                  <option>Devre Mülk</option>
                  <option>Turistik Tesis</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                İlan başlığı
                <input name="baslik" required className={`${inputClass} mt-1.5`} placeholder="Örn. Deniz manzaralı 3+1 daire" />
              </label>

              <label className="block text-sm font-medium">
                Fiyat
                <input name="fiyat" type="number" min="0" required className={`${inputClass} mt-1.5`} placeholder="Fiyat girin" />
              </label>

              <label className="block text-sm font-medium">
                Para birimi
                <select name="paraBirimi" className={`${inputClass} mt-1.5`}>
                  <option>TRY</option><option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                Net m²
                <input name="netMetrekare" type="number" min="0" className={`${inputClass} mt-1.5`} />
              </label>

              <label className="block text-sm font-medium">
                Açık alan m²
                <input name="acikAlan" type="number" min="0" className={`${inputClass} mt-1.5`} />
              </label>

              <label className="block text-sm font-medium">
                Oda sayısı
                <select name="odaSayisi" className={`${inputClass} mt-1.5`}>
                  <option value="">Seçiniz</option>
                  {odaSecenekleri.map((oda) => <option key={oda}>{oda}</option>)}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium">
              İlan açıklaması
              <textarea name="aciklama" required rows={5} className={`${inputClass} mt-1.5`} placeholder="İlanın özelliklerini anlat..." />
            </label>
          </section>

          <section className="rounded-2xl border border-[#E8E3D8] bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">2. Adres</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {["İl", "İlçe", "Semt / Mahalle"].map((alan) => (
                <label key={alan} className="block text-sm font-medium">
                  {alan}
                  <input name={alan} required className={`${inputClass} mt-1.5`} />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8E3D8] bg-white p-5">
            <h2 className="text-lg font-bold">3. Fotoğraflar</h2>
            <p className="my-2 text-sm text-gray-500">
              En fazla 20 fotoğraf yükleyebilirsin. {photos.length}/20
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={photos.length >= 20}
              onChange={(e) => {
                fotoEkle(e.target.files);
                e.target.value = "";
              }}
              className="w-full rounded-lg border border-dashed border-[#C58B58] p-4 text-sm"
            />

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Fotoğraf ${index + 1}`}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((onceki) => onceki.filter((_, i) => i !== index))}
                    className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs text-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8E3D8] bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">4. Konut Özellikleri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(ozellikler).map(([baslik, secenekler]) => (
                <label key={baslik} className="block text-sm font-medium">
                  {baslik}
                  <select name={baslik} className={`${inputClass} mt-1.5`}>
                    <option value="">Seçiniz</option>
                    {secenekler.map((secenek) => <option key={secenek}>{secenek}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </section>

          {mesaj && (
            <p role="status" className="rounded-lg bg-[#F7E5D8] p-3 text-sm">
              {mesaj}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#203B32] px-5 py-3 font-semibold text-white hover:bg-[#2D5145]"
          >
            İlanı Yayınla
          </button>
        </form>
      </div>
    </main>
  );
}
