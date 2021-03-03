<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="AdminName" class="required">
        <el-input v-model="dataForm.adminUserName" placeholder="Admin Name" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="email" class="required">
        <el-input v-model="dataForm.email" placeholder="email" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="password" class="required">
        <el-input type="password" v-model="dataForm.passWord" placeholder="password" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="Blocked" >
        <el-switch v-model="dataForm.isBlock"></el-switch>
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
          adminUserName:"",
          email:"",
          passWord:"",
          isBlock:false
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || ""
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
           this.$http({
              url: this.$http.adornUrl("/adminUser/pc/findAdminUserInfo"),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.id = data.data.userId
                this.dataForm.adminUserName = data.data.adminUserName
                this.dataForm.email = data.data.email
                this.dataForm.passWord = data.data.passWord
                this.dataForm.isBlock = data.data.isBlock===1?true:false
              }else{
                this.$message.error(data.msg)
              }
            })
          }else{
            this.dataForm.id =  "";
            this.dataForm.adminUserName = "";
            this.dataForm.email = "";
            this.dataForm.passWord = "";
            this.dataForm.isBlock = false;
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.adminUserName == ""){
          this.$message.error("Username can not be empty");
          return;
        }
        if(this.dataForm.email == ""){
          this.$message.error("Email can not be empty");
          return;
        }
        if(this.dataForm.passWord == ""){
          this.$message.error("Password can not be empty");
          return;
        }
        if(this.dataForm.id){
          this.common.isCheckSecoundPasswrod((flag)=>{
            if(flag){
              this.$http({
                url: this.$http.adornUrl(`/adminUser/pc/${!this.dataForm.id ? 'addAdminUser' : 'editAdminUser'}`),
                method: 'post',
                data: this.$http.adornData({
                  'userId': this.dataForm.id || undefined,
                  'adminUserName':this.dataForm.adminUserName,
                  'email':this.dataForm.email,
                  "passWord":this.dataForm.passWord,
                  "isBlock":this.dataForm.isBlock?1:0,
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
        }else{
          this.$http({
            url: this.$http.adornUrl(`/adminUser/pc/${!this.dataForm.id ? 'addAdminUser' : 'editAdminUser'}`),
            method: 'post',
            data: this.$http.adornData({
              'userId': this.dataForm.id || undefined,
              'adminUserName':this.dataForm.adminUserName,
              'email':this.dataForm.email,
              "passWord":this.dataForm.passWord,
              "isBlock":this.dataForm.isBlock?1:0,
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
      }
    }
  }
</script>
