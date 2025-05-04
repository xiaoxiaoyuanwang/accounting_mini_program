import App from './App'
import store from './store'

// #ifndef VUE3
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'
import loadAllData from './components/loadAllData/loadAllData'
import wrapperPage from './components/wrapperPage/wrapperPage'
import {
	filterObj
} from './common/filter'
for (let key in filterObj) {
	Vue.filter(key, filterObj[key])
}
Vue.use(uView)
Vue.use(loadAllData)
Vue.use(wrapperPage)
Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.$adpid = "1111111111"
Vue.prototype.$baseUrl = "https://env-00jxgf6z60g2.normal.cloudstatic.cn"
Vue.prototype.$backgroundAudioData = {
	playing: false,
	playTime: 0,
	formatedPlayTime: '00:00:00'
}
App.mpType = 'app'
const app = new Vue({
	store,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.use(store)
	app.config.globalProperties.$adpid = "1111111111"
	app.config.globalProperties.$backgroundAudioData = {
		playing: false,
		playTime: 0,
		formatedPlayTime: '00:00:00'
	}
	return {
		app
	}
}
// #endif