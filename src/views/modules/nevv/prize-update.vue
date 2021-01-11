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

      <el-form-item label="Icon"  class="required">
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Prize Name" class="required">
        <el-input v-model="dataForm.rankTitle" placeholder="Prize Name"></el-input>
      </el-form-item>

      <el-form-item label="Rank From" class="required">
        <el-input-number v-model="dataForm.rankFrom" :min="0" label="Rank From"></el-input-number>
      </el-form-item>

      <el-form-item label="Rank To" class="required">
        <el-input-number v-model="dataForm.rankTo" :min="0" label="Rank To"></el-input-number>
      </el-form-item>

      <el-form-item label="Event Point">
        <el-input v-model="dataForm.pointNevv" placeholder="Event Point"></el-input>
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
      
      <el-form-item label="Publishing" >
        <el-switch v-model="dataForm.isPush"></el-switch>
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
          eventId: "",
          rankTitle:"",
          isPush:false,
          pointNevv:"",
          startTime:"",
          endTime:"",
          rankFrom:"",
          rankTo:""
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
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl('/eventPpp/pc/findPppInfo'),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.id = data.data.id
                this.dataForm.eventId = data.data.eventId;
                this.dataForm.rankTitle = data.data.rankTitle;
                this.dataForm.isPush = data.data.isPush==0?false:true;
                this.dataForm.pointNevv = data.data.pointNevv;
                this.dataForm.startTime = data.data.startTime;
                this.dataForm.endTime = data.data.endTime;
                this.dataForm.rankFrom = data.data.rankFrom;
                this.dataForm.rankTo = data.data.rankTo;
                let files = [];
                files.push({url:data.data.rankImg})
                this.fileList = files;
              }else{
                this.$message.error(data.msg)
              }
            })
          }else{
            this.dataForm.id = ""
            this.dataForm.eventId = "";
            this.dataForm.rankTitle = "";
            this.dataForm.isPush = false;
            this.dataForm.pointNevv = "";
            this.dataForm.startTime = "";
            this.dataForm.endTime = "";
            this.dataForm.rankFrom = "";
            this.dataForm.rankTo = ""
            this.fileList = [];
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
        if(this.fileList.length <= 0){
          this.$message.error("Icon can not be empty");
          return;
        }
        if(this.dataForm.rankTitle == ""){
          this.$message.error("Prize Name can not be empty");
          return;
        }
        if(this.dataForm.rankFrom ==""){
           this.$message.error("Rank From can not be empty");
            return;
        }

        if(this.dataForm.rankTo ==""){
           this.$message.error("Rank To can not be empty");
            return;
        }

        if(!this.compareNumber()){
          this.$message.error("Rank From cannot be greater than Rank To");
          return;
        }

        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/eventPpp/pc/${!this.dataForm.id ? 'addPpp' : 'editPpp'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'eventId': this.dataForm.eventId,
                'rankTitle': this.dataForm.rankTitle,
                'rankImg':this.fileList.length>0?this.fileList[0].url:"",
                'isPush': this.dataForm.isPush?1:0,
                'pointNevv': this.dataForm.pointNevv,
                'startTime': this.dataForm.startTime,
                'endTime': this.dataForm.endTime,
                'rankFrom': this.dataForm.rankFrom,
                'rankTo': this.dataForm.rankTo
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
      compareNumber(){//比較rank
        if(this.dataForm.rankFrom !=="" && this.dataForm.rankTo !=="" && this.dataForm.rankFrom !== this.dataForm.rankTo){
          let d1 = this.dataForm.rankFrom,
              d2 = this.dataForm.rankTo;

          return d1 < d2;
        }else{
          return true;
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
      }
    }
  }
</script>
