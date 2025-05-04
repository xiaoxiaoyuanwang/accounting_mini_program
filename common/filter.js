import dayjs from 'dayjs'
const weekArray = ["日", "一", "二", "三", "四", "五", "六"];
export const filterObj = {
	formatData: (time, format) => {
		if (!time) {
			return ''
		}
		const date = dayjs(time).format(format)
		return date
	},
	formatWeek: (time) => {
		if (!time) {
			return ''
		}
		const date = dayjs(time)
		const weekday = date.day()
		const currentTime = dayjs();
		const today = dayjs(currentTime);
		if (date.isSame(today, 'day')) {
			return '今天'
		} else {
			return `星期${weekArray[weekday]}`
		}
	},
	formatWeek2: (time) => {
		if (!time) {
			return ''
		}
		const date = dayjs(time)
		const weekday = date.day()
		const currentTime = dayjs();
		const today = dayjs(currentTime);
		if (date.isSame(today, 'day')) {
			return '今'
		} else {
			return `${weekArray[weekday]}`
		}
	},
	formatAmount(amount) {
		if (amount) {
			return (amount / 100).toFixed(2)
		} else {
			return amount
		}
	},
	changeToThousand: (num, type) => {
		if (!num) {
			return num;
		}
		let resNum;
		num = (num + "").replace(/,/g, "");
		resNum = Number(num);
		if (resNum >= 0) {
			if (type) {
				return (
					(num && num.toString().replace(/^\d+/, (m) => m.replace(/(?=(?!^)(\d{3})+$)/g, ",")))
				);
			} else {
				return (
					"+" + (num && num.toString().replace(/^\d+/, (m) => m.replace(/(?=(?!^)(\d{3})+$)/g, ",")))
				);
			}

		} else {
			num = 0 - num;
			num = num.toFixed(2)
			if (type) {
				return ((num && num.toString().replace(/^\d+/, (m) => m.replace(/(?=(?!^)(\d{3})+$)/g, ","))));
			} else {
				return (
					"-" +
					(num && num.toString().replace(/^\d+/, (m) => m.replace(/(?=(?!^)(\d{3})+$)/g, ",")))
				);
			}

		}
	}
}