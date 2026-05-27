CREATE TABLE "mother_profiles" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "babyLossHistory" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "lastVisit" TIMESTAMP(3) NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "gestationalAgeWeeks" INTEGER,
    "childAgeMonths" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mother_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mother_profiles_qrCode_key" ON "mother_profiles"("qrCode");
