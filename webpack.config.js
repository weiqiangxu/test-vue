const path = require('path');
const webpack = require('webpack');
//定义了一些文件夹的路径
// const ROOT_PATH = path.resolve(__dirname);
// 编译文件路径
const BUILD_PATH = path.resolve(__dirname, './build');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader'); //获取vueloader插件
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
// const HappyPack = require('happypack');
// const os = require('os'); // 系统操作函数
// const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length }); // 指定线程池个数
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //生成html
// 编译文件html指向的静态文件路径前缀
// const publicPath = (process.env.NODE_ENV === 'dev' ? '/public/build/web/' : '/v2/build/web/')
const publicPath = '/'

module.exports = {
	entry: {
		// webpack的编译入口文件
		main: path.resolve(__dirname, './src/main.js')
	},
	//输出的文件名 合并以后的js会命名为xxx.build.js
	output: {
		path: BUILD_PATH,
		filename: '[name].build.js',
		// 指向异步加载的路径
		publicPath: publicPath
	},
	resolve: {
		// 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
		mainFields: ['jsnext:main', 'browser', 'main'],
		//定义引用路径别名 配置别名可以加快webpack查找模块的速度
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': path.resolve(__dirname, './src')
		},
		//缩小文件搜索范围
		modules: [path.resolve(__dirname, 'node_modules')],
		//约定省略后缀
		extensions: ['.js', '.vue', '.css', '.less', '.sass', '.scss', '.json']
	},
	module: {
		noParse: function (content) { // content 从入口开始解析的模块路径
			return /no-parser/.test(content); // 返回true则忽略对no-parser.js的解析
		},
		rules: [
			{
				test: /\.vue$/,//使用正则表达式匹配以.vue结尾的文件
				loader: 'vue-loader' //使用vue-loader处理
			},
			{
				test: /\.js$/,
				//loader: 'babel-loader',
				use: 'happypack/loader?id=babel-loader', // 缓存loader执行结果
				include: [path.resolve(__dirname, './src')],
				exclude: /node_modules/ // 排除不要加载的文件夹
			},
			{
				// 文件匹配正则
				test: /\.css$/,
				// 加载器，从后向前倒序使用
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /.scss$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.less$/,
				// 加载器，从后向前倒序使用
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
			},
			{
				test: /\.(png|jpe?g|gif)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000, // 只转码 1M以下的图片
					name: 'img/[name].[hash:7].[ext]' // 发布到 dist/img 目录下，名称中添加 hash 值，避免缓存
				}
			},
			{
				test: /\.svg$/,
				use: ['svg-inline-loader']
			},
			{
				test: /\.(woff|woff2|ttf|eot|otf)\??.*$/,
				loader: 'url-loader',
				options: {
					limit: 25000,
					name: 'fonts/[name].[hash:7].[ext]'
				}
			}
		]
	},
	// 优化 https://webpack.docschina.org/configuration/optimization/
	optimization: {
		usedExports: true,
		concatenateModules: true,//告知 webpack 去寻找模块图形中的片段，哪些是可以安全地被合并到单一模块中
		occurrenceOrder: true,//告知 webpack 去确定那些会引致更小的初始化文件 bundle 的模块顺序
		splitChunks: {
			minSize: 30000,
			minChunks: 1,
			maxAsyncRequests: 5,//按需加载时候最大的并行请求数
			maxInitialRequests: 3,//一个入口最大的并行请求数
			name: false,//分割的js名称，默认为true 返回 -${cacheGroup的key} ${automaticNameDelimiter} ${moduleName},
			chunks: "async",// 必须三选一： "initial" | "all"(默认就是all) | "async" //all同时分割同步和异步代码,推荐
			cacheGroups: {
				// 处理入口chunk
				vendor: { // 将第三方模块提取出来
					//test: /node_modules/,
					test: /vue|vue-resource|vue-router|element-ui|nprogress/,
					chunks: 'initial',
					name: 'vendor',
					minSize: 100,
					priority: 10, // 优先
					enforce: true,
					reuseExistingChunk: false   // 可设置是否重用该chunk（查看源码没有发现默认值）
				}
			}
		},
		// 可以自定义UglifyJsPlugin和一些配置,默认的压缩为uglifyjs-webpack-plugin
		minimizer: [
			// new UglifyJsPlugin({
			// 	cache: true,
			// 	parallel: true,
			// 	sourceMap: false
			// }),
			new OptimizeCSSAssetsPlugin({})  // use OptimizeCSSAssetsPlugin
		]
	},
};

// 开发环境
if (process.env.NODE_ENV !== 'production') {
	// 配置开发服务器
	module.exports.devServer = {
		progress: true,//添加进度条显示
		// contentBase: path.resolve(__dirname, './'),  // 基本目录-定义页面文件index.html的位置
		historyApiFallback: true,
		hot: true,//热更新
		inline: true,
		port: 8060 //端口你可以自定义
	};
	module.exports.plugins = [
		new VueLoaderPlugin(),
		new FriendlyErrorsPlugin(),
		
		new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
			filename: 'index.html', //输出文件的文件名称，相对于 path
			template: './src/html/index.html', //html模板路径
			hash: true,//是否为所有注入的静态资源添加webpack每次编译产生的唯一hash值
		}),
		// 开启 Scope Hoisting
		new ModuleConcatenationPlugin(),
		new MiniCssExtractPlugin({
			filename: "[name].css",
			allChunks: true
		}),
		// new HappyPack({
		// 	id: 'babel-loader',
		// 	loaders: ['babel-loader?cacheDirectory'],
		// 	threadPool: happyThreadPool,
		// 	verbose: true
		// }),
		new webpack.HotModuleReplacementPlugin()
	];
	module.exports.stats = { children: false }

	// if (process.env.NODE_ENV === 'test') {
	// 	//构建前先清空，防止出现垃圾文件
	// 	module.exports.plugins.push(new CleanWebpackPlugin())
	// }
} else {
	//现网配置
	module.exports.devtool = false;
	module.exports.plugins = [
		new VueLoaderPlugin(),
		new FriendlyErrorsPlugin(),

		new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
			filename: 'index.html', //生成的html存放路径，相对于 path
			template: './src/html/index.html', //html模板路径
			hash: true,//是否为所有注入的静态资源添加webpack每次编译产生的唯一hash值
		}),

		// 开启 Scope Hoisting
		new ModuleConcatenationPlugin(),
		// 将CSS提取为独立的文件的插件，对每个包含css的js文件都会创建一个CSS文件，支持按需加载css和sourceMap
		// https://webpack.js.org/plugins/mini-css-extract-plugin/
		new MiniCssExtractPlugin({
			filename: "[name].css"
		}),
		// HappyPack让webpack同一时间处理多个任务，发挥多核 CPU 电脑的威力
		// new HappyPack({
		// 	id: 'babel-loader',//用id来标识 happypack处理那里类文件
		// 	loaders: ['babel-loader?cacheDirectory'],//如何处理  用法和loader 的配置一样
		// 	threadPool: happyThreadPool,////共享进程池
		// 	verbose: true,//允许 HappyPack 输出日志
		// }),
		// 该插件可帮助具有多个入口点的项目加快其构建速度
		// new WebpackParallelUglifyPlugin({
		// 	workerCount: os.cpus().length - 1, // 开启几个子进程去并发的执行压缩，默认是当前电脑的cpu数量减1
		// 	uglifyES: {
		// 		output: {
		// 			quote_keys: true,
		// 			beautify: false, //不需要格式化
		// 			comments: false //不保留注释
		// 		},
		// 		compress: {
		// 			properties: false,
		// 			warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
		// 			drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
		// 			collapse_vars: true, // 内嵌定义了但是只用到一次的变量
		// 			reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
		// 		}
		// 	}
		// }),
		//构建前先清空，防止出现垃圾文件
		new CleanWebpackPlugin()
	];
}

console.info(module.exports.plugins)