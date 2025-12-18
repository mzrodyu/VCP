# VCPChat Web

基于 Vue.js + Python Flask 的 VCPChat Web 版本，类似云酒馆的多用户 AI 聊天平台。

## 功能特点

- **多用户系统**: 用户注册、登录、JWT 认证
- **助手管理**: 创建、编辑、删除 AI 助手（角色卡）
- **聊天功能**: 流式输出、多话题管理、消息编辑/删除/重新生成
- **群组聊天**: 多角色同时对话
- **预设系统**: 保存和复用系统提示词配置
- **世界书**: 基于关键词的动态上下文注入
- **笔记功能**: 支持文件夹的笔记管理系统
- **管理后台**: 用户管理、数据统计、系统维护

## 技术栈

### 后端
- Python 3.9+
- Flask 3.0
- Flask-SQLAlchemy (SQLite)
- Flask-JWT-Extended
- Flask-SocketIO
- Flask-CORS

### 前端
- Vue 3 + Vite
- Pinia (状态管理)
- Vue Router
- TailwindCSS
- Lucide Icons
- Axios

## 快速开始

### 1. 克隆项目

```bash
cd d:\AAA代码\帮p一串写的\VCPChat-Web
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
python app.py
```

后端服务将在 http://localhost:5001 启动

### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 5. 启动前端开发服务器

```bash
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 使用说明

### 首次使用

1. 打开 http://localhost:3000
2. 点击"注册"创建账户（第一个注册的用户将自动成为管理员）
3. 进入"设置"页面配置 API 地址和密钥
4. 创建助手开始聊天

### API 配置

在设置页面配置您的 AI API：
- **API 地址**: OpenAI 兼容的 API 地址 (如 http://localhost:5000)
- **API 密钥**: 如有需要，填写 API 密钥

### 助手设置

创建助手时可以配置：
- 基本信息（名称、头像、描述）
- 系统提示词（主提示词、越狱提示词、助手笔记）
- 模型参数（Temperature、Top P、上下文限制等）
- 正则替换规则

### 世界书

世界书用于根据对话内容动态注入背景知识：
1. 创建世界书
2. 添加条目，设置触发关键词
3. 当对话中出现关键词时，相关内容会自动注入到上下文中

### 管理后台

管理员可以：
- 查看系统统计
- 管理用户（禁用/启用、设置管理员）
- 重置用户密码
- 管理公开的助手
- 系统清理

## 目录结构

```
VCPChat-Web/
├── backend/
│   ├── app.py              # Flask 应用入口
│   ├── config.py           # 配置文件
│   ├── requirements.txt    # Python 依赖
│   ├── models/             # 数据模型
│   │   ├── user.py
│   │   ├── agent.py
│   │   ├── chat.py
│   │   ├── note.py
│   │   ├── preset.py
│   │   ├── worldbook.py
│   │   ├── group.py
│   │   └── settings.py
│   ├── routes/             # API 路由
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── agents.py
│   │   ├── chat.py
│   │   ├── topics.py
│   │   ├── notes.py
│   │   ├── presets.py
│   │   ├── worldbook.py
│   │   ├── groups.py
│   │   ├── admin.py
│   │   └── settings.py
│   └── data/               # 数据存储目录
│       ├── vcpchat.db      # SQLite 数据库
│       ├── uploads/        # 上传文件
│       └── avatars/        # 头像文件
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── style.css
│       ├── router/
│       ├── stores/
│       ├── utils/
│       ├── layouts/
│       ├── components/
│       └── views/
└── README.md
```

## 环境变量

可通过环境变量配置：

```bash
# 后端
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///path/to/db.sqlite
VCP_API_URL=http://localhost:5000
VCP_API_KEY=your-api-key
```

## 生产部署

### 后端

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 "app:create_app()"
```

### 前端

```bash
npm run build
# 将 dist 目录部署到 Web 服务器
```

## 许可证

MIT License

## 致谢

本项目基于 VCPChat 桌面版本进行 Web 化改造。
