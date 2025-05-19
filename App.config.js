/**
 * 项目配置文件
 * dev 开发
 * test 测试（走外网ip）
 * prod 发布
 */
 const mode = 'dev'
 /**
  * 请求路径
  */
 const requestEnv = {
	 dev:  'https://zwth.xjjswh.cn/api',
	 test: 'https://www.aiot-fire.com/mp/firecontrol/api',
	 prod: 'https://www.aiot-fire.com/mp/firecontrol/api'
 }
 export const baseUrl = requestEnv[mode];
 
 /**
  * stomp ws 请求路径
  */
 const stompEnv = {
	 dev: 'ws://192.168.1.23:15674/ws',
	 test: 'wss://www.aiot-fire.com/mp/ws',
	 prod: 'wss://www.aiot-fire.com/mp/ws'
 }
 export const stompjsUrl = stompEnv[mode];
 
 /**
  * 视频点播地址
  */
 const playEnv = {
	dev: 'http://192.168.1.32:18080/api',
	test: 'https://www.aiot-fire.com/wvp/api',
	prod: 'https://www.aiot-fire.com/wvp/api'
 }
 
export const mvpUrl= playEnv[mode];

/**
  * 图片前缀
  */
 const imgEnv = {
 	dev: 'http://192.168.1.23:9002/',
 	test: 'https://www.aiot-fire.com/',
 	prod: 'https://www.aiot-fire.com/'
 }
 export const imgUrl= imgEnv[mode];
 
 
 /**
   * 青犀视频请求前缀
   */
  const qxRequest = {
  	dev: 'https://dev.aiot-fire.com',
  	test: 'https://www.aiot-fire.com',
  	prod: 'https://www.aiot-fire.com'
  }
  export const qxRequestUrl= qxRequest[mode];
  
  export const qxVideoUrl= 'https://www.aiot-fire.com';