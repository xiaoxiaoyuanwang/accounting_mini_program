<!-- 账号密码登录页 -->
<template>
	<wrapperPage>
		<view class="uni-content">
			<view class="login-logo">
				<image :src="logo"></image>
			</view>
			<!-- 顶部文字 -->
			<text class="title title-box">账号密码登录</text>
			<uni-forms>
				<uni-forms-item name="username">
					<uni-easyinput :focus="focusUsername" @blur="focusUsername = false" class="input-box"
						:inputBorder="false" v-model="username" placeholder="请输入手机号/用户名/邮箱" />
				</uni-forms-item>
				<uni-forms-item name="password">
					<uni-easyinput :focus="focusPassword" @blur="focusPassword = false" class="input-box" clearable
						type="password" :inputBorder="false" v-model="password" placeholder="请输入密码" />
				</uni-forms-item>
			</uni-forms>
			<uni-captcha v-if="needCaptcha" focus ref="captcha" scene="login-by-pwd" v-model="captcha" />
			<!-- 带选择框的隐私政策协议组件 -->
			<uni-id-pages-agreements scope="login" ref="agreements"></uni-id-pages-agreements>
			<view class="root">
				<checkbox-group @change="rememberPasswordFlagFun">
					<label class="checkbox-box">
						<checkbox :checked="rememberPasswordFlag" style="transform: scale(0.5);margin-right: -6px;" />
						<text class="text" style="padding-left: 5px;">记住密码</text>
					</label>
				</checkbox-group>
			</view>
			<button class="uni-btn" type="primary" @click="pwdLogin">登录</button>
			<button class="uni-btn uni-btn2" type="primary" plain="true" @click="pwdLogin2">使用体验账号快速登录</button>
			<!-- 忘记密码 -->
			<view class="link-box">
				<view v-if="!config.isAdmin">
					<text class="forget">忘记了？</text>
					<text class="link" @click="toRetrievePwd">找回密码</text>
				</view>
				<text class="link" @click="toRegister">{{config.isAdmin ? '注册管理员账号': '注册账号'}}</text>
				<!-- <text class="link" @click="toRegister" v-if="!config.isAdmin">注册账号</text> -->
			</view>
			<!-- 悬浮登录方式组件 -->
			<uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login>
		</view>
	</wrapperPage>
</template>

<script>
	import wrapperPage from '@/components/wrapperPage/wrapperPage'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	const uniIdCo = uniCloud.importObject("uni-id-co", {
		errorOptions: {
			type: 'toast'
		}
	})
	export default {
		components: {
			wrapperPage
		},
		mixins: [mixin],
		data() {
			return {
				"password": "",
				"username": "",
				"captcha": "",
				"needCaptcha": false,
				"focusUsername": false,
				"focusPassword": false,
				rememberPasswordFlag: false,
			}
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.pwdLogin()
				}
			};
			// #endif

			if (uni.getStorageSync('rememberUsername')) {
				this.username = uni.getStorageSync('rememberUsername')
			}
			if (uni.getStorageSync('rememberPassword')) {
				this.password = uni.getStorageSync('rememberPassword')
			}
			if (uni.getStorageSync('rememberPasswordFlag')) {
				this.rememberPasswordFlag = uni.getStorageSync('rememberPasswordFlag')
			}
		},
		methods: {
			rememberPasswordFlagFun(e) {
				this.rememberPasswordFlag = !this.rememberPasswordFlag
			},
			// 页面跳转，找回密码
			toRetrievePwd() {
				let url = '/uni_modules/uni-id-pages/pages/retrieve/retrieve'
				//如果刚好用户名输入框的值为手机号码，就把它传到retrieve页面，根据该手机号找回密码
				if (/^1\d{10}$/.test(this.username)) {
					url += `?phoneNumber=${this.username}`
				}
				uni.navigateTo({
					url
				})
			},
			/**
			 * 密码登录
			 */
			pwdLogin() {
				if (!this.password.length) {
					this.focusPassword = true
					return uni.showToast({
						title: '请输入密码',
						icon: 'none',
						duration: 3000
					});
				}
				if (!this.username.length) {
					this.focusUsername = true
					return uni.showToast({
						title: '请输入手机号/用户名/邮箱',
						icon: 'none',
						duration: 3000
					});
				}
				if (this.needCaptcha && this.captcha.length != 4) {
					this.$refs.captcha.getImageCaptcha()
					return uni.showToast({
						title: '请输入验证码',
						icon: 'none',
						duration: 3000
					});
				}

				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.pwdLogin)
				}

				let data = {
					"password": this.password,
					"captcha": this.captcha
				}

				if (/^1\d{10}$/.test(this.username)) {
					data.mobile = this.username
				} else if (/@/.test(this.username)) {
					data.email = this.username
				} else {
					data.username = this.username
				}
				if (this.rememberPasswordFlag) {
					uni.setStorageSync('rememberUsername', this.username)
					uni.setStorageSync('rememberPassword', this.password)
					uni.setStorageSync('rememberPasswordFlag', this.rememberPasswordFlag)
				} else {
					uni.setStorageSync('rememberUsername', '')
					uni.setStorageSync('rememberPassword', '')
					uni.setStorageSync('rememberPasswordFlag', this.rememberPasswordFlag)
				}

				uniIdCo.login(data).then(e => {
					this.loginSuccess(e)
				}).catch(e => {
					if (e.errCode == 'uni-id-captcha-required') {
						this.needCaptcha = true
					} else if (this.needCaptcha) {
						//登录失败，自动重新获取验证码
						this.$refs.captcha.getImageCaptcha()
					}
				})
			},
			pwdLogin2() {
				this.username = '小明记账簿'
				this.password = 'xm88888888'
				this.pwdLogin()
			},
			/* 前往注册 */
			toRegister() {
				uni.navigateTo({
					url: this.config.isAdmin ? '/uni_modules/uni-id-pages/pages/register/register-admin' :
						'/uni_modules/uni-id-pages/pages/register/register',
					fail(e) {
						console.error(e);
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	@media screen and (min-width: 690px) {
		.uni-content {
			height: auto;
		}
	}

	.forget {
		font-size: 12px;
		color: #8a8f8b;
	}

	.link-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: space-between;
		margin-top: 20px;
	}

	.link {
		font-size: 12px;
	}

	.root {
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		color: #8a8f8b;
	}

	.checkbox-box,
	.uni-label-pointer {
		align-items: center;
		display: flex;
		flex-direction: row;
	}

	.item {
		flex-direction: row;
	}

	.text {
		line-height: 26px;
	}
</style>