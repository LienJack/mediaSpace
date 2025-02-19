#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 打印信息函数
print_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
    log_to_file "INFO" "$1"
}

print_warning() {
    printf "${YELLOW}[WARNING]${NC} %s\n" "$1"
    log_to_file "WARNING" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
    log_to_file "ERROR" "$1"
}

# 日志记录函数
log_to_file() {
    local level=$1
    local message=$2
    local log_file="synology_docker.log"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$log_file"
}

# 环境检查函数
check_environment() {
    # 检查是否在群辉系统上运行
    if [ ! -f "/etc/synoinfo.conf" ]; then
        print_error "此脚本只能在群辉系统上运行"
        exit 1
    }

    # 检查 Docker 是否安装
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker 未安装，请按以下步骤安装："
        print_info "1. 打开群辉套件中心"
        print_info "2. 搜索并安装 Docker"
        print_info "3. 安装完成后重新运行此脚本"
        exit 1
    }

    # 检查当前用户权限
    if [ "$(id -u)" != "0" ]; then
        print_warning "需要管理员权限运行此脚本"
        print_info "请使用: sudo ./synology_start.sh"
        exit 1
    }
}

# 初始化目录结构
init_directories() {
    local alist_dir="../alist"
    print_info "检查并创建目录结构..."
    
    # 创建必要的目录
    for dir in "mnt/image" "mnt/video" "logs" "config"; do
        mkdir -p "$alist_dir/$dir"
    done

    # 设置权限
    chown -R "$SUDO_USER:users" "$alist_dir"
    chmod -R 755 "$alist_dir"
    
    print_info "目录结构初始化完成"
}

# 验证配置文件
validate_configs() {
    local compose_file="docker-compose.prod.yml"
    local nginx_conf="nginx.prod.conf"

    for file in "$compose_file" "$nginx_conf"; do
        if [ ! -f "$file" ]; then
            print_error "配置文件不存在: $file"
            exit 1
        fi
        
        # 检查文件权限
        if [ ! -r "$file" ]; then
            print_error "无法读取配置文件: $file"
            exit 1
        fi
    done
}

# 显示菜单
show_menu() {
    clear
    cat << EOF
================================
      群辉 Docker 管理菜单      
================================
1. 启动服务
2. 停止服务
3. 重启服务
4. 重建容器
5. 查看容器状态
6. 查看容器日志
7. 查看系统信息
0. 退出
================================
EOF
    echo "请输入选项 [0-7]: "
}

# 显示系统信息
show_system_info() {
    print_info "系统信息："
    echo "Docker 版本：$(docker --version)"
    echo "系统内存使用：$(free -h)"
    echo "磁盘使用情况：$(df -h /)"
    echo "Docker 容器数量：$(docker ps -q | wc -l)"
}

# 处理用户选择
handle_choice() {
    local compose_file="docker-compose.prod.yml"
    
    case $1 in
        1)
            print_info "启动服务..."
            docker compose -f "$compose_file" up -d
            print_info "服务启动完成"
            ;;
        2)
            print_info "停止服务..."
            docker compose -f "$compose_file" down
            print_info "服务已停止"
            ;;
        3)
            print_info "重启服务..."
            docker compose -f "$compose_file" restart
            print_info "服务已重启"
            ;;
        4)
            print_info "重建容器..."
            docker compose -f "$compose_file" down
            docker compose -f "$compose_file" build --no-cache
            docker system prune -f
            docker compose -f "$compose_file" up -d
            print_info "容器重建完成"
            ;;
        5)
            print_info "容器状态："
            docker compose -f "$compose_file" ps
            ;;
        6)
            print_info "容器日志（按 Ctrl+C 退出）："
            docker compose -f "$compose_file" logs -f
            ;;
        7)
            show_system_info
            ;;
        0)
            print_info "退出程序..."
            exit 0
            ;;
        *)
            print_error "无效的选项"
            ;;
    esac
}

# 主函数
main() {
    # 设置工作目录
    cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1
    
    # 初始化检查
    check_environment
    init_directories
    validate_configs

    # 主循环
    while true; do
        show_menu
        read -r choice
        handle_choice "$choice"
        
        if [ "$choice" != "6" ]; then
            echo
            echo "按 Enter 键继续..."
            read -r
        fi
    done
}

# 捕获 Ctrl+C
trap 'echo -e "\n${YELLOW}正在退出...${NC}"; exit 0' INT

# 启动主程序
main 