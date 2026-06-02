# 西昌农产品溯源系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-blue.svg)](https://vuejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange.svg)](https://soliditylang.org/)

> 基于区块链技术的农产品溯源电商系统，实现从农田到餐桌的全链路可追溯

## 📋 项目简介

西昌农产品溯源系统是一个集**区块链溯源**、**农产品电商**、**生长记录管理**于一体的完整解决方案。系统通过智能合约将农产品数据哈希上链，确保数据不可篡改，消费者可通过扫描二维码查看完整溯源信息。



## ✨ 核心特性

- 🔗 **区块链溯源**：基于 Polygon Amoy 测试网，智能合约存储数据哈希
- 📱 **微信小程序**：消费者端，支持商品购买、扫码溯源
- 🖥️ **后台管理系统**：农户/管理员端，管理商品、批次、生长记录
- 🎨 **精美UI**：现代化界面设计，良好的用户体验
- 🔐 **数据安全**：SHA-256 哈希加密 + 区块链存证
- 📊 **生长记录**：时间轴展示，记录各阶段环境数据
- 📷 **二维码溯源**：ZXing 生成溯源二维码，扫码查询

## 🏗️ 系统架构

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  微信小程序      │◄──────►│  Spring Boot    │◄──────►│  后台管理系统    │
│  (顾客端)        │   API   │   后端服务      │   API   │  (农户/管理员)   │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Polygon     │
                              │  区块链测试网 │
                              └──────────────┘
```

## 🛠️ 技术栈

| 模块           | 技术栈                      | 版本   |
| -------------- | --------------------------- | ------ |
| **后端**       | Spring Boot                 | 3.2.5  |
| **数据库**     | MySQL                       | 8.0+   |
| **ORM**        | MyBatis                     | 3.0.5  |
| **区块链**     | Polygon Amoy                | -      |
| **智能合约**   | Solidity                    | 0.8.20 |
| **Web3客户端** | Web3j                       | 4.10.3 |
| **后台管理**   | Vue 3 + Element Plus        | 3.x    |
| **小程序**     | 微信小程序原生 + TypeScript | -      |
| **二维码**     | ZXing                       | 3.5.3  |

## 📁 项目结构

```
BS/
├── App/
│   ├── Backend/xichang-interface/       # Spring Boot 后端
│   │   ├── contracts/                    # 智能合约 Solidity
│   │   ├── blockchain-deploy/            # 合约部署工具
│   │   ├── src/main/java/                # Java源码
│   │   └── src/main/resources/           # 配置与资源
│   ├── Counter/hotai/                    # Vue 3 后台管理
│   │   ├── src/api/                      # API 模块
│   │   ├── src/views/                    # 页面组件
│   │   └── src/store/                    # 状态管理
│   └── WeChatApp/miniprogram/            # 微信小程序
│       ├── pages/                        # 小程序页面
│       ├── api/                          # 接口封装
│       └── types/                        # TypeScript 类型定义
└── textImage/                            # 图片资源
```

## 🚀 快速开始

### 环境要求

- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+
- 微信开发者工具

### 1. 数据库配置

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE xichang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始数据
mysql -u root -p xichang &lt; App/Backend/xichang-interface/src/main/resources/init.sql
```

### 2. 后端启动

```bash
cd App/Backend/xichang-interface

# 配置 application.properties
# 编辑数据库连接、区块链配置

# 启动后端
mvn spring-boot:run
```

后端服务运行在：http://localhost:8080

### 3. 后台管理系统启动

```bash
cd App/Counter/hotai

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

后台管理运行在：http://localhost:5173

### 4. 小程序启动

1. 使用微信开发者工具打开 `App/WeChatApp` 目录
2. 配置 AppID：wxa3a3b63e1c61dc31（或使用测试号）
3. 确认后端地址配置在 `utils/config.ts`
4. 点击编译运行

## 📖 完整业务流程

### 🔸 农户后台操作流程

1. **创建商品** - `ProductManagement.vue`
2. **创建批次** - `BatchManagement.vue`
3. **记录生长过程** - `GrowthRecordManagement.vue`
4. **数据上链** - 调用智能合约 `storeHash()`
5. **生成溯源二维码** - `QRCodeGenerator.vue`
6. **打印二维码贴到产品包装**

### 🔸 顾客小程序操作流程

7. **浏览商品** - `pages/index`
8. **下单购买** - `pages/cart` → `pages/order-confirm`
9. **收到商品**
10. **扫码查溯源** - `pages/trace`
11. **查看溯源信息**（批次信息、生长记录、区块链验证）
12. **在区块链浏览器验证** - https://amoy.polygonscan.com

## 🔗 区块链配置

### 启用真实区块链

编辑 `application.properties`：

```properties
# 启用真实区块链
blockchain.enabled=true

# Polygon Amoy 测试网配置
blockchain.rpc.url=https://rpc-amoy.polygon.technology
blockchain.contract.address=0xYourContractAddress
blockchain.private.key=0xYourPrivateKey
```

### 智能合约

智能合约文件位于：`App/Backend/xichang-interface/contracts/AgriTrace.sol`

核心功能：

- `storeHash(string dataId, bytes32 hash)` - 存储数据哈希
- `verifyHash(string dataId, bytes32 hash)` - 验证数据
- `getTimestamp(string dataId)` - 获取上链时间

## 📱 小程序功能

| 页面                | 功能                       |
| ------------------- | -------------------------- |
| `login/register`    | 用户登录注册               |
| `index`             | 商品列表、搜索、分类筛选   |
| `product-detail`    | 商品详情、加入购物车       |
| `cart`              | 购物车管理、结算           |
| `address-list/edit` | 收货地址管理               |
| `order-list/detail` | 订单管理、查看详情         |
| `trace`             | 溯源查询、扫码、区块链验证 |
| `user`              | 个人中心、用户信息         |

## 🖥️ 后台管理功能

| 模块       | 功能                             |
| ---------- | -------------------------------- |
| 用户管理   | 用户增删改查、角色管理、状态管理 |
| 商品管理   | 商品增删改查、上架下架、库存管理 |
| 批次管理   | 批次创建、状态管理、数据上链     |
| 生长记录   | 生长阶段记录、环境数据、照片上传 |
| 订单管理   | 订单查看、发货、状态更新         |
| 二维码生成 | 生成溯源二维码、下载打印         |
| 数据统计   | 驾驶舱、销售分析                 |

## 📊 API 接口

### 核心接口

- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册
- `GET /api/product/list` - 商品列表
- `POST /api/product/create` - 创建商品
- `GET /api/batch/list` - 批次列表
- `POST /api/batch/create` - 创建批次
- `GET /api/trace/batch/{batchNumber}` - 溯源查询
- `GET /api/trace/qrcode/{batchNumber}` - 生成二维码
- `POST /api/order/create` - 创建订单

### Swagger API 文档

启动后端后访问：http://localhost:8080/swagger-ui.html

## 🎯 智能合约核心代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriTrace {
    mapping(string =&gt; bytes32) private dataHashes;
    mapping(string =&gt; uint256) private timestamps;
    
    event DataStored(string indexed dataId, bytes32 hash, uint256 timestamp);
    
    function storeHash(string memory dataId, bytes32 hash) public {
        dataHashes[dataId] = hash;
        timestamps[dataId] = block.timestamp;
        emit DataStored(dataId, hash, block.timestamp);
    }
    
    function verifyHash(string memory dataId, bytes32 hash) 
        public returns (bool) {
        return dataHashes[dataId] == hash;
    }
}
```

## 🔧 配置说明

### 后端配置 (application.properties)

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/xichang
spring.datasource.username=root
spring.datasource.password=yourpassword

# 区块链配置（可选）
blockchain.enabled=false  # true=真实区块链, false=模拟模式
```

### 小程序配置 (config.ts)

```typescript
export const API_BASE_URL = 'http://localhost:8080/api';
```

## 📸 项目截图

（此处可添加项目截图）

- 小程序首页
- 溯源查询页面
- 后台管理系统
- 区块链浏览器验证

## 📄 相关文档

- [后端开发文档](App/Backend/xichang-interface/README.md)
- [后台管理系统文档](App/Counter/hotai/README.md)
- [小程序开发文档](App/WeChatApp/README.md)
- [区块链集成指南](App/Backend/xichang-interface/BLOCKCHAIN_IMPLEMENTATION_GUIDE.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 了解详情

## 👨‍💻 作者

- 项目开发：基于毕业设计

## 🙏 致谢

感谢所有为本项目做出贡献的人！

---

**星标项目** ⭐ 如果这个项目对您有帮助，请给个 Star 支持！

## 📞 联系方式

如有问题，请提交 Issue 或联系项目维护者。

