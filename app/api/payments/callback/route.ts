
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tokenValue = formData.get("token");

    if (typeof tokenValue !== "string" || !tokenValue) {
      return NextResponse.redirect(
        new URL("/bakiye-yukle?payment=failed", request.url)
      );
    }

    const apiKey = process.env.IYIZICO_API_KEY;
    const secretKey = process.env.IYIZICO_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.redirect(
        new URL("/bakiye-yukle?payment=error", request.url)
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
          conversationId: "",
          token: tokenValue,
        },
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response);
        }
      );
    });

    if (
      result.status === "success" &&
      result.paymentStatus === "SUCCESS"
    ) {
      // Ödeme doğrulandı. Bakiye güncellemesi henüz eklenmedi.
      return NextResponse.redirect(
        new URL("/?payment=success", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/bakiye-yukle?payment=failed", request.url)
    );
  } catch (error) {
    console.error("Ödeme callback hatası:", error);

    return NextResponse.redirect(
      new URL("/bakiye-yukle?payment=error", request.url)
    );
  }
}
