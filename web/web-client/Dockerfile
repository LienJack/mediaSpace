# 使用官方 Docker Hub 镜像源
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

# 接收构建参数
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# 安装必要的工具并设置镜像源
RUN apk add curl git

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com/ 

# 安装 pnpm
RUN npm install -g pnpm@8.15.4
    
# 配置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制所有源代码
COPY . .

# 安装依赖（包括开发依赖）
RUN pnpm install --prod=false

# 构建应用
RUN pnpm build

# 设置环境变量和端口
ENV PORT=8000
ENV NEXT_PUBLIC_API_URL=/api

EXPOSE 8000

# 启动命令
CMD ["pnpm", "start", "-p", "8000"] 