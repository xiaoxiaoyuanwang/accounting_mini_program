<template>
	<view :class="{wrapper: isGrey}">
		<view v-if="hasLogin && userInfo && userInfo.role && userInfo.role.indexOf('experience account') !== -1">
			<uni-notice-bar style="margin: 0;" show-icon single text="当前登录账号为体验账号,请及时登录自己的账号!" />
		</view>
		<slot></slot>
	</view>

</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		name: 'wrapperPage',
		computed: {
			isGrey() {
				return this.$store.state.isGrey
			},
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
		},
		created() {
			this.initStyle()
		},
		methods: {
			initStyle() {
				if (!this.isGrey) {
					return
				}
				// 设置导航栏样式
				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: '#6A6A6A',
				})


				// 设置tabbar样式
				uni.setTabBarStyle({
					color: '#7E7E7E',
					selectedColor: '#6A6A6A',
				})
				uni.setTabBarItem({
					index: 0,
					text: '明细',
					iconPath: 'static/bars/detail.png',
					selectedIconPath: 'static/bars/detail_grey.png'
				})
				uni.setTabBarItem({
					index: 1,
					text: '统计',
					iconPath: 'static/bars/report.png',
					selectedIconPath: 'static/bars/report_grey.png',
				})
				uni.setTabBarItem({
					index: 2,
					text: '我的',
					iconPath: 'static/bars/my.png',
					selectedIconPath: 'static/bars/my_grey.png',
				})
			},
		},
		watch: {
			isGrey: {
				handler(newVal, oldVal) {
					if (newVal) {
						this.initStyle()
					}
				}
			},
		},
	}
</script>
<style lang="scss">
	.wrapper {
		filter: grayscale(1);

		canvas {
			filter: grayscale(1);
		}
	}
</style>