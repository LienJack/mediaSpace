# MediaSpace Docker 镜像导入说明

## 群辉 Docker 导入步骤：

1. 将 `mediaspace-latest.dockerbuild` 上传到群辉
2. 在群辉 Docker 界面中，选择"映像"
3. 点击"添加" -> "从文件添加"
4. 选择 .dockerbuild 文件导入
5. 导入完成后，可以在映像列表中看到：
   - lienjoe/mediaspace-backend:latest
   - lienjoe/mediaspace-frontend:latest

## 创建 docker-compose.yml

请创建以下 docker-compose.yml 文件：

```yaml
version: '3.8'

services:
  backend:
    image: lienjoe/mediaspace-backend:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data

  frontend:
    image: lienjoe/mediaspace-frontend:latest
    restart: always
    ports:
      - "80:3000"
    depends_on:
      - backend
```

## 启动服务

在 docker-compose.yml 所在目录执行：

```bash
docker-compose up -d
```
