<template>
  <div>
  <el-dialog
    class="dialog watchDialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event">
        <el-select v-model="dataForm.eventId" filterable placeholder="Relate to Event">
          <el-option
            v-for="item in config.eventList"
            :key="item.eventId"
            :label="item.eventName"
            :value="item.eventId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Team A Name">
        <el-input v-model="dataForm.matchTeamNameA" placeholder="Team A Name"></el-input>
      </el-form-item>

      <el-form-item label="Team B Name">
        <el-input v-model="dataForm.matchTeamNameB" placeholder="Team B Name"></el-input>
      </el-form-item>

      <el-form-item label="Predict">
        <el-col :span="24" class="toolbar">
          <el-button type="primary" @click="innerVisible = true">Add</el-button>
        </el-col>

        <!--列表-->
        <el-table class="userTable" border :data="dataForm.matchInfoParamsList" highlight-current-row>
          <el-table-column prop="title" label="Title"></el-table-column> 
          <el-table-column prop="aIcon" label="A Icon"></el-table-column> 
          <el-table-column prop="bIcon" label="B Icon"></el-table-column> 
          <el-table-column prop="least" label="Minimum Point Reguired" width="250"></el-table-column> 
          <el-table-column prop="winner" label="Winner"></el-table-column> 
          <el-table-column label="Operation" width="150">
            <template slot-scope="scope">
              <el-link icon="el-icon-edit">Edit</el-link>
              <el-link icon="el-icon-delete">Delete</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="Schedule From">
        <el-date-picker
          v-model="dataForm.startTime"
          type="datetime"
          placeholder="Schedule From">
        </el-date-picker>
        
      </el-form-item>

      <el-form-item label="Schedule To">
        <el-date-picker
          v-model="dataForm.endTime"
          type="datetime"
          placeholder="Schedule To">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="Blocked">
        <el-switch v-model="dataForm.teamStatus"></el-switch>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Save</el-button>
    </span>
    
  </el-dialog>
  <!-- 添加icon -->
  <el-dialog
      title="Add"
      :visible.sync="innerVisible">
      <el-form :model="innerForm" label-width="100px">
        <el-form-item label="Title">
          <el-input v-model="innerForm.title" placeholder="Title"></el-input>
        </el-form-item>

        <el-form-item label="A Icon">
          <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
        </el-form-item>

        <el-form-item label="B Icon">
          <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button type="primary" @click="innerVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        innerVisible:false,
        dataForm: {
          id: 0,
          eventId:"",
          matchTeamNameA:"",
          matchTeamNameB:"",
          matchInfoParamsList:[],
          startTime:"",
          endTime:"",
          teamStatus:false
        },
        innerForm:{
          title:""
        },
        fileList: [],
        config:{
          eventList:[],
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.getSearchEventList()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl('/eventWatch/pc/findMatchInfo'),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.beanName = data.schedule.beanName
                this.dataForm.params = data.schedule.params
                this.dataForm.cronExpression = data.schedule.cronExpression
                this.dataForm.remark = data.schedule.remark
                this.dataForm.status = data.schedule.status
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/schedule/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'jobId': this.dataForm.id || undefined,
                'beanName': this.dataForm.beanName,
                'params': this.dataForm.params,
                'cronExpression': this.dataForm.cronExpression,
                'remark': this.dataForm.remark,
                'status': !this.dataForm.id ? undefined : this.dataForm.status
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      getSearchEventList(){
        this.$http({
          url: this.$http.adornUrl("/event/pc/searchEventList"),
          method: 'post'
        }).then(({data}) => {
          if (data && data.code === 20000) {
            this.config.eventList = data.data
          } else {
            this.$message.error(data.msg)
          }
        })
      },
    }
  }
</script>
<style>
  .watchDialog .el-dialog{
    width: 80%!important;
  }
  .watchDialog .toolbar{
    margin-bottom: 15px;
  }
</style>
