# Polygon Amoy 测试网配置指南

## 📋 为什么使用 Polygon Amoy？

### Mumbai 已停用
- ❌ Polygon Mumbai 测试网已于 2024年4月停止支持
- ✅ Polygon Amoy 是新的官方测试网
- ✅ 功能更强大，性能更好

### Amoy 的优势
- ✅ 交易速度快（2秒确认）
- ✅ Gas 费用极低（几乎免费）
- ✅ 兼容以太坊（可用 Web3j）
- ✅ 稳定可靠
- ✅ 官方长期支持

---

## 🔧 MetaMask 配置

### 方式一：自动添加（推荐）

访问 Chainlist：
```
https://chainlist.org/
```

1. 搜索 "Polygon Amoy"
2. 点击 "Add to MetaMask"
3. 确认添加

### 方式二：手动添加

在 MetaMask 中：

1. 点击网络下拉菜单
2. 选择"添加网络"
3. 填入以下信息：

```
网络名称: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
货币符号: MATIC
区块浏览器: https://amoy.polygonscan.com
```

4. 点击"保存"

---

## 💰 获取测试 MATIC

### 官方水龙头

访问：https://faucet.polygon.technology/

**步骤：**
1. 连接 MetaMask 钱包
2. 选择 "Polygon Amoy"
3. 点击 "Submit"
4. 等待 1-2 分钟
5. 查看钱包余额

**限制：**
- 每24小时可领取一次
- 每次约 0.5 MATIC
- 足够测试使用

### 备用水龙头

如果官方水龙头不可用，可以尝试：

1. **Alchemy Faucet**
   ```
   https://www.alchemy.com/faucets/polygon-amoy
   ```

2. **QuickNode Faucet**
   ```
   https://faucet.quicknode.com/polygon/amoy
   ```

---

## 🌐 RPC 节点选择

### 公共 RPC（免费）

#### 1. 官方 RPC（推荐）
```
https://rpc-amoy.polygon.technology
```
- ✅ 官方维护
- ✅ 稳定可靠
- ⚠️ 可能有速率限制

#### 2. Alchemy（推荐用于生产）
```
https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
```
- ✅ 高性能
- ✅ 免费额度充足
- ✅ 详细的分析工具
- 📝 需要注册：https://www.alchemy.com/

#### 3. Infura
```
https://polygon-amoy.infura.io/v3/YOUR_API_KEY
```
- ✅ 老牌服务商
- ✅ 稳定可靠
- 📝 需要注册：https://infura.io/

---

## 🔍 区块链浏览器

### Polygon Amoy Scan
```
https://amoy.polygonscan.com
```

**功能：**
- 查看交易详情
- 验证智能合约
- 查看账户余额
- 查看 Gas 使用情况

**使用示例：**
```
查看交易：https://amoy.polygonscan.com/tx/0x...
查看地址：https://amoy.polygonscan.com/address/0x...
查看合约：https://amoy.polygonscan.com/address/0x...#code
```

---

## 📊 网络参数对比

| 参数 | Mumbai（已停用） | Amoy（新） |
|------|-----------------|-----------|
| Chain ID | 80001 | 80002 |
| RPC | ❌ 已停用 | ✅ 可用 |
| 区块时间 | ~2秒 | ~2秒 |
| Gas 费用 | 极低 | 极低 |
| 水龙头 | ❌ 不可用 | ✅ 可用 |
| 官方支持 | ❌ 已停止 | ✅ 长期支持 |

---

## 🚀 快速测试

### 1. 检查连接

在浏览器控制台（F12）：
```javascript
// 检查是否连接到 Amoy
ethereum.request({ method: 'eth_chainId' })
  .then(chainId => console.log('Chain ID:', parseInt(chainId, 16)))
// 应该输出: Chain ID: 80002
```

### 2. 查看余额

```javascript
ethereum.request({
  method: 'eth_getBalance',
  params: [ethereum.selectedAddress, 'latest']
}).then(balance => console.log('Balance:', parseInt(balance, 16) / 1e18, 'MATIC'))
```

### 3. 发送测试交易

在 MetaMask 中：
1. 选择 Polygon Amoy 网络
2. 发送少量 MATIC 到另一个地址
3. 在区块浏览器查看交易

---

## 🔐 安全建议

### 测试网钱包
- ✅ 使用专门的测试钱包
- ✅ 不要在测试网钱包存放真实资产
- ✅ 私钥可以相对宽松管理

### 主网钱包
- ⚠️ 绝对不要混用测试网和主网钱包
- ⚠️ 主网私钥要严格保密
- ⚠️ 使用硬件钱包存储大额资产

---

## 📝 配置检查清单

- [ ] MetaMask 已安装
- [ ] Polygon Amoy 网络已添加
- [ ] 已切换到 Amoy 网络
- [ ] 已获取测试 MATIC
- [ ] 钱包余额 > 0
- [ ] 可以访问区块链浏览器
- [ ] 已导出私钥（用于项目配置）

---

## 🆘 常见问题

### Q1: 为什么我的交易一直 pending？
**A:** 
- 检查 Gas 设置是否过低
- 确认网络连接正常
- 等待几分钟，Amoy 通常很快

### Q2: 水龙头领取失败？
**A:**
- 确认已切换到 Amoy 网络
- 检查是否在24小时内已领取
- 尝试备用水龙头

### Q3: RPC 连接失败？
**A:**
- 检查网络连接
- 尝试其他 RPC 节点
- 使用 Alchemy 或 Infura

### Q4: 如何查看我的合约？
**A:**
```
https://amoy.polygonscan.com/address/你的合约地址
```

---

## 🔗 相关链接

### 官方资源
- **Polygon 文档**: https://docs.polygon.technology/
- **Amoy 说明**: https://polygon.technology/blog/introducing-the-amoy-testnet
- **开发者门户**: https://polygon.technology/developers

### 工具
- **Remix IDE**: https://remix.ethereum.org/
- **Chainlist**: https://chainlist.org/
- **Gas Tracker**: https://amoy.polygonscan.com/gastracker

### 社区
- **Discord**: https://discord.gg/polygon
- **Forum**: https://forum.polygon.technology/
- **Twitter**: @0xPolygon

---

## ✅ 配置完成

完成以上步骤后，你就可以：
1. ✅ 在 Polygon Amoy 测试网部署合约
2. ✅ 发送交易
3. ✅ 测试你的 DApp
4. ✅ 在区块链浏览器查看所有活动

**下一步：**
- 将合约地址填入 `application.properties`
- 将私钥填入配置文件
- 启动项目测试上链功能

祝你开发顺利！🎉
