CREATE TABLE "CommercialInvoice" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "reference" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "shipDate" TIMESTAMP(3),
    "tracking" TEXT,
    "boxCount" INTEGER,
    "weight" TEXT,
    "currency" TEXT NOT NULL,
    "dutiesPayableBy" TEXT,
    "senderJson" JSONB NOT NULL,
    "receiverJson" JSONB NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "invoiceTotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommercialInvoiceLine" (
    "id" TEXT NOT NULL,
    "commercialInvoiceId" TEXT NOT NULL,
    "product" TEXT,
    "designName" TEXT,
    "productType" TEXT,
    "description" TEXT,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "commodityCode" TEXT,
    "countryOfOrigin" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "CommercialInvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommercialInvoice_updatedAt_idx" ON "CommercialInvoice"("updatedAt");
CREATE INDEX "CommercialInvoice_invoiceNumber_idx" ON "CommercialInvoice"("invoiceNumber");
CREATE INDEX "CommercialInvoiceLine_commercialInvoiceId_idx" ON "CommercialInvoiceLine"("commercialInvoiceId");

ALTER TABLE "CommercialInvoiceLine" ADD CONSTRAINT "CommercialInvoiceLine_commercialInvoiceId_fkey" FOREIGN KEY ("commercialInvoiceId") REFERENCES "CommercialInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
