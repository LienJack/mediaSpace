-- 允许 root 用户远程访问并设置密码认证方式
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- 创建 admin 用户并授予所有权限
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'admin';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;

-- 创建 alist 数据库
CREATE DATABASE IF NOT EXISTS alist CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
GRANT ALL PRIVILEGES ON alist.* TO 'admin'@'%';

-- 刷新权限
FLUSH PRIVILEGES;