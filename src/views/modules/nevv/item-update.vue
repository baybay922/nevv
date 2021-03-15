<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.productId ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" label-width="100px">
      <el-form-item label="Asset Name" class="required">
        <el-input v-model="dataForm.productName" placeholder="Asset Name" @input="handlerToUpperCase('productName')"></el-input>
      </el-form-item>

      <el-form-item label="Icon" class="required">
        <el-upload
          class="upload-demo"
          :action="uploadUrl"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Description" class="required">
        <el-input type="textarea" v-model="dataForm.description" @input="handlerToUpperCase('description')"></el-input>
      </el-form-item>

       <el-form-item label="Weight(kg)" class="required">
        <el-input type="number" v-model="dataForm.weight" ></el-input>
      </el-form-item>

      <el-form-item label="Nevv" class="required">
        <el-input v-model="dataForm.nevv" placeholder="nevv" type="number"></el-input>
      </el-form-item>

      <el-form-item label="Stock">
        <el-input v-model="dataForm.productNumber" placeholder="Stock" type="number"></el-input>
      </el-form-item>

      <el-form-item label="Exchanges limited pre user">
        <el-input v-model="dataForm.limitedQuantity" placeholder="Exchanges limited pre user" type="number"></el-input>
      </el-form-item>

      <el-form-item label="Publishing" >
        <el-switch v-model="dataForm.publishing"></el-switch>
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
        dataForm: {
          productId: 0,
          productName:"",
          description:"",
          weight:"",
          nevv:"",
          publishing:false,
          productNumber:"",
          limitedQuantity:""
        },
        isChangePubling:"",
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
                'functionId': this.dataForm.productId
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.productId = data.data.productId
                this.dataForm.productName = data.data.productName
                this.dataForm.description = data.data.description
                this.dataForm.weight = data.data.weight
                this.dataForm.nevv = data.data.nevv
                this.dataForm.productNumber = data.data.productNumber
                this.dataForm.limitedQuantity = data.data.limitedQuantity
                this.dataForm.publishing = data.data.publishing==0?false:true;
                this.isChangePubling = data.data.publishing==0?false:true;
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
            this.dataForm.weight = ""
            this.dataForm.nevv = ""
            this.dataForm.limitedQuantity = ""
            this.dataForm.publishing = ""
            this.dataForm.publishing = false
            this.fileList = []
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.productName == ""){
          this.$message.error("Asset Name can not be empty");
          return;
        }
        if(this.fileList.length <= 0){
          this.$message.error("Icon can not be empty");
          return;
        }

        if(this.dataForm.description == ""){
          this.$message.error("Description can not be empty");
          return;
        }
        if(this.dataForm.weight == "" || this.dataForm.weight <= 0){
          this.$message.error("Weight cannot be less than 0");
          return;
        }

        if(this.dataForm.nevv == ""){
          this.$message.error("Nevv can not be empty");
          return;
        }
        if(this.isChangePubling !== this.dataForm.publishing && this.dataForm.productId){
          this.common.isCheckSecoundPasswrod((flag)=>{
            if(flag){	
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
                      'weight': this.dataForm.weight,
                      'nevv': this.dataForm.nevv,
                      'publishing':!this.dataForm.publishing?0:1,
                      'productNumber': this.dataForm.productNumber,
                      'limitedQuantity':this.dataForm.limitedQuantity
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
                url: this.$http.adornUrl(`/product/pc/${!this.dataForm.productId ? 'addItem' : 'editItem'}`),
                method: 'post',
                data: this.$http.adornData({
                  'productId': this.dataForm.productId || undefined,
                  'productName': this.dataForm.productName,
                  'showUrl': this.fileList.length>0?this.fileList[0].url:"",
                  'description': this.dataForm.description,
                  'weight': this.dataForm.weight,
                  'nevv': this.dataForm.nevv,
                  'publishing':!this.dataForm.publishing?0:1,
                  'productNumber': this.dataForm.productNumber,
                  'limitedQuantity':this.dataForm.limitedQuantity
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
      },
      handlerToUpperCase(variate){ //切换大写  
        this.dataForm[variate] = this.dataForm[variate].toUpperCase();
      }
    }
  }
</script>
