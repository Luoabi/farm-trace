# 商品创建 farmerId 修复总结

## 问题描述
创建商品时报错：`java.sql.SQLIntegrityConstraintViolationException: Column 'farmer_id' cannot be null`

## 根本原因
1. 前端使用了错误的方式获取 farmerId：`localStorage.getItem('farmerId')` 返回 null
2. 后端 ProductRequest DTO 缺少 farmerId 字段

## 修复方案

### 1. 前端修复 (Counter/hotai/src/views/ProductManagement.vue)
- ✅ 已在组件顶部定义正确的 farmerId 常量：
  ```javascript
  const farmerId = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).id : null;
  ```
- ✅ 在 handleSaveProduct 方法中使用该常量：
  ```javascript
  const submitData = {
    // ... 其他字段
    farmerId: farmerId // 使用顶部定义的 farmerId
  };
  ```

### 2. 后端修复

#### ProductRequest DTO (Backend/.../dto/ProductRequest.java)
- ✅ 已添加 farmerId 字段：
  ```java
  private String farmerId; // 农户ID
  ```

#### Product Model (Backend/.../model/Product.java)
- ✅ 已有 farmerId 字段和 getter/setter

#### ProductServiceImpl (Backend/.../service/impl/ProductServiceImpl.java)
- ✅ createProduct 方法使用 BeanUtils.copyProperties 自动复制 farmerId
- ✅ BeanUtils 会自动将 request.farmerId 复制到 product.farmerId

#### MyBatis Mapper XML (Backend/.../mapper/ProductMapper.xml)
- ✅ INSERT 语句包含 farmer_id 字段：
  ```xml
  INSERT INTO product (id, farmer_id, product_code, ...)
  VALUES (#{id}, #{farmerId}, #{productCode}, ...)
  ```

## 数据流验证

1. 前端获取 farmerId：`JSON.parse(localStorage.getItem('userInfo')).id`
2. 前端发送请求：`productAPI.createProduct({ farmerId, ... })`
3. 后端接收：`ProductRequest.farmerId`
4. 后端复制：`BeanUtils.copyProperties(request, product)` → `product.farmerId`
5. 数据库插入：`INSERT ... farmer_id = #{farmerId}`

## 测试建议

1. 确保 localStorage 中有 userInfo 数据
2. 测试创建商品功能
3. 验证数据库中 farmer_id 字段正确填充
4. 测试按农户ID查询商品列表功能

## 相关文件
- `Counter/hotai/src/views/ProductManagement.vue`
- `Backend/xichang-interface/src/main/java/org/xingchang/xichanginterface/dto/ProductRequest.java`
- `Backend/xichang-interface/src/main/java/org/xingchang/xichanginterface/model/Product.java`
- `Backend/xichang-interface/src/main/java/org/xingchang/xichanginterface/service/impl/ProductServiceImpl.java`
- `Backend/xichang-interface/src/main/resources/mapper/ProductMapper.xml`
