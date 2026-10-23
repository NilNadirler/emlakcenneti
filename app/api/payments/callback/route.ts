
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export async function POST(request: Request) {
  const baseUrl = new URL(request.url);

  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, baseUrl.origin), 303);

  try {
    const formData = await request.formData();
    const token = formData.get("token");

    if (typeof token !== "string" || !token) {
      return redirect("/bakiye-yukle?payment=failed");
    }

    const apiKey = process.env.IYIZICO_API_KEY;
    const secretKey = process.env.IYIZICO_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey || !secretKey || !supabaseUrl || !serviceRoleKey) {
      console.error("Ödeme callback ortam değişkenleri eksik.");
      return redirect("/bakiye-yukle?payment=error");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Ödeme başlatılırken kaydedilen işlemi bul.
    const { data: payment, error: lookupError } = await supabase
      .from("wallet_payments")
      .select("user_id, amount, conversation_id, token, status")
      .eq("token", token)
      .maybeSingle();

    if (lookupError || !payment) {
      console.error("Ödeme kaydı bulunamadı:", lookupError);
      return redirect("/bakiye-yukle?payment=failed");
    }

    // Daha önce işlenmiş ödeme yeniden kredilendirilmesin.
    if (payment.status !== "pending") {
      return redirect(
        payment.status === "credited"
          ? "/?payment=success"
          : "/bakiye-yukle?payment=failed"
      );
    }

    const iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri:
        process.env.IYIZICO_BASE_URL ||
        "https://sandbox-api.iyzipay.com",
    });

    const result: any = await new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve(
        {
          locale: Iyzipay.LOCALE.TR,
          conversationId: payment.conversation_id,
          token,
        },
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response);
        }
      );
    });

    if (
      result.status !== "success" ||
      result.paymentStatus !== "SUCCESS" ||
      Number(result.paidPrice) !== Number(payment.amount) ||
      (result.conversationId &&
        result.conversationId !== payment.conversation_id)
    ) {
      console.error("İyzico ödeme doğrulaması başarısız.");
      return redirect("/bakiye-yukle?payment=failed");
    }

    // Veritabanı fonksiyonu bakiyeyi ve ödeme durumunu
    // tek bir işlem içinde, yalnızca bir kez günceller.
    const { data: credited, error: creditError } = await supabase.rpc(
      "credit_wallet_payment",
      {
        p_token: token,
        p_paid_amount: Number(result.paidPrice),
      }
    );

    if (creditError || credited !== true) {
      console.error("Bakiye güncellenemedi:", creditError);
      return redirect("/bakiye-yukle?payment=error");
    }

    return redirect("/?payment=success");
  } catch (error) {
    console.error("Ödeme callback hatası:", error);
    return redirect("/bakiye-yukle?payment=error");
  }
}
