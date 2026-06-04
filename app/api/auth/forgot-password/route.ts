import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้งานในระบบ" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenCreatedAt: new Date(),
        resetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รีเซ็ตรหัสผ่าน - SOBER CHEERs</title>
      </head>
      <body style="font-family: 'Prompt', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="${process.env.NEXTAUTH_URL}/images/logo.png" alt="SOBER CHEERs Logo" width="150" style="display: block;">
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="color: #d97706;">รีเซ็ตรหัสผ่านของคุณ</h2>
              <p>เรียน คุณ${user.firstName},</p>
              <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณที่ SOBER CHEERs - ระบบงดเหล้าเข้าพรรษา หากคุณไม่ได้ทำการร้องขอนี้ กรุณาเพิกเฉยต่ออีเมลนี้</p>
              <p>คลิกที่ปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold;">รีเซ็ตรหัสผ่าน</a>
                  </td>
                </tr>
              </table>
              <p>หากคุณมีปัญหาในการคลิกปุ่ม ให้คัดลอกและวางลิงก์ต่อไปนี้ลงในเบราว์เซอร์ของคุณ:</p>
              <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">${resetUrl}</p>
              <p style="color: #dc2626; font-weight: bold;">⚠️ ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัยของบัญชีของคุณ</p>
              <p>หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาติดต่อเราทันทีที่ <a href="mailto:support@sobercheers.com" style="color: #d97706;">support@sobercheers.com</a></p>
              <p style="margin-top: 30px;">
                <strong>SOBER CHEERs</strong><br>
                ร่วมสร้างสังคมปลอดเหล้า เพื่อสุขภาพที่ดีของทุกคน<br>
                🙏 งดเหล้าเข้าพรรษา เพื่อบุญและสุขภาพ
              </p>
              <p>ขอแสดงความนับถือ,<br>ทีมงาน SOBER CHEERs</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb;">
              <p>&copy; 2025 SOBER CHEERs - แคมเปญงดเหล้าเข้าพรรษา. All rights reserved.</p>
              <p>🌟 ร่วมเป็นส่วนหนึ่งของการสร้างสังคมที่ดีกว่า 🌟</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"SOBER CHEERs" <noreply@sobercheers.com>',
      to: email,
      subject: "รีเซ็ตรหัสผ่าน - SOBER CHEERs แคมเปญงดเหล้าเข้าพรรษา",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "ลิงก์สำหรับรีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งอีเมล โปรดลองอีกครั้งในภายหลัง" },
      { status: 500 }
    );
  }
}