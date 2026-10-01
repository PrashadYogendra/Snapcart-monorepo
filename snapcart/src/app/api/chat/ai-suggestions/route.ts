import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { message, role } = await req.json()

        const prompt = `You are a professional delivery assistant chatbot.

You will be given:
- role: either "user" or "delivery_boy"
- last message: the last message sent in the conversation

Your task:
👉 If role is "user" → generate 3 short WhatsApp-style reply suggestions that a user could send to the delivery boy.
👉 If role is "delivery_boy" → generate 3 short WhatsApp-style reply suggestions that a delivery boy could send to the user.

Follow these rules:
- Replies must match the context of the last message.
- Keep replies short, human-like (max 10 words).
- Use emojis naturally (max one per reply).
- No generic replies like "okay" or "thank you".
- Must be helpful, respectful, and relevant to delivery, status, help, or location.
- NO numbering, NO extra instructions, NO extra text.
- Just return comma-separated reply suggestions.

Role: ${role}
Last message: "${message}"

Return only the three reply suggestions, comma-separated.`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ]
                })
            }
        )

        const data = await response.json()

        if (!response.ok) {
            console.log("Gemini API error:", data)
            return NextResponse.json(
                { message: "AI suggestion failed", details: data },
                { status: 500 }
            )
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
        const suggestions = replyText
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)

        return NextResponse.json(suggestions, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: `Something went wrong ${error}` },
            { status: 500 }
        )
    }
}