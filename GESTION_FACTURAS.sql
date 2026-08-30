-- Script de inicialización para MySQL 3306 (root/root)
-- Base de datos: GESTION_FACTURAS

CREATE DATABASE IF NOT EXISTS `GESTION_FACTURAS` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `GESTION_FACTURAS`;

-- 1. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `nit` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla Principal de Facturas y Cotizaciones
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `supplierId` VARCHAR(100) NOT NULL,
  `supplierName` VARCHAR(255) NOT NULL,
  `type` ENUM('QUOTATION', 'INVOICE') NOT NULL,
  `description` TEXT NOT NULL,
  `invoiceCode` VARCHAR(100) NOT NULL,
  `remissionDate` DATETIME NOT NULL,
  `deliveryDate` DATETIME NULL,
  `amount` DOUBLE NOT NULL,
  
  -- Cotización
  `quotationSigned` TINYINT(1) NOT NULL DEFAULT 0,
  `quotationSignedDate` DATETIME NULL,
  `quotationSignedBy` VARCHAR(255) NULL,
  
  -- Factura
  `invoiceSigned` TINYINT(1) NOT NULL DEFAULT 0,
  `invoiceSignedDate` DATETIME NULL,
  `invoiceSignedBy` VARCHAR(255) NULL,
  
  -- Facture
  `factureReceived` VARCHAR(20) NOT NULL DEFAULT 'AÚN NO',
  `factureReceivedDate` DATETIME NULL,
  `factureReceivedBy` VARCHAR(255) NULL,
  
  -- Gestión & Entrega
  `management` TINYINT(1) NOT NULL DEFAULT 0,
  `managementDate` DATETIME NULL,
  `managedBy` VARCHAR(255) NULL,
  
  `delivered` TINYINT(1) NOT NULL DEFAULT 0,
  `deliveredDate` DATETIME NULL,
  `deliveredBy` VARCHAR(255) NULL,
  
  -- Relaciones y Rutas
  `relatedQuotationId` VARCHAR(100) NULL,
  `relatedQuotationCode` VARCHAR(100) NULL,
  `quotationDocumentPath` TEXT NULL,
  `invoiceDocumentPath` TEXT NULL,
  `signedQuotationDocumentPath` TEXT NULL,
  `signedInvoiceDocumentPath` TEXT NULL,
  
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Documentos Adjuntos
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `invoiceId` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `originalName` VARCHAR(255) NOT NULL,
  `storedName` VARCHAR(255) NOT NULL,
  `relativePath` TEXT NOT NULL,
  `mimeType` VARCHAR(100) NOT NULL,
  `size` INT NOT NULL,
  `uploadedBy` VARCHAR(255) NOT NULL DEFAULT 'Usuario Sistema',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Registro de Auditoría e Histórico
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `invoiceId` VARCHAR(100) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `user` VARCHAR(255) NOT NULL DEFAULT 'Usuario Administrador',
  `details` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserción de proveedores iniciales
INSERT INTO `suppliers` (`id`, `nit`, `name`, `contact`, `phone`, `email`) VALUES
('sup-1', '900.123.456-1', 'Proveedor ABC', 'Carlos Pérez', '3001234567', 'contacto@proveedorabc.com'),
('sup-2', '800.987.654-2', 'Distribuidora Lácteos Enriko', 'María Gómez', '3109876543', 'ventas@lacteosenriko.com'),
('sup-3', '901.555.777-3', 'Empaques e Insumos SAS', 'Juan Rodriguez', '3205557777', 'pedidos@empaques.com')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
