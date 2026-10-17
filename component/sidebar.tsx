"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, House } from "lucide-react";

const categories = [
  "Konut",
  "İş Yeri",
  "Arsa",
  "Konut Projeleri",
  "Bina",
  "Devre Mülk",
  "Turistik Tesis",
];

const subcategories = [
  "Satılık",
  "Kiralık",
  "Turistik Günlük Kiralık",
  "Devren Satılık Konut",
];

const roomOptions = [
  "Stüdyo (1+0)",
  "1+1",
  "1.5+1",
  "2+0",
  "2+1",
  "2.5+1",
  "3+1",
  "3.5+1",
  "4+1",
  "4.5+1",
  "5+1",
  "6+1 ve üzeri",
];

const ageOptions = [
  "0 (Oturuma Hazır)",
  "0 (Yapım Aşamasında)",
  "1",
  "2",
  "3",
  "4",
  "5-10",
  "11-15",
  "16-20",
  "21 ve üzeri",
];

const konutKategorileri = [
  "Konut",
  "Satılık",
  "Kiralık",
  "Turistik Günlük Kiralık",
  "Devren Satılık Konut",
];

const filters = [
  {
    title: "Kat Sayısı",
    options: ["1", "2", "3", "4", "5", "6-10", "11 ve üzeri"],
  },
  {
    title: "Bulunduğu Kat",
    options: [
      "Giriş Katı",
      "Yüksek Giriş",
      "Bahçe Katı",
      "Bodrum",
      "Zemin Kat",
      "1. Kat",
      "2. Kat",
      "3. Kat",
      "4. Kat ve üzeri",

    ],
  },
  {
    title: "Ara Kat",
    options: ["Evet", "Hayır"],
  },
  {
    title: "Isıtma",
    options: [
      "Kombi (Doğalgaz)",
      "Merkezi",
      "Yerden Isıtma",
      "Klima",
      "Elektrikli",
      "Soba",
      "Yok",
    ],
  },
  {
    title: "Banyo Sayısı",
    options: ["1", "2", "3", "4 ve üzeri"],
  },
  {
    title: "Mutfak",
    options: ["Açık (Amerikan)", "Kapalı"],
  },
  {
    title: "Balkon",
    options: ["Var", "Yok"],
  },
  {
    title: "Asansör",
    options: ["Var", "Yok"],
  },
  {
    title: "Otopark",
    options: ["Açık Otopark", "Kapalı Otopark", "Açık ve Kapalı", "Yok"],
  },
  {
    title: "Eşyalı",
    options: ["Evet", "Hayır"],
  },
  {
    title: "Kullanım Durumu",
    options: ["Boş", "Kiracılı", "Mülk Sahibi Oturuyor"],
  },
  {
    title: "Site İçerisinde",
    options: ["Evet", "Hayır"],
  },
  {
    title: "Krediye Uygun",
    options: ["Evet", "Hayır"],
  },
  {
    title: "Tapu Durumu",
    options: ["Kat Mülkiyetli", "Kat İrtifaklı", "Arsa Tapulu", "Hisseli Tapu"],
  },
  {
    title: "Kimden",
    options: ["Sahibinden", "Emlak Ofisinden", "İnşaat Firmasından"],
  },
  {
    title: "Takaslı",
    options: ["Evet", "Hayır"],
  },
  {
    title: "İlan Tarihi",
    options: ["Son 24 saat", "Son 3 gün", "Son 7 gün", "Son 15 gün", "Son 30 gün"],
  },
  {
    title: "Fotoğraf, Video",
    options: ["Fotoğraflı", "Videolu", "Sanal Turlu"],
  },
  {
    title: "Harita",
    options: ["Haritada göster"],
  },
];

function RangeFilter({ title }: { title: string }) {
  return (
    <div className="border-b border-[#EEE9E0] px-4 py-4">
      <h3 className="mb-3 text-sm font-semibold text-[#203B32]">{title}</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="min"
          aria-label={`${title} minimum`}
          className="w-1/2 min-w-0 rounded-lg border border-[#DCD6CB] bg-white px-3 py-2 text-sm outline-none focus:border-[#C58B58]"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          placeholder="max"
          aria-label={`${title} maksimum`}
          className="w-1/2 min-w-0 rounded-lg border border-[#DCD6CB] bg-white px-3 py-2 text-sm outline-none focus:border-[#C58B58]"
        />
      </div>
    </div>
  );
}

function CheckFilter({
  title,
  options,
}: {
  title: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#EEE9E0]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#35443D] hover:bg-[#F8F7F2]"
      >
        {title}
        {open ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
      </button>

      {open && (
        <div className="max-h-44 space-y-2 overflow-y-auto px-4 pb-4">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
            >
              <input
                type="checkbox"
                value={option}
                className="accent-[#203B32]"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [konutAcik, setKonutAcik] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currency, setCurrency] = useState("TL");
  const [extraOpen, setExtraOpen] = useState(false); 

  return (
    <aside className="w-full max-w-[300px] shrink-0 self-start rounded-2xl border border-[#E8E3D8] bg-white text-sm shadow-sm">
      <div className="border-b border-[#EEE9E0] p-4">

        <h2 className="text-lg font-bold text-[#203B32]">Emlak Filtreleri</h2>
      </div>

      <div className="border-b border-[#EEE9E0] p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#F7E5D8] p-3">
          <span className="rounded-full bg-[#E77D55] p-2 text-white">
            <House size={20} />
          </span>
         <button
  type="button"
  onClick={() => {
    window.location.href = "/";
  }}
  className="cursor-pointer rounded-lg px-2 py-1 text-lg font-bold text-[#203B32] transition-colors hover:bg-[#F7E5D8] hover:text-[#E77D55]"
>
  Emlak
</button>
        </div>

        <nav>
          {categories.map((category) => (
            <div key={category}>
              <button
                type="button"
                onClick={() => {
                  if (category === "Konut") setKonutAcik(!konutAcik);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-gray-700 hover:bg-[#F8F7F2]"
              >
                {category}
                <ChevronRight size={17} />
              </button>

              {category === "Konut" && konutAcik && (
                <div className="ml-3 border-l-2 border-[#E77D55] pl-3">
                  {subcategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedCategory(item)}
                      className={`block w-full rounded-md px-3 py-2 text-left ${
                        selectedCategory === item
                          ? "bg-[#F7E5D8] font-semibold text-[#203B32]"
                          : "text-gray-600 hover:bg-[#F8F7F2]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-1">
        <div className="p-3">
          <h3 className="mb-3 font-bold text-[#203B32]">Adres</h3>
          {["İl seçin", "İlçe seçin", "Semt / Mahalle"].map((item) => (
            <select
              key={item}
              defaultValue=""
              aria-label={item}
              className="mb-2 w-full rounded-lg border border-[#DCD6CB] bg-white p-2.5 text-sm text-gray-600 outline-none focus:border-[#C58B58]"
            >
              <option value="">{item}</option>
            </select>
          ))}
        </div>

        <div className="border-b border-[#EEE9E0] px-4 py-4">
          <h3 className="mb-3 font-semibold text-[#203B32]">Fiyat</h3>
          <div className="mb-3 grid grid-cols-4 overflow-hidden rounded-lg border border-[#DCD6CB] text-xs">
            {["TL", "USD", "EUR", "GBP"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCurrency(item)}
                className={`py-2 ${
                  currency === item
                    ? "bg-[#203B32] text-white"
                    : "bg-white text-gray-600 hover:bg-[#F8F7F2]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Min ${currency}`}
              aria-label="Minimum fiyat"
              className="w-1/2 min-w-0 rounded-lg border border-[#DCD6CB] px-2 py-2 outline-none focus:border-[#C58B58]"
            />
            <input
              type="number"
              placeholder={`Max ${currency}`}
              aria-label="Maksimum fiyat"
              className="w-1/2 min-w-0 rounded-lg border border-[#DCD6CB] px-2 py-2 outline-none focus:border-[#C58B58]"
            />
          </div>
        </div>


                {subcategories.includes(selectedCategory) && (
          <>
            <RangeFilter title="m² (Net)" />
            <RangeFilter title="Açık Alan m²" />

            <CheckFilter title="Oda Sayısı" options={roomOptions} />
            <CheckFilter title="Bina Yaşı" options={ageOptions} />

            {filters.map((filter) => (
               <CheckFilter key={filter.title} {...filter} />
                      ))}

            <button
              type="button"
              onClick={() => setExtraOpen(!extraOpen)}
              className="w-full px-4 py-3 text-left text-sm text-[#203B32] underline"
            >
              {extraOpen ? "Daha az seçenek göster" : "Daha fazla seçenek göster"}
            </button>
          </>
        )}

        <div className="px-4 pb-4">
         
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-[#203B32] px-4 py-3 font-semibold text-white hover:bg-[#2D5145]"
          >
            Ara
          </button>
        </div>
      </div>
    </aside>
  );
}

  


