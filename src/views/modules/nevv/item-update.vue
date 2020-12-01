<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Asset Name">
        <el-input v-model="dataForm.productName" placeholder="Asset Name"></el-input>
      </el-form-item>

      <el-form-item label="Icon">
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-preview="handlePreview"
          :on-success="handleUpload"
          :on-remove="handleRemove"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Description">
        <el-input type="textarea" v-model="dataForm.description"></el-input>
      </el-form-item>

      <el-form-item label="Nevv">
        <el-input v-model="dataForm.nevv" placeholder="nevv"></el-input>
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
          productId: 0,
          productName:"",
          description:"",
          nevv:""
        },
        fileList: [],
        options: [{
          value: '0',
          label: 'Action'
        }]
      }
    },
    methods: {
      init (id) {
        this.dataForm.productId = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.productId) {
            this.$http({
              url: this.$http.adornUrl('/product/pc/findItemInfo'),
              method: 'post',
              data: this.$http.adornData({
                'productId': this.dataForm.productId
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.productId = data.data.productId
                this.dataForm.productName = data.data.productName
                this.dataForm.description = data.data.description
                this.dataForm.nevv = data.data.nevv
                let files = [];
                files.push({url:data.data.showUrl})
                this.fileList = files;
              }else{
                this.$message.error(data.msg)
              }
            })
          }else{
            this.dataForm.productId = ""
            this.dataForm.productName = ""
            this.dataForm.description = ""
            this.dataForm.nevv = ""
            this.fileList = []
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/product/pc/${!this.dataForm.productId ? 'addItem' : 'editItem'}`),
              method: 'post',
              data: this.$http.adornData({
                'productId': this.dataForm.productId || undefined,
                'productName': this.dataForm.productName,
                'showUrl': this.fileList.length>0?this.fileList[0].url:"",
                'description': this.dataForm.description,
                'nevv': this.dataForm.nevv
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
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
      //上传头像
      handleUpload(response, file, fileList){
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.fileList = files
        }else{
          this.$message.error(data.msg)
        }
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
