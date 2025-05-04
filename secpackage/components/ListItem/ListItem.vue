<template>
	<view class="list_item_wrapper">

		<uni-swipe-action :autoClose="true" :disabled="activeRankTypes == '分类'">
			<view v-for="(itemSec,indexSec ) in itemData" :key="indexSec">
				<uni-swipe-action-item :disabled="activeRankTypes == '分类'" :right-options="rightOptions"
					@click="optRightSwipe($event,itemSec)" :auto-close="false">

					<view class="list_item" @click="gotoDetail(itemSec)">
						<view class="rank_view">
							<view v-if="indexSec == 0">
								<text class="iconfont icon-guanjun" style="color: #e86452;font-size: 40rpx;"></text>
							</view>
							<view v-else-if="indexSec == 1">
								<text class="iconfont icon-second" style="color: #ff8945;font-size: 40rpx;"></text>
							</view>
							<view v-else-if="indexSec == 2">
								<text class="iconfont icon-thirst" style="color: #f6bd16;font-size: 40rpx;"></text>
							</view>
							<view v-else class="rank_num">
								{{indexSec+1}}
							</view>
						</view>
						<view class="img_container">
							<view class="img_item">
								<text class="iconfont colItemImg2" :class="itemSec.consumption_icon_class"
									:style="[comColor(itemSec.consumption_icon_color,'color')]"></text>
							</view>
							<view class="tip_img" v-if="itemSec.platform==='mp-weixin'">
								<u-icon name="weixin-fill" color="#2aae67" size="13"></u-icon>
							</view>
							<view class="tip_img" v-if="itemSec.platform==='mp-alipay'">
								<u-icon name="zhifubao" color="#226bf3" size="13"></u-icon>
							</view>
						</view>
						<view class="right_container">
							<view class="right_item left_text flex_row">
								<text>{{itemSec.consumption_label}}</text>
								<text v-if="itemSec.consumption_type =='收入'" class="pay_in">
									{{getAmountFormat(itemSec.consumption_amount)}}
								</text>
								<text v-else-if="itemSec.consumption_type =='支出'" class="pay_out">
									{{getAmountFormat(-itemSec.consumption_amount)}}
								</text>
								<text v-else-if="itemSec.consumption_type =='不计'" class="pay_not">
									{{getAmountFormat(itemSec.consumption_amount, 1)}}
								</text>
							</view>
							<view class="right_item right_text flex_row">
								<view class="color1 remark_view w100 flex_row flex_align_center flex_justify_between"
									v-if="activeRankTypes == '分类' && itemSec.countNum">
									<text>
										{{getAmountNumFormat(itemSec.countNum)}} 笔
									</text>
									<uni-icons type="right" color="#999" size="18"></uni-icons>
								</view>
								<view class="color1 remark_view" v-else>
									<view class="remarkText" v-if="itemSec.consumption_remark">
										<text class="overflowE">{{itemSec.consumption_remark || ''}}</text>
									</view>
								</view>
								<view class="avatar_wrapper">
									<text class="color1">
										{{itemSec.consumption_date|formatData('YYYY-MM-DD')}}
									</text>
								</view>
							</view>
						</view>
					</view>
				</uni-swipe-action-item>
			</view>
		</uni-swipe-action>
		<slot name="bottom"></slot>
	</view>
</template>

<script>
	const db = uniCloud.database()
	const dbcmd = db.command
	const xm_consumption_pages = 'xm-consumption-pages'
	export default {
		name: "ListItem",
		props: {
			hiddenAmountFlag: {
				type: Boolean,
				default: true
			},
			itemType: {
				type: String,
				default: ''
			},
			activeYearMonth: {
				type: String,
				default: ''
			},
			activeYearMonthType: {
				type: String,
				default: ''
			},
			activeRankTypes: {
				type: String,
				default: ''
			},
			consumption_type: {
				type: String,
				default: ''
			},
			itemData: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {
				rightOptions: [{
						text: '编辑',
						style: {
							backgroundColor: '#007aff'
						}
					},
					{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				],
			};
		},
		computed: {
			comColor() {
				return (valObj, key) => {
					if (valObj) {
						let c = `rgba(${valObj.r},${valObj.g},${valObj.b},${valObj.a})`
						return {
							[key]: c
						}
					} else {
						return {}
					}
				}
			},
			getAmountNumFormat() {
				return (num) => {
					if (this.hiddenAmountFlag) {
						return '***'
					} else {
						return num
					}
				}
			},
			getAmountFormat() {
				return (num, type) => {
					if (this.hiddenAmountFlag) {
						return '*****'
					} else {
						let formatAmount = this.$options.filters['formatAmount']
						let changeToThousand = this.$options.filters['changeToThousand']
						if (type) {
							return changeToThousand(formatAmount(num), type)
						} else {
							return changeToThousand(formatAmount(num))
						}
					}
				}
			},
		},
		methods: {
			optRightSwipe(e, item) {
				if (e.content.text == '删除') {
					uni.showModal({
						title: '删除',
						content: '确定要删除该条数据吗？',
						success: (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '删除中'
								})
								db.collection(xm_consumption_pages).doc(item._id).remove().then(() => {
									this.itemType && uni.$emit(this.itemType)
								}).catch(err => {
									uni.showModal({
										title: '删除失败',
										icon: 'error',
										content: JSON.stringify(err),
										showCancel: false
									});
								}).finally(() => {
									uni.hideLoading()
								})
							} else if (res.cancel) {}
						}
					});
				} else {
					this.gotoDetail(item)
				}
			},
			gotoDetail(item) {
				if (this.activeRankTypes === '分类') {
					let de = this.activeYearMonth
					if (this.activeYearMonthType === '按年') {
						de = this.activeYearMonth.slice(0, 4)
					}
					uni.navigateTo({
						url: `/secpackage/bookkeeping/rank/rankType?consumption_type=${this.consumption_type}&consumption_label=${item.consumption_label}&activeYearMonth=${de}&activeYearMonthType=${this.activeYearMonthType}`
					})
				} else {
					uni.navigateTo({
						url: `/secpackage/bookkeeping/addAndEdit/addAndEdit?items=${JSON.stringify(item)}&itemType=${this.itemType}`
					});
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.list_item_wrapper {
		.list_item {
			flex-direction: row;
			border-bottom: 2rpx solid #ddd;
			padding: 20rpx;
		}

		.rank_view {
			justify-content: center;
			padding-right: 20rpx;
		}

		.rank_num {
			width: 40rpx;
			height: 40rpx;
			align-items: center;
			justify-content: center;
		}

		.img_container {
			position: relative;
		}

		.img_item {
			margin-top: 20rpx;
			height: 64rpx;
			width: 64rpx;
			border-radius: 50%;
		}

		.tip_img {
			position: absolute;
			top: -4rpx;
			left: 0rpx;
		}

		.right_container {
			flex: 1;
			// flex-direction: row;
			justify-content: space-between;
			padding-left: 16rpx;
		}

		.right_item {
			justify-content: space-between;
		}

		.left_text {
			align-items: flex-start;
		}

		.right_text {
			align-items: flex-end;
		}

		.remark_view {
			flex-direction: row;
			align-items: center;
		}
	}
</style>