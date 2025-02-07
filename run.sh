#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "用法: ./run.sh [选项]"
    echo "选项:"
    echo "  --dev     使用开发环境配置"
    echo "  --prod    使用生产环境配置（默认）"
    echo "  --build   重新构建容器"
    echo "  --update  更新代码（从git仓库拉取最新代码）"
    echo "  --help    显示此帮助信息"
    echo
    echo "示例:"
    echo "  ./run.sh --dev --build    构建并启动开发环境"
    echo "  ./run.sh --dev            启动开发环境（不重新构建）"
    echo "  ./run.sh --prod --build   构建并启动生产环境"
    echo "  ./run.sh                  启动生产环境（不重新构建）"
    echo "  ./run.sh --update         更新代码并启动"
}

# 初始化默认值
ENV="prod"
BUILD=false
UPDATE=false

# 检查并创建alist文件夹及其结构
check_and_create_alist() {
    local alist_dir="../alist"
    
    if [ ! -d "$alist_dir" ]; then
        print_info "创建alist文件夹及其结构..."
        mkdir -p "$alist_dir/mnt/image"
        mkdir -p "$alist_dir/mnt/video"
        print_info "alist文件夹及其结构已创建。"
    else
        print_info "alist文件夹已存在，检查其结构..."
        if [ ! -d "$alist_dir/mnt" ]; then
            print_info "创建缺失的mnt文件夹..."
            mkdir "$alist_dir/mnt"
        fi
        if [ ! -d "$alist_dir/mnt/image" ]; then
            print_info "创建缺失的image文件夹..."
            mkdir "$alist_dir/mnt/image"
        fi
        if [ ! -d "$alist_dir/mnt/video" ]; then
            print_info "创建缺失的video文件夹..."
            mkdir "$alist_dir/mnt/video"
        fi
    fi
}

# 添加git更新函数
update_code() {
    print_info "正在从git仓库main分支拉取最新代码..."
    
    # 检查当前分支
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "main" ]; then
        print_warning "当前不在main分支，正在切换到main分支..."
        if ! git checkout main; then
            print_error "切换到main分支失败"
            exit 1
        fi
    fi
    
    # 设置上游分支并拉取
    if ! git branch --set-upstream-to=origin/main main 2>/dev/null; then
        print_info "上游分支已设置"
    fi
    
    if git pull origin main; then
        print_info "代码更新成功"
    else
        print_error "代码更新失败"
        exit 1
    fi
}

# 解析命令行参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dev) ENV="dev" ;;
        --prod) ENV="prod" ;;
        --build) BUILD=true ;;
        --update) UPDATE=true ;;
        --help) show_help; exit 0 ;;
        *) print_error "未知参数: $1"; show_help; exit 1 ;;
    esac
    shift
done

# 如果需要更新代码
if [ "$UPDATE" = true ]; then
    update_code
fi

# 检查必要的配置文件是否存在
check_config_files() {
    local nginx_conf="nginx.${ENV}.conf"
    if [ ! -f "$nginx_conf" ]; then
        print_error "找不到 ${nginx_conf} 配置文件"
        exit 1
    fi
}

# 根据环境设置变量
if [ "$ENV" = "dev" ]; then
    print_info "使用开发环境配置..."
    export NGINX_CONF=nginx.dev.conf
    export NODE_ENV=development
    export BACKEND_CMD="npm run start:dev"
    export FRONTEND_CMD="npm run dev"
    
    # 检查开发环境特定的设置
    print_info "检查开发环境配置..."
    check_config_files
else
    print_info "使用生产环境配置..."
    export NGINX_CONF=nginx.prod.conf
    export NODE_ENV=production
    export BACKEND_CMD="npm run start:prod"
    export FRONTEND_CMD="npm run start"
    
    # 检查生产环境特定的设置
    print_info "检查生产环境配置..."
    check_config_files
fi

# 如果需要构建
if [ "$BUILD" = true ]; then
    print_info "开始构建${ENV}环境..."
    
    # 停止并删除现有容器
    print_info "停止并删除现有容器..."
    docker-compose down
    
    # 清理Docker缓存（可选）
    if [ "$ENV" = "prod" ]; then
        print_info "清理Docker缓存..."
        docker system prune -f
    fi
    
    # 构建容器
    print_info "构建新容器..."
    docker-compose build --no-cache
fi

# 检查并创建alist文件夹及其结构
check_and_create_alist

# 启动容器
print_info "启动${ENV}环境容器..."
if [ "$ENV" = "dev" ]; then
    print_warning "开发环境启动，日志将实时显示..."
    docker-compose up
else
    print_info "生产环境启动，容器将在后台运行..."
    docker-compose up -d
    
    # 显示容器状态
    print_info "容器状态："
    docker-compose ps
fi

# 捕获Ctrl+C信号
trap 'print_info "正在关闭容器..."; docker-compose down' INT

# 如果是开发环境，等待用户输入
if [ "$ENV" = "dev" ]; then
    wait
fi 