-- CreateTable
CREATE TABLE `OrganizationCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `categoryType` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrganizationCategory_name_key`(`name`),
    INDEX `OrganizationCategory_createdAt_idx`(`createdAt`),
    INDEX `OrganizationCategory_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    INDEX `OrganizationCategory_categoryType_idx`(`categoryType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `organizationCategoryId` INTEGER NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `numberOfSigners` INTEGER NOT NULL,
    `image1` VARCHAR(191) NOT NULL,
    `image2` VARCHAR(191) NOT NULL,
    `image3` VARCHAR(191) NULL,
    `image4` VARCHAR(191) NULL,
    `image5` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_phoneNumber_key`(`phoneNumber`),
    INDEX `Organization_organizationCategoryId_idx`(`organizationCategoryId`),
    INDEX `Organization_province_createdAt_idx`(`province`, `createdAt`),
    INDEX `Organization_createdAt_idx`(`createdAt`),
    INDEX `Organization_phoneNumber_idx`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_organizationCategoryId_fkey` FOREIGN KEY (`organizationCategoryId`) REFERENCES `OrganizationCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
