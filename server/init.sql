-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `mediaspace`;
USE `mediaspace`;

-- 创建User表
CREATE TABLE `User` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `account` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `User_name_key` (`name`),
    UNIQUE INDEX `User_account_key` (`account`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建Media表
CREATE TABLE `Media` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `type` TINYINT NOT NULL DEFAULT 1,
    `descript` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建Comment表
CREATE TABLE `Comment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `userId` INT NOT NULL,
    `mediaId` INT NOT NULL,
    `isEdited` BOOLEAN NOT NULL DEFAULT false,
    `imageUrls` VARCHAR(191) NOT NULL,
    `timestamp` FLOAT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    INDEX `Comment_mediaId_fkey` (`mediaId`),
    INDEX `Comment_userId_idx` (`userId`),
    CONSTRAINT `Comment_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media` (`id`),
    CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 