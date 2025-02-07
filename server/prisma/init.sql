-- 创建 mediaspace 数据库
CREATE DATABASE IF NOT EXISTS mediaspace CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 允许 root 用户远程访问并设置密码认证方式
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- 创建 admin 用户并授予所有权限
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'admin';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;


-- 刷新权限
FLUSH PRIVILEGES;

USE mediaspace;

-- 删除已存在的表（如果存在）以确保重新创建
DROP TABLE IF EXISTS Comment;
DROP TABLE IF EXISTS Media;
DROP TABLE IF EXISTS user;

-- 创建 User 表
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    account VARCHAR(255) NOT NULL UNIQUE,
    avatarUrl VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL,
    deletedAt TIMESTAMP NULL
);

-- 创建 Media 表
CREATE TABLE Media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    type TINYINT DEFAULT 1,
    descript TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL,
    deletedAt TIMESTAMP NULL
);

-- 创建 Comment 表
CREATE TABLE Comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    userId INT NOT NULL,
    mediaId INT NOT NULL,
    isEdited BOOLEAN DEFAULT FALSE,
    imageUrls TEXT NOT NULL,
    timestamp FLOAT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES user(id),
    FOREIGN KEY (mediaId) REFERENCES Media(id),
    INDEX Comment_userId_idx (userId),
    INDEX Comment_mediaId_fkey (mediaId)
);

-- 检查并插入admin用户
INSERT INTO user (name, account, avatarUrl)
SELECT 'admin', 'admin', 'https://avatars.githubusercontent.com/u/54362992'
WHERE NOT EXISTS (
    SELECT 1 FROM user WHERE name = 'admin'
);

-- 创建必要的表（如果不存在）
CREATE TABLE IF NOT EXISTS alist_storages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mount_path VARCHAR(255) NOT NULL,
    `order` VARCHAR(50),
    driver VARCHAR(50),
    cache_expiration VARCHAR(50),
    status VARCHAR(50),
    addition TEXT,
    remark TEXT,
    modified TIMESTAMP,
    disabled TINYINT(1),
    disable_index TINYINT(1),
    enable_sign TINYINT(1),
    order_by VARCHAR(50),
    order_direction VARCHAR(50),
    extract_folder VARCHAR(255),
    web_proxy VARCHAR(50),
    webdav_policy VARCHAR(50),
    proxy_range VARCHAR(50),
    down_proxy_url TEXT
);

CREATE TABLE IF NOT EXISTS alist_setting_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 检查并插入alist_storages数据
INSERT INTO alist_storages (mount_path, `order`, driver, cache_expiration, status, addition, remark, modified, disabled, disable_index, enable_sign, order_by, order_direction, extract_folder, web_proxy, webdav_policy, proxy_range, down_proxy_url)
SELECT '/local', '0', 'Local', '0', 'work', 
       '{\"root_folder_path\":\"/mnt\",\"thumbnail\":false,\"thumb_cache_folder\":\"\",\"thumb_concurrency\":\"16\",\"video_thumb_pos\":\"20%\",\"show_hidden\":true,\"mkdir_perm\":\"777\",\"recycle_bin_path\":\"delete permanently\"}',
       '', '2025-02-05 21:13:40.783000', '0', '0', '0', '', '', '', '0', 'native_proxy', '0', ''
WHERE NOT EXISTS (
    SELECT 1 FROM alist_storages WHERE mount_path = '/local'
);

-- 检查并更新sign_all设置
INSERT INTO alist_setting_items (`key`, value)
SELECT 'sign_all', 'false'
WHERE NOT EXISTS (
    SELECT 1 FROM alist_setting_items WHERE `key` = 'sign_all');