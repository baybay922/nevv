<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event" >
        <el-select v-model="dataForm.eventId" filterable placeholder="Relate to Event">
          <el-option
            v-for="item in config.eventList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Title" >
        <el-input v-model="dataForm.Nevv" placeholder="Title"></el-input>
      </el-form-item>

      <el-form-item label="Rules" >
        <el-input type="textarea" v-model="dataForm.questRule" placeholder="Rules"></el-input>
      </el-form-item>

      <el-form-item label="FAQ" >
        <el-input type="textarea" v-model="dataForm.questFaq" placeholder="FAQ"></el-input>
      </el-form-item>

      <el-form-item label="Objective" >
        <el-col :span="11">
          <el-select v-model="dataForm.questType" filterable placeholder="Objective">
            <el-option
              v-for="item in config.urls"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="11" v-if="dataForm.questType===1">
           <el-input v-model="dataForm.questUrl" placeholder="https://"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="Event Point">
        <el-input v-model="dataForm.questCast" placeholder="Event Point"></el-input>
      </el-form-item>

      <el-form-item label="Schedule From" >
        <el-date-picker
          v-model="dataForm.startTime"
          type="date"
          placeholder="Schedule From">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Schedule To" >
        <el-date-picker
          v-model="dataForm.endTime"
          type="date"
          placeholder="Schedule To">
        </el-date-picker>
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
        isShowUrl:false,
        config:{
          eventList:[],
          urls:[
            {
              value: 1,
              label: 'Open the url'
            },
            {
              value: 2,
              label: 'Verify code'
            },
            {
              value: 3,
              label: 'Invite friend'
            }
          ]
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
