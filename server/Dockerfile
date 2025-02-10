# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录和环境变量
WORKDIR /app
ENV NODE_ENV=production \
    PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

# 安装系统依赖和配置
RUN apk add curl git && \
    npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm@8.15.4 && \
    pnpm config set registry https://registry.npmmirror.com/

# 先复制package.json和pnpm-lock.yaml以利用缓存
COPY package.json pnpm-lock.yaml ./

RUN npm config set registry https://registry.npmmirror.com/ 
# RUN npm config set registry https://mirrors.aliyun.com/npm/
# 安装pnpm
RUN npm install -g pnpm@8.15.4

# 配置镜像源
RUN pnpm config set registry https://registry.npmmirror.com/
# RUN pnpm config set registry https://mirrors.aliyun.com/


# 复制package.json和pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# 全局安装prisma CLI
# RUN pnpm add -g prisma

# 安装依赖
RUN pnpm install

# 复制prisma配置
COPY prisma ./prisma/

# 生成Prisma客户端
RUN pnpm prisma generate

# 构建应用
RUN pnpm build && \
    # 验证构建结果
    ls -la dist && test -f dist/main.js

# 清理缓存
RUN pnpm cache clean && \
    rm -rf /var/cache/apk/*

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start:prod"] 