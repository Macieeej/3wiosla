import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Brak klucza API" }, { status: 500 });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a40;">Nowa wiadomość z formularza — 3 Wiosła</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">Imię i nazwisko</td><td style="padding: 8px;">${name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">E-mail</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">Telefon</td><td style="padding: 8px;">${phone}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #b8956a; vertical-align: top;">Wiadomość</td><td style="padding: 8px;">${message}</td></tr>
      </table>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "formularz@3wiosla.pl",
      to: ["rezerwacje@brzozowazatoka.pl"],
      subject: `Nowa wiadomość od ${name} — 3 Wiosła`,
      html,
      reply_to: email,
    }),
  });

  if (res.ok) {
    return NextResponse.json({ success: true });
  } else {
    const err = await res.text();
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Błąd wysyłania" }, { status: 502 });
  }
}