
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { createClient } from "@/app/lib/supabase-server";
import { loadEnvConfig } from "@next/env";
import { createAdminClient } from "@/app/lib/supabase-admin";

loadEnvConfig(process.cwd());

const allowedAmounts = [3000, 5000, 10000];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

  const authorization = request.headers.get("authorization");
const accessToken = authorization?.startsWith("Bearer ")
  ? authorization.slice(7)
  : null;

if (!accessToken) {
  return NextResponse.json(
    { success: false, error: "Oturum bulunamadı. Tekrar giriş yap." },
    { status: 401 }
  );
}



const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser(accessToken);

if (authError || !user) {
  return NextResponse.json(
    { success: false, error: "Oturum geçersiz. Tekrar giriş yap." },
    { status: 401 }
  );
}
    const body = await request.json();
    const amount = Number(body.amount);

    if (!allowedAmounts.includes(amount)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz ödeme tutarı." },
        { status: 400 }
      );
    }

    const apiKey = process.env.IYIZICO_API_KEY;
    const secretKey = process.env.IYIZICO_SECRET_KEY;
    const callbackUrl = process.env.IYIZICO_CALLBACK_URL;

    if (!apiKey || !secretKey || !callbackUrl) {
      console.error("İyzico ortam değişkenleri eksik.");
      return NextResponse.json(
        { success: false, error: "Ödeme ayarları eksik." },
        { status: 500 }
      );
    }

    const iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri:
        process.env.IYIZICO_BASE_URL ||
        "https://sandbox-api.iyzipay.com",
    });

    const conversationId = `wallet_${user.id}_${Date.now()}`;

    const paymentRequest: any = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: conversationId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl,
      buyer: {
        id: user.id,
        name: "Test",
        surname: "Kullanici",
        email: user.email || "test@example.com",
        gsmNumber: "+905350000000",
        identityNumber: "11111111111",
        registrationAddress: "Istanbul",
        ip: "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: "Test Kullanici",
        city: "Istanbul",
        country: "Turkey",
        address: "Istanbul",
      },
      billingAddress: {
        contactName: "Test Kullanici",
        city: "Istanbul",
        country: "Turkey",
        address: "Istanbul",
      },
      basketItems: [
        {
          id: `wallet-${amount}`,
          name: "İlan paketi bakiyesi",
          category1: "Dijital Ürün",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount.toFixed(2),
        },
      ],
    };

    const result: any = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(
        paymentRequest,
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response);
        }
      );
    });

    if (
      result.status !== "success" ||
      !result.paymentPageUrl ||
      !result.token
    ) {
      console.error("İyzico ödeme başlatma hatası:", result);
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage || "Ödeme sayfası oluşturulamadı.",
        },
        { status: 400 }
      );
    }

 const supabaseAdmin = createAdminClient();
const { error: paymentInsertError } = await supabaseAdmin
.from("wallet_payments")
  .insert({
    user_id: user.id,
    amount,
    conversation_id: conversationId,
    token: result.token,
    status: "pending",
  });


if (paymentInsertError) {
  console.error("Ödeme kaydı oluşturulamadı:", paymentInsertError);

  return NextResponse.json(
    {
      success: false,
      error: `Ödeme kaydı oluşturulamadı: ${paymentInsertError.message}`,
      details: paymentInsertError,
    },
    { status: 500 }
  );
}


return NextResponse.json({
  success: true,
  paymentPageUrl: result.paymentPageUrl,
  token: result.token,
  conversationId,
});

  } catch (error) {
    console.error("Ödeme başlatma hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sunucuya bağlanılamadı." },
      { status: 500 }
    );
  }
}
