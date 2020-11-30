<template>
  <el-dialog
    class="dialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="*In-Game Name" prop="Name">
        <el-input v-model="dataForm.ign" placeholder="In-Game Name"></el-input>
      </el-form-item>

      <el-form-item label="Avatar" prop="params">
        <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-preview="handlePreview"
          :on-success="handleUpload"
          :on-remove="handleRemove"
          :file-list="fileList"
          :limit="1"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="Phone Number" prop="cronExpression">
        <el-input v-model="dataForm.phone" placeholder="Phone Number"></el-input>
      </el-form-item>

      <el-form-item label="Birth Date" prop="remark">
        <el-date-picker
          v-model="dataForm.birthdate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="Birth Date">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="Gender" prop="cronExpression" size="30">
        <el-select v-model="dataForm.genter" placeholder="Gender">
          <el-option
            v-for="item in config.genter"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Country" prop="cronExpression">
        <el-select v-model="dataForm.country" placeholder="Country" @change="selectCityName($event)">
          <el-option
            v-for="item in config.countryArray"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="City" prop="City">
        <el-select v-model="dataForm.city" placeholder="City">
          <el-option
            v-for="item in config.cityArray"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Favorite Game Genre" prop="Genre">
        <el-select v-model="dataForm.fgameGen" filterable placeholder="Favorite Game  Genre">
          <el-option
            v-for="item in config.favorite"
            :key="item.id"
            :label="item.genreName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Nevv" prop="Nevv">
        <el-input v-model="dataForm.nevv" placeholder="Nevv"></el-input>
      </el-form-item>

      <el-form-item label="Blocked" prop="Blocked">
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
            this.$http({
              url: this.$http.adornUrl("/user/pc/findUserInfo"),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.userId
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm = data.data;
                this.dataForm.isLocked = data.data.isLocked==0?true:false;
                let files = [];
                files.push({url:data.data.userImg})
                this.fileList = files
              }else{
                this.$message.error(data.msg)
              }
            })
          }
        })
        this.getFavoriteGameList();
        this.setSelectCountryArray();
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
        let countryArray = [];
        let PCANEN = countrys.split("#");
        
        for (let i = 0; i < PCANEN.length; i++) {
          if(PCANEN[i].split("$")[0] !== ""){
            let _citys = PCANEN[i].split("$")[1].split(",");
            let _country = {};
            _country.value = PCANEN[i].split("$")[0];
            _country.label = PCANEN[i].split("$")[0];
            let countryChildren = [];
            
            for(let j =0; j < _citys.length; j++){
              if(_citys[j] !== ""){
                let _city = {};
                _city.value = _citys[j];
                _city.label = _citys[j];
                countryChildren.push(_city)
              }
            }
            _country.children = countryChildren;
            countryArray.push(_country)
          }
        }
        this.config.countryArray = countryArray;
      },
      //获取最爱的游戏列表
      getFavoriteGameList(){
        this.$http({
          url: this.$http.adornUrl("/favoriteGameGenre/findGameGenreList"),
          method: 'post'
        }).then(({data}) => {
          if (data && data.code === 20000) {
            this.config.favorite = data.data
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
            'isLocked': this.dataForm.isLocked?1:0
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
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
