# 使用更稳定的基础镜像和镜像源
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 安装必要的工具
RUN apk add --no-cache curl git

# 创建PNPM_HOME目录并设置权限，然后安装特定版本的pnpm
RUN mkdir -p /pnpm && \
    chmod 777 /pnpm && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@8.15.4

# 配置npm和pnpm镜像
RUN npm config set registry https://registry.npmmirror.com && \
    pnpm config set registry https://registry.npmmirror.com

# 复制所有文件
COPY . .

# 构建应用
RUN pnpm build

# 生产环境
FROM node:18-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

# 安装必要的工具
RUN apk add --no-cache curl git

# 创建PNPM_HOME目录并设置权限，然后安装特定版本的pnpm
RUN mkdir -p /pnpm && \
    chmod 777 /pnpm && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@8.15.4

# 配置npm和pnpm镜像
RUN npm config set registry https://registry.npmmirror.com && \
    pnpm config set registry https://registry.npmmirror.com

# 复制构建产物和必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["pnpm", "start", "-p", "8000"] 