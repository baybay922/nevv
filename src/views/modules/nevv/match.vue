<template>
	<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar">
		<el-form :inline="true" :model="filters">
			<el-form-item label-width="120px">
				<el-input autocomplete="off" v-model="filters.studentId" placeholder="Search by name"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary">Search</el-button>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">Add</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading">
		<el-table-column prop="Event" label="Event"></el-table-column> 
		<el-table-column prop="Team A" label="Team A"></el-table-column> 
		<el-table-column prop="Team B" label="Team B"></el-table-column> 
		<el-table-column prop="Matches" label="Play URL"></el-table-column> 
		<el-table-column prop="Schedule From" label="Schedule From"></el-table-column> 
		<el-table-column prop="Schedule To" label="Schedule To"></el-table-column> 
		<el-table-column prop="Publishing" label="Publishing"></el-table-column> 
		<el-table-column label="Operation" width="150">
			<template slot-scope="scope">
				<el-link icon="el-icon-edit">Edit</el-link>
				<el-link icon="el-icon-check">Block</el-link>
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
import AddOrUpdate from './match-update'
export default {
	data() {
		return {
			filters: {
				pageSize: 10,
				pageNum: 1,
				total: 0,
			},
			dataList: [{}],
			listLoading: false,
			addOrUpdateVisible: false,
		}
	},
	components: {
		AddOrUpdate
	},
	methods: {
		 // 新增 / 修改
		addOrUpdateHandle (id) {
			this.addOrUpdateVisible = true
			this.$nextTick(() => {
			this.$refs.addOrUpdate.init(id)
			})
		},
		getSearchFilters(){//搜索
			let params = {
				studentId: this.filters.studentId,
				pageNum:0,
				pageSize:10
			}
			if(this.filters.explainDate !== ''){
				params.explainDate = this.filters.explainDate
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
		},
		handleSizeChange(val) {
			this.filters.pageSize = val;
			this.filters.currentPage = 1;//每次改变每页多少条都会重置当前页码为1
			console.log(`每页 ${val} 条`);
		},
		
	},
	mounted() {
		//his.getDataList(this.filters);
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