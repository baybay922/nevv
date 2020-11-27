<template>
  <el-dialog
    class="dialog"
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

      <el-form-item label="Image" prop="params">
        <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Title" prop="Title">
        <el-input v-model="dataForm.Nevv" placeholder="Nevv"></el-input>
      </el-form-item>

      <el-form-item label="Plat URL" prop="Plat URL">
        <el-input v-model="dataForm.Nevv" placeholder="Nevv"></el-input>
      </el-form-item>
      
      <el-form-item label="Banner" prop="Banner">
        <el-switch v-model="dataForm.Blocked"></el-switch>
      </el-form-item>

      <el-form-item label="Sort" prop="Sort">
        <el-input v-model="dataForm.Nevv" placeholder="Nevv"></el-input>
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
