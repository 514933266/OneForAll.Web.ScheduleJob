<template>
  <el-container class="ofa-container column" v-loading="loading">
    <div class="header">
      <div class="title-box">
        <span class="title ofa-text-title">任务日志列表<span class="sub-title" style="margin-left: 10px;">共有<label
              class="ofa-text-primary"> {{total}} </label>条数据</span></span>
      </div>
      <div class="search-box">
        <span>
          <el-input v-model="searchOption.appId" placeholder="AppId" size="small"></el-input>
          <el-input v-model="searchOption.taskName" size="small" placeholder="任务名称"></el-input>
          <el-select v-model="searchOption.type" :clearable="true" placeholder="日志类型" size="small">
            <el-option v-for="item in types" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
          <el-date-picker v-model="searchOption.beginTime" type="datetime" size="small" placeholder="选择开始日期时间"
            format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          <el-date-picker v-model="searchOption.endTime" type="datetime" size="small" placeholder="选择结束日期时间"
            format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          <el-input v-model="searchOption.key" size="small" placeholder="请输入要查询的内容关键字"></el-input>
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
        <el-table-column prop="Type" label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeClass(scope.row)" size="small">{{getTypeName(scope.row)}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="AppId" label="应用程序id" width="200"></el-table-column>
        <el-table-column prop="TaskName" label="任务名称" width="200"></el-table-column>
        <el-table-column show-overflow-tooltips prop="Content" label="备注" min-width="200"></el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="160"></el-table-column>
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
  TASK_LOG
} from '../../../router/job-router'
import { TASK_LOG_TYPE } from '../../../assets/js/job-const'

export default {
  name: TASK_LOG.name,
  data () {
    return {
      types: TASK_LOG_TYPE,
      loading: false, // 加载中
      searchOption: {
        key: '', // 关键字
        appId: '', // 应用程序id
        taskName: '', // 任务名称
        type: '', // 任务类型
        beginTime: '', // 开始日期
        endTime: '' // 结束日期
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.setSearchOption())
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TASK_LOG.name)
    }
  },
  methods: {
    init () {
      if (this.loading) return false
      this.get()
    },
    setSearchOption () {
      if (this.$route.params.AppId) {
        this.searchOption.appId = this.$route.params.AppId
        this.searchOption.taskName = this.$route.params.Name
        this.searchOption.beginTime = new Date().toString('yyyy-MM-dd')
        this.searchOption.endTime = new Date()
      }
    },
    getTypeClass (row) {
      switch (row.Type) {
        case 0: return 'success'
        case 1: return 'success'
        case 2: return 'warning'
        case 3: return ''
        case 4: return 'info'
        case 99: return 'danger'
      }
    },
    getTypeName (row) {
      return this.types.find(w => w.value === row.Type).label
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.TASK_LOG.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          ...this.searchOption,
          type: this.searchOption.type ? this.searchOption.type : -1
        }
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
        const url = this.$root.getApi(API.KEY, API.TASK_LOG.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    updateIsEnabled (entity) {
      const url = this.$root.getApi(API.KEY, API.TASK_LOG.ENABLED).replace(/{id}/, entity.Id)
      this.axios.patch(url)
        .then(response => {
          if (response.Status) this.get()
        })
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
