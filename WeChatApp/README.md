# 西昌农产品溯源小程序

一个基于微信小程序的农产品溯源平台，支持商品浏览、在线购买、订单管理和区块链溯源查询。

## 🚀 快速开始

### 1. 环境准备

- 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 确保后端服务运行在 `http://localhost:8080`

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `WeChatApp` 目录
4. AppID：`wxa3a3b63e1c61dc31`

### 3. 配置后端地址

如果后端地址不是 `http://localhost:8080`，请修改：

```typescript
// miniprogram/utils/config.ts
export const API_BASE_URL = 'http://your-backend-url/api';
```

### 4. 启动项目

在微信开发者工具中点击"编译"即可运行。

---

## 📱 功能特性

### ✅ 已完成功能

- 用户注册和登录
- 商品列表浏览（支持搜索和分类筛选）
- 购物车管理
- 订单列表查看
- 个人中心
- 扫码功能

### 🚧 开发中

- 商品详情页
- 确认订单
- 订单详情
- 地址管理
- 溯源查询详情

---

## 📂 项目结构

```
WeChatApp/
├── miniprogram/              # 小程序源码
│   ├── api/                  # API 接口封装
│   │   ├── user.ts          # 用户接口
│   │   ├── product.ts       # 商品接口
│   │   ├── order.ts         # 订单接口
│   │   ├── address.ts       # 地址接口
│   │   └── trace.ts         # 溯源接口
│   ├── pages/               # 页面
│   │   ├── login/           # 登录页
│   │   ├── register/        # 注册页
│   │   ├── index/           # 首页
│   │   ├── cart/            # 购物车
│   │   ├── order-list/      # 订单列表
│   │   ├── user/            # 个人中心
│   │   └── ...              # 其他页面
│   ├── types/               # TypeScript 类型定义
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── address.ts
│   │   ├── trace.ts
│   │   └── common.ts
│   ├── utils/               # 工具类
│   │   ├── config.ts        # 配置文件
│   │   ├── request.ts       # 网络请求
│   │   └── auth.ts          # 登录管理
│   ├── app.ts               # 应用入口
│   ├── app.json             # 应用配置
│   └── app.wxss             # 全局样式
├── 开发计划.md               # 14天开发计划
├── 快速开始.md               # 快速上手指南
├── 项目进度.md               # 当前进度
└── README.md                # 本文件
```

---

## 🛠️ 技术栈

- 微信小程序原生框架
- TypeScript
- Skyline 渲染引擎
- glass-easel 组件框架

---

## 📖 开发文档

- [开发计划](./开发计划.md) - 完整的14天开发计划
- [快速开始](./快速开始.md) - 详细的开发指南
- [项目进度](./项目进度.md) - 当前开发进度

---

## 🔌 后端接口

### 基础地址
```
http://localhost:8080/api
```

### 主要接口

#### 用户认证
- `POST /register` - 注册
- `POST /login` - 登录

#### 商品管理
- `POST /product/list` - 商品列表
- `GET /product/detail/{id}` - 商品详情

#### 订单管理
- `POST /order/create` - 创建订单
- `POST /order/list-by-customer` - 我的订单
- `PUT /order/cancel/{id}` - 取消订单

#### 地址管理
- `GET /user/address/list` - 地址列表
- `POST /user/address/create` - 添加地址
- `PUT /user/address/update/{id}` - 更新地址
- `DELETE /user/address/delete/{id}` - 删除地址

#### 溯源查询
- `GET /trace/batch/{batchNumber}` - 批次溯源
- `GET /trace/verify/{txHash}` - 区块链验证

---

## 🧪 测试账号

请在后端数据库中创建测试账号，或通过注册页面注册新账号。

---

## 📝 开发进度

- 基础架构：100% ✅
- 用户认证：100% ✅
- 商品浏览：80% 🚧
- 购物车：100% ✅
- 订单管理：60% 🚧
- 地址管理：10% 🚧
- 溯源查询：20% 🚧
- 个人中心：100% ✅

总体进度：约 50%

---

## 🐛 已知问题

暂无

---

## 📅 更新日志

### 2026-04-07
- ✅ 完成基础架构搭建
- ✅ 完成登录注册功能
- ✅ 完成首页商品列表
- ✅ 完成购物车功能
- ✅ 完成订单列表
- ✅ 完成个人中心
- 🚧 创建其他页面占位文件

---

## 👥 开发团队

- 后端开发：Spring Boot
- 前端开发：微信小程序
- 产品设计：农产品溯源平台

---

## 📄 许可证

本项目仅供学习和研究使用。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

---

**祝开发顺利！** 🎉
