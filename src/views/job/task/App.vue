<template>
  <el-container class="ofa-container column" v-loading="loading">
    <div class="header">
      <div class="title-box">
        <span class="title ofa-text-title">定时任务列表<span class="sub-title" style="margin-left: 10px;">共有<label
              class="ofa-text-primary"> {{total}} </label>条数据</span></span>
      </div>
      <div class="search-box">
        <span>
          <el-input v-model="searchOption.nodeName" placeholder="运行节点" size="small" ></el-input>
          <el-input v-model="searchOption.groupName" placeholder="所属分组" size="small" ></el-input>
          <el-input v-model="searchOption.key" size="small" placeholder="请输入要查询的任务名称"></el-input>
          <el-button type="primary" class="search-btn" size="small" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </span>
        <span>
        </span>
      </div>
    </div>
    <el-main>
      <el-table :data="list" row-key="Id" size="small" class="ofa-table">
        <el-table-column prop="Status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <font-awesome-icon fas icon="circle" :class="getStatusClass(scope.row)"></font-awesome-icon>
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="任务名称" width="200"></el-table-column>
        <el-table-column prop="Cron" label="表达式" width="200"></el-table-column>
        <el-table-column prop="GroupName" label="所属分组" width="200"></el-table-column>
        <el-table-column prop="NodeName" label="运行节点" width="120"></el-table-column>
        <el-table-column show-overflow-tooltips prop="Remark" label="备注" min-width="200"></el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="160"></el-table-column>
        <el-table-column prop="UpdateTime" label="最后修改时间" width="160"></el-table-column>
        <el-table-column prop="RunningTime" label="最后运行时间" width="160"></el-table-column>
        <el-table-column prop="HeartbeatTime" label="心跳时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="toLogPage(scope.row)">日志详情</el-button>
            <el-button type="text" size="small" :class="scope.row.IsEnabled ? 'ofa-text-danger' : 'ofa-text-success'" @click="updateIsEnabled(scope.row)">{{scope.row.IsEnabled ? '禁用' : '启用'}}</el-button>
            <el-button type="text" size="small" class="ofa-text-danger" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange" size="small">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script >
import API from '../../../apis/job-api'
import {
  TASK, TASK_LOG
} from '../../../router/job-router'
import { TASK_STATUS } from '../../../assets/js/job-const'

export default {
  name: TASK.name,
  data () {
    return {
      status: TASK_STATUS,
      loading: false, // 加载中
      searchOption: {
        key: '', // 关键字
        nodeName: '', // 所属节点
        groupName: '' // 所属分组
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TASK.name)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.get()
    },
    getStatusClass (row) {
      return row.Status === 99 ? 'ofa-text-danger' : (row.Status === 1 ? 'ofa-text-success' : 'ofa-text-warning')
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.TASK.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOption
      }).then(response => {
        if (response) {
          this.total = response.Total
          this.list = response.Items
          this.loading = false
        }
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => {
        this.get()
      })
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => {
        this.get()
      })
    },
    search () {
      this.pageIndex = 1
      this.$nextTick(() => {
        this.get()
      })
    },
    del (entity) {
      this.$confirm('确认要删除选中定时任务？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TASK.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    updateIsEnabled (entity) {
      const url = this.$root.getApi(API.KEY, API.TASK.ENABLED).replace(/{id}/, entity.Id)
      this.axios.patch(url)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    toLogPage (row) {
      this.$root.navigate({ ...TASK_LOG, params: row })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: column;
  height: auto !important;
  margin-bottom: 20px;
  padding: 0 20px;

  .title-box {
    padding: 20px 0;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .search-box {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .el-input,
    .el-select,
    .el-date-editor {
      width: 200px;
      margin-right: 10px;
    }
  }
}
</style>
