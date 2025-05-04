<!-- 用户资料页 -->
<template>
	<view class="uni-content">
		<view v-if="hasLogin" class="avatar">
			<uni-id-pages-avatar width="200rpx" height="200rpx"></uni-id-pages-avatar>
		</view>
		<uni-list>
			<uni-list-item class="item" @click="showSetNickname" title="昵称" :rightText="userInfo.nickname||'未设置'" link>
			</uni-list-item>
			<!-- #ifdef MP-WEIXIN -->
			<uni-list-item v-if="hasLogin" class="item" title="手机号" @click="errorTip"
				:rightText="userInfo.mobile||'请移步支付宝小程序'" link>
			</uni-list-item>
			<!-- #endif -->
			<!-- 非微信展示手机号 -->
			<!-- #ifndef MP-WEIXIN -->
			<uni-list-item v-if="hasLogin" class="item" @click="bindMobile" title="手机号"
				:rightText="userInfo.mobile||'未绑定'" link>
			</uni-list-item>
			<!-- #endif -->
			<uni-list-item v-if="userInfo.email" class="item" title="电子邮箱" :rightText="userInfo.email">
			</uni-list-item>
			<!-- #ifdef APP -->
			<!-- 如未开通实人认证服务，可以将实名认证入口注释 -->
			<uni-list-item class="item" @click="realNameVerify" title="实名认证"
				:rightText="realNameStatus !== 2 ? '未认证': '已认证'" link>
			</uni-list-item>
			<!-- #endif -->
			<uni-list-item v-if="hasPwd" class="item" @click="changePassword" title="修改密码" link>
			</uni-list-item>
			<uni-list-item v-if="!hasPwd" class="item" @click="setPassword" title="设置密码" link>
			</uni-list-item>
		</uni-list>
		<view class="mt10">
			<uni-list>
				<uni-list-item @click="deactivate" title="注销账号" link="navigateTo"></uni-list-item>
			</uni-list>
		</view>


		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog mode="input" :before-close="true" maxlength="32" :value="userInfo.nickname"
				@confirm="setNickname" @close="closeNickname" :inputType="setNicknameIng?'nickname':'text'" title="设置昵称"
				placeholder="请输入要设置的昵称">
			</uni-popup-dialog>
		</uni-popup>
		<uni-id-pages-bind-mobile ref="bind-mobile-by-sms" @success="bindMobileSuccess"></uni-id-pages-bind-mobile>
		<template v-if="showLoginManage">
			<button v-if="userInfo._id" @click="logout">退出登录</button>
			<button v-else @click="login">去登录</button>
		</template>
	</view>
</template>
<script>
	const uniIdCo = uniCloud.importObject("uni-id-co")
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	// const xm_message_burying_point = 'xm-message-burying-point'
	export default {
		computed: {
			userInfo() {
				return store.userInfo
			},
			realNameStatus() {
				if (!this.userInfo.realNameAuth) {
					return 0
				}

				return this.userInfo.realNameAuth.authStatus
			},
			hasLogin() {
				return store.hasLogin
			},
		},
		data() {
			return {
				univerifyStyle: {
					authButton: {
						"title": "本机号码一键绑定", // 授权按钮文案
					},
					otherLoginButton: {
						"title": "其他号码绑定",
					}
				},
				// userInfo: {
				// 	mobile:'',
				// 	nickname:''
				// },
				hasPwd: false,
				showLoginManage: false, //通过页面传参隐藏登录&退出登录按钮
				setNicknameIng: false
			}
		},
		async onShow() {
			this.univerifyStyle.authButton.title = "本机号码一键绑定"
			this.univerifyStyle.otherLoginButton.title = "其他号码绑定"
			//判断当前用户是否有密码，否则就不显示密码修改功能
			let res = await uniIdCo.getAccountInfo()
			this.hasPwd = res.isPasswordSet
		},
		async onLoad(e) {
			if (e.showLoginManage) {
				this.showLoginManage = true //通过页面传参隐藏登录&退出登录按钮
			}
			// try {
			// 	let data = {
			// 		type: "信息标识",
			// 		content: 'info'
			// 	}
			// 	db.collection(xm_message_burying_point).add(data).then(res => {
			// 		console.log(111, data);
			// 	})
			// } catch (e) {
			// 	let data = {
			// 		type: "信息标识",
			// 		content: JSON.stringify(e)
			// 	}
			// 	db.collection(xm_message_burying_point).add(data).then(res => {
			// 		console.log(222, e);
			// 	})
			// }
		},
		methods: {
			errorTip() {
				uni.showModal({
					content: '请在支付宝中搜索 “小明记账簿” 绑定手机号！',
					showCancel: false,
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			login() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd',
					complete: (e) => {
						// console.log(e);
					}
				})
			},
			logout() {
				mutations.logout()
			},
			bindMobileSuccess() {
				mutations.updateUserInfo()
			},
			changePassword() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd',
					complete: (e) => {
						// console.log(e);
					}
				})
			},
			setPassword() {
				uni.navigateTo({
					url: `/uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd`,
					complete: (e) => {
						// console.log(e);
					}
				})
			},
			bindMobile() {
				// #ifdef MP-WEIXIN || MP-ALIPAY
				this.bindMobileBySmsCode()
				// this.$refs['bind-mobile-by-sms'].open()
				// #endif
				return
				if (!this.userInfo.mobile) {
					uni.showModal({
						title: '获取手机号须知',
						content: '之后需要您输入手机号码进行绑定，方便以后找回密码，更多详情请移步隐私政策，谢谢！',
						success: (res) => {
							if (res.confirm) {
								// #ifdef APP-PLUS
								uni.preLogin({
									provider: 'univerify',
									success: this.univerify(), //预登录成功
									fail: (res) => { // 预登录失败
										// 不显示一键登录选项（或置灰）
										this.bindMobileBySmsCode()
									}
								})
								// #endif

								// #ifdef MP-WEIXIN || MP-ALIPAY
								this.bindMobileBySmsCode()
								// this.$refs['bind-mobile-by-sms'].open()
								// #endif

								// #ifdef H5
								//...去用验证码绑定
								this.bindMobileBySmsCode()
								// #endif
							} else if (res.cancel) {}
						}
					});
					return
				}

				// #ifdef APP-PLUS
				uni.preLogin({
					provider: 'univerify',
					success: this.univerify(), //预登录成功
					fail: (res) => { // 预登录失败
						// 不显示一键登录选项（或置灰）
						this.bindMobileBySmsCode()
					}
				})
				// #endif

				// #ifdef MP-WEIXIN || MP-ALIPAY
				this.bindMobileBySmsCode()
				// this.$refs['bind-mobile-by-sms'].open()
				// #endif

				// #ifdef H5
				//...去用验证码绑定
				this.bindMobileBySmsCode()
				// #endif
			},
			univerify() {
				uni.login({
					"provider": 'univerify',
					"univerifyStyle": this.univerifyStyle,
					success: async e => {
						uniIdCo.bindMobileByUniverify(e.authResult).then(res => {
							mutations.updateUserInfo()
						}).catch(e => {
							console.log(e);
						}).finally(e => {
							// console.log(e);
							uni.closeAuthView()
						})
					},
					fail: (err) => {
						if (err.code == '30002' || err.code == '30001') {
							this.bindMobileBySmsCode()
						}
					}
				})
			},
			bindMobileBySmsCode() {
				uni.navigateTo({
					url: './bind-mobile/bind-mobile'
				})
			},
			showSetNickname() {
				this.$refs.dialog.open()
			},
			closeNickname() {
				this.$refs.dialog.close()
			},
			setNickname(nickname) {
				if (nickname) {
					mutations.updateUserInfo({
						nickname
					})
					this.setNicknameIng = false
					this.$refs.dialog.close()
				} else {
					return uni.showToast({
						title: '请输入昵称',
						icon: 'none',
						duration: 3000
					});
				}
			},
			deactivate() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate"
				})
			},
			async bindThirdAccount(provider) {
				const uniIdCo = uniCloud.importObject("uni-id-co")
				const bindField = {
					weixin: 'wx_openid',
					alipay: 'ali_openid',
					apple: 'apple_openid',
					qq: 'qq_openid'
				} [provider.toLowerCase()]

				if (this.userInfo[bindField]) {
					await uniIdCo['unbind' + provider]()
					await mutations.updateUserInfo()
				} else {
					uni.login({
						provider: provider.toLowerCase(),
						onlyAuthorize: true,
						success: async e => {
							const res = await uniIdCo['bind' + provider]({
								code: e.code
							})
							if (res.errCode) {
								uni.showToast({
									title: res.errMsg || '绑定失败',
									duration: 3000
								})
							}
							await mutations.updateUserInfo()
						},
						fail: async (err) => {
							console.log(err);
							uni.hideLoading()
						}
					})
				}
			},
			realNameVerify() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/realname-verify/realname-verify"
				})
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		padding: 0;
	}

	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	@media screen and (min-width: 690px) {
		.uni-content {
			padding: 0;
			max-width: 690px;
			margin-left: calc(50% - 345px);
			border: none;
			max-height: none;
			border-radius: 0;
			box-shadow: none;
		}
	}

	/* #endif */
	.avatar {
		align-items: center;
		justify-content: center;
		margin: 22px 0;
		width: 100%;
	}

	.item {
		flex: 1;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	button {
		margin: 10%;
		margin-top: 40px;
		border-radius: 0;
		background-color: #FFFFFF;
		width: 80%;
	}

	.mt10 {
		margin-top: 10px;
	}
</style>