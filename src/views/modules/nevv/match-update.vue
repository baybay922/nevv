<template>
  <div>
  <el-dialog
    class="dialog watchDialog"
    :title="!dataForm.id ? 'Add' : 'Modify'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
      <el-form-item label="Relate to Event" class="required">
        <el-select v-model="dataForm.eventId" filterable placeholder="Relate to Event">
          <el-option
            v-for="item in config.eventList"
            :key="item.eventId"
            :label="item.eventName"
            :value="item.eventId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Team A Name" class="required">
        <el-input v-model="dataForm.matchTeamNameA" placeholder="Team A Name"></el-input>
      </el-form-item>

      <el-form-item label="Team B Name" class="required">
        <el-input v-model="dataForm.matchTeamNameB" placeholder="Team B Name"></el-input>
      </el-form-item>

      <el-form-item label="Predict" class="required">
        <el-col :span="24" class="toolbar">
          <el-button type="primary" @click="updatePredict()">Add</el-button>
        </el-col>

        <!--列表-->
        <el-table class="userTable" border :data="dataForm.matchInfoParamsList" highlight-current-row v-if="dataForm.matchInfoParamsList.length > 0">
          <el-table-column prop="title" label="Title"></el-table-column> 
          <el-table-column prop="aicon" label="A Icon">
            <template slot-scope="scope">
                <img class="listImg" :src="scope.row.aicon" @click="showPreviewImage(scope.row.aicon)" v-if="scope.row.aicon !==''" />
				        <p v-else>--</p>
            </template>
          </el-table-column> 
          <el-table-column prop="bicon" label="B Icon">
            <template slot-scope="scope">
                <img class="listImg" :src="scope.row.bicon" @click="showPreviewImage(scope.row.bicon)"  v-if="scope.row.bicon !==''" />
                <p v-else>--</p>
            </template>
          </el-table-column> 
          <el-table-column prop="least" label="Minimum Point Reguired" width="250"></el-table-column> 
          <el-table-column prop="winner" label="Winner"></el-table-column> 
          <el-table-column label="Operation" width="150">
            <template slot-scope="scope">
              <el-link icon="el-icon-edit" @click="updatePredict(scope.row.matchInfoId,scope.$index)">Edit</el-link>
              <el-link icon="el-icon-delete" @click="deletePredict(scope.row.matchInfoId,scope.$index)">Delete</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="Schedule From">
        <el-date-picker
          v-model="dataForm.startTime"
          type="datetime"
          placeholder="Schedule From">
        </el-date-picker>
        
      </el-form-item>

      <el-form-item label="Schedule To">
        <el-date-picker
          v-model="dataForm.endTime"
          type="datetime"
          placeholder="Schedule To">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="Blocked">
        <el-switch v-model="dataForm.teamStatus"></el-switch>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Save</el-button>
    </span>
    
  </el-dialog>
  <!-- 添加icon -->
  <el-dialog
      title="Add"
      :close-on-click-modal="false"
      :visible.sync="innerVisible">
      <el-form :model="innerForm" label-width="200px">
        <el-form-item label="Title" class="required">
          <el-input v-model="innerForm.title" placeholder="Title"></el-input>
        </el-form-item>

        <el-form-item label="A Icon" class="required">
          <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUploadA"
          :file-list="aIconUrl"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
        </el-form-item>

        <el-form-item label="B Icon" class="required">
          <el-upload
          class="upload-demo"
          action="https://api.nevvorld.cn/api/public/cos/uploadfile"
          :on-success="handleUploadB"
          :file-list="bIconUrl"
          list-type="picture">
          <el-button size="small" type="primary">Upload Image</el-button>
        </el-upload>
        </el-form-item>

        <el-form-item label="Minimum Point Reguired" class="required">
          <el-input v-model="innerForm.least" type="number" placeholder="Minimum Point Reguired"></el-input>
        </el-form-item>

        <el-form-item label="Winner">
          <!-- <img :src="innerForm.awinner" alt=""> -->
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button type="primary" @click="savePredict()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 图片查看器 -->
    <el-dialog title="Photo Viewer" :visible.sync="imgsVisible" width="40%">
        <div style="display: flex;justify-content: center;">
          <el-image :src="imgs" fit="scale-down" lazy style="margin: 20px auto;">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        innerVisible:false,
        imgsVisible:false,
			  imgs: "",
        dataForm: {
          id: 0,
          eventId:"",
          matchTeamNameA:"",
          matchTeamNameB:"",
          matchInfoParamsList:[],
          startTime:"",
          endTime:"",
          teamStatus:false
        },
        innerForm:{
          aicon: "",
          amatchDetailId: "",
          awinner: "",
          bicon: "",
          bmatchDetailId: "",
          bwinner: "",
          least: "",
          matchInfoId: "",
          title: ""
        },
        fileList: [],
        config:{
          eventList:[],
        },
        aIconUrl:[],
        bIconUrl:[],
        savePredictIndex:""
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
              url: this.$http.adornUrl('/eventMatch/pc/findMatchInfo'),
              method: 'post',
              data: this.$http.adornData({
                'functionId': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.code === 20000) {
                this.dataForm.id = data.data.id;
                this.dataForm.eventId = data.data.eventId;
                this.dataForm.matchTeamNameA = data.data.matchTeamNameA
                this.dataForm.matchTeamNameB = data.data.matchTeamNameB
                this.dataForm.matchInfoParamsList = data.data.matchInfoParamsList
                this.dataForm.startTime = data.data.startTime
                this.dataForm.endTime = data.data.endTime
                this.dataForm.teamStatus = data.data.teamStatus===0?false:true
              }
            })
          }else{
            this.dataForm.id = "" 
            this.dataForm.eventId = ""
            this.dataForm.matchTeamNameA = ""
            this.dataForm.matchTeamNameB = ""
            this.dataForm.matchInfoParamsList = []
            this.dataForm.startTime = ""
            this.dataForm.endTime = ""
            this.dataForm.teamStatus = false
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.eventId == ""){
          this.$message.error("Relate to Event can not be empty");
          return;
        }
        if(this.dataForm.matchTeamNameA == ""){
          this.$message.error("Team A Name can not be empty");
          return;
        }
        if(this.dataForm.matchTeamNameB == ""){
          this.$message.error("Team B Name can not be empty");
          return;
        }
        if(this.dataForm.matchInfoParamsList.length <= 0){
          this.$message.error("Predict can not be empty");
          return;
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/eventMatch/pc/${!this.dataForm.id ? 'addMatch' : 'editMatch'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'eventId': this.dataForm.eventId,
                'matchTeamNameA': this.dataForm.matchTeamNameA,
                'matchTeamNameB': this.dataForm.matchTeamNameB,
                'matchInfoParamsList':this.dataForm.matchInfoParamsList,
                'startTime': this.dataForm.startTime,
                'endTime': this.dataForm.endTime,
                'teamStatus': this.dataForm.teamStatus?1:0,
                'isUpdate': this.dataForm.isUpdate?1:0
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
      showPreviewImage(url){
        this.imgsVisible = true;
        this.imgs = url
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
      handleUploadA(response, file, fileList){
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.aIconUrl = files
        }else{
          this.$message.error(data.msg)
        }
      },
      handleUploadB(response, file, fileList){
        if(response && response.code === 20000){
          let files = [];
          files.push({url:response.data.cosUrl})
          this.bIconUrl = files
        }else{
          this.$message.error(data.msg)
        }
      },
      updatePredict(id, index){//预览详情
        
        this.innerVisible = true;
        if(id){
          this.savePredictIndex = index;
          let data = this.dataForm.matchInfoParamsList[index];
          this.innerForm.aicon =  data.aicon
          this.innerForm.amatchDetailId = data.amatchDetailId
          this.innerForm.awinner = data.awinner
          this.innerForm.bicon = data.bicon
          this.innerForm.bmatchDetailId = data.bmatchDetailId
          this.innerForm.bwinner = data.bwinner
          this.innerForm.least = data.least
          this.innerForm.matchInfoId = data.matchInfoId
          this.innerForm.title = data.title

          let _aiconImg = [];
          _aiconImg.push({url:data.aicon})
          this.aIconUrl = _aiconImg;

          let _biconImg = [];
          _biconImg.push({url:data.bicon})
          this.bIconUrl = _biconImg;
        }else{
          this.savePredictIndex = "";
          this.innerForm.aicon =  "";
          this.innerForm.amatchDetailId = "";
          this.innerForm.awinner = "";
          this.innerForm.bicon = "";
          this.innerForm.bmatchDetailId = "";
          this.innerForm.bwinner = "";
          this.innerForm.least = "";
          this.innerForm.matchInfoId = "";
          this.innerForm.title = "";
        }
      },
      deletePredict(id, index){//删除
        
        this.$confirm('This operation will permanently delete the file, do you want to continue?', 'Prompt', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          let _curArr = this.dataForm.matchInfoParamsList;
          _curArr.splice(index, 1);
            this.dataForm.matchInfoParamsList = _curArr;
            console.log(this.dataForm.matchInfoParamsList)
        })
        
      },
      savePredict(){//保存处理
        if(this.innerForm.title == ""){
          this.$message.error("title can not be empty");
          return;
        }
        if(this.aIconUrl.length>0 == ""){
          this.$message.error("A Icon can not be empty");
          return;
        }
        if(this.bIconUrl.length>0 == ""){
          this.$message.error("B Icon can not be empty");
          return;
        }
        if(this.innerForm.least == ""){
          this.$message.error("Minimum Point Reguired can not be empty");
          return;
        }
        let _curArr = this.dataForm.matchInfoParamsList;
        this.innerForm.aicon = this.aIconUrl.length>0?this.aIconUrl[0].url:"";
        this.innerForm.bicon = this.bIconUrl.length>0?this.bIconUrl[0].url:"";

        if(this.savePredictIndex === ""){//新建
          let _obj = {};
          _obj.aicon =  this.innerForm.aicon;
          _obj.amatchDetailId = this.innerForm.amatchDetailId;
          _obj.awinner = this.innerForm.awinner;
          _obj.bicon = this.innerForm.bicon;
          _obj.bmatchDetailId = this.innerForm.bmatchDetailId;
          _obj.bwinner = this.innerForm.bwinner;
          _obj.least = this.innerForm.least;
          _obj.matchInfoId = this.innerForm.matchInfoId;
          _obj.title = this.innerForm.title;
          _curArr.push(_obj)
        }else{//编辑
          let _obj = {};
          _obj.aicon =  this.innerForm.aicon;
          _obj.amatchDetailId = this.innerForm.amatchDetailId;
          _obj.awinner = this.innerForm.awinner;
          _obj.bicon = this.innerForm.bicon;
          _obj.bmatchDetailId = this.innerForm.bmatchDetailId;
          _obj.bwinner = this.innerForm.bwinner;
          _obj.least = this.innerForm.least;
          _obj.matchInfoId = this.innerForm.matchInfoId;
          _obj.title = this.innerForm.title;
          _curArr.splice(this.savePredictIndex,1,_obj)
        };
        this.dataForm.matchInfoParamsList = [];
        this.dataForm.matchInfoParamsList = _curArr;
        this.innerVisible = false;
        
      }
    }
  }
</script>
<style>
  .watchDialog .el-dialog{
    width: 80%!important;
  }
  .watchDialog .toolbar{
    margin-bottom: 15px;
  }
</style>
