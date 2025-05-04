<template>
	<view>
		<view :key="index" v-for="(item, key, index) in listObj">
			<view class="types_label" v-if="popupType !== 'selectYear'"
				:style="{textAlign:popupType==='selectType'?'left':'center'}">
				{{key}}
			</view>
			<view class="types_btns_wrapper">
				<view :class="'class_'+index+'_'+indexSec" class="types_btns" :key="indexSec"
					v-for="(itemSec,indexSec) in item">
					<u-button :custom-style="comColor(itemSec.icon_color,'color')" @click="btnClick(itemSec)"
						:type="active2 ==itemSec.label && active1 ==itemSec.type?'primary':'info'" size="large"
						:text="itemSec.label"></u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "popupBtn",
		props: {
			listObj: {
				type: Object,
				default: () => {
					return {}
				}
			},
			activeType: {
				type: String,
				default: ''
			},
			activeTypeFirst: {
				type: String,
				default: ''
			},
			popupType: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				active1: '',
				active2: ''
			};
		},
		watch: {
			activeTypeFirst: {
				handler(newVal, oldVal) {
					if (newVal !== oldVal) {
						this.active1 = newVal
					}
				},
				immediate: true
			},
			activeType: {
				handler(newVal, oldVal) {
					if (newVal !== oldVal) {
						this.active2 = newVal
					}
				},
				immediate: true
			}
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
		},
		methods: {
			btnClick(item) {
				let obj = {
					item,
					popupType: this.popupType
				}
				this.$emit('btnClickCb', obj)
			}
		}
	}
</script>

<style lang="scss">
	.types_btns_wrapper {
		padding-bottom: 10px;
		flex-direction: row;
		// justify-content: space-between;
		flex-wrap: wrap;
	}

	.types_btns {
		width: 30%;
		margin: 0 1.66% 10px;
	}

	.types_label {
		padding: 0 1.66% 10px;
		text-align: center;
	}
</style>