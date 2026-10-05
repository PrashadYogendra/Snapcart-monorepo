import nodemailer from "nodemailer";
import dns from "dns/promises";

let cachedIp: string | null = null;

async function getGmailIPv4() {
  if (cachedIp) return cachedIp;
  const addresses = await dns.resolve4("smtp.gmail.com");
  cachedIp = addresses[0];
  console.log("Resolved smtp.gmail.com to IPv4:", cachedIp);
  return cachedIp;
}

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const ip = await getGmailIPv4();

    const transporter = nodemailer.createTransport({
      host: ip,
      port: 465,
      secure: true,
      tls: {
        servername: "smtp.gmail.com",
      },
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Snapcart" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Mail sent successfully:", info.messageId, "to:", to);
  } catch (error) {
    console.error("❌ Mail sending failed:", error);
    throw error;
  }
};