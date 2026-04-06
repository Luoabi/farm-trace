<template>
  <div class="user-management">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateUser">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button @click="handleExportUsers">
          <el-icon><Download /></el-icon>
          导出用户
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 180px;"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            style="width: 150px;"
          >
            <template v-if="isRootAdmin">
              <el-option label="农户" value="FARMER" />
            </template>
            <template v-else-if="isFarmer">
              <el-option label="操作员" value="OPERATOR" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px;"
          >
            <el-option label="启用" value="ACTIVE" />
            <el-option label="禁用" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.registerTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <div class="table-header">
        <span>共 {{ pagination.total }} 个用户</span>
        <el-button-group>
          <el-button type="link" size="small" @click="handleBatchEnable" :disabled="selectedUsers.length === 0">
            <el-icon><Check /></el-icon>
            批量启用
          </el-button>
          <el-button type="link" size="small" @click="handleBatchDisable" :disabled="selectedUsers.length === 0">
            <el-icon><Close /></el-icon>
            批量禁用
          </el-button>
          <el-button type="link" size="small" @click="handleBatchDelete" :disabled="selectedUsers.length === 0">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-button-group>
      </div>
      
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="realName" label="真实姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="getRoleTag(scope.row.userType)">
              {{ scope.row.userType === 'SUPER_ADMIN' ? '超级管理员' : scope.row.userType === 'FARMER' ? '农户' : '操作员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-switch
               v-model="scope.row.status"
              @change="handleStatusChange(scope.row)"
              :disabled="scope.row.username === 'root'"
              active-value="ACTIVE"
              inactive-value="INACTIVE"
            />
            {{ scope.row.status === 'ACTIVE' ? '启用' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewUser(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="link" size="small" @click="handleEditUser(scope.row)" :disabled="scope.row.username === 'admin'">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleResetPassword(scope.row)" :disabled="scope.row.username === 'admin'">
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
            <el-button type="link" size="small" @click="handleDeleteUser(scope.row)" :disabled="scope.row.username === 'admin'">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailVisible"
      title="用户详情"
      width="60%"
      :before-close="handleCloseDetail"
    >
      <div class="user-detail" v-if="currentUser">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentUser.avatar || 'https://via.placeholder.com/80x80?text=User'" />
          <div class="user-basic-info">
            <h3>{{ currentUser.username }}</h3>
            <div class="info-item">
              <el-tag :type="getRoleTag(currentUser.userType)">{{ currentUser.userType === 'SUPER_ADMIN' ? '超级管理员' : currentUser.userType === 'FARMER' ? '农户' : '操作员' }}</el-tag>
              <el-tag :type="currentUser.status === 'ACTIVE' ? 'success' : 'danger'" style="margin-left: 10px;">
                {{ currentUser.status === 'ACTIVE' ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <el-descriptions :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentUser.realName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ currentUser.idCard }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ currentUser.lastLoginTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录IP">{{ currentUser.lastLoginIp }}</el-descriptions-item>
          <el-descriptions-item label="所属组织" :column="2">{{ currentUser.organization || '无' }}</el-descriptions-item>
          <el-descriptions-item label="权限列表" :column="2">
            <div class="permission-list">
              <el-tag
                v-for="permission in currentUser.permissions"
                :key="permission"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ permission }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="userFormVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="50%"
      :before-close="handleCloseForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="120px"
        class="user-form"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="userForm.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <template v-if="!isEdit">
          <el-form-item prop="password" label="密码">
            <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" />
          </el-form-item>
        </template>
        <el-form-item prop="realName" label="真实姓名">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="idCard" label="身份证号">
          <el-input v-model="userForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <!-- 超级管理员只能创建农户 -->
            <template v-if="isRootAdmin">
              <el-option label="农户" value="FARMER" />
            </template>
            <!-- 农户只能创建操作员角色 -->
            <template v-else-if="isFarmer">
              <el-option label="操作员" value="OPERATOR" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="organization" label="所属组织">
          <el-input v-model="userForm.organization" placeholder="请输入所属组织" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-switch
            v-model="userForm.status"
            :active-value="'ACTIVE'"
            :inactive-value="'INACTIVE'"
          />
        </el-form-item>
        <el-form-item prop="permissions" label="权限设置">
          <el-checkbox-group v-model="userForm.permissions">
            <el-checkbox v-for="permission in permissionOptions" :key="permission.value" :label="permission.value">
              {{ permission.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveUser" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="40%"
      :before-close="handleCloseResetPassword"
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.username" disabled />
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input v-model="resetPasswordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseResetPassword">取消</el-button>
        <el-button type="primary" @click="handleConfirmResetPassword" :loading="resetting">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 用户管理组件 - 权限控制系统
 * 
 * 权限控制设计说明：
 * 1. 角色层级结构：超级管理员 > 农户（农场主） > 操作员
 * 2. 父子关系设计：每个非超级管理员用户都有一个父用户，形成树状结构
 *    - 超级管理员可以管理所有的农户（农场主）
 *    - 农户（农场主）可以管理该农场的操作员
 *    - 操作员可以管理商品、订单、生长记录等业务数据
 * 3. 数据隔离：用户只能看到和管理自己权限范围内的用户和数据
 */
import { ref, reactive, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download, Search, RefreshLeft, Check, Close, Delete, View, Edit, Key } from '@element-plus/icons-vue';
import { userAPI } from '../api/modules/user';
 
const store = useStore();
// 当前用户标识和角色检查
const currentUserId = computed(() => store.state.user.id);
const isRootAdmin = computed(() => store.getters.isRootAdmin); // 超级管理员检查
const isFarmer = computed(() => store.getters.isFarmer); // 农户角色检查
const hasUserPermission = computed(() => store.getters.hasPermission('user')); // 用户管理权限检查

const loading = ref(false);
const saving = ref(false);
const resetting = ref(false);
const userFormRef = ref(null);
const resetPasswordFormRef = ref(null);
const userList = ref([]);
const selectedUsers = ref([]);
const currentUser = ref(null);
const userDetailVisible = ref(false);
const userFormVisible = ref(false);
const resetPasswordVisible = ref(false);
const isEdit = ref(false);

// 权限选项
const permissionOptions = [
  { label: '商品管理', value: 'product_manage' },
  { label: '订单管理', value: 'order_manage' },
  { label: '用户管理', value: 'user_manage' },
  { label: '批次管理', value: 'batch_manage' },
  { label: '生长记录管理', value: 'growth_record_manage' }
];

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: '',
  registerTime: []
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  idCard: '',
  role: '',
  status: '启用',
  organization: '',
  permissions: []
});

// 重置密码表单
const resetPasswordForm = reactive({
  username: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
/**
 * 用户表单验证规则
 * 包含字段唯一性检查、格式验证和业务规则验证
 * 特别说明：
 * 1. 编辑模式下密码为可选项
 * 2. 用户名、手机号、邮箱有唯一性约束
 * 3. 密码强度要求：至少包含字母和数字
 * 4. 组织字段对农户用户非必填
 */
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 检查用户名是否已存在（编辑时排除当前用户）
        const existingUser = userList.value.find(
          user => user.username === value && user.id !== userForm.id
        );
        if (existingUser) {
          callback(new Error('用户名已存在'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 密码强度验证：至少包含字母和数字
        if (value && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/.test(value)) {
          callback(new Error('密码必须包含至少一个字母和一个数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: !isEdit.value, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '真实姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 检查手机号是否已存在（编辑时排除当前用户）
        const existingUser = userList.value.find(
          user => user.phone === value && user.id !== userForm.id
        );
        if (existingUser) {
          callback(new Error('手机号已被使用'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 检查邮箱是否已存在（编辑时排除当前用户）
        const existingUser = userList.value.find(
          user => user.email === value && user.id !== userForm.id
        );
        if (existingUser) {
          callback(new Error('邮箱已被使用'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, 
      message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  organization: [
    { 
      required: () => !isFarmer.value, 
      message: '请输入所属组织', 
      trigger: 'blur' 
    }
  ]
};

const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 尝试从API获取数据 这里是获取
    const response = await userAPI.getUserList({
   
    });
    
    userList.value = response.data || [];
    pagination.total = response.data.length || 0;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败: ' + (error.message || '未知错误'));
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取角色标签类型
const getRoleTag = (role) => {
  const roleMap = {
    'SUPER_ADMIN': 'danger',
    'FARMER': 'success',
    'OPERATOR': 'warning'
  };
  return roleMap[role] || 'default';
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  initData();
  ElMessage.success('搜索成功');
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    role: '',
    status: '',
    registerTime: []
  });
  pagination.currentPage = 1;
};

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  initData();
};

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current;
  initData();
};

// 选择变化
const handleSelectionChange = (selection) => {
  // 过滤掉admin用户
  selectedUsers.value = selection.filter(item => item.username !== 'admin');
};

// 状态变化
const handleStatusChange = async (row) => {
  try {
    // 调用API更新用户状态
    await userAPI.updateUserStatus(row.id, row.status);
    ElMessage.success(`用户「${row.username}」状态已变更为${row.status === 'ACTIVE' ? '启用' : '禁用'}`);
  } catch (error) {
    // 状态变更失败，恢复原始状态
    row.status = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    ElMessage.error('状态变更失败: ' + (error.message || '未知错误'));
  }
};

// 查看用户详情
const handleViewUser = (row) => {
  // 调用API获取用户详情
  userAPI.getUserDetail(row.id).then((response) => {
    currentUser.value = response.data;
    userDetailVisible.value = true;
  }).catch(() => {
    ElMessage.error('获取用户详情失败');
  });
};

// 关闭详情
const handleCloseDetail = () => {
  userDetailVisible.value = false;
  currentUser.value = null;
};

// 创建用户
const handleCreateUser = () => {
  if (!hasUserPermission.value) {
    ElMessage.warning('您没有创建用户的权限');
    return;
  }
  
  isEdit.value = false;
  // 重置表单
  Object.assign(userForm, {
    id: '',
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    email: '',
    idCard: '',
    role: '',
    status: '启用',
    organization: isFarmer.value ? store.state.user.organization : '',
    permissions: [],
    farmInfo: null,
    parentId: isFarmer.value ? currentUserId.value : 'user000'
  });
  userFormVisible.value = true;
};

// 编辑用户
const handleEditUser = (row) => {
  // 检查权限：超级管理员可以编辑所有用户，农户只能编辑自己和自己创建的用户
  if (!hasUserPermission.value) {
    ElMessage.warning('您没有编辑用户的权限');
    return;
  }
  
  if (isFarmer.value && row.parentId !== currentUserId.value && row.id !== currentUserId.value) {
    ElMessage.warning('您只能编辑自己和您创建的用户');
    return;
  }
  
  isEdit.value = true;
  // 填充表单数据
  Object.assign(userForm, {
    ...row,
    // 不包含密码
    password: '',
    confirmPassword: ''
  });
  userFormVisible.value = true;
};

// 关闭表单
const handleCloseForm = () => {
  userFormVisible.value = false;
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 保存用户
/**
 * 用户保存函数 - 核心权限控制逻辑
 * 权限控制要点：
 * 1. 超级管理员可以创建/编辑所有角色的用户
 * 2. 农户只能创建/编辑操作员角色，且新用户的parentId指向农户
 * 3. 操作员不能创建用户，只能被创建
 * 4. 用户的父子关系一旦建立不能修改
 * 5. 农户创建的操作员权限不能超过农户本身的权限范围
 */
const handleSaveUser = async () => {
  try {
    // 使用Promise方式进行表单验证
    await userFormRef.value.validate();
    
    saving.value = true;
    
    // 构建用户数据前的最后权限检查
    if (!isRootAdmin.value) {
      // 非超级管理员不能创建管理员或超级管理员
      if (['管理员', '超级管理员'].includes(userForm.role)) {
        throw new Error('您没有权限创建该角色的用户');
      }
    }
    
    // 准备提交数据（根据后端User实体字段调整）
    const submitData = {
      username: userForm.username,
      realName: userForm.realName,
      phone: userForm.phone,
      email: userForm.email,
      idCard: userForm.idCard,
      role: userForm.role,
      status: userForm.status,
      organization: userForm.organization,
      parentId: userForm.parentId
    };
    
    if (isEdit.value) {
      // 编辑用户：调用updateUser API
      await userAPI.updateUser(userForm.id, submitData);
      ElMessage.success('用户更新成功');
      initData(); // 刷新数据
    } else {
      // 创建新用户：调用createUser API
      await userAPI.createUser(submitData);
      ElMessage.success('用户创建成功');
      initData(); // 刷新数据
    }
    
    handleCloseForm();
  } catch (error) {
    // 捕获表单验证错误和业务逻辑错误
    console.error('保存用户失败:', error);
    if (error.message && error.message !== 'Validation failed') {
      ElMessage.error(error.message);
    }
  } finally {
    saving.value = false;
  }
};

// 删除用户
const handleDeleteUser = (row) => {
  // 检查权限：超级管理员可以删除所有用户，农户只能删除自己创建的用户
  if (!hasUserPermission.value) {
    ElMessage.warning('您没有删除用户的权限');
    return;
  }
  
  if (isFarmer.value && row.parentId !== currentUserId.value) {
    ElMessage.warning('您只能删除自己创建的用户');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？删除后数据将无法恢复`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    // 调用deleteUser API
    await userAPI.deleteUser(row.id);
    ElMessage.success('用户删除成功');
    initData(); // 刷新数据
  }).catch(() => {
    // 取消删除
  });
};

// 批量启用
const handleBatchEnable = () => {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedUsers.value.length} 个用户吗？`, '批量操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 调用batchUpdateUsersStatus API
    await userAPI.batchUpdateUsersStatus(selectedUsers.value.map(item => item.id), 1);
    ElMessage.success('批量启用成功');
    initData(); // 刷新数据
    selectedUsers.value = [];
  }).catch(() => {
    // 取消操作
  });
};

// 批量禁用
const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`, '批量操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 调用batchUpdateUsersStatus API
    await userAPI.batchUpdateUsersStatus(selectedUsers.value.map(item => item.id), 0);
    ElMessage.success('批量禁用成功');
    initData(); // 刷新数据
    selectedUsers.value = [];
  }).catch(() => {
    // 取消操作
  });
};

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？删除后数据将无法恢复`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    // 调用batchDeleteUsers API
    await userAPI.batchDeleteUsers(selectedUsers.value.map(item => item.id));
    ElMessage.success('批量删除成功');
    initData(); // 刷新数据
    selectedUsers.value = [];
  }).catch(() => {
    // 取消删除
  });
};

// 导出用户
const handleBatchExport = () => {
  ElMessage.success('用户数据导出成功');
};

// 重置密码
const handleResetPassword = (row) => {
  // 检查权限：超级管理员可以重置所有用户密码，农户可以重置自己和自己创建的用户密码
  if (!hasUserPermission.value) {
    ElMessage.warning('您没有重置密码的权限');
    return;
  }
  
  if (isFarmer.value && row.parentId !== currentUserId.value && row.id !== currentUserId.value) {
    ElMessage.warning('您只能重置自己和您创建的用户的密码');
    return;
  }
  
  Object.assign(resetPasswordForm, {
    username: row.username,
    userId: row.id,
    newPassword: '',
    confirmPassword: ''
  });
  resetPasswordVisible.value = true;
};

// 关闭重置密码对话框
const handleCloseResetPassword = () => {
  resetPasswordVisible.value = false;
  if (resetPasswordFormRef.value) {
    resetPasswordFormRef.value.resetFields();
  }
};

// 确认重置密码
const handleConfirmResetPassword = () => {
  resetPasswordFormRef.value.validate((valid) => {
    if (valid) {
      resetting.value = true;
      setTimeout(() => {
        // 更新用户密码
        const userIndex = userList.value.findIndex(user => user.id === resetPasswordForm.userId);
        if (userIndex > -1) {
          userList.value[userIndex].password = resetPasswordForm.newPassword;
        }
        
        // 同时更新userList中的密码
        const listIndex = userList.value.findIndex(user => user.id === resetPasswordForm.userId);
        if (listIndex > -1) {
          userList.value[listIndex].password = resetPasswordForm.newPassword;
        }
        
        ElMessage.success('密码重置成功');
        handleCloseResetPassword();
        resetting.value = false;
      }, 1000);
    }
  });
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
}

/* 页面标题样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情样式 */
.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-basic-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 权限列表样式 */
.permission-list {
  display: flex;
  flex-wrap: wrap;
}

/* 用户表单样式 */
.user-form {
  max-height: 60vh;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>