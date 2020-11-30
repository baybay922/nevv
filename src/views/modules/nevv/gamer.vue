<template>
	<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar">
		<el-form :inline="true" :model="filters">
			<el-form-item label-width="120px">
				<el-input autocomplete="off" v-model="filters.keyWord" placeholder="Search by name"></el-input>
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
		<el-table-column prop="ign" label="In-Game Name"></el-table-column> 
		<el-table-column prop="phone" label="Phone Number"></el-table-column> 
		<el-table-column prop="birthdate" label="Birth Date"></el-table-column> 
		<el-table-column prop="genter"  label="Gender">
			<template slot-scope="scope">
				<p v-if="scope.row.genter == 0">No Select</p>
				<p v-else-if="scope.row.genter == 1">Female</p>
				<p v-else>Male</p>
			</template>
		</el-table-column>
		<el-table-column prop="country"  label="Country"></el-table-column>
		<el-table-column prop="nevv"  label="Nevv"></el-table-column>
		<el-table-column prop="eventCount"  label="Event Point">
			<template slot-scope="scope">
				<el-button type="text" v-if="scope.row.eventCount == 0">
					{{scope.row.eventCount}} items
				</el-button>
				<el-popover
					v-else
					placement="left"
					width="300"
					trigger="click">
					<el-table :data="eventCountList">
						<el-table-column prop="eventName" label="Event"></el-table-column>
						<el-table-column prop="eventPoint" label="Event point"></el-table-column>
					</el-table>
					<el-button slot="reference" type="text" @click="showEventCountList(scope.row.userId)">
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
					width="500"
					trigger="click">
					<el-table :data="predictCountList">
						<el-table-column prop="eventName" label="Event"></el-table-column>
						<el-table-column prop="eventPoint" label="Match"></el-table-column>
						<el-table-column prop="eventPoint" label="Predict"></el-table-column>
						<el-table-column prop="eventPoint" label="Result"></el-table-column>
					</el-table>
					<el-button slot="reference" type="text" @click="showJoinMatchList(scope.row.userId)">
						{{scope.row.predictCount}} items
					</el-button>
				</el-popover>
			</template>
		</el-table-column>
		<el-table-column prop="createDate"  label="Create Date"></el-table-column>
		<el-table-column label="Operation" width="200">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row.userId)">Edit</el-link>
				<el-link icon="el-icon-lock" @click="isLockHandle(scope.row.userId, 1)" v-if="scope.row.isLock == 0">Block</el-link>
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
		:total="filters.total">
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
			filters: {
				keyWord:"",
				pageSize: 10,
				pageNum: 1,
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
				pageSize:10,
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
				pageSize:10,
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
			let params = this.filters;
			let _params = '';
			for (const key in params) {
				console.log(params[key])
				_params+=key+'='+params[key]!==''?params[key]:""+'&'
				
			}
			
			console.log(_params)
		},
		isLockHandle(id, isLock){//关闭或打开
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
					keyWord:"",
					pageNum:1,
					pageSize:10
				}
				this.filters = filters;
				this.getDataList(this.filters);
              } else {
                this.$message.error(data.msg)
              }
            })
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
				pageNum:1,
				pageSize:10
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		handleCurrentChange(val) {//上一页或者下一页
			this.filters.pageNum = val;
			this.getDataList(this.filters);
		},
		getDataList(params) {//获取书单列表
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
				this.total = data.total
              } else {
                this.$message.error(data.msg)
              }
            })
		},
		handleSizeChange(val) {
			this.filters.pageSize = val;
			this.filters.currentPage = 1;//每次改变每页多少条都会重置当前页码为1
			console.log(`每页 ${val} 条`);
		},
		
	},
	mounted() {
		this.getDataList(this.filters);
	}
}

</script>

<style scoped lang="scss">
.toolbar{
padding-bottom: 0px;
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