<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event" class="required">
        <el-select v-model="dataForm.eventId" placeholder="Relate to Event">
          <el-option
            v-for="item in config.eventList"
            :key="item.eventId"
            :label="item.eventName"
            :value="item.eventId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Title" class="required">
        <el-input v-model="dataForm.questName" placeholder="Title"></el-input>
      </el-form-item>

      <el-form-item label="Rules" class="required">
        <el-input type="textarea" v-model="dataForm.questRule" placeholder="Rules"></el-input>
      </el-form-item>

      <el-form-item label="FAQ" class="required">
        <el-input type="textarea" v-model="dataForm.questFaq" placeholder="FAQ"></el-input>
      </el-form-item>

      <el-form-item label="Objective" class="required">
        <el-col :span="11">
          <el-select v-model="dataForm.questType" placeholder="Objective">
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

      <el-form-item label="Event Point" class="required">
        <el-input v-model="dataForm.questCast" placeholder="Event Point"></el-input>
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
          eventId:"",
          questName:"",
          questRule:"",
          questFaq:"",
          questType:"",
          questUrl:"",
          questCast:"",
          startTime:"",
          endTime:""
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
              url: this.$http.adornUrl('/eventQuest/pc/findQuestInfo'),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.id = data.data.id;
                this.dataForm.eventId = data.data.eventId;
                this.dataForm.questName = data.data.questName;
                this.dataForm.questRule = data.data.questRule;
                this.dataForm.questFaq = data.data.questFaq;
                this.dataForm.questType = parseInt(data.data.questType);
                this.dataForm.questUrl = data.data.questUrl;
                this.dataForm.questCast = data.data.questCast;
                this.dataForm.startTime = data.data.startTime;
                this.dataForm.endTime = data.data.endTime;
              }
            })
          }else{
            this.dataForm.id = "";
            this.dataForm.eventId = "";
            this.dataForm.questName = "";
            this.dataForm.questRule = "";
            this.dataForm.questFaq = "";
            this.dataForm.questType = "";
            this.dataForm.questUrl = "";
            this.dataForm.questCast = "";
            this.dataForm.startTime = "";
            this.dataForm.endTime = "";
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
        if(this.dataForm.questName == ""){
          this.$message.error("Title can not be empty");
          return;
        }
        if(this.dataForm.questRule == ""){
          this.$message.error("Rules can not be empty");
          return;
        }
        if(this.dataForm.questFaq == ""){
          this.$message.error("FAQ can not be empty");
          return;
        }
        if(this.dataForm.questType == ""){
          this.$message.error("Objective can not be empty");
          return;
        }

        if(this.dataForm.questType == 1 && this.dataForm.questUrl == ""){
          this.$message.error("Objective Url can not be empty");
          return;
        }

        if(this.dataForm.questCast == ""){
          this.$message.error("Event Point can not be empty");
          return;
        }

        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/eventQuest/pc/${!this.dataForm.id ? 'addQuest' : 'editQuest'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'eventId': this.dataForm.eventId,
                'questName': this.dataForm.questName,
                'questRule': this.dataForm.questRule,
                'questFaq': this.dataForm.questFaq,
                'questType': this.dataForm.questType,
                'questUrl': this.dataForm.questUrl,
                'questCast': this.dataForm.questCast,
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
<style  scoped>
.toolbar{
  padding-bottom: 20px;
}
</style>
