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
				<el-button type="primary" @click="getSearchFilters()">Search</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">Add</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="exportHandle()">Export</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading"> 
		<el-table-column prop="eventName" label="Event"></el-table-column> 
		<el-table-column prop="rankImg" label="Icon">
			<template slot-scope="scope">
				<img class="listImg" :src="scope.row.rankImg" @click="showPreviewImage(scope.row.rankImg)" />
			</template>
		</el-table-column> 
		<el-table-column prop="rankTitle" label="Name"></el-table-column> 
		<el-table-column prop="pointNevv" label="Point"></el-table-column> 
		<el-table-column prop="rankFrom" label="Rank From"></el-table-column> 
		<el-table-column prop="rankTo" label="Rank To"></el-table-column> 
		<el-table-column prop="startTime" label="Schedule From"></el-table-column> 
		<el-table-column prop="endTime" label="Schedule To"></el-table-column> 
		<el-table-column prop="isPush" label="Publishing">
			<template slot-scope="scope">
				<el-switch v-model="scope.row.isPush" :active-value="1" :inactive-value="0" @change="switchHandle(scope.row.id,scope.row.isPush)"></el-switch>
			</template>
		</el-table-column>
		<el-table-column prop="createTime" label="Create Date"></el-table-column> 
		<el-table-column label="Operation" width="200">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row.id)">Edit</el-link>
				<el-link icon="el-icon-delete" @click="deleteHandle(scope.row.id)">Delete</el-link>
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
import AddOrUpdate from './prize-update'
export default {
	data() {
		return {
			searchTime:"",
			filters: {
				isOpen:"2",
				keyWord:"",
				pageSize: 10,
				pageNum: 1,
				startTime:"",
				endTime:""
			},
			total: 0,
			dataList: [],
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
			]
		}
	},
	components: {
		AddOrUpdate
	},
	methods: {
		changeSearchTime(){//获取时间段
			if(this.searchTime !== null){
				this.filters.startTime = this.searchTime[0]
				this.filters.endTime = this.searchTime[1]
			}else{
				this.filters.startTime =""
				this.filters.endTime = ""
			}
		},
		//是否开启
		switchHandle(id, value){
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = {};
					params['functionId'] = id;
					params['isPush'] = value

					this.$http({
					url: this.$http.adornUrl('/eventPpp/pc/pushEventPppInfo'),
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
					url: this.$http.adornUrl('/eventPpp/pc/delPppInfo'),
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
				pageSize:this.filters.pageSize,
				startTime:this.filters.startTime,
				endTime:this.filters.endTime
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
					isOpen: this.filters.isOpen,
					keyWord:this.filters.keyWord,
					pageNum:this.filters.pageNum,
					pageSize:this.filters.pageSize,
					startTime:this.filters.startTime,
					endTime:this.filters.endTime
				}
			}
			let that = this;
			this.listLoading = true;
			this.$http({
              url: this.$http.adornUrl('/eventPpp/pc/findPppList'),
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
				pageSize:this.filters.pageSize,
				startTime:this.filters.startTime,
				endTime:this.filters.endTime
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
		exportHandle(){//导出列表
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = this.filters;
					params.isOpen = "";
					params.pageSize = "";
					params.pageNum = "";
					let _params = "https://api.nevvorld.cn/api/eventPppOrder/pc/exportUserList?";
					for (const key in params) {
						if(params[key] !== ""){
							_params+= (key+'='+params[key]+'&')
						}
					}
					_params = _params.substring(0,_params.length-1);
					window.location.href=_params
					params.pageSize = 10;
					params.pageNum = 1;
					params.isOpen = "2";
					this.getDataList(params)
				}
			})
			
		},
		
	},
	mounted() {
		this.getDataList(this.filters);
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
</style>