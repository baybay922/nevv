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

      <el-form-item label="Code"  class="required">
        <el-input v-model="dataForm.promoCode" placeholder="happy new year"></el-input>
      </el-form-item>

      <el-form-item label="Schedule From">
        <el-date-picker
          v-model="dataForm.startTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="Schedule From">
        </el-date-picker>
        
      </el-form-item>

      <el-form-item label="Schedule To">
        <el-date-picker
          v-model="dataForm.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="Schedule To">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Event Points" class="required">
        <el-input-number v-model="dataForm.promoPoint" :min="1" label="Event Points"></el-input-number>
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
          id: "",
          eventId:"",
          eventName:"",
          promoCode:"",
          promoPoint:"",
          startTime:"",
          endTime:""
        },
        config:{
          eventList:[]
        }
      }
    },
    methods: {
      init (data) {
        this.dataForm.id = data.id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.getSearchEventList()
          if (this.dataForm.id) {
            this.dataForm.id = data.id;
            this.dataForm.eventId = data.eventId;
            this.dataForm.eventName = data.eventName;
            this.dataForm.promoCode = data.promoCode;
            this.dataForm.promoPoint = data.promoPoint;
            this.dataForm.startTime = data.startTime;
            this.dataForm.endTime = data.endTime;
          }else{
            this.dataForm.id = "";
            this.dataForm.eventId = "";
            this.dataForm.eventName = "";
            this.dataForm.promoCode = "";
            this.dataForm.promoPoint = "";
            this.dataForm.startTime = "";
            this.dataForm.endTime = "";
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.eventId == ""){
          this.$message.error("Relate to Event can not be empty");
          return;
        }
        if(!this.compareDate()){
          this.$message.error("The end time cannot be greater than the activity time");
          return;
        }
        if(this.dataForm.eventWatchUrl == ""){
          this.$message.error("Plat URL can not be empty");
          return;
        }

        this.config.eventList.map(e=>{
          if(this.dataForm.eventId == e.eventId){
            this.dataForm.eventName = e.eventName
          }
        })
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/eventPromo/pc/${!this.dataForm.id ? 'addPromo' : 'editPromo'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'eventId': this.dataForm.eventId,
                'eventName': this.dataForm.eventName,
                'promoCode': this.dataForm.promoCode,
                'promoPoint': this.dataForm.promoPoint,
                'startTime': this.dataForm.startTime,
                'endTime': this.dataForm.endTime
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
      compareDate () {//比较时间
        if(this.dataForm.startTime !=="" && this.dataForm.endTime !=="" && this.dataForm.startTime !== this.dataForm.endTime){
          var oDate1 = new Date(this.dataForm.startTime);
          var oDate2 = new Date(this.dataForm.endTime);
          if(oDate1.getTime() > oDate2.getTime()){
              return false
          }
        }
        return true
        
      },
      handlerToUpperCase(variate){ //切换大写  
        this.dataForm[variate] = this.dataForm[variate].toUpperCase();
      }
    }
  }
</script>
