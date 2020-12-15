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
				<el-button type="primary" @click="getSearchFilters()">Search</el-button>
			</el-form-item>
		</el-form>
	</el-col>

	<!--列表-->
	<el-table class="userTable" border :data="dataList" highlight-current-row v-loading="listLoading"> 
		<el-table-column prop="eventName" label="Event"></el-table-column> 
		<el-table-column prop="rank" label="Rank"></el-table-column> 
		<el-table-column prop="userImg" label="Avatar">
			<template slot-scope="scope">
				<img class="listImg" :src="scope.row.userImg" @click="showPreviewImage(scope.row.userImg)" />
			</template>
		</el-table-column> 
		<el-table-column prop="ign" label="In-Game Name"></el-table-column> 
		<el-table-column prop="country" label="Country"></el-table-column> 
		<el-table-column prop="level" label="Level"></el-table-column>
		<el-table-column prop="eventCast" label="Event Point"></el-table-column>
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
			imgsVisible:false,
			imgs: "",
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
	methods: {
		showPreviewImage(url){
			this.imgsVisible = true;
			this.imgs = url
		},
		//搜索
		getSearchFilters(){
			let params = {
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
					keyWord:"",
					pageNum:this.filters.pageNum,
					pageSize:this.filters.pageSize
				}
			}
			let that = this;
			this.listLoading = true;
			this.$http({
              url: this.$http.adornUrl('/eventRegist/pc/findRegistList'),
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
			this.filters.currentPage = 1;
			console.log(`每页 ${val} 条`);
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
</style>