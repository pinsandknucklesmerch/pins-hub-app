CREATE TABLE "SavedInvoiceAddress" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "eoriNumber" TEXT,
    "vatNumber" TEXT,
    "einNumber" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedInvoiceAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommercialInvoiceCommodityCode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "material" TEXT,
    "commodityCode" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialInvoiceCommodityCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavedInvoiceAddress_label_idx" ON "SavedInvoiceAddress"("label");
CREATE INDEX "SavedInvoiceAddress_updatedAt_idx" ON "SavedInvoiceAddress"("updatedAt");
CREATE INDEX "CommercialInvoiceCommodityCode_label_idx" ON "CommercialInvoiceCommodityCode"("label");
CREATE INDEX "CommercialInvoiceCommodityCode_productType_idx" ON "CommercialInvoiceCommodityCode"("productType");
CREATE INDEX "CommercialInvoiceCommodityCode_commodityCode_idx" ON "CommercialInvoiceCommodityCode"("commodityCode");
