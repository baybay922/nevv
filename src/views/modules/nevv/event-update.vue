<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.functionId ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm"   label-width="100px">
      <el-form-item label="Event Name" class="required">
        <el-input v-model="dataForm.eventName" placeholder="Event Name" @input="handlerToUpperCase('eventName')"></el-input>
      </el-form-item>

      <el-form-item label="Icon" class="required">
       <el-upload
          class="upload-demo"
          :action="uploadUrl"
          :on-success="iconHandleUpload"
          :file-list="iconImg"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
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

      <el-form-item label="Description" class="required">
        <el-input type="textarea" v-model="dataForm.description" @input="handlerToUpperCase('description')"></el-input>
      </el-form-item>

      <el-form-item label="Rules" class="required">
        <el-input type="textarea" v-model="dataForm.rules" @input="handlerToUpperCase('rules')"></el-input>
      </el-form-item>

      <el-form-item label="Registration Url" class="required">
        <el-input v-model="dataForm.resUrl" placeholder="https://"></el-input>
      </el-form-item>

      <el-form-item label="Tournament Url" class="required" >
        <el-input v-model="dataForm.tourUrl" placeholder="https://"></el-input>
      </el-form-item>

      <el-form-item label="Background Image" class="required">
       <el-upload
          class="upload-demo"
          :action="uploadUrl"
          :on-success="bgHandleUpload"
          :file-list="bgImg"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Sort" >
        <el-input v-model="dataForm.sortActivity" type="number" placeholder="Sort"></el-input>
      </el-form-item>

      <el-form-item label="Publishing" >
        <el-switch v-model="dataForm.isRecommend" :disabled="disabled"></el-switch>
      </el-form-item>

      <el-form-item label="Transfer Event Point">
        <el-switch v-model="dataForm.isEnabled"></el-switch>
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
        uploadUrl:window.SITE_CONFIG['baseUrl']+"/public/cos/uploadfile",
        visible: false,
        disabled:false,
        dataForm: {
          functionId:"",
          eventName:"",
          startTime:"",
          endTime:"",
          description:"",
          rules:"",
          resUrl:"",
          tourUrl:"",
          sortActivity:"",
          isEnabled:false,
          isRecommend:false,
        },
        isChangePublishing:"",
        isChangeTransfer:"",
        iconImg: [],
        bgImg:[],
        options: [{
          value: '0',
          label: 'Action'
        }]
      }
    },
    methods: {
      init (id) {
        this.dataForm.functionId = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.functionId) {
            this.$http({
              url: this.$http.adornUrl("/event/pc/findEventInfo"),
              method: 'post',
              data: this.$http.adornData({
                'functionId':this.dataForm.functionId
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.functionId = data.data.eventId
                this.dataForm.eventName = data.data.eventName;
                this.dataForm.startTime = data.data.startTime;
                this.dataForm.endTime = data.data.endTime;
                this.dataForm.description = data.data.description;
                this.dataForm.rules = data.data.rules;
                this.dataForm.resUrl = data.data.resUrl;
                this.dataForm.tourUrl = data.data.tourUrl;
                this.dataForm.sortActivity = data.data.sortActivity;
                this.dataForm.isEnabled = data.data.isEnabled===1?true:false
                this.dataForm.isRecommend = data.data.isRecommend===1?true:false
                this.isChangePublishing = data.data.isEnabled===1?true:false
                this.isChangeTransfer = data.data.isRecommend===1?true:false
                let _iconImg = [];
                _iconImg.push({url:data.data.eventImgCover})
                this.iconImg = _iconImg;
                let _bgImg = [];
                _bgImg.push({url:data.data.backgroundImg})
                this.bgImg = _bgImg;
                this.disabled = false
              }
            })
          }else{
            this.dataForm.eventName = ""
            this.dataForm.startTime = ""
            this.dataForm.endTime = ""
            this.dataForm.description = ""
            this.dataForm.rules = ""
            this.dataForm.resUrl = ""
            this.dataForm.tourUrl = ""
            this.dataForm.sortActivity = ""
            this.dataForm.isEnabled = false
            this.dataForm.isRecommend = false
            this.iconImg = [];
            this.bgImg = [];
            this.disabled = true
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(!this.compareDate()){
          this.$message.error("The end time cannot be greater than the activity time");
          return;
        }
        if(this.dataForm.eventName == ""){
          this.$message.error("Event Name can not be empty");
          return;
        }
        if(this.iconImg.length <= 0){
          this.$message.error("Icon can not be empty");
          return;
        }

        if(this.dataForm.description == ""){
          this.$message.error("Description can not be empty");
          return;
        }
        console.log()
        if(this.dataForm.rules == ""){
          this.$message.error("Rules can not be empty");
          return;
        }
        
        if(this.dataForm.resUrl == ""){
          this.$message.error("Registeration Url can not be empty");
          return;
        }
        if(this.dataForm.tourUrl == ""){
          this.$message.error("Tournament Url can not be empty");
          return;
        }
        if(!this.inHttpsLink(this.dataForm.resUrl)){
          this.$message.error("Registeration Url must start with http or https");
          return;
        }
        if(!this.inHttpsLink(this.dataForm.tourUrl)){
          this.$message.error("Tournament Url must start with http or https");
          return;
        }
        if(this.bgImg.length <= 0){
          this.$message.error("Background Image can not be empty");
          return;
        }
        if((this.isChangePublishing !== this.dataForm.isEnabled || this.isChangeTransfer !== this.dataForm.isRecommend) && this.dataForm.functionId){
          this.common.isCheckSecoundPasswrod((flag)=>{
            if(flag){
              this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                  this.$http({
                    url: this.$http.adornUrl(`/event/pc/${!this.dataForm.functionId ? 'addEvent' : 'editEvent'}`),
                    method: 'post',
                    data: this.$http.adornData({
                      'eventId': this.dataForm.functionId || undefined,
                      'eventName': this.dataForm.eventName,
                      'eventImgCover': this.iconImg.length>0?this.iconImg[0].url:"",
                      'startTime': this.dataForm.startTime,
                      'endTime': this.dataForm.endTime,
                      'description': this.dataForm.description,
                      'rules':this.dataForm.rules,
                      'resUrl':this.dataForm.resUrl,
                      'tourUrl':this.dataForm.tourUrl,
                      'backgroundImg': this.bgImg.length>0?this.bgImg[0].url:"",
                      'sortActivity':this.dataForm.sortActivity,
                      'isEnabled':this.dataForm.isEnabled?1:0,
                      'isRecommend':this.dataForm.isRecommend?1:0,
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
            }
          })
        }else{
          this.$refs['dataForm'].validate((valid) => {
            if (valid) {
              this.$http({
                url: this.$http.adornUrl(`/event/pc/${!this.dataForm.functionId ? 'addEvent' : 'editEvent'}`),
                method: 'post',
                data: this.$http.adornData({
                  'eventId': this.dataForm.functionId || undefined,
                  'eventName': this.dataForm.eventName,
                  'eventImgCover': this.iconImg.length>0?this.iconImg[0].url:"",
                  'startTime': this.dataForm.startTime,
                  'endTime': this.dataForm.endTime,
                  'description': this.dataForm.description,
                  'rules':this.dataForm.rules,
                  'resUrl':this.dataForm.resUrl,
                  'tourUrl':this.dataForm.tourUrl,
                  'backgroundImg': this.bgImg.length>0?this.bgImg[0].url:"",
                  'sortActivity':this.dataForm.sortActivity,
                  'isEnabled':this.dataForm.isEnabled?1:0,
                  'isRecommend':this.dataForm.isRecommend?1:0,
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
        }
        
      },
      iconHandleUpload(response, file, fileList){//上传封面图
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.iconImg = files
        }else{
          this.$message.error(data.msg)
        }
      },
      bgHandleUpload(response, file, fileList){//上传背景图
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.bgImg = files
        }else{
          this.$message.error(data.msg)
        }
      },
      compareDate(){//比较时间
        if(this.dataForm.startTime !=="" && this.dataForm.endTime !=="" && this.dataForm.startTime !== this.dataForm.endTime){
          let d1 = this.dataForm.endTime,
              d2 = this.dataForm.startTime;
              console.log((new Date(d1.replace(/-/g,"\/"))))
          return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
        }else{
          return true;
        }
      },
      inHttpsLink(str){
        if(str.indexOf("http://") != -1 || str.indexOf("https://") != -1 ){
          return true;
        }
        return false;
      },
      handlerToUpperCase(variate){ //切换大写  
        this.dataForm[variate] = this.dataForm[variate].toUpperCase();
      }
    }
  }
</script>
