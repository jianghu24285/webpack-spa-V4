/* 
 * 启动express服务,访问打包后的资源
 *  命令: node prod.server.js
 * 
 * @Author: Eleven 
 * @Date: 2018-06-08 17:10:14 
 * @Last Modified by: Eleven
 * @Last Modified time: 2018-07-09 20:50:12
 */

let express = require('express')
let compression = require('compression')

let app = express()
let port = 8888

app.use(compression())
app.use(express.static('./dist'))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})