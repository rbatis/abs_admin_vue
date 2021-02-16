<template>

  <div class="productBody">
    <a-form
      layout="inline"
    >
      <!--<a-form-item>-->
      <!--<a-input-->
      <!--placeholder="请输入手机号"-->
      <!--v-model="queryData.phone"-->
      <!--&gt;-->
      <!--<a-icon-->
      <!--slot="prefix"-->
      <!--type="user"-->
      <!--style="color:rgba(0,0,0,.25)"-->
      <!--/>-->
      <!--</a-input>-->
      <!--</a-form-item>-->
      <a-form-item>
        <a-input
          v-model="queryData.remark"
          placeholder="请输入计划备注"
        >
        </a-input>
      </a-form-item>
      <a-form-item
        :wrapper-col="{ span: 12, offset: 5 }"
      >
        <a-button
          type="primary"
          html-type="submit"
          @click="fetch_no_page"
        >
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <div class="operate">
      <a-button type="dashed" style="width: 100%" icon="plus" @click="addProduct">添加</a-button>
    </div>
    <a-table :columns="columns"
             :rowKey="record => record.id"
             :dataSource="data"
             :pagination="pagination"
             :loading="loading"
             :scroll="{ x: 1280 }"
             @change="handleTableChange"
    >
      <!--<template slot="rate" slot-scope="rate">-->
      <!--{{rate+'%'}}-->
      <!--</template>-->
      <template slot="action" slot-scope="scope">
        <!--{{scope.id}}-->
        <div style="width: 80px">
          <a @click="handleEditProduct(scope)">编辑</a>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDeleteProduct(scope)">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>

      </template>
    </a-table>

    <a-modal
      title="添加"
      v-model="visible"
      :width="600"
      :maskClosable="false"
      @ok="handleAddProduct"

    >
      <a-form
        layout="inline"
      >
        <a-form-item>
          <a-input
            style="width: 300px"
            v-model="dialogData.id"
            placeholder="请输入ID(唯一)">
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-textarea
            :rows="2"
            style="width: 300px"
            v-model="dialogData.value"
            placeholder="请输入值">
          </a-textarea>
        </a-form-item>
        <a-form-item>
          <a-input
            style="width: 300px"
            v-model="dialogData.remark"
            placeholder="请输入备注">
          </a-input>
        </a-form-item>
      </a-form>


    </a-modal>
  </div>

</template>

<script>
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: '12%',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: '5%',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    width: '5%',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '路由',
    dataIndex: 'path',
    width: '5%',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '创建时间',
    dataIndex: 'create_date',
    width: '5%',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '操作',
    // dataIndex: 'create_time',
    width: '5%',
    scopedSlots: {customRender: 'action'},
  },
];


import {resPage} from '@/api/manage'
// import {kvPage, kvAdd, kvUpdate, kvDelete} from '@/api/manage'
// import {showMsg} from '@/utils/data'
import moment from 'moment';

export default {
  mounted() {
    this.fetch();
  },
  data() {
    return {
      data: [],
      pagination: {},
      loading: false,
      columns,

      queryData: {
        id: null,
        remark: null,
        value: null,
        page: 1,
        size: 5
      },
      dialogData: {
        id: null,
        remark: null,
        value: null,
      },
      visible: false,
      dialogMode: "add",
    }
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
      const pager = {...this.pagination};
      pager.current = pagination.current;
      pager.pageSize = 5;
      this.pagination = pager;
      this.queryData.page = pagination.current;
      this.fetch();
    },
    fetch_no_page(){
      this.pagination.current = 1; this.queryData.page=undefined;
      this.fetch();
    },
    fetch() {
      this.loading = true;
      var arg = Object.assign({}, this.queryData);
      if (arg.time_start != null) {
        arg.time_start = arg.time_start.format('YYYY-MM-DD hh:mm:ss')
      }
      if (arg.time_end != null) {
        arg.time_end = arg.time_end.format('YYYY-MM-DD hh:mm:ss')
      }
      //取分页数据
      resPage(arg).then((res) => {
        //alert(JSON.stringify(res))
        const pagination = {...this.pagination};
        this.loading = false;
        this.data = res.data.records;
        pagination.total = res.data.total;
        pagination.pageSize = res.data.size;
        this.pagination = pagination;
      })
    },

    addProduct: function () {
      this.handleDialogCancel()
      this.visible = true
    },
    //处理添加产品
    handleAddProduct: function () {
      if (this.dialogMode == "add") {
        // kvAdd(this.dialogData)
        //   .then((res) => {
        //     //showMsg(this, res)
        //     this.visible = false;
        //     this.fetch();
        //   })
      } else if (this.dialogMode == "edit") {
        // kvUpdate(this.dialogData)
        //   .then((res) => {
        //     //showMsg(this, res)
        //     this.visible = false;
        //     this.fetch();
        //   })
      } else {
        // kvDelete(this.dialogData)
        //   .then((res) => {
        //     showMsg(this, res)
        //     this.visible = false;
        //     this.fetch();
        //   })
      }
    },
    //handleEditProduct
    handleEditProduct: function (scope) {
      this.visible = true
      this.dialogMode = "edit";
      this.dialogData = Object.assign({}, scope);
    },
    handleDeleteProduct: function (scope) {
      let self = this;
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          // kvDelete(scope)
          //   .then((res) => {
          //     showMsg(self, res)
          //     self.visible = false;
          //     self.fetch();
          //   })
        },
        onCancel() {
          // console.log('Cancel');
        },
        class: 'test',
      });
    },
    handleDialogCancel:function() {
      this.dialogData={
        id: null,
        remark: null,
        value: null,
      }
    }
  },
}
</script>

<style lang="less">
.productBody {
  background: #ffffff;
  padding: 10px;
}
</style>