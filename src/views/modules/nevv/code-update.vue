<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event"  class="required">
        <el-select v-model="dataForm.eventId" filterable placeholder="Relate to Event">
          <el-option
					v-for="item in config.eventList"
					:key="item.eventId"
					:label="item.eventName"
					:value="item.eventId">
					</el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Logo" >
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Code Type"  class="required">
        <el-radio-group v-model="dataForm.couponsType" size="small">
          <el-radio-button label="2">QR Code</el-radio-button>
          <el-radio-button label="1">Unique Code</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Schedule From" >
        <el-date-picker
          v-model="dataForm.startTime"
          type="date"
          value-format="yyyy-MM-dd"    
          placeholder="Schedule From">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Schedule To" >
        <el-date-picker
          v-model="dataForm.endTime"
          type="date"
          value-format="yyyy-MM-dd"    
          placeholder="Schedule To">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Event Points"  class="required">
        <el-input v-model="dataForm.couponsCast" placeholder="Event Points" @input="handlerToUpperCase('couponsCast')"></el-input>
      </el-form-item>

      <el-form-item label="Batch amount" class="required">
        <el-input v-model="dataForm.amount" type="number" placeholder="Batch amount"></el-input>
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
          eventId:"",
          couponsCast:"",
          couponsType:2,
          amount:"",
          startTime:"",
          endTime:""
        },
        fileList: [],
        config:{
          eventList:[]
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
          if (!this.dataForm.id) {
            this.dataForm.eventId = ""
            this.dataForm.couponsCast = ""
            this.dataForm.couponsType = 2
            this.dataForm.amount = ""
            this.dataForm.startTime = ""
            this.dataForm.endTime = ""
            this.fileList = []
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(!this.compareDate()){
          this.$message.error("The end time cannot be greater than the activity time");
          return;
        }
        if(this.dataForm.eventId == ""){
          this.$message.error("Relate to Event can not be empty");
          return;
        }
        if(this.dataForm.couponsType == ""){
          this.$message.error("Code Type can not be empty");
          return;
        }
        if(this.dataForm.couponsCast == ""){
          this.$message.error("Event Points can not be empty");
          return;
        }
        if(this.dataForm.amount == ""){
          this.$message.error("Batch amount can not be empty");
          return;
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/eventCoupon/pc/addCoupon'),
              method: 'post',
              data: this.$http.adornData({
                eventId: this.dataForm.eventId,
                couponsCast: this.dataForm.couponsCast,
                couponsType: this.dataForm.couponsType,
                amount: this.dataForm.amount,
                startTime: this.dataForm.startTime,
                endTime: this.dataForm.endTime,
                logoUrl: this.fileList.length>0?this.fileList[0].url:"",
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.$message({
                  message: 'Success',
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
      handleUpload(response, file, fileList){
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.fileList = files
        }else{
          this.$message.error(data.msg)
        }
      },
      compareDate(){//比较时间
        if(this.dataForm.startTime !=="" && this.dataForm.endTime !=="" && this.dataForm.startTime !== this.dataForm.endTime){
          let d1 = this.dataForm.endTime,
              d2 = this.dataForm.startTime;
          return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
        }else{
          return true;
        }
      },
      handlerToUpperCase(variate){ //切换大写  
        this.dataForm[variate] = this.dataForm[variate].toUpperCase();
      }
    }
  }
</script>
