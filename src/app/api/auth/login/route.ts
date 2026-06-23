import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { setAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

type AttemptState = {
  count: number;
  resetAt: number;
};

const failedAttempts = new Map<string, AttemptState>();

const loginSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("email").default("email"),
    email: z.string().email(),
    password: z.string().min(1),
  }),
  z.object({
    method: z.literal("qr"),
    qrToken: z.string().min(1),
  }),
]);

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function getAttemptKey(request: Request, identifier: string) {
  return `${getClientIp(request)}:${identifier.toLowerCase()}`;
}

function getLockResponse(key: string) {
  const attempt = failedAttempts.get(key);
  const now = Date.now();

  if (!attempt) return null;

  if (attempt.resetAt <= now) {
    failedAttempts.delete(key);
    return null;
  }

  if (attempt.count < MAX_FAILED_ATTEMPTS) return null;

  const retryAfter = Math.ceil((attempt.resetAt - now) / 1000);

  return NextResponse.json(
    {
      message: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    },
  );
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const current = failedAttempts.get(key);

  if (!current || current.resetAt <= now) {
    failedAttempts.set(key, { count: 1, resetAt: now + LOCK_WINDOW_MS });
    return;
  }

  failedAttempts.set(key, { count: current.count + 1, resetAt: current.resetAt });
}

function clearFailedAttempts(key: string) {
  failedAttempts.delete(key);
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi dengan benar." },
      { status: 400 },
    );
  }

  if (parsed.data.method === "qr") {
    const qrToken = parsed.data.qrToken.trim();
    const attemptKey = getAttemptKey(request, `qr:${qrToken}`);
    const lockResponse = getLockResponse(attemptKey);

    if (lockResponse) return lockResponse;

    const admin = await prisma.adminUser.findUnique({
      where: { qrToken },
    });

    if (!admin) {
      await prisma.loginRecord.create({
        data: {
          adminEmail: "QR tidak terdaftar",
          adminName: "Login QR gagal",
          method: "qr",
          status: "failed",
          device: "Browser admin",
        },
      });

      recordFailedAttempt(attemptKey);

      return NextResponse.json(
        { message: "QR code admin tidak valid." },
        { status: 401 },
      );
    }

    await prisma.loginRecord.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        method: "qr",
        status: "success",
        device: "Browser admin",
      },
    });

    clearFailedAttempts(attemptKey);

    await setAdminSession({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      region: admin.region,
    });

    return NextResponse.json({
      message: "Login QR berhasil.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        region: admin.region,
      },
    });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const attemptKey = getAttemptKey(request, `email:${normalizedEmail}`);
  const lockResponse = getLockResponse(attemptKey);

  if (lockResponse) return lockResponse;

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin) {
    await prisma.loginRecord.create({
      data: {
        adminEmail: normalizedEmail,
        adminName: "Email tidak terdaftar",
        method: "email",
        status: "failed",
        device: "Browser admin",
      },
    });

    recordFailedAttempt(attemptKey);

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
    recordFailedAttempt(attemptKey);

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

  clearFailedAttempts(attemptKey);

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
