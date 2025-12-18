# 1Panel 部署指南

## 部署架构

```
用户 → Nginx (前端静态文件 + 反向代理) → Python后端 (5001端口)
```

## 步骤一：上传项目到服务器

将整个 `VCPChat-Web` 文件夹上传到服务器，例如：
```
/www/wwwroot/vcpchat/
```

## 步骤二：构建前端

在服务器上执行：
```bash
cd /www/wwwroot/vcpchat/frontend
npm install
npm run build
```

构建完成后会生成 `dist` 目录。

## 步骤三：在 1Panel 创建 Python 运行环境

在 1Panel 的 "运行环境" → "Python" 中点击 "创建运行环境"：

| 配置项       | 值                                                                                      |
| ------------ | --------------------------------------------------------------------------------------- |
| **名称**     | vcpchat-backend                                                                         |
| **项目目录** | /www/wwwroot/vcpchat/backend                                                            |
| **启动命令** | pip install -r requirements.txt && gunicorn -w 4 -b 0.0.0.0:5001 --timeout 120 wsgi:app |
| **应用**     | Python                                                                                  |
| **版本**     | 3.10+ (建议3.11)                                                                        |
| **进程名称** | vcpchat                                                                                 |
| **端口**     | 5001                                                                                    |

点击 "确认" 创建。

## 步骤四：创建网站并配置 Nginx

### 4.1 创建静态网站

在 1Panel "网站" 中创建网站：
- **类型**: 静态网站
- **域名**: 你的域名
- **目录**: /www/wwwroot/vcpchat/frontend/dist

### 4.2 配置 Nginx 反向代理

在网站设置 → 配置文件中添加以下配置：

```nginx
location /api {
    proxy_pass http://127.0.0.1:5001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
}

location /socket.io {
    proxy_pass http://127.0.0.1:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 步骤五：配置环境变量（可选）

在 1Panel Python 运行环境的 "环境变量" 中添加：

| 变量名         | 值         | 说明      |
| -------------- | ---------- | --------- |
| SECRET_KEY     | 随机字符串 | Flask密钥 |
| JWT_SECRET_KEY | 随机字符串 | JWT密钥   |

## 步骤六：启动服务

1. 在 1Panel 运行环境中启动 Python 后端
2. 访问你的域名即可使用

## 常见问题

### Q: 502 Bad Gateway
检查 Python 后端是否正常运行，查看日志排查问题。

### Q: 静态资源404
确保 Nginx 配置中 `try_files` 正确配置。

### Q: WebSocket连接失败
确保 Nginx 配置了 WebSocket 代理。

## 目录结构确认

```
/www/wwwroot/vcpchat/
├── backend/
│   ├── app.py
│   ├── wsgi.py          # gunicorn入口
│   ├── config.py
│   ├── requirements.txt
│   ├── models/
│   ├── routes/
│   └── data/            # 数据库和上传文件
└── frontend/
    ├── dist/            # 构建后的静态文件
    ├── package.json
    └── src/
```
