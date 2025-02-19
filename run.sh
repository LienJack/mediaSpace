#!/bin/bash

# 设置颜色输出
if [[ "$OSTYPE" == "darwin"* ]] || [[ -f "/etc/synoinfo.conf" ]]; then
    # macOS 和 群辉 的颜色设置
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m' # No Color
else
    # 其他系统默认不使用颜色
    GREEN=''
    YELLOW=''
    RED=''
    NC=''
fi

# 检测系统类型
detect_system() {
    if [[ -f "/etc/synoinfo.conf" ]]; then
        echo "synology"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "other"
    fi
}

SYSTEM_TYPE=$(detect_system)

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装。请先安装 Docker。"
        if [[ "$SYSTEM_TYPE" == "synology" ]]; then
            print_info "请在群辉的套件中心安装 Docker。"
        elif [[ "$SYSTEM_TYPE" == "macos" ]]; then
            print_info "请访问 https://docs.docker.com/desktop/mac/install/ 安装 Docker Desktop。"
        fi
        exit 1
    fi
}

# 检查 Docker Compose 是否安装
check_docker_compose() {
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装。"
        if [[ "$SYSTEM_TYPE" == "synology" ]]; then
            print_info "Docker Compose 应该随 Docker 一起安装。"
        elif [[ "$SYSTEM_TYPE" == "macos" ]]; then
            print_info "Docker Compose 应该随 Docker Desktop 一起安装。"
        fi
        exit 1
    fi
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
    
    # 检查目录权限
    if [[ ! -w "$(dirname "$alist_dir")" ]]; then
        print_error "没有创建目录的权限，请检查权限设置。"
        exit 1
    fi
    
    if [[ ! -d "$alist_dir" ]]; then
        print_info "创建alist文件夹及其结构..."
        mkdir -p "$alist_dir/mnt/image"
        mkdir -p "$alist_dir/mnt/video"
        
        # 设置适当的权限
        if [[ "$SYSTEM_TYPE" == "synology" ]]; then
            chown -R $USER:users "$alist_dir"
            chmod -R 755 "$alist_dir"
        else
            chmod -R 755 "$alist_dir"
        fi
        
        print_info "alist文件夹及其结构已创建。"
    else
        print_info "alist文件夹已存在，检查其结构..."
        [[ ! -d "$alist_dir/mnt" ]] && mkdir "$alist_dir/mnt"
        [[ ! -d "$alist_dir/mnt/image" ]] && mkdir "$alist_dir/mnt/image"
        [[ ! -d "$alist_dir/mnt/video" ]] && mkdir "$alist_dir/mnt/video"
    fi
}

# 添加git更新函数
update_code() {
    print_info "正在从git仓库main分支拉取最新代码..."
    
    # 检查git是否安装
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装。请先安装 Git。"
        exit 1
    }
    
    # 检查当前分支
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" != "main" ]]; then
        print_warning "当前不在main分支，正在切换到main分支..."
        if ! git checkout main; then
            print_error "切换到main分支失败"
            exit 1
        fi
    fi
    
    # 设置上游分支并拉取
    git branch --set-upstream-to=origin/main main 2>/dev/null || true
    
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

# 系统检查
check_docker
check_docker_compose

# 如果需要更新代码
[[ "$UPDATE" = true ]] && update_code

# 检查必要的配置文件是否存在
check_config_files() {
    local nginx_conf="nginx.${ENV}.conf"
    if [[ ! -f "$nginx_conf" ]]; then
        print_error "找不到 ${nginx_conf} 配置文件"
        exit 1
    fi
}

# 根据环境设置变量
if [[ "$ENV" = "dev" ]]; then
    print_info "使用开发环境配置..."
    COMPOSE_FILE="docker-compose.dev.yml"
    export NGINX_CONF=nginx.dev.conf
    export NODE_ENV=development
    export BACKEND_CMD="npm run start:dev"
    export FRONTEND_CMD="npm run dev"
    
    check_config_files
else
    print_info "使用生产环境配置..."
    COMPOSE_FILE="docker-compose.prod.yml"
    export NGINX_CONF=nginx.prod.conf
    export NODE_ENV=production
    export BACKEND_CMD="npm run start:prod"
    export FRONTEND_CMD="npm run start"
    
    check_config_files
fi

# 检查 docker-compose 配置文件是否存在
if [[ ! -f "$COMPOSE_FILE" ]]; then
    print_error "找不到 ${COMPOSE_FILE} 配置文件"
    exit 1
fi

# 如果需要构建
if [[ "$BUILD" = true ]]; then
    print_info "开始构建${ENV}环境..."
    
    print_info "停止并删除现有容器..."
    docker compose -f "${COMPOSE_FILE}" down

    if [[ "$ENV" = "prod" ]]; then
        print_info "构建生产环境容器..."
        docker compose -f "${COMPOSE_FILE}" build --no-cache
        
        print_info "清理Docker缓存..."
        docker system prune -f
    else
        print_info "构建开发环境容器..."
        docker compose -f "${COMPOSE_FILE}" build --no-cache
    fi
fi

# 检查并创建alist文件夹及其结构
check_and_create_alist

# 启动容器
print_info "启动${ENV}环境容器..."
if [[ "$ENV" = "dev" ]]; then
    print_warning "开发环境启动，日志将实时显示..."
    docker compose -f "${COMPOSE_FILE}" up
else
    print_info "生产环境启动，容器将在后台运行..."
    docker compose -f "${COMPOSE_FILE}" up -d
    
    print_info "容器状态："
    docker compose -f "${COMPOSE_FILE}" ps
fi

# 捕获Ctrl+C信号
trap 'print_info "正在关闭容器..."; docker compose -f "${COMPOSE_FILE}" down' INT

# 如果是开发环境，等待用户输入
[[ "$ENV" = "dev" ]] && wait 