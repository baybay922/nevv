<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="*In-Game Name">
        <el-input v-model="dataForm.ign" placeholder="In-Game Name"></el-input>
      </el-form-item>

      <el-form-item label="Avatar" >
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

      <el-form-item label="Phone Number" >
        <el-input v-model="dataForm.phone" placeholder="Phone Number"></el-input>
      </el-form-item>

      <el-form-item label="Birth Date" >
        <el-date-picker
          v-model="dataForm.birthdate"
          type="date"
          value-format="yyyy-MM-dd"
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

      <el-form-item label="Country" >
        <el-select v-model="dataForm.country" placeholder="Country" @change="selectCityName($event)">
          <el-option
            v-for="item in config.countryArray"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="City" >
        <el-select v-model="dataForm.city" placeholder="City">
          <el-option
            v-for="item in config.cityArray"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Favorite Game Genre" >
        <el-select v-model="dataForm.fgameGen" placeholder="Favorite Game Genre">
          <el-option
            v-for="item in config.favorite"
            :key="item.id"
            :label="item.genreName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Nevv" >
        <el-input v-model="dataForm.nevv" placeholder="Nevv"></el-input>
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
          ign:"",
          phone:"",
          birthdate:"",
          genter:"",
          country:"",
          city:"",
          fgameGen:"",
          nevv:"",
          isLocked:true
        },
        fileList: [],
        config:{
          favorite: [],
          countryArray:[],
          cityArray:[],
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
            this.setSelectCountryArray();
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
                this.dataForm.phone = data.data.phone
                this.dataForm.birthdate = data.data.birthdate
                this.dataForm.genter = data.data.genter
                this.dataForm.country = data.data.country
                this.dataForm.city = data.data.city
                this.dataForm.fgameGen = data.data.fgameGen
                this.dataForm.nevv = data.data.nevvCash
                this.dataForm.isLocked = data.data.isBlock==0?true:false;
                let files = [];
                files.push({url:data.data.userImg})
                this.fileList = files;
                this.getFavoriteGameList(data.data.fgameGen);
              }else{
                this.$message.error(data.msg)
              }
            })
          }
        })
        
      },
      selectCityName(event){//获取城市
        let _cityChiren = [];
        let PCANEN = countrys.split("#");
        for (let i = 0; i < PCANEN.length; i++) {
          if(PCANEN[i].split("$")[0] !== ""){
            
            let value = PCANEN[i].split("$")[0];
            if(event === value){
              let _citys = PCANEN[i].split("$")[1].split(",");
              
              for(let j =0; j < _citys.length; j++){
                if(_citys[j] !== ""){
                  let _city = {};
                  _city.value = _citys[j];
                  _city.label = _citys[j];
                  _cityChiren.push(_city)
                }
              }
            }
          }
        }
        this.config.cityArray = _cityChiren
      },
      setSelectCountryArray(){//获取国家
        // let countryArray = [];
        // let PCANEN = countrys.split("#");
        
        // for (let i = 0; i < PCANEN.length; i++) {
        //   if(PCANEN[i].split("$")[0] !== ""){
        //     let _citys = PCANEN[i].split("$")[1].split(",");
        //     let _country = {};
        //     _country.value = PCANEN[i].split("$")[0];
        //     _country.label = PCANEN[i].split("$")[0];
        //     let countryChildren = [];
            
        //     for(let j =0; j < _citys.length; j++){
        //       if(_citys[j] !== ""){
        //         let _city = {};
        //         _city.value = _citys[j];
        //         _city.label = _citys[j];
        //         countryChildren.push(_city)
        //       }
        //     }
        //     _country.children = countryChildren;
        //     countryArray.push(_country)
        //   }
        // }
        // this.config.countryArray = countryArray;
        let params = {
          'key': "1cf1b88177bd77884000d6e42dcf1d19"
        };
        jsonp('https://api.rajaongkir.com/starter/province',params)
        .then(function (response) {
          console.log(response);
        }).catch(function (error) {
          console.log(error);
        });

      },
      //获取最爱的游戏列表
      getFavoriteGameList(id){
        this.$http({
          url: this.$http.adornUrl("/favoriteGameGenre/findGameGenreList"),
          method: 'post'
        }).then(({data}) => {
          if (data && data.code === 20000) {
            
            this.config.favorite = data.data
            
            this.dataForm.fgameGen = parseInt(id)
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
        this.$http({
          url: this.$http.adornUrl('/user/pc/editUser'),
          method: 'post',
          data: this.$http.adornData({
            'userId': this.dataForm.userId,
            'userImg': this.fileList.length>0?this.fileList[0].url:"",
            'ign':this.dataForm.ign,
            'email':this.dataForm.email,
            'phone': this.dataForm.phone,
            'birthdate': this.dataForm.birthdate,
            'genter': this.dataForm.genter,
            'country': this.dataForm.country,
            'city':this.dataForm.city,
            'favoriteGameGenre': this.dataForm.fgameGen,
            'nevv': this.dataForm.nevv,
            'isLocked': this.dataForm.isLocked?0:1
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
