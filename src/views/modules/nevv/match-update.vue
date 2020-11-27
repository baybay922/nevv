<template>
  <el-dialog
    class="dialog watchDialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event" prop="Name">
        <el-select v-model="dataForm.Genre" filterable placeholder="Favorite Game  Genre">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Team A Name" prop="Team A Name">
        <el-input v-model="dataForm.Nevv" placeholder="Nevv"></el-input>
      </el-form-item>

      <el-form-item label="Team B Name" prop="Team B Name">
        <el-input v-model="dataForm.Nevv" placeholder="Nevv"></el-input>
      </el-form-item>

      <el-form-item label="Predict" prop="Predict">
        <el-col :span="24" class="toolbar">
          <el-button type="primary">Add</el-button>
        </el-col>

      <!--列表-->
      <el-table class="userTable" border :data="dataList" highlight-current-row>
        <el-table-column prop="Title" label="Title"></el-table-column> 
        <el-table-column prop="A Icon" label="A Icon"></el-table-column> 
        <el-table-column prop="B Icon" label="B Icon"></el-table-column> 
        <el-table-column prop="Minimum Point Reguired" label="Minimum Point Reguired" width="250"></el-table-column> 
        <el-table-column prop="Winner" label="Winner"></el-table-column> 
        <el-table-column label="Operation" width="150">
          <template slot-scope="scope">
            <el-link icon="el-icon-edit">Edit</el-link>
            <el-link icon="el-icon-check">Block</el-link>
          </template>
        </el-table-column>
      </el-table>
      </el-form-item>

      <el-form-item label="Schedule From" prop="cronExpression">
        <el-date-picker
          v-model="dataForm.BirthDate"
          type="date"
          placeholder="Birth Date">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Schedule To" prop="cronExpression">
        <el-date-picker
          v-model="dataForm.BirthDate"
          type="date"
          placeholder="Birth Date">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="Blocked" prop="Blocked">
        <el-switch v-model="dataForm.Blocked"></el-switch>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Save</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        dataList:[],
        visible: false,
        dataForm: {
          id: 0,
          Name:"",
          Avatar:"",
          Description:"",
          Phone:"",
          BirthDate:"",
          Gender:"Male",
          Country:"",
          City:"",
          Genre:"",
          Nevv:"",
          Blocked:false
        },
        dataRule: {
          beanName: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
          ]
        },
        fileList: [
          {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
        ],
        options: [{
          value: '0',
          label: 'Action'
        }]
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/sys/schedule/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
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
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
    }
  }
</script>
<style>
.watchDialog .el-dialog{
  width: 80%!important;
}
</style>
