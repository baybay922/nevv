<template>
  <div class="site-wrapper site-page--login">
    <div class="site-content__wrapper">
      <div class="site-content">
        <div class="login-head">
          <div class="login-logo">
            <img src="~@/assets/img/logo.jpg" alt="">
          </div>
          <div class="login-name">Nevvorld Admin Dashboard</div>
          <div class="login-version">V 1.0.0</div>
        </div>
        <div class="login-main">
          <h3 class="login-title">Login</h3>
          <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" status-icon>
            <el-form-item prop="userName">
              <el-input v-model="dataForm.userName" placeholder="Please input your email account"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="dataForm.password" type="password" placeholder="Please input your password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="login-btn-submit" type="primary" @click="dataFormSubmit()" :loading="isLogin">{{isLogin?'Loging':'Login'}}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getUUID } from '@/utils'
  export default {
    data () {
      return {
        isLogin:false,
        dataForm: {
          userName: '',
          password: ''
        },
        dataRule: {
          userName: [
            { required: true, message: 'Account cannot be empty', trigger: 'blur' }
          ],
          password: [
            { required: true, message: 'password can not be blank', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 提交表单
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.isLogin = true;
            this.$http({
              url: this.$http.adornUrl('/login/pwdPcLogin'),
              method: 'post',
              data: this.$http.adornData({
                'userName': this.dataForm.userName,
                'password': this.dataForm.password
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.$cookie.set('token', data.data.token)
                this.$cookie.set('userName', data.data.userName)
                this.$router.replace({ name: 'home' })
              } else {
                this.$message.error(data.msg)
                this.isLogin = false;
              }
            }).catch(() => {
              this.isLogin = false;
            })
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .site-wrapper.site-page--login {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(38, 50, 56, .6);
    overflow: hidden;
    &:before {
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      content: "";
      background-image: url(~@/assets/img/login_bg.jpg);
      background-size: cover;
    }
    .site-content__wrapper {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: transparent;
    }
    .site-content {
      width: 450px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-content: center;
      padding: 0;
      flex-direction: column;
      margin: 0 auto;
    }
    .brand-info {
      margin: 220px 100px 0 90px;
      color: #fff;
    }
    .brand-info__text {
      margin:  0 0 22px 0;
      font-size: 48px;
      font-weight: 400;
      text-transform : uppercase;
    }
    .brand-info__intro {
      margin: 10px 0;
      font-size: 16px;
      line-height: 1.58;
      opacity: .6;
    }
    .login-main {
      padding:0 60px;
      background-color: #fff;
    }
    .login-title {
      font-size: 16px;
      text-align: center;
    }
    .login-captcha {
      overflow: hidden;
      > img {
        width: 100%;
        cursor: pointer;
      }
    }
    .login-btn-submit {
      width: 100%;
      margin-top: 38px;
    }
    .login-head{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .login-logo{
      width: 60px;
      height: 60px;
      background: #fff;
      border-radius: 50%;
      overflow: hidden;
      img{
        width: 100%;
      }
    }
    .login-name{
      color: #fff;
      font-size: 26px;
      margin-top: 20px;
    }
    .login-version{
      text-align: center;
      color: #fff;
      margin-bottom: 20px;
    }
  }
</style>
