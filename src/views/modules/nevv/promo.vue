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
			<el-form-item>
				<el-button type="primary" @click="searchFilters()">Search</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">Add</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="exportHandle()">PROMO CODE TRACKING</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading">
		<el-table-column prop="eventName" label="Event"></el-table-column> 
		<el-table-column prop="promoCode" label="Code"></el-table-column> 
		<el-table-column prop="promoPoint" label="Event Point"></el-table-column> 
		<el-table-column prop="startTime" label="Schedule From"></el-table-column> 
		<el-table-column prop="endTime" label="Schedule To"></el-table-column> 
		<el-table-column prop="codeState" label="Publishing">
			<template slot-scope="scope">
				<el-switch v-model="scope.row.codeState" :active-value="1" :inactive-value="0" @change="switchHandle(scope.row.id,scope.row.codeState)"></el-switch>
			</template>
		</el-table-column> 
		<el-table-column prop="createTime" label="Create Date"></el-table-column> 
		<el-table-column label="Operation" width="200">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit" @click="addOrUpdateHandle(scope.row)">Edit</el-link>
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
</section>
</template>

<script>
import AddOrUpdate from './promo-update'
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
			config:{
				eventList:[]
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
		exportHandle(){//导出列表
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = this.filters;
					params.pageSize = "";
					params.pageNum = "";
					let _params = window.SITE_CONFIG['baseUrl']+"/user/exportBagpackHistory?";
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
		//是否开启
		switchHandle(id, value, type){
			this.common.isCheckSecoundPasswrod((flag)=>{
				if(flag){
					let params = {};
					params['functionId'] = id;
					params['isPush'] = value

					this.$http({
					url: this.$http.adornUrl('/eventPromo/pc/pushEventPromo'),
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
			this.$confirm('This operation will permanently delete, do you want to continue?', 'Prompt', {
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel',
				type: 'warning'
			}).then(() => {
				let params = {
					'functionId':id
				};
				this.$http({
					url: this.$http.adornUrl('/eventPromo/pc/delPromo'),
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
		//关闭或打开
		isLockHandle(id, isLock){
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
		addOrUpdateHandle (data) {
			let _data;
			if(data){
				_data = data;
			}else{
				_data = ""
			}
			this.addOrUpdateVisible = true
			this.$nextTick(() => {
				this.$refs.addOrUpdate.init(_data)
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
              url: this.$http.adornUrl('/eventPromo/pc/findPromoList'),
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