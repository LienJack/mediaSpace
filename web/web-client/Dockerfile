# 使用官方 Docker Hub 镜像源
FROM node:18-alpine AS deps

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 安装必要的工具并设置镜像源
RUN echo "https://mirrors.ustc.edu.cn/alpine/v3.18/main/" > /etc/apk/repositories && \
    echo "https://mirrors.ustc.edu.cn/alpine/v3.18/community/" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache curl git && \
    rm -rf /var/cache/apk/*

# 创建pnpm目录并设置权限
RUN mkdir -p /pnpm && \
    chmod 777 /pnpm && \
    npm install -g pnpm@8.15.4

# 配置镜像源
RUN npm config set registry https://registry.npmmirror.com/ && \
    pnpm config set registry https://registry.npmmirror.com/

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@8.15.4

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# 复制源代码
COPY . .

# 构建
RUN pnpm build

# 生产环境
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 安装pnpm和生产依赖
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-lock.yaml* ./
RUN npm install -g pnpm@8.15.4 && \
    pnpm install --prod

# 复制构建文件和公共资源
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 8000

ENV PORT 8000

# 使用node_modules/.bin中的next命令
CMD ["./node_modules/.bin/next", "start", "-p", "8000"] 