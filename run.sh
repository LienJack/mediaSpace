#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 打印信息函数
print_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warning() {
    printf "${YELLOW}[WARNING]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# 检查 Docker 是否安装
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker 未安装，请在群辉的套件中心安装 Docker"
    exit 1
fi

# 初始化默认值
ENV="prod"
BUILD=false
UPDATE=false

# 解析参数
for arg in "$@"; do
    case $arg in
        --dev) ENV="dev" ;;
        --prod) ENV="prod" ;;
        --build) BUILD=true ;;
        --update) UPDATE=true ;;
        --help)
            echo "用法: ./run.sh [--dev|--prod] [--build] [--update]"
            exit 0
            ;;
        *) 
            print_error "未知参数: $arg"
            exit 1
            ;;
    esac
done

# 检查并创建目录
ALIST_DIR="../alist"
if [ ! -d "$ALIST_DIR" ]; then
    print_info "创建 alist 目录结构..."
    mkdir -p "$ALIST_DIR/mnt/image"
    mkdir -p "$ALIST_DIR/mnt/video"
    chown -R "$USER:users" "$ALIST_DIR"
    chmod -R 755 "$ALIST_DIR"
fi

# 设置环境变量
if [ "$ENV" = "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    NGINX_CONF="nginx.dev.conf"
    export NODE_ENV=development
else
    COMPOSE_FILE="docker-compose.prod.yml"
    NGINX_CONF="nginx.prod.conf"
    export NODE_ENV=production
fi

# 检查配置文件
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "找不到 $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$NGINX_CONF" ]; then
    print_error "找不到 $NGINX_CONF"
    exit 1
fi

# 如果需要构建
if [ "$BUILD" = true ]; then
    print_info "停止现有容器..."
    docker compose -f "$COMPOSE_FILE" down

    print_info "构建容器..."
    docker compose -f "$COMPOSE_FILE" build --no-cache

    if [ "$ENV" = "prod" ]; then
        print_info "清理 Docker 缓存..."
        docker system prune -f
    fi
fi

# 启动容器
print_info "启动 $ENV 环境..."
if [ "$ENV" = "dev" ]; then
    docker compose -f "$COMPOSE_FILE" up
else
    docker compose -f "$COMPOSE_FILE" up -d
    print_info "容器状态："
    docker compose -f "$COMPOSE_FILE" ps
fi

# 捕获 Ctrl+C
trap 'docker compose -f "$COMPOSE_FILE" down' INT 