<template>
	<!-- <scroll-view scroll-y :style="[getAreaStyle]" :scroll-top="scrollTop" @scroll="handleScroll"> -->
	<view>
		<view :style="[getAreaStyle]">
			<movable-area :style="[getAreaStyle]">
				<movable-view v-for="(item, index) in list" :animation="animation" :direction="direction" :key="item.key"
					:damping="damping" :x="item.x" :y="item.y" :disabled="longpress ? disabled : false"
					@longpress="handleLongpress" @touchstart="handleDragStart(index)" @change="handleMoving"
					@touchend="handleDragEnd" :style="[getViewStyle]" class="base-drag-wrapper"
					:class="{ active: activeIndex === index }">
					<template v-if="dragType==='remark'">
						<uni-swipe-action-item :right-options="rightOptions" :auto-close="false"
							@click="disabled&&optBack($event,item)">
							<view class="list_item">
								{{`${index + 1} - ${item.label}`}}
							</view>
						</uni-swipe-action-item>
					</template>

					<template v-if="dragType==='type'">
						<view class="colWrap2" @click="disabled&&optBack(item, index)">
							<button class="type_btn" plain="true" type="primary">
								<view class="img_item_btn" v-if="item.icon_color">
									<text class="iconfont colItemImg" :class="item.icon_class"
										:style="{ color: 'rgba(' + item.icon_color.r + ',' + item.icon_color.g + ',' + item.icon_color.b + ',' + item.icon_color.a + ')' }"></text>
									<text class="colItemLabel"
										:style="{ color: 'rgba(' + item.icon_color.r + ',' + item.icon_color.g + ',' + item.icon_color.b + ',' + item.icon_color.a + ')' }">
										{{item.label}}
									</text>
									<text class="edit_tip">
										轻点编辑
									</text>
								</view>
								<view class="img_item_btn" v-else>
									<text class="iconfont colItemImg" :class="item.icon_class"></text>
									<text class="colItemLabel">
										{{item.label}}
									</text>
									<text class="edit_tip">
										轻点编辑
									</text>
								</view>
							</button>
						</view>
					</template>
				</movable-view>
			</movable-area>
		</view>
		<loadAllData v-if="isAll && showNodata && list.length>0"></loadAllData>
	</view>
	<!-- </scroll-view> -->
</template>

<script>
	export default {
		props: {
			countNum: {
				type: Number || null,
				default: null
			},
			showNodata: {
				type: Boolean,
				default: false
			},
			dragType: {
				type: String,
				default: ""
			},
			column: {
				type: Number,
				default: 3
			},
			value: {
				type: Array,
				default: () => []
			},
			wrapperMaxHeight: {
				type: String,
				default: '100vh'
			},
			width: {
				type: String,
				default: '100%'
			},
			height: {
				type: String,
				default: 'auto'
			},
			itemKey: {
				type: String,
				required: true
			},
			itemHeight: {
				type: String,
				default: '60px'
			},
			direction: {
				type: String,
				default: 'all',
				validator: value => {
					return ['all', 'vertical', 'horizontal', 'none'].includes(value);
				}
			},
			animation: {
				type: Boolean,
				default: true
			},
			damping: {
				type: Number,
				default: 20
			},
			longpress: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				list: [],
				disabled: true,
				activeIndex: -1,
				moveToIndex: -1,
				oldIndex: -1,
				tempDragInfo: {
					x: '',
					y: ''
				},
				cloneList: [],
				scrollTop: 0,
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
				customStyleTypes: {
					border: 'none',
					color: '#007aff',
					height: '140rpx',
					fontSize: '24rpx',
					padding: 0
				},
			};
		},
		computed: {
			isAll() {
				return this.countNum !== null && this.list.length >= this.countNum
			},
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
			getScrollStyle() {
				const width = this.getRealWidth(this.width);
				return {
					width: width * 2 + 'rpx',
					maxHeight: this.wrapperMaxHeight
				};
			},
			getAreaStyle() {
				const width = this.getRealWidth(this.width);
				return {
					width: width * 2 + 'rpx',
					height: Math.ceil(this.list.length / this.column) * this.getItemHeight * 2 + 'rpx'
				};
			},
			getViewStyle() {
				const {
					itemHeight,
					getItemWidth
				} = this;
				return {
					width: getItemWidth * 2 + 'rpx',
					height: itemHeight
				};
			},
			getItemHeight() {
				return parseFloat(this.itemHeight);
			},
			getItemWidth() {
				if (this.column === 0) return;
				const width = this.getRealWidth(this.width);
				return (parseFloat(width) / this.column).toFixed(2);
			}
		},
		methods: {
			optBack(e, item) {
				this.$emit('clickItem', e, item);
			},
			//获取实际的宽度
			getRealWidth(width) {
				if (width.includes('%')) {
					const windowWidth = uni.getSystemInfoSync().windowWidth;
					width = windowWidth * (parseFloat(width) / 100);
				}
				return width;
			},

			initList(list = []) {
				const newList = this.deepCopy(list);
				this.list = newList.map((item, index) => {
					const [x, y] = this.getPosition(index);
					return {
						...item,
						x,
						y,
						key: Math.random() + index
					};
				});
				this.cloneList = this.deepCopy(this.list);
			},

			//长按
			handleLongpress() {
				this.disabled = false;
			},

			//拖拽开始
			handleDragStart(index) {
				this.activeIndex = index;
				this.oldIndex = index;
			},

			//拖拽中
			handleMoving(e) {
				if (e.detail.source !== 'touch' || this.disabled) return;
				const {
					x,
					y
				} = e.detail;
				Object.assign(this.tempDragInfo, {
					x,
					y
				});
				const currentX = Math.floor((x + this.getItemWidth / 2) / this.getItemWidth);
				const currentY = Math.floor((y + this.getItemHeight / 2) / this.getItemHeight);

				this.moveToIndex = Math.min(currentY * this.column + currentX, this.list.length - 1);

				if (this.oldIndex !== this.moveToIndex && this.oldIndex !== -1 && this.moveToIndex !== -1) {
					const newList = this.deepCopy(this.cloneList);
					newList.splice(this.moveToIndex, 0, ...newList.splice(this.activeIndex, 1));

					this.list.forEach((item, index) => {
						if (index !== this.activeIndex) {
							const itemIndex = newList.findIndex(val => val._id === item._id);
							[item.x, item.y] = this.getPosition(itemIndex);
						}
					});
					this.oldIndex = this.moveToIndex;
					this.scrollIntoView();
				}
			},

			//获取当前的位置
			getPosition(index) {
				const x = (index % this.column) * this.getItemWidth;
				const y = Math.floor(index / this.column) * this.getItemHeight;
				return [x, y];
			},

			//拖拽结束
			handleDragEnd(e) {
				if (this.disabled) return;
				if (this.moveToIndex !== -1 && this.activeIndex !== -1 && this.moveToIndex !== this.activeIndex) {
					this.cloneList.splice(this.moveToIndex, 0, ...this.cloneList.splice(this.activeIndex, 1));
				} else {
					this.$set(this.list[this.activeIndex], 'x', this.tempDragInfo.x);
					this.$set(this.list[this.activeIndex], 'y', this.tempDragInfo.y);
				}
				this.initList(this.cloneList);
				const endList = this.list.map(item => this.omit(item, ['x', 'y', 'key']));
				this.$emit('endDrag', endList);

				this.activeIndex = -1;
				this.oldIndex = -1;
				this.moveToIndex = -1;
				this.disabled = true;
			},

			scrollIntoView() {
				if (this.height === 'auto') return;
				const {
					height,
					moveToIndex,
					getItemHeight,
					scrollTop
				} = this;

				if ((moveToIndex + 1) * this.getItemHeight >= scrollTop + parseFloat(height)) {
					this.scrollTop = Math.min(parseFloat(this.getAreaStyle.height), scrollTop + Math.ceil(moveToIndex / 2) * this
						.getItemHeight);
				} else if ((moveToIndex - 1) * this.getItemHeight <= scrollTop) {
					this.scrollTop = Math.max(0, scrollTop - Math.ceil(moveToIndex / 2) * this.getItemHeight);
				}
			},

			setScrollTop(index) {
				this.scrollTop = index * this.getItemHeight;
			},

			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop;
			},

			deepCopy(source) {
				return JSON.parse(JSON.stringify(source));
			},

			/**
			 * 排除掉obj里面的key值
			 * @param {object} obj
			 * @param {Array|string} args
			 * @returns {object}
			 */
			omit(obj, args) {
				if (!args) return obj;
				const newObj = {};
				const isString = typeof args === 'string';
				const keys = Object.keys(obj).filter(item => {
					if (isString) {
						return item !== args;
					}
					return !args.includes(item);
				});

				keys.forEach(key => {
					if (obj[key] !== undefined) newObj[key] = obj[key];
				});
				return newObj;
			},
		},
		watch: {
			value: {
				handler() {
					this.initList(this.value);
				},
				immediate: true,
				deep: true
			}
		}
	};
</script>

<style lang="scss" scoped>
	.base-drag-wrapper {
		opacity: 1;
		z-index: 1;

		&.active {
			opacity: 0.7;
			transform: scale(1.3);
			z-index: 9;
			background-color: #dedede;
			border-radius: 10rpx;
		}
	}

	.colWrap2 {
		flex-wrap: wrap;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
		align-content: center;
	}

	.img_item_btn {
		align-items: center;
	}

	.colItemLabel {
		padding: 10rpx 0;
		color: #007aff;
	}

	.edit_tip {
		color: #ccc;
		height: 32rpx;
	}

	// button[type=default] {
	// 	background-color: transparent;
	// }

	// .button-hover[type=default] {
	// 	background-color: #dedede!important;
	// 	color: rgba(0, 0, 0, .6);
	// }
	// .button::hover[type=default] {
	// 	background-color: #dedede!important;
	// 	color: rgba(0, 0, 0, .6);
	// }

	.type_btn {
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #007aff;
		height: 100%;
		font-size: 12px;
		padding: 0;
		width: 100%;
		border: none !important;
	}

	.type_btn::after {
		border: none;
	}
</style>
<style lang="scss">
	.button-hover[type=primary][plain] {
		background: #dedede !important;
		background-color: #dedede !important;
	}
</style>