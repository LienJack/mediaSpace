# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制prisma配置
COPY prisma ./prisma/

# 生成Prisma客户端
RUN pnpm prisma generate

# 复制其余源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start:prod"] 