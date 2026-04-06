<template>
  <div class="api-test-container">
    <el-card header="API 接口测试">
      <el-tabs v-model="activeTab">
        <!-- 用户接口测试 -->
        <el-tab-pane label="用户接口" name="user">
          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-card>
              <template #header>登录测试</template>
              <el-form :model="loginForm" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="loginForm.username" placeholder="testfarmer" />
                </el-form-item>
                <el-form-item label="密码">
                  <el-input v-model="loginForm.password" type="password" placeholder="123456" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="testLogin">测试登录</el-button>
                </el-form-item>
              </el-form>
              <el-divider />
              <div v-if="loginResult">
                <strong>响应结果：</strong>
                <pre>{{ JSON.stringify(loginResult, null, 2) }}</pre>
              </div>
            </el-card>

            <el-card>
              <template #header>获取农户列表</template>
              <el-button type="primary" @click="testGetFarmerList">获取农户列表</el-button>
              <el-divider />
              <div v-if="farmerListResult">
                <strong>响应结果：</strong>
                <pre>{{ JSON.stringify(farmerListResult, null, 2) }}</pre>
              </div>
            </el-card>
          </el-space>
        </el-tab-pane>

        <!-- 商品接口测试 -->
        <el-tab-pane label="商品接口" name="product">
          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-card>
              <template #header>获取商品列表</template>
              <el-button type="primary" @click="testGetProductList">获取商品列表</el-button>
              <el-divider />
              <div v-if="productListResult">
                <strong>响应结果：</strong>
                <pre>{{ JSON.stringify(productListResult, null, 2) }}</pre>
              </div>
            </el-card>
          </el-space>
        </el-tab-pane>

        <!-- 批次接口测试 -->
        <el-tab-pane label="批次接口" name="batch">
          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-card>
              <template #header>获取批次列表</template>
              <el-button type="primary" @click="testGetBatchList">获取批次列表</el-button>
              <el-divider />
              <div v-if="batchListResult">
                <strong>响应结果：</strong>
                <pre>{{ JSON.stringify(batchListResult, null, 2) }}</pre>
              </div>
            </el-card>
          </el-space>
        </el-tab-pane>

        <!-- 订单接口测试 -->
        <el-tab-pane label="订单接口" name="order">
          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-card>
              <template #header>获取订单列表</template>
              <el-button type="primary" @click="testGetOrderList">获取订单列表</el-button>
              <el-divider />
              <div v-if="orderListResult">
                <strong>响应结果：</strong>
                <pre>{{ JSON.stringify(orderListResult, null, 2) }}</pre>
              </div>
            </el-card>
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { userAPI, productAPI, batchAPI, orderAPI } from '@/api';

const activeTab = ref('user');

// 登录表单
const loginForm = ref({
  username: 'testfarmer',
  password: '123456'
});

// 结果数据
const loginResult = ref(null);
const farmerListResult = ref(null);
const productListResult = ref(null);
const batchListResult = ref(null);
const orderListResult = ref(null);

// 测试登录
const testLogin = async () => {
  try {
    const response = await userAPI.login(loginForm.value);
    loginResult.value = response;
    ElMessage.success('登录成功');
  } catch (error) {
    ElMessage.error(error.message || '登录失败');
    loginResult.value = { error: error.message };
  }
};

// 测试获取农户列表
const testGetFarmerList = async () => {
  try {
    const response = await userAPI.getFarmerList({ page: 1, pageSize: 10 });
    farmerListResult.value = response;
    ElMessage.success('获取成功');
  } catch (error) {
    ElMessage.error(error.message || '获取失败');
    farmerListResult.value = { error: error.message };
  }
};

// 测试获取商品列表
const testGetProductList = async () => {
  try {
    const response = await productAPI.getProductList({ page: 1, pageSize: 10 });
    productListResult.value = response;
    ElMessage.success('获取成功');
  } catch (error) {
    ElMessage.error(error.message || '获取失败');
    productListResult.value = { error: error.message };
  }
};

// 测试获取批次列表
const testGetBatchList = async () => {
  try {
    const response = await batchAPI.getBatchList({ page: 1, pageSize: 10 });
    batchListResult.value = response;
    ElMessage.success('获取成功');
  } catch (error) {
    ElMessage.error(error.message || '获取失败');
    batchListResult.value = { error: error.message };
  }
};

// 测试获取订单列表
const testGetOrderList = async () => {
  try {
    const response = await orderAPI.getOrderList({ page: 1, pageSize: 10 });
    orderListResult.value = response;
    ElMessage.success('获取成功');
  } catch (error) {
    ElMessage.error(error.message || '获取失败');
    orderListResult.value = { error: error.message };
  }
};
</script>

<style scoped>
.api-test-container {
  padding: 20px;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
}
</style>
