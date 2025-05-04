import dayjs from 'dayjs'
const db = uniCloud.database()
const dbcmd = db.command
const numObj = {
	"1": "日报",
	"2": "月报",
	"3": "年报",
}
const formatDe3 = "YYYY"
const xm_message_template = "xm-message-template"
const xm_message_times = "xm-message-times"
let messageMixin = {
	data() {
		return {
			timesYear: 2,
			timesMonth: 13,
			timesDay: 366,
			// 订阅次数
			messageTimesObj: {},
			templateObj: {}
		}
	},
	methods: {
		getTemplateFun(cb) {
			if (!this.hasLogin) {
				return
			}
			db.collection(xm_message_template).get({
				getOne: true
			}).then(res => {
				this.templateObj = res.result.data
				cb && cb()
			})
		},
		getMessageTimes(cb) {
			let useUid = uni.getStorageSync("useUid")
			if (!this.hasLogin || !useUid) {
				return
			}
			db.collection(xm_message_times).where({
					user_id: db.getCloudEnv('$cloudEnv_uid'),
					time: dayjs().format(formatDe3),
					platform: process.env.UNI_PLATFORM,
					uid: useUid
				})
				.get({
					getOne: true
				}).then(res => {
					console.log('获取消息次数', res.result.data)
					this.messageTimesObj = res.result.data || {}
				}).finally(() => {
					console.log('获取消息次数-catch', this.messageTimesObj)
					this.$nextTick(() => {
						cb && cb()
					})
				})
		},
		async getMessageTimesHistory(time) {
			let useUid = uni.getStorageSync("useUid")
			if (!this.hasLogin || !useUid) {
				return
			}
			return db.collection(xm_message_times).where({
					user_id: db.getCloudEnv('$cloudEnv_uid'),
					time: time ? time : dayjs().format(formatDe3),
					platform: process.env.UNI_PLATFORM,
					uid: useUid
				})
				.get({
					getOne: true
				})
		},
		// 只改变状态-当次数大于设定次数时
		onlyChangeStatues(ajaxData, cb) {
			db.collection(xm_message_times).doc(this.messageTimesObj._id)
				.update(ajaxData).then(res => {}).finally(() => {
					cb && cb()
				})
		},
		async addNums(ajaxData, num, cb) {
			let useUid = uni.getStorageSync("useUid")
			if (!useUid) {
				return
			}
			let params = {
				time: dayjs().format(formatDe3),
				platform: process.env.UNI_PLATFORM,
				uid: useUid,
				...ajaxData
			}
			console.log('消息次数请求数据-' + numObj[num], params)
			if (this.messageTimesObj._id) {
				if (params.wxDayTimes < this.timesDay ||
					params.wxMonthTimes < this.timesMonth ||
					params.wxYearTimes < this.timesYear ||
					params.aliDayTimes < this.timesDay ||
					params.aliMonthTimes < this.timesMonth ||
					params.aliYearTimes < this.timesYear
				) {
					db.collection(xm_message_times).where({
						_id: this.messageTimesObj._id
					}).update(params).then((resTimes) => {
						console.log('消息增加次数-修改-' + numObj[num], resTimes)
					}).finally(() => {
						console.log('finally-修改-' + numObj[num], params)
						cb && cb()
					})
				}
			} else {
				let history = await this.getMessageTimesHistory(dayjs().subtract(1, 'year').format(formatDe3))
				let hisDt = history.result.data
				let defaultFlag = {}
				// #ifdef MP-WEIXIN

				if (hisDt) {
					if (hisDt.wxDisabledDay !== undefined) {
						defaultFlag.wxDisabledDay = hisDt.wxDisabledDay
					}
					if (hisDt.wxDisabledMonth !== undefined) {
						defaultFlag.wxDisabledMonth = hisDt.wxDisabledMonth
					}
					if (hisDt.wxDisabledYear !== undefined) {
						defaultFlag.wxDisabledYear = hisDt.wxDisabledYear
					}
				}
				// #endif

				// #ifdef MP-ALIPAY
				if (hisDt) {
					if (hisDt.aliDisabledDay !== undefined) {
						defaultFlag.aliDisabledDay = hisDt.aliDisabledDay
					}
					if (hisDt.aliDisabledMonth !== undefined) {
						defaultFlag.aliDisabledMonth = hisDt.aliDisabledMonth
					}
					if (hisDt.aliDisabledYear !== undefined) {
						defaultFlag.aliDisabledYear = hisDt.aliDisabledYear
					}
				}
				// #endif
				db.collection(xm_message_times).add({
					...defaultFlag,
					...params
				}).then((resTimes) => {
					console.log('消息新增次数-新增-' + numObj[num], resTimes)
				}).finally(() => {
					console.log('finally-新增-' + numObj[num], params)
					cb && cb()
				})
			}
		},
		async requestSubscribeMessageFun(num, params, paramsExtra = {}, cb) {
			console.log("订阅消息进来了");
			// params只包含次数，其它参数放在paramsExtra
			let ajaxData = {
				...this.messageTimesObj,
				...paramsExtra
			}
			let tem = ''
			// #ifdef MP-WEIXIN
			if (num === 1) {
				tem = this.templateObj.wxDayTemplate
				// 关闭消息
				if (ajaxData.wxDisabledDay) {
					return
				}
			}
			if (num === 2) {
				tem = this.templateObj.wxMonthTemplate
				// 关闭消息
				if (ajaxData.wxDisabledMonth) {
					return
				}
			}
			if (num === 3) {
				tem = this.templateObj.wxYearTemplate
				// 关闭消息
				if (ajaxData.wxDisabledYear) {
					return
				}
			}
			if ((num === 1 && params.wxDayTimes < this.timesDay) ||
				(num === 2 && params.wxMonthTimes < this.timesMonth) ||
				(num === 3 && params.wxYearTimes < this.timesYear)
			) {
				// 小程序订阅消息模板id
				uni.requestSubscribeMessage({
					tmplIds: [tem],
					success: (resSuc) => {
						console.log('微信订阅成功-' + numObj[num], resSuc)
						if (resSuc[this.templateObj.wxDayTemplate] === 'accept') {
							ajaxData.wxDayTimes = params.wxDayTimes
							this.addNums(ajaxData, num, cb)
						}
						if (resSuc[this.templateObj.wxMonthTemplate] === 'accept') {
							ajaxData.wxMonthTimes = params.wxMonthTimes
							this.addNums(ajaxData, num, cb)
						}
						if (resSuc[this.templateObj.wxYearTemplate] === 'accept') {
							ajaxData.wxYearTimes = params.wxYearTimes
							this.addNums(ajaxData, num, cb)
						}
					},
					fail: (resFail) => {
						console.log('微信订阅失败-' + numObj[num], {
							...resFail,
							tem
						})
					},
					// complete: () => {
					// 	cb && cb()
					// }
				})
			} else {
				this.onlyChangeStatues(paramsExtra, cb)
			}
			// #endif

			// #ifdef MP-ALIPAY
			if (num === 1) {
				tem = this.templateObj.aliDayTemplate
				// 关闭消息
				if (ajaxData.aliDisabledDay) {
					return
				}
			}
			if (num === 2) {
				tem = this.templateObj.aliMonthTemplate
				// 关闭消息
				if (ajaxData.aliDisabledMonth) {
					return
				}
			}
			if (num === 3) {
				tem = this.templateObj.aliYearTemplate
				// 关闭消息
				if (ajaxData.aliDisabledYear) {
					return
				}
			}
			if ((num === 1 && params.aliDayTimes < this.timesDay) ||
				(num === 2 && params.aliMonthTimes < this.timesMonth) ||
				(num === 3 && params.aliYearTimes < this.timesYear)
			) {
				my.requestSubscribeMessage({
					//需要用户订阅的消息模板的id的集合
					entityIds: [tem],
					success: (resSuc) => {
						console.log("支付宝订阅成功-" + numObj[num], resSuc)
						if (resSuc[this.templateObj.aliDayTemplate] === 'accept') {
							ajaxData.aliDayTimes = params.aliDayTimes
							this.addNums(ajaxData, num, cb)
						}
						if (resSuc[this.templateObj.aliMonthTemplate] === 'accept') {
							ajaxData.aliMonthTimes = params.aliMonthTimes
							this.addNums(ajaxData, num, cb)
						}
						if (resSuc[this.templateObj.aliYearTemplate] === 'accept') {
							ajaxData.aliYearTimes = params.aliYearTimes
							this.addNums(ajaxData, num, cb)
						}
					},
					fail: (resFail) => {
						console.log('支付宝订阅失败-' + numObj[num], {
							...resFail,
							tem
						})
					},
					// complete: () => {
					// 	cb && cb()
					// }
				})
			} else {
				this.onlyChangeStatues(paramsExtra, cb)
			}
			// #endif

		},
	}
}
export default messageMixin