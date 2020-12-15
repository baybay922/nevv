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

      <el-form-item label="Image"  class="required">
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Title"  class="required">
        <el-input v-model="dataForm.watchTitle" placeholder="Title"></el-input>
      </el-form-item>

      <el-form-item label="Plat URL"  class="required">
        <el-input v-model="dataForm.eventWatchUrl" placeholder="Plat URL"></el-input>
      </el-form-item>
      
      <el-form-item label="Banner">
        <el-switch v-model="dataForm.isBanner"></el-switch>
      </el-form-item>

      <el-form-item label="Sort">
        <el-input v-model="dataForm.sort" type="number" placeholder="sort"></el-input>
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
          watchTitle:"",
          eventWatchUrl:"",
          isBanner:false,
          sort:""
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
              url: this.$http.adornUrl('/eventWatch/pc/findWatchInfo'),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.id = data.data.id;
                this.dataForm.eventId = data.data.eventId;
                this.dataForm.watchTitle = data.data.watchTitle;
                this.dataForm.eventWatchUrl = data.data.eventWatchUrl;
                this.dataForm.isBanner = data.data.isBanner===1?true:false;
                this.dataForm.sort = data.data.sort;
                let files = [];
                files.push({url:data.data.eventWatchImg})
                this.fileList = files;
              }else{
                this.$message.error(data.msg)
              }
            })
          }else{
            this.dataForm.eventId = "";
            this.dataForm.watchTitle = "";
            this.dataForm.eventWatchUrl = "";
            this.dataForm.isBanner = false;
            this.dataForm.sort = "";
            this.fileList = [];
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.eventId == ""){
          this.$message.error("Relate to Event can not be empty");
          return;
        }
        if(this.fileList.length <= 0){
          this.$message.error("Image can not be empty");
          return;
        }
        if(this.dataForm.watchTitle == ""){
          this.$message.error("Title can not be empty");
          return;
        }
        if(this.dataForm.eventWatchUrl == ""){
          this.$message.error("Plat URL can not be empty");
          return;
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/eventWatch/pc/${!this.dataForm.id ? 'addWatch' : 'editWatch'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'eventId': this.dataForm.eventId,
                'watchTitle': this.dataForm.watchTitle,
                'eventWatchUrl': this.dataForm.eventWatchUrl,
                'eventWatchImg': this.fileList.length>0?this.fileList[0].url:"",
                'isBanner': this.dataForm.isBanner ? 1 : 0,
                'sort': this.dataForm.sort,
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
    }
  }
</script>
