<template>
	<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar">
		<el-form :inline="true" :model="filters">

			<el-form-item label-width="120px">
				<el-select v-model="filters.keyWord" placeholder="请选择">
					<el-option
					v-for="item in config.eventList"
					:key="item.eventId"
					:label="item.eventName"
					:value="item.eventId">
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item label-width="50px">
				<el-select v-model="filters.isOpen" placeholder="请选择">
					<el-option
					v-for="item in config.openOptions"
					:key="item.value"
					:label="item.label"
					:value="item.value">
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="getSearchFilters()">Search</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">Add</el-button>
			</el-form-item>

			<el-form-item>
				<el-date-picker
				v-model="searchTime"
				type="daterange"
				range-separator="to"
				value-format="yyyy-MM-dd"
				start-placeholder="Start Date"
				end-placeholder="End Date"
				@change="changeSearchTime">
				</el-date-picker>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="exportHandle()">EXPORT MATCH</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading"> 

		<el-table-column prop="eventName" label="Event"></el-table-column> 
		<el-table-column prop="matchName" label="Match Name"></el-table-column> 
		<el-table-column prop="matchTeamNameA" label="Team A"></el-table-column> 
		<el-table-column prop="matchTeamNameB" label="Team B"></el-table-column> 
		<el-table-column prop="matches" label="Matches">
			<template slot-scope="scope">
				<el-button type="text" v-if="scope.row.matches === 0">
					{{scope.row.matches}} items
				</el-button>
				<el-popover
					v-else
					placement="left"
					width="600"
					trigger="click">
					<el-table :data="matchList">
						<el-table-column prop="title" label="Title" ></el-table-column> 
						<el-table-column prop="aicon" label="A Icon" width="70">
							<template slot-scope="scope">
								<img class="listImg" :src="scope.row.aicon" @click="showPreviewImage(scope.row.aicon)" v-if="scope.row.aicon !==''" />
								<p v-else>--</p>
							</template>
						</el-table-column>
						<el-table-column prop="bicon" label="B Icon" width="70">
							<template slot-scope="scope">
								<img class="listImg" :src="scope.row.bicon" @click="showPreviewImage(scope.row.bicon)"  v-if="scope.row.bicon !==''" />
								<p v-else>--</p>
							</template>
						</el-table-column> 
						<el-table-column prop="least" label="Minimum Point Reguired"></el-table-column> 
						<el-table-column prop="winner" label="Winner">
							<template slot-scope="scopes">
								<el-select
								v-if="scopes.row.winner ==''"
								v-model="scopes.row.winner" 
								placeholder="Winner" 
								@focus="setWinnerOptions(scopes.row)"
								@change="selectWinner(scope.row.eventId,$event, scopes.row.matchInfoId)"
								>
									<el-option label="A" :value="scopes.row.amatchDetailId"></el-option>
									<el-option label="B" :value="scopes.row.bmatchDetailId"></el-option>
									<el-option label="Draw" value="0"></el-option>
									<el-option label="Cancel" value="-1"></el-option>
								</el-select>

								<div v-else>
									<el-input
									v-if="scopes.row.winner == 0"
									value="Draw"
									disabled="disabled"
									>
									</el-input>
									<el-input
									v-else-if="scopes.row.winner == -1"
									value="Cancel"
									disabled="disabled"
									>
									</el-input>
									<el-input
									v-else-if="scopes.row.winner !== -1 && scopes.row.winner !== 0"
									:value="scopes.row.winner==scopes.row.amatchDetailId?'A':'B'"
									disabled="disabled"
									>
									</el-input>
								</div>
							</template>
						</el-table-column>
					</el-table>
					<el-button slot="reference" type="text" @click="showMatchInfoParamsList(scope.row.id)">
						{{scope.row.matches}} items
					</el-button>
				</el-popover>
			</template>	
		</el-table-column> 
		<el-table-column prop="startTime" label="Schedule From"></el-table-column> 
		<el-table-column prop="endTime" label="Schedule To"></el-table-column> 
		<el-table-column prop="teamStatus" label="Publishing">
			<template slot-scope="scope">
				<el-switch v-model="scope.row.teamStatus" :active-value="1" :inactive-value="0" :disabled="scope.row.isUpdate==1" @change="switchHandle(scope.row.id,scope.row.teamStatus)"></el-switch>
			</template>	
		</el-table-column> 

		<el-table-column label="Operation" width="200">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row.id)">Edit</el-link>
				<el-link icon="el-icon-delete" :disabled="scope.row.teamStatus==1" @click="deleteHandle(scope.row.id)">Delete</el-link>
			</template>
		</el-table-column>
	</el-table>
	
	<!--工具条-->
	<el-col :span="24" class="toolbar">
		<el-pagination
		style="float:right;"
		@size-change="handleSizeChange"
		@current-change="handleCurrentChange"
		:current-page="filters.pageNum"
		:page-sizes="[5, 10, 15, 20]"
		:page-size="filters.pageSize"
		layout="total, sizes, prev, pager, next"
		:total="total">
		</el-pagination>
	</el-col>
	<!-- 弹窗, 新增 / 修改 -->
    <AddOrUpdate v-if="addOrUpdateVisible" ref="addOrUpdate"  @refreshDataList="getDataList"></AddOrUpdate>
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
</section>
</template>

<script>
import AddOrUpdate from './match-update'
export default {
	data() {
		return {
			winner:"",
			winners:[],
			filters: {
				keyWord:"",
				isOpen:"2",
				pageSize: 10,
				pageNum: 1,
			},
			total: 0,
			dataList: [],
			matchList:[],
			listLoading: false,
			addOrUpdateVisible: false,
			imgsVisible:false,
			imgs: "",
			config:{
				eventList:[],
				openOptions:[
					{
						value:"2",
						label:"All"
					},
					{
						value:"1",
						label:"Open"
					},
					{
						value:"0",
						label:"Close"
					}
				]
			},
			all:[
				{
					'eventId':"",
					'eventName':"All"
				}
			],
			searchTime:"",
			startTime:"",
			endTime:""
		}
	},
	components: {
		AddOrUpdate
	},
	methods: {
		changeSearchTime(){//获取时间段
			if(this.searchTime !== null){
				this.startTime = this.searchTime[0]
				this.endTime = this.searchTime[1]
			}else{
				this.startTime =""
				this.endTime = ""
			}
		},
		exportHandle(){//导出列表
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = this.filters;
					params.pageSize = "";
					params.pageNum = "";
					params.startTime = this.startTime;
					params.endTime = this.endTime;
					let _params = window.SITE_CONFIG['baseUrl']+"/eventMatch/matchHistory?";
					for (const key in params) {
						if(params[key] !== ""){
							_params+= (key+'='+params[key]+'&')
						}
					}
					_params = _params.substring(0,_params.length-1);
					window.location.href=_params
					params.pageSize = 10;
					params.pageNum = 1;
				}
			})
		},
		setWinnerOptions(data){
			let arr = [];
			let aObj = {
					value: data.amatchDetailId,
					label: 'A'
				},
				bObj = {
					value: data.bmatchDetailId,
					label: 'B'
				},
				DObj = {
					value: '0',
					label: 'Draw'
				},
				CObj = {
					value: '-1',
					label: 'Cancel'
				};
			arr.push(aObj,bObj,DObj,CObj)
			this.winners = arr;
		},
		selectWinner(eventId,matchDetailId,matchInfoId){
			console.log(matchDetailId)
			let _winnerName = ""
			this.winners.map(items=>{
				if(items.value == matchDetailId){
					_winnerName = items.label
				}
			})

			let _message = "Are you sure you want to choose ";
			
			if(_winnerName !== 'Draw' && _winnerName !== 'Cancel'){
				_message+= _winnerName;
				_message+= " as Winner?";
			}else{
				_message+= _winnerName+'?';

			}
			
			this.$confirm(_message, 'Prompt', {
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel',
				type: 'warning'
			}).then(() => {
				let params = {
					'eventId':eventId,
					'matchInfoId':matchInfoId,
					'matchDetailId':matchDetailId,
				};
				this.$http({
					url: this.$http.adornUrl('/eventMatch/pc/editMatchInfoWinner'),
					method: 'post',
					data: this.$http.adornData(params)
				}).then(({data}) => {
					if (data && data.code === 20000) {
						this.$message.success(data.msg)
						this.getDataList()
					} else {
						this.$message.error(data.msg)
					}
				})
				
			})
			console.log(_winnerName)
		},
		showMatchInfoParamsList(id){
			let params = {};
			params['functionId'] = id;

			this.$http({
              url: this.$http.adornUrl('/eventMatch/pc/findMatchInfoDetail'),
              method: 'post',
              data: this.$http.adornData(params)
            }).then(({data}) => {
              if (data && data.code === 20000) {
				  this.matchList = data.data;
              } else {
                this.$message.error(data.msg)
              }
            })
		},
		//是否开启
		switchHandle(id, value){
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = {};
					params['functionId'] = id;
					params['isPush'] = value

					this.$http({
					url: this.$http.adornUrl('/eventMatch/pc/pushEventMatchInfo'),
					method: 'post',
					data: this.$http.adornData(params)
					}).then(({data}) => {
					if (data && data.code === 20000) {
						this.$message({
						message: 'Success',
						type: 'success',
						duration: 1500,
						onClose: () => {
							this.getDataList()
						}
						})
					} else {
						this.$message.error(data.msg)
					}
					})
				}else{
					this.getDataList()
				}
			})
			
		},
		//删除
		deleteHandle(id){
			this.$confirm('This operation will permanently delete the file, do you want to continue?', 'Prompt', {
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel',
				type: 'warning'
			}).then(() => {
				let params = {
					'functionId':id
				};
				this.$http({
					url: this.$http.adornUrl('/eventMatch/pc/delMatchInfo'),
					method: 'post',
					data: this.$http.adornData(params)
				}).then(({data}) => {
					if (data && data.code === 20000) {
						this.$message.success(data.msg)
						this.getDataList()
					} else {
						this.$message.error(data.msg)
					}
				})
				
			})
		},
		showPreviewImage(url){
			this.imgsVisible = true;
			this.imgs = url
		},
		 // 新增 / 修改
		addOrUpdateHandle (id) {
			this.addOrUpdateVisible = true
			this.$nextTick(() => {
				this.$refs.addOrUpdate.init(id)
			})
		},
		//搜索
		getSearchFilters(){
			let params = {
				isOpen:this.filters.isOpen,
				keyWord:this.filters.keyWord,
				pageNum:1,
				pageSize:this.filters.pageSize
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		//上一页或者下一页
		handleCurrentChange(val) {
			this.filters.pageNum = val;
			this.getDataList(this.filters);
		},
		//获取列表
		getDataList(params) {
			if(!params){
				params = {
					isOpen:"2",
					keyWord:this.filters.keyWord,
					pageNum:this.filters.pageNum,
					pageSize:this.filters.pageSize
				}
			}
			let that = this;
			this.listLoading = true;
			this.$http({
              url: this.$http.adornUrl('/eventMatch/pc/findMatchList'),
              method: 'post',
              data: this.$http.adornData(params)
            }).then(({data}) => {
              if (data && data.code === 20000) {
				that.listLoading = false;
				that.dataList = data.data.list;
				this.total = data.data.total
              } else {
                this.$message.error(data.msg)
              }
            })
		},
		//每页个数
		handleSizeChange(val) {
			this.filters.pageSize = val;
			this.filters.pageNum = 1;//每次改变每页多少条都会重置当前页码为1
			let params = {
				keyWord:this.filters.keyWord,
				isOpen:this.filters.isOpen,
				pageNum: this.filters.pageNum,
				pageSize:this.filters.pageSize
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		//获取活动
		getSearchEventList(){
			this.$http({
				url: this.$http.adornUrl("/event/pc/searchEventList"),
				method: 'post'
			}).then(({data}) => {
				if (data && data.code === 20000) {
					this.config.eventList = this.all.concat(data.data);
				} else {
					this.$message.error(data.msg)
				}
			})
      	},
		
	},
	mounted() {
		this.getDataList();
		this.getSearchEventList()
	}
}

</script>

<style scoped lang="scss">
.toolbar{
	padding-bottom: 20px;
}
.form-item{
width: 310px;
position: relative;

i{
	position: absolute;
	top: 50%;
	right: -26px;
	font-size: 16px;
	margin-top: -8px;
	color:#409EFF;
}
}

.image-list{
display: flex;
width: 300px;
flex-wrap: wrap;

.img-item{
	width: 50px;
	height: 50px;
	margin-right: 8px;
	border: 1px solid #e7eaec;
	padding: 15px;
	position: relative;

	img{
		width: 100%;
		height: auto;
	}

	i{
		position: absolute;
		right: 5px;
		top: 10px;
		cursor: pointer;
		opacity: 0;
	}
	&:hover i{
		opacity: 1;
		transition: all .3s ease;
	}
}
}
.cell{
display: flex!important;
justify-content: center!important;

i{
	font-size: 24px;
	cursor: pointer;
	margin: 0 auto;
}
}



.demo-image__preview{
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,.7);
	z-index: 9;
	display: flex;
	justify-content: center;
	align-items: center;

	.carousel {
		width: 50%;
	}

	.el-carousel__item{
		display: flex;
	justify-content: center;
	align-items: center;
	}

	.el-icon-close{
		position: absolute;
		right: 30px;
		top: 30px;
		font-size: 30px;
		color: #fff;
	}
}
.export{
	color: #606266;
}
.export:hover{
	color: #9733ff;
}
</style>