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
				<el-button type="primary" @click="addOrUpdateHandle()">Add</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading">
		<el-table-column prop="adminUserName" label="Admin Name"></el-table-column> 
		<el-table-column prop="email" label="email"></el-table-column> 
		<el-table-column prop="createTime" label="Create Date"></el-table-column> 
		<el-table-column label="Operation" width="200">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row.adminUserId)">Edit</el-link>
				<el-link icon="el-icon-lock" @click="isLockHandle(scope.row.adminUserId, 1)" v-if="scope.row.isLock == 0">Block</el-link>
				<el-link icon="el-icon-unlock" @click="isLockHandle(scope.row.adminUserId, 0)" v-else>Unblock</el-link>
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
import AddOrUpdate from './admin-update'
export default {
	data() {
		return {
			filters: {
				keyWord:"",
				pageSize: 10,
				pageNum: 1
			},
			dataList: [],
			listLoading: false,
			addOrUpdateVisible: false,
			total: 0,
		}
	},
	components: {
		AddOrUpdate
	},
	methods: {
		isLockHandle(id, isLock){//关闭或打开
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
				url: this.$http.adornUrl('/adminUser/pc/lockAdminUserInfo'),
				method: 'post',
				data: this.$http.adornData(params)
				}).then(({data}) => {
				if (data && data.code === 20000) {
					this.$message.success(data.msg)
					let filters = {
						keyWord:this.filters.keyWord,
						pageNum: this.filters.pageNum,
						pageSize:this.filters.pageSize
					}
					this.filters = filters;
					this.getDataList(this.filters);
				} else {
					this.$message.error(data.msg)
				}
				})
				
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
				pageNum: this.filters.pageNum,
				pageSize:this.filters.pageSize
			}
			this.filters = params;
			this.getDataList(this.filters);
		},
		handleCurrentChange(val) {//上一页或者下一页
			this.filters.pageNum = val;
			this.getDataList(this.filters);
		},
		getDataList(params) {//获取列表
			if(!params){
				params = {
					keyWord:this.filters.keyWord,
					pageNum: this.filters.pageNum,
					pageSize:this.filters.pageSize
				}
			}
			let that = this;
			this.listLoading = true;
			this.$http({
              url: this.$http.adornUrl('/adminUser/pc/findAdminUserList'),
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
				pageSize:this.filters.pageSize
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