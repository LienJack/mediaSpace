# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录和环境变量
WORKDIR /app
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NODE_OPTIONS="--max-old-space-size=4096" \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    PORT=8000 \
    NEXT_PUBLIC_API_URL=/api

# 接收构建参数
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# 安装系统依赖和配置
RUN apk add  curl git && \
    npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm@8.15.4 && \
    pnpm config set registry https://registry.npmmirror.com/

# 先复制package.json和pnpm-lock.yaml以利用缓存
COPY package*.json pnpm-lock.yaml ./

# 安装依赖（包括开发依赖）
RUN pnpm install --prod=false

# 复制所有源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["pnpm", "start", "-p", "8000"] 