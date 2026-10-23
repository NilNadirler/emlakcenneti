"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { createClient } from "@/app/lib/supabase-server";

export default function PaymentAmount() {
  const [amount, setAmount] = useState("3000");
  const [loading, setLoading] = useState(false);
  const numericAmount = Number(amount);
  const isValid =
    Number.isInteger(numericAmount) &&
    numericAmount >= 3000 &&
    numericAmount % 1000 === 0;

  const packages = [3000, 5000, 10000];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border p-8">
        <h2 className="text-2xl font-bold">İlan Paketi Satın Al</h2>

        <p className="text-sm text-gray-500">
          Hazır tutarlardan birini seç veya kendi tutarını gir.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {packages.map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => setAmount(String(price))}
              className={`rounded-lg border p-3 font-semibold ${
                amount === String(price)
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300"
              }`}
            >
              {price.toLocaleString("tr-TR")} TL
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="amount" className="mb-2 block font-medium">
            Ödeme tutarı (TL)
          </label>

          <input
            id="amount"
            type="number"
            min="3000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Örn. 7000"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {isValid ? (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-600">Kazanacağın ilan hakkı</p>
            <p className="text-2xl font-bold">{numericAmount / 1000} ilan</p>
          </div>
        ) : (
          <p className="text-sm text-red-600">
            Minimum tutar 3.000 TL olmalı ve tutar 1.000 TL'nin katı olmalı.
          </p>
        )}

        <button

          type="button"
          disabled={!isValid || loading}
          onClick={async () => {
            setLoading(true);
            try {
              const { data: sessionData } = await supabase.auth.getSession();

              if (!sessionData.session) {
                alert("Lütfen önce giriş yapın.");
                window.location.href = "/giris";
                return;
              }

              const response = await fetch("/api/payments", {
                 method: "POST",
                headers: {
               "Content-Type": "application/json",
                Authorization: `Bearer ${sessionData.session.access_token}`,
                },
                body: JSON.stringify({ amount: numericAmount }),
              });

              const result = await response.json();

              if (!response.ok) {
                alert(result.error || "İşlem başarısız.");
                return;
              }

              if (result.success && result.paymentPageUrl) {
                  window.location.href = result.paymentPageUrl;
                 return;
           }

           alert(result.error || "Ödeme sayfası oluşturulamadı.");
            } catch {
              alert("Sunucuya bağlanılamadı.");
            }finally {
              setLoading(false);
            }

            console.log("Seçilen tutar:", numericAmount);
          }}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
    <span className="flex items-center justify-center gap-2">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      Ödeme sayfası açılıyor...
    </span>
  ) : (
    "Ödemeye Devam Et"
  )}
        </button>
      </div>
    </div>
  );
}
