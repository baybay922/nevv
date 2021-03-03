<template>
	<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar">
		<el-form :inline="true" :model="filters">
			<el-form-item label-width="120px">
				<el-input autocomplete="off" v-model="filters.keyWord" placeholder="Search by name"></el-input>
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
				<el-button type="primary" @click="searchFilters()">Search</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="exportHandle()">Export</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading">
		<el-table-column prop="ign" label="In-Game Name" width="200"></el-table-column> 
		<el-table-column prop="phone" label="Phone Number" width="200"></el-table-column>
		<el-table-column prop="email" label="email" width="200"></el-table-column> 
		<el-table-column prop="realName" label="realName" width="200"></el-table-column> 
		<el-table-column prop="birthdate" label="Birth Date" width="200"></el-table-column> 
		<el-table-column prop="gender"  label="Gender">
			<template slot-scope="scope">
				<div v-if="scope.row.gender === 1">Male</div>
				<div v-else-if="scope.row.gender === 2">Female</div>
				<div v-else>No Select</div>
			</template>
		</el-table-column>
		<el-table-column prop="provinceName"  label="Province" width="200"></el-table-column>
		<el-table-column prop="cityName"  label="City" width="200"></el-table-column>
		<el-table-column prop="eventCount"  label="Event Point">
			<template slot-scope="scope">
				<el-button type="text" v-if="scope.row.eventCount == 0">
					{{scope.row.eventCount}} items
				</el-button>
				<el-popover
					v-else
					placement="left"
					width="350"
					trigger="click">
					<el-table :data="eventCountList" height="200">
						<el-table-column prop="eventName" label="Event" width="150"></el-table-column>
						<el-table-column prop="eventPoint" label="Event point" width="150"></el-table-column>
					</el-table>
					<el-button slot="reference" type="text" @click="showEventCountList(scope.row.userStrId)">
						{{scope.row.eventCount}} items
					</el-button>
				</el-popover>
			</template>
		</el-table-column>
		<el-table-column prop="predictCount"  label="History Predict">
			<template slot-scope="scope">
				<el-button type="text" v-if="scope.row.predictCount == 0">
					{{scope.row.predictCount}} items
				</el-button> 
				<el-popover
					v-else
					placement="left"
					width="650"
					trigger="click">
					<el-table :data="predictCountList" 
					height="300">
						<el-table-column prop="eventName" label="Event" width="150"></el-table-column>
						<el-table-column prop="eventPoint" label="Match" width="150"></el-table-column>
						<el-table-column prop="eventPoint" label="Predict" width="150"></el-table-column>
						<el-table-column prop="eventPoint" label="Result" width="150"></el-table-column>
					</el-table>
					<el-button slot="reference" type="text" @click="showJoinMatchList(scope.row.userStrId)">
						{{scope.row.predictCount}} items
					</el-button>
				</el-popover>
			</template>
		</el-table-column>
		<el-table-column prop="createDate"  label="Create Date" width="200"></el-table-column>
		<el-table-column label="Operation" width="200" fixed="right">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row.userId)">Detail</el-link>
				<el-link icon="el-icon-lock" @click="isLockHandle(scope.row.userId, 1)" v-if="scope.row.isLocked == 0">Block</el-link>
				<el-link icon="el-icon-unlock" @click="isLockHandle(scope.row.userId, 0)" v-else>Unblock</el-link>
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
</section>
</template>

<script>
import AddOrUpdate from './gamer-update'
export default {
	data() {
		return {
			searchTime:"",
			filters: {
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
			eventCountList:[],
			predictCountList:[]
		}
	},
	components: {
		AddOrUpdate
	},
	methods: {
		showJoinMatchList(id){//获取竞猜数量
			this.$http({
              url: this.$http.adornUrl('/user/pc/joinMatchList'),
              method: 'post',
              data: this.$http.adornData({
				keyWord:id,
				pageSize:999,
				pageNum:1
			  })
            }).then(({data}) => {
              if (data && data.code === 20000) {
				this.predictCountList = data.data.list
              } else {
                this.$message.error(data.msg)
              }
            })
		},
		showEventCountList(id){//获取用户
			this.$http({
              url: this.$http.adornUrl('/user/pc/joinEventList'),
              method: 'post',
              data: this.$http.adornData({
				keyWord:id,
				pageSize:999,
				pageNum:1
			  })
            }).then(({data}) => {
              if (data && data.code === 20000) {
				this.eventCountList = data.data.list
              } else {
                this.$message.error(data.msg)
              }
            })
		},
		exportHandle(){//导出列表
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = this.filters;
					params.pageSize = "";
					params.pageNum = "";
					let _params = "https://api.nevvorld.com/api/user/pc/exportUserList?";
					for (const key in params) {
						if(params[key] !== ""){
							_params+= (key+'='+params[key]+'&')
						}
					}
					_params = _params.substring(0,_params.length-1);
					window.location.href=_params
				}
			})
			
		},
		isLockHandle(id, isLock){//关闭或打开

			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let _message = "Are you sure you want to ";
					if(isLock === 1){
						_message+= 'Blocked'
					}else{
						_message+= 'Unblock'
					}
					_message+= " this user?";
					this.$confirm(_message, 'Prompt', {
						confirmButtonText: 'Confirm',
						cancelButtonText: 'Cancel',
						type: 'warning'
					}).then(() => {
						let params = {
							functionId:id,
							isLock:isLock
						};
						this.$http({
							url: this.$http.adornUrl('/user/pc/lockUserInfo'),
							method: 'post',
							data: this.$http.adornData(params)
							}).then(({data}) => {
							if (data && data.code === 20000) {
								this.$message.success(data.msg)
								let filters = {
									keyWord:this.filters.keyWord,
									pageNum:1,
									pageSize:10
								}
								this.filters = filters;
								this.getDataList(this.filters);
							} else {
								this.$message.error(data.msg)
							}
						})
						
					})
				}
			})
			
		},
		changeSearchTime(){//获取时间段
			if(this.searchTime !== null){
				this.filters.startTime = this.searchTime[0]
				this.filters.endTime = this.searchTime[1]
			}else{
				this.filters.startTime =""
				this.filters.endTime = ""
			}
		},
		 // 新增 / 修改
		addOrUpdateHandle (id) {
			this.addOrUpdateVisible = true
			this.$nextTick(() => {
				this.$refs.addOrUpdate.init(id)
			})
		},
		searchFilters(){//搜索
			let params = {
				keyWord:this.filters.keyWord,
				pageNum: 1,
				pageSize:this.filters.pageSize,
				startTime:this.filters.startTime,
				endTime:this.filters.endTime
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		handleCurrentChange(val) {//上一页或者下一页
			this.filters.pageNum = val;
			this.getDataList(this.filters);
		},
		getDataList(params) {//
			if(!params){
				params = {
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
              url: this.$http.adornUrl('/user/pc/findUserList'),
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
		handleSizeChange(val) {
			this.filters.pageSize = val;
			this.filters.pageNum = 1;//每次改变每页多少条都会重置当前页码为1
			let params = {
				keyWord:this.filters.keyWord,
				pageNum: this.filters.pageNum,
				pageSize:this.filters.pageSize,
				startTime:this.filters.startTime,
				endTime:this.filters.endTime
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		
	},
	mounted() {
		this.getDataList(this.filters);
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