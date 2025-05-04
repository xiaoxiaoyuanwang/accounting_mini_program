<!-- 绑定手机号码页 -->
<template>
	<view class="uni-content">
		<!-- #ifdef MP-WEIXIN -->
		<text class="title title-box">微信暂不支持</text>
		<!-- #endif -->
		<!-- #ifndef MP-WEIXIN -->
		<!-- 顶部文字 -->
		<text class="title title-box">绑定手机号</text>
		<!-- 登录框 (选择手机号所属国家和地区需要另行实现) -->
		<uni-easyinput clearable :focus="focusMobile" @blur="focusMobile = false" type="number" class="input-box"
			:inputBorder="false" v-model="formData.mobile" maxlength="11" placeholder="请输入手机号"></uni-easyinput>
		<view style="margin-bottom: 20px;"></view>
		<uni-id-pages-sms-form ref="smsForm" type="bind-mobile-by-sms" v-model="formData.code" :phone="formData.mobile">
		</uni-id-pages-sms-form>
		<button class="uni-btn send-btn-box" type="primary" @click="submit">提交</button>
		<uni-popup-captcha @confirm="submit" v-model="formData.captcha" scene="bind-mobile-by-sms" ref="popup">
		</uni-popup-captcha>
		<!-- #endif -->
	</view>
</template>
<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	const xm_message_burying_point = 'xm-message-burying-point'
	export default {
		data() {
			return {
				formData: {
					mobile: "",
					code: "",
					captcha: ""
				},
				focusMobile: true
			}
		},
		computed: {
			tipText() {
				return `验证码已通过短信发送至 ${this.formData.mobile}。密码为6 - 20位`
			}
		},
		onLoad(event) {},
		onReady() {},
		onShow() {
			try {
				// 通过页面栈判断上一个页面
				const pages = getCurrentPages();
				const prevPage = pages[pages.length - 2];
				let data = {
					type: "路由跳转",
					content: prevPage.route
				}
				db.collection(xm_message_burying_point).add(data).then(res => {
					console.log(111, data);
				})
			} catch (e) {
				let data = {
					type: "路由跳转",
					content: JSON.stringify(e)
				}
				db.collection(xm_message_burying_point).add(data).then(res => {
					console.log(222, e);
				})
			}
		},
		methods: {
			/**
			 * 完成并提交
			 */
			submit() {
				if (!/^1\d{10}$/.test(this.formData.mobile)) {
					this.focusMobile = true
					return uni.showToast({
						title: '手机号码格式不正确',
						icon: 'none',
						duration: 3000
					});
				}
				if (!/^\d{6}$/.test(this.formData.code)) {
					this.$refs.smsForm.focusSmsCodeInput = true
					return uni.showToast({
						title: '验证码格式不正确',
						icon: 'none',
						duration: 3000
					});
				}

				const uniIdCo = uniCloud.importObject("uni-id-co")
				uniIdCo.bindMobileBySms(this.formData).then(e => {
					uni.showToast({
						title: e.errMsg,
						icon: 'none',
						duration: 3000
					});
					// #ifdef APP-NVUE
					const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
					// #endif
					// #ifndef APP-NVUE
					const eventChannel = this.getOpenerEventChannel();
					// #endif
					mutations.setUserInfo(this.formData)
					uni.navigateBack()
				}).catch(e => {
					console.log(e);
					if (e.errCode == 'uni-id-captcha-required') {
						this.$refs.popup.open()
					}
				}).finally(e => {
					this.formData.captcha = ""
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		padding: 0;
		align-items: center;
		justify-content: center;
		padding: 50rpx;
		padding-top: 10px;
	}

	.input-box {
		width: 100%;
		margin-top: 16px;
		background-color: #f9f9f9;
		border-radius: 6rpx;
		flex-direction: row;
		flex-wrap: nowrap;
		margin-bottom: 20px;
	}

	.send-btn-box {
		margin-top: 20px;
	}
</style>