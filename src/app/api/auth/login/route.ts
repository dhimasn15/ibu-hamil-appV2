import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { setAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi dengan benar." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin) {
    await prisma.loginRecord.create({
      data: {
        adminEmail: email.toLowerCase(),
        adminName: "Email tidak terdaftar",
        method: "email",
        status: "failed",
        device: "Browser admin",
      },
    });

    return NextResponse.json(
      { message: "Email atau password salah." },
      { status: 401 },
    );
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);

  await prisma.loginRecord.create({
    data: {
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      method: "email",
      status: validPassword ? "success" : "failed",
      device: "Browser admin",
    },
  });

  if (!validPassword) {
    return NextResponse.json(
      { message: "Email atau password salah." },
      { status: 401 },
    );
  }

  await setAdminSession({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: "admin",
    region: admin.region,
  });

  return NextResponse.json({
    message: "Login berhasil.",
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      region: admin.region,
    },
  });
}
