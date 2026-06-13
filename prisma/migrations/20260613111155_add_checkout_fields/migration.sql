-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
