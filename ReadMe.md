# Webpack H5活动单页打包实践 - webpack 4X

<br>

## 编译命令
```bash
# 安装依赖包
npm i

# 启动dev-server运行调试
npm run dev

#  打包发布
npm run build

# 开启node express服务,访问打包后目录
npm run server 或 npm run http-server
```

## Webpack配置的几个重点

<br>

> **[如何在webpack中引入未模块化的库, 如Zepto](https://blog.csdn.net/sinat_17775997/article/details/70495891)**
   
   *script-loader 把我们指定的模块 JS 文件转成纯字符串, exports-loader将需要的js对象module.exports导出, 以支持import或require导入.*
   
   1. 安装依赖包
      
      ```bash
      npm i script-loader exports-loader -D
      ```

   2. 配置
      
      ```js
      {
        test: require.resolve('zepto'),
        loader: 'exports-loader?window.Zepto!script-loader'
      }
      ```   

      > *以上是正常处理一个 *"可以NPM安装但又不符合webpack模块化规范"* 的库, 例如其它库XX, 处理后可以直接 import xx from XX 后使用; 但是, zepto有点特殊, 默认npm安装的包或者从github clone的包, 都是仅包含5个模块, 其它如常用的touch模块是未包含的, 想要正常使用还需做得更多.*

  3. 怎样拿到一个包含更多模块的zepto包 ?
     
     a) [打包出一个包含更多需要模块的zepto包 ](https://www.cnblogs.com/czf-zone/p/4433657.html)  
        从github clone官方的包下来, 找到名为make的文件 ( 在package.json同级目录 ), 用记事本打开, 找到这一行 `modules = (env['MODULES'] || 'zepto event ajax form ie').split(' ')`, 应该是在第41行, 手动修改加入你想要引入的模块, 然后保存;   

     b) 在make文件同级目录 => 右键打开终端或git bash => 敲npm i安装zepto源码需要的node包 ( 这里你应当是已经已安装过nodejs了, 如果没有, 安装好后再做这一步 ), 等待安装结束.

     c) 在刚才打开的 终端/git bash 敲命令 npm run-script dist, 如果没有报错, 你应该在这个打开的文件夹里可以看到生成了一个文件夹 dist, 打开它, 包含新模块的zepto包就在这了, Over !
     
  4. 拿到新的zepto包后, 建议放到自己的src下lib目录( 第三方工具包目录 ), 不再通过npm的方式去安装和更新zepto了 ( *因为将来npm update后的zepto又将缺少模块,将来别人也会出现误操作* ); 现在开始对这个放在lib目录下的zepto.min.js进行处理: 
     
     a) 通过script-loader、exports-loader转成符合webpack模块化规范的包
     ```js
     {
        // # require.resolve()是nodejs用来查找模块位置的发放,返回模块的入口文件
        test: require.resolve('./src/js/lib/zepto.min.js'),
        loader: 'exports-loader?window.Zepto!script-loader'
     }
     ```

     b) 给模块配置别名
     ```js
     resolve: {
        alias: {
            'zepto': path.resolve(__dirname, './src/js/lib/zepto.min.js')
        }
     }
     ```

     c) 自动加载模块, 不再到处import或require
     ```js
     new webpack.ProvidePlugin({
        $: 'zepto',
        Zepto: 'zepto'
     })
     ```

     *大功告成, 现在zepto跟你使用jquery是一样的开发体验了 !*

     > *以上, 演示的是对于一个第三方库( 不能npm安装,也不符合webpack规范 ), 如何去处理, 达到和正常npm安装一样的开发体验, 仅就zepto来说, npm库有符合webpack规范的不同版本 ([zepto-webpack](https://www.npmjs.com/package/zepto-webpack), 或 [zepto-modules](https://www.npmjs.com/package/zepto-modules)), 有需要可以试试.  
     平时意图使用某个包, 先去[NPM官网](https://www.npmjs.com/)搜一搜比较好.*

<br><br>

> **[Babel](https://www.webpackjs.com/loaders/babel-loader/) - ES6转码**
   
1. 需要安装的依赖
   
   ```bash
   npm i babel-core babel-loader babel-preset-env babel-plugin-transform-runtime babel-runtime babel-preset-stage-2 -D
   ```

2. 在webpack.config.js同级目录新建.babelrc文件   
   
   ```json
   {
    "presets": [
      ["env", {
        "modules": false,
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
      }],
      "stage-2"
    ],
    "plugins": ["transform-runtime"]
   }
   ```

3. 最基础的使用, 安装babel-loader babel-core babel-preset-env这3个依赖即可, 其中babel-preset-env取代过去版本中的babel-preset-es2015.

4. 一些es6公共方法等转码后可能会被添加到每一个需要它的文件中, 这种重复的引入造成了转码后体积变大, 通过babel-plugin-transform-runtime插件来解决, 同时要依赖babel-runtime, 所以也需要安装它.

5. > Babel默认只转换新的JavaScript句法（syntax），而不转换新的API，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法（比如Object.assign）都不会转码。
   
   
   这种情况通过babel-polyfill解决 ( 参考文档: [babel-polyfill的作用?](https://blog.csdn.net/crazyfeeling/article/details/70241285), 以及[babel-polyfill的引用和使用](https://www.cnblogs.com/princesong/p/6728250.html) ), 安装好依赖以后, 并不会自动生效, 需要在js代码的第一行引入才行:   
   ```js
   import 'babel-polyfill' 或 require('babel-polyfill' )
   ```
   或者, 在webpack.config.js中, 改写entry对应的入口字符串值为数组, 'babel-polyfill'作为数组第一个元素 ( 不推荐 ):   
   ```js
   entry: {
        index: ['babel-polyfill', './src/js/pages/index.js']
    }
    ```

6. 为了提升转码的速度, 减少耗费的时间, 配置几个参数:    
   
   ```js
   {
      test: /\.js$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, 'src'),  // # 仅转码src目录下代码(有时可能需要转其它目录下代码,有需要再加)
      exclude: /node_modules/, // # 排除 node_modules中的文件，否则所有外部库都会通过babel编译，将会降低编译速度
      options: {
          cacheDirectory: true   // # 缓存转码结果,提升编译速度
      }
   }
   ```

<br><br>

> **CSS 的处理 - less编译和postcss工具**
1. 需要安装的依赖包

   ```bash      
   npm i less less-loader css-loader style-loader postcss-loader postcss-import postcss-cssnext cssnano autoprefixer -D
   ```

2. 配置
   
   *默认会将css一起打包到js里, 借助mini-css-extract-plugin将css分离出来并自动在生成的html中link引入. ( webpack4不推荐使用extract-text-webpack-plugin插件了 )*

   ```js
   const MiniCssExtractPlugin = require('mini-css-extract-plugin')
   ```
   
   ```js
   {
        test: /\.(less|css)$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader', 'postcss-loader', 'less-loader'
        ]
    }
   ```
   ```js
    // # 单独使用link标签加载css并设置路径，相对于output配置中的publickPath
    new MiniCssExtractPlugin({
        filename: 'css/[name].css'
    })
   ```

3. [PostCSS](https://www.webpackjs.com/loaders/postcss-loader/) 本身不会对你的 CSS 做任何事情, 你需要安装一些 plugins 才能开始工作.   
参考文档:   
    - [PostCSS自学笔记（一）【安装使用篇】](https://segmentfault.com/a/1190000010926812),   
    - [展望未来：使用 PostCSS 和 cssnext 书写 CSS](https://www.cnblogs.com/nzbin/p/5744672.html),   
    - [使用PostCSS+cssnext来写css](http://www.zhaiqianfeng.com/2017/07/postcss-autoprefixer-cssnext.html) ),   
    - [PostCSS及其常用插件介绍](http://www.css88.com/archives/7317)   

    使用时在webpack.config.js同级目录新建postcss.config.js文件:
   
   ```js
   module.exports = {
      // parser: 'sugarss', # 一种更简洁的css语法格式
      plugins: {
        'postcss-import': {},
        'postcss-cssnext': {},
        'cssnano': {}
      }
   }
   ```

   *常用的插件*:
   - autoprefixer     ——*插件在编译时自动给css新特性添加浏览器厂商前缀, 因此, 借助[Modernizr](http://modernizr.cn/)来添加厂商前缀已经不需要了( 还是可以用来做js检测浏览器兼容性的 ).*   
   - postcss-cssnext ——*让你使用下一代css语法, 在最新的css规范里, 已经包含了大量less的内置功能*
   - cssnano ——*会压缩你的 CSS 文件来确保在开发环境中下载量尽可能的小*
 
   *其它有用的插件*:   
   - postcss-pxtorem        ——*px单位自动转换rem*
   - postcss-assets         ——*插件用来处理图片和SVG, 类似url-load*
   - Postcss-sprites        ——*将扫描你CSS中使用的所有图像，自动生成优化的 Sprites 图像和 CSS Sprites 代码*
    
   Less是预处理, 而PostCSS是后处理, 基本支持less等预处理器的功能, 自动添加浏览器厂商前缀向前兼容, 允许书写下一代css语法 , 可以在编译时去除冗余的css代码, PostCSS 声称比预处理器快 3-30 倍.   
**因为PostCSS, 可能我们要放弃less/sass/stylus了**.

<br><br>

> **图片、字体及多媒体等文件的处理**
   
   1. css中引入的图片( 或其它资源 ) ==> url-loader   
   配置了url-loader以后, webpack编译时可以自动将小图转成base64编码, 将大图改写url并将文件生成到指定目录下 ( *file-loader可以完成文件生成, 但是不能小图转base64, 所以统一用url-loader, 但url-loader在处理大图的时候是自动去调用file-loader, 所以你仍然需要install file-loader* ).
      
      ```js
      // # 处理图片(雷同file-loader，更适合图片)
      {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
              limit: 10000, // # 小图转成base64
              name: 'assets/img/[name].[hash:7].[ext]'
          }
      },
      // # 处理多媒体文件
      {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
              limit: 10000,
              name: 'assets/media/[name].[hash:7].[ext]'
          }
      },
      // # 处理字体文件
      {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
              limit: 10000,
              name: 'assets/fonts/[name].[hash:7].[ext]'
          }
      }
      ```
   2. html页面中引入的图片( 或其它资源 ) ==> html-loader   
   css中的图片url-loader处理即可, 而html中img标签引入的图片, 不做工作的情况下: 图片将不会被处理, 路径也不会被改写, 即最终编译完成后这部分图片是找不到的, 怎么办? [html-loader](https://www.webpackjs.com/loaders/html-loader/) ! ( *这个时候你应该是url-loader和html-loader都配置了, 所以css中图片、页面引入的图片、css中的字体文件、页面引入的多媒体文件等， 统统都会在编译时被处理* ).
      
      ```js
      // # html中引用的静态资源在这里处理,默认配置参数attrs=img:src,处理图片的src引用的资源.
      {
          test: /\.html$/,
          loader: 'html-loader',
          options: {
              // # 除了img的src,还可以继续配置处理更多html引入的资源(不能在页面直接写路径,又需要webpack处理怎么办?先require再js写入).
              attrs: ['img:src', 'img:data-src', 'audio:src'],
              minimize: false,
              removeComments: true,
              collapseWhitespace: false
          }
      }
      ```

    3. 有的时候, 图片可能既不在css中, 也不在html中引入, 怎么办?   

       ```js   
       import img from 'xxx/xxx/123.jpg'   
       或 let img = require('xxx/xxx/123.jpg')
       ```
       js中引用img, webpack将会自动搞定它.

    4. 图片等资源的访问路径问题:    
    经过上面的处理, 静态资源处理基本没有问题了, webpack编译时将会将文件打包到你指定的生成目录, 但是不同位置的图片路径改写会是一个问题.   
    *全部通过绝对路径访问即可, 在output下的publicPath填上适当的server端头, 来保证所有静态资源文件路径能被访问到, 具体要根据服务器部署的目录结构来做修改.*   
       
       ```js
       output: {
        path: path.resolve(__dirname, 'static'), // # 输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
        publicPath: '/', // # 模板、样式、脚本、图片等资源对应的server上的路径
       }
       ```

<br><br>

> **自动将打包js引入生成的html文件**
   
   - [html-webpack-plugin](https://www.webpackjs.com/plugins/html-webpack-plugin/)插件, 配置:  
      
      ```js
      const HtmlWebpackPlugin = require('html-webpack-plugin')
      ```

      
      ```js
      new HtmlWebpackPlugin({
          title: '2017味全校园招聘',
          filename: './index.html',
          template: './src/index.html',
          inject: 'body',
          hash: true,
          minify: {
              removeComments: true,
              collapseWhitespace: true
          }
      })
      ```

<br><br>

> **配置开发服务器, [webpack-dev-server](https://www.webpackjs.com/configuration/dev-server/).**
   
   - 安装依赖包
      
      ```bash
      npm i webpack-dev-server -D
      ```
   - 常用配置
      ```js
      devServer: {
        contentBase: './dist',
        host: 'localhost',
        openPage: 'index.html',    // # 指定默认启动浏览器时打开的页面
        port: 8686, // # 默认8080
        inline: true, // # 可以监控js变化
        hot: true, // # 热启动
        open: true // # 自动打开浏览器
      }
      ```
   - 运行命令 ( package.json配置命令 => npm run dev )
      ```json
      "dev": "cross-env NODE_ENV=development webpack-dev-server --mode development --colors --profile"
      ```
     *根据目录结构的不同, contentBase、openPage参数要配置合适的值, 否则运行时应该不会立刻访问到你的首页; 同时要注意你的publicPath, 静态资源打包后生成的路径是一个需要思考的点, 这与你的目录结构有关.*
     
<br><br>

> **配置node express服务, 访问打包后资源**
   
   1. 新建prod.server.js文件
      
      ```js
      let express = require('express')
      let compression = require('compression')

      let app = express()
      let port = 8888

      app.use(compression())
      app.use(express.static('./dist'))

      module.exports = app.listen(port, function (err) {
        if (err) {****
          console.log(err)
          return
        }
        console.log('Listening at http://localhost:' + port + '\n')
      })
      ```

  2. 运行命令
     
     ```bash
     node prod.server.js
     ```

  3. 访问路径
     
     ```bash
     localhost:8888
     ```

<br><br>

> **http-server, 比自己配置一个express服务更简洁的方式, 去访问打包后的资源.**
  
  1. 安装依赖
     
     ```bash
     npm i http-server -D
     ```
  2. package.json配置命令
     
     ```json
     "server": "http-server dist"
     ```
  3. 访问路径
     
     ```bash
     localhost:8080 或 http://127.0.0.1:8080
     ```