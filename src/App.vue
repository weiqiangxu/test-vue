<!-- 页面结构入口 -->
<template>
	<router-view v-if="isLogin"></router-view>
	<div v-else v-loading.fullscreen.lock="true"></div>
</template>

<script>
export default {
	data: function () {
		return {
			isLogin: true,
		};
	},
	watch: {
		$route: function (newRoute) {
			//监听路由变化
		},
	},
	mounted: function () {
	},
	methods: {
	},
};
</script>