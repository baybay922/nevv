<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.userId ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="*In-Game Name" class="required">
        <el-input v-model="dataForm.ign" placeholder="In-Game Name"></el-input>
      </el-form-item>

      <el-form-item label="Avatar" >
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUpload"
          :file-list="fileList"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Email" >
        <el-input v-model="dataForm.email" placeholder="Email"></el-input>
      </el-form-item>

      <el-form-item label="RealName" >
        <el-input v-model="dataForm.realName" placeholder="RealName"></el-input>
      </el-form-item>

      <el-form-item label="Phone Number" >
        <el-input v-model="dataForm.phone" placeholder="Phone Number"></el-input>
      </el-form-item>

      <el-form-item label="Birth Date" >
        <el-date-picker
          v-model="dataForm.birthdate"
          type="date"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          placeholder="Birth Date">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Gender" size="30">
        <el-select v-model="dataForm.genter" placeholder="Gender">
          <el-option
            v-for="item in config.genter"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Province">
        <el-select v-model="dataForm.province" placeholder="Province" @change="selectCityName($event)">
          <el-option
            v-for="item in config.countryArray"
            :key="item.province_id"
            :label="item.province"
            :value="item.province_id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="City" >
        <el-select v-model="dataForm.city" placeholder="City" @change="selectCityText($event)">
          <el-option
            v-for="item in config.cityArray"
            :key="item.city_id"
            :label="item.city_name"
            :value="item.city_id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Favorite Game Genre">
        <el-select v-model="dataForm.fgameGen" placeholder="Favorite Game Genre">
          <el-option
            v-for="item in config.favorite"
            :key="item.id"
            :label="item.genreName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Blocked" >
        <el-switch v-model="dataForm.isLocked"></el-switch>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Save</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import countrys from '../../../../static/json/country';
  import { jsonp } from 'vue-jsonp'
 
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          userId: "",
          email:"",
          realName:"",
          ign:"",
          phone:"",
          birthdate:"",
          genter:"",
          province:"",
          provinceName:"",
          city:"",
          cityName:"",
          fgameGen:"",
          isLocked:true
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now() - 8.64e6;//如果没有后面的-8.64e6就是不可以选择今天
          }
        }, 
        fileList: [],
        config:{
          favorite: [
            {
              id:'',
              genreName:'No Selected'
            },
          ],
          countryArray:[
            {
              province_id:'',
              province:"No Selected"
            }
          ],
          cityArray:[
            {
              city_id:'',
              city_name:"No Selected"
            }
          ],
          genter:[
            {
              value:0,
              text:'No Selected'
            },{
              value:1,
              text:'Male'
            },{
              value:2,
              text:'Female'
            }
          ]
        }
      }
    },
    methods: {
      //初始化赋值
      init (id) {
        this.dataForm.userId = id || ""
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.userId) {
            this.$http({
              url: this.$http.adornUrl("/user/pc/findUserInfo"),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.userId
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.userId = data.data.userId
                this.dataForm.ign = data.data.ign

                this.dataForm.email = data.data.email
                this.dataForm.realName = data.data.realName

                this.dataForm.phone = data.data.phone
                this.dataForm.birthdate = data.data.birthdate
                this.dataForm.genter = data.data.genter
                this.dataForm.isLocked = data.data.isBlock==0?true:false;
                let files = [];
                files.push({url:data.data.userImg})
                this.fileList = files;
                this.getFavoriteGameList(data.data.fgameGen);
                this.setSelectProvinceArray(data.data.province,data.data.city);
              }else{
                this.$message.error(data.msg)
              }
            })
          }else{
            this.setSelectProvinceArray();
          }
        })
        
      },
      selectCityText(id){//获取市名称
        let _cityText;
        this.config.cityArray.map(item=>{
          if(item.city_id == id){
            _cityText = item.city_name;
          }
        })
        this.dataForm.cityName = _cityText;
      },
      selectProvinceText(id){//获取省份名称
        let _provinceText;
        this.config.countryArray.map(item=>{
          if(item.province_id == id){
            _provinceText = item.province;
          }
        })
        this.dataForm.provinceName = _provinceText;
      },
      selectCityName(id,cityID){//获取城市
        this.$http({
          url: this.$http.adornUrl("/public/rajaongkir/provinceAndCity"),
          method: 'post',
          data: this.$http.adornData({
            'provinceId': id
          })
        }).then(({data}) => {
          if (data && data.code === 20000) {
            let res = JSON.parse(data.data);
            this.config.cityArray = this.config.cityArray.concat(res.rajaongkir.results)
            if(cityID){
              this.dataForm.city = cityID
              this.selectCityText(cityID)
            }
            this.selectProvinceText(id)
          }
        })
      },
      setSelectProvinceArray(id,cityID){//获取省份数组
        this.$http({
          url: this.$http.adornUrl("/public/rajaongkir/provinceAndCity"),
          method: 'post',
          data: this.$http.adornData({
            'provinceId': ""
          })
        }).then(({data}) => {
          if (data && data.code === 20000) {
            let res = JSON.parse(data.data);
            this.config.countryArray = this.config.countryArray.concat(res.rajaongkir.results)
            if(id){
              this.selectCityName(id,cityID)
            }
          }
        })
      },
      //获取最爱的游戏列表
      getFavoriteGameList(id){
        this.$http({
          url: this.$http.adornUrl("/favoriteGameGenre/findGameGenreList"),
          method: 'post'
        }).then(({data}) => {
          if (data && data.code === 20000) {
            this.config.favorite = this.config.favorite.concat(data.data)
            if(id !== ""){
              this.$nextTick(()=>{
                this.dataForm.fgameGen = parseInt(id);
              })
            }
            
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
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.ign == ""){
          this.$message.error('In-Game Name cannot be empty')
          return;
        }
        this.$http({
          url: this.$http.adornUrl('/user/pc/editUser'),
          method: 'post',
          data: this.$http.adornData({
            'userId': this.dataForm.userId,
            'userImg': this.fileList.length>0?this.fileList[0].url:"",
            'ign':this.dataForm.ign,
            'email':this.dataForm.email,
            'realName':this.dataForm.realName,
            'phone': this.dataForm.phone,
            'birthdate': this.dataForm.birthdate,
            'genter': this.dataForm.genter,
            'province': this.dataForm.province,
            'provinceName':this.dataForm.provinceName,
            'city':this.dataForm.city,
            'cityName':this.dataForm.cityName,
            'favoriteGameGenre': this.dataForm.fgameGen,
            'isLocked': this.dataForm.isLocked?0:1
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
</script>
