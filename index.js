var http = require('http');
var url = require('url');
var util = require('util');
// fs 模块  用于读取文件的
const fs = require('fs');
const md5 = require("md5-node");
const {
	readSettings,
	saveSettings
} = require("./config");
// 处理 url
const path = require('path');
const {
	default: axios
} = require('axios');
const port = 8888;



/**
/*对Date的扩展，将 Date 转化为指定格式的String
/* 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
/* 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
/* 例子：
/* (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2019-01-02 10:19:04.423
/* (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2019-1-2 10:19:4.18
*/
Date.prototype.format = function (fmt) {
    var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}



const requestType = {
	".css": "text/css",
	".js": "text/javascript",
	".html": "text/html",
	".png": "image/png",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".ttf": "font/ttf",
	".eot": "font/eot"
};

const api_host = "http://47.97.98.67";
const default_code = "b0366f4efb7f4c5c";
const dataMap = readSettings("dataMap") || {};
const loginInfo = readSettings("loginInfo");
const secretKey = "5645asdfWEREWRsdfaC>Vb#$%43asd3256&*!";
const accessToken = md5(loginInfo.pwd + loginInfo.user + secretKey);
const tokenKey = "__token";
const pagesize = 30;
const expires = 1000 * 60 * 30;

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {string} name 
 * @returns 
 */
function getCookie(req, name) {
	var cookieStr = req.headers.cookie;
	if (cookieStr) {
		var cookies = cookieStr.split(/[=;]/);
		for (var i = 0; i < cookies.length; i++) {
			if (cookies[i] == name) {
				return cookies[i + 1];
			}
		}
	}
	return null;
}
/**
 * 
 * @param {http.ServerResponse} res 
 * @param {string} name 
 * */
function delCookie(res, name) {
	setCookie(res,name,"",-1);
}

const cookieExpires = (n) => {
	const d = new Date() // 获取当前时间
	if (!n) {
		n = 0;
	}
	d.setTime(d.getTime() + n)
	return d.toGMTString()
}

/**
 * 
 * @param {http.ServerResponse} res 
 * @param {string} name 
 * @param {string} value 
 * @param {number} expires 
 */
function setCookie(res, name, value, expires) {
	var cookieStr = name + "=" + value + ";path=/" ;
	if(expires){
		cookieStr += ";expires="+cookieExpires(expires) ;
	}
	res.setHeader("Set-Cookie", cookieStr);
}
//创建后台服务器
var WebSocketServer = require('websocket').server;
var server = http.createServer(async function (req, res) {
	let pathname = req.url.split(/[?]/)[0] //先获取地址
	pathname = pathname == '/' ? '/index.html' : pathname //根目录下定位到首页  
	let ext = path.extname(pathname) // 获取资源后缀
	let query = url.parse(req.url, true).query;
	console.log(pathname, query);
	if (pathname.startsWith("/api/")) {
		res.writeHead(200, {
			'Content-Type': `application/json;charset=utf-8`
		});
		var data = {
			code: 0
		};
		if (pathname.indexOf("/api/verify") != -1) {
			//code=46d4a397b658bfd3&label=%E6%98%8A%E8%A7%86%E7%A7%91%E6%8A%80&version=210
			if (!query.code) {
				data = {
					"code": -1,
					"msg": "版本太低，请下载最新版本"
				};
			} else if (query.version < "210") {
				if (dataMap[query.code] && dataMap[query.code].activeStatus == '1') {
					// var url = `${api_host}/api/updateVersion?code=${default_code}&oldVersion=${query.version}&type=0&app=${encodeURIComponent(query.label)}`;
					// console.log("remote url " + url);
					// data = (await axios.get(url)).data;
					data = {
						"code": 0,
						"data": {
							"type": 0,
							"version": 210,
							"url": {
								"apkUrl": "https://dyver.oss-cn-beijing.aliyuncs.com/jgz/%E6%98%8A%E8%A7%86%E7%A7%91%E6%8A%80/210.apk"
							},
							"content": "升级"
						},
						"msg": "操作成功"
					};
				} else {
					data = {
						"code": -1,
						"msg": "版本太低，请下载最新版本"
					};
				}
			} else if (!dataMap[query.code]) {
				dataMap[query.code] = query;
				dataMap[query.code].regTime = new Date().getTime();

				saveSettings("dataMap", dataMap);
				data = {
					"code": -1,
					"msg": "请先注册设备"
				};
			} else {
				var info = dataMap[query.code];
				if (!query.invite) {
					if (info.activeStatus == '1' ) {
						if(info.deadline && info.deadline < new Date().getTime()){
							data = {
								"code": -1,
								"msg": "已过有效期,请联系管理员"
							}
						}else{
							data = {
								"code": 0,
								"data": {
									"nickName": info.invite,
									"time": parseInt(info.deadline)/1000,
									"type": 1
								},
								"msg": "授权成功"
							};
						}
					} else if (info.invite) {
						if( info.activeTime){
							data = {
								"code": -1,
								"msg": "请等待审核后再激活设备"
							}
						}else{
							data = {
								"code": -1,
								"msg": "请输入激活码激活设备"
							};
						}
					} else {
						data = {
							"code": -1,
							"msg": "请先注册设备"
						};
					}
				} else {
					if(info.invite == query.invite){
						if (info.activeStatus == '1') {
							data = {
								"code": -1,
								"msg": "此设备已激活无需重复操作"
							};
						}else{
							info.activeTime = new Date().getTime();
							saveSettings("dataMap",dataMap);
							data = {
								"code": -1,
								"msg": "请等待审核后再激活设备"
							}
						}
					}  else {
						data = {
							"code": -1,
							"msg": "无效的邀请码或使用已达上限"
						};
					}
				}
			}
		}else if(pathname == "/api/updateVersion"){
			var info = dataMap[query.code];
			if(!info){
				data.code=-1;
				data.msg = "未找到code,版本过低,请先更新版本";
			}else if(info.activeStatus == '1'){
				if(info.deadline && info.deadline < new Date().getTime()){
					data = {"code": -1,
					"msg": "已过有效期,请联系管理员"}
				}else{

					if(query.type == "0"){
						if(query.oldVersion < "210"){
							data = {"code":0,"data":{"type":0,"version":210,"url":{"apkUrl":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/%E6%98%8A%E8%A7%86%E7%A7%91%E6%8A%80/210.apk"},"content":"升级"},"msg":"操作成功"}
						}else{
							data = {"code":-1,"msg":"没有最新版本"}
						}
					}else if(query.type == "1"){
						if(query.oldVersion < "10017"){
							data = {"code":0,"data":{"type":1,"version":10017,"url":{"wz_en.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/wz_en.js","currency.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/currency.js","popcheck.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/popcheck.js","process.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/process.js","common.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/common.js","wz_ja.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/wz_ja.js","main.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/main.js","wz_es.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/wz_es.js","wz_zh_CN.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/wz_zh_CN.js","request.js":"https://dyver.oss-cn-beijing.aliyuncs.com/jgz/update/request.js"},"content":"10017"},"msg":"操作成功"};
						}else{
							data = {"code":-1,"msg":"没有最新版本"}
						}
					}else{
						data = {"code":-1,"msg":"没有最新版本"}
					}
				}
			}else{
				data.code=-1;
				data.msg = "设备未激活,请先激活";
			}
		}else if(pathname == "/api/getTask"){
			var info = dataMap[query.code];
			if(!info){
				data.code=-1;
				data.msg = "未找到code,版本过低,请先更新版本";
			}else if(info.activeStatus == '1'){
				if(info.deadline && info.deadline < new Date().getTime()){
					data = {"code": -1,
					"msg": "已过有效期,请联系管理员"}
				}else{
					data = {"code":0,"data":{"activeCode":"b0366f4efb7f4c5c","content":"[\"武功秘籍\"]","createTime":"2022-08-30 13:21:40","deviceId":51564,"home":0,"id":227879,"state":1,"taskParams":"[{\"files\":[{\"identifier\":\"Secretjztc0One\",\"name\":\"精准同城\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E7%B2%BE%E5%87%86%E5%90%8C%E5%9F%8E_Secretjztc0One.js?Expires=1975394694&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=Aj%2FhBPaZGmEvAi2hE0i6uLUD%2BjM%3D\",\"fileType\":8},{\"identifier\":\"Secretkhbdtcplz0One\",\"name\":\"同城评论赞\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E5%90%8C%E5%9F%8E%E8%AF%84%E8%AE%BA%E8%B5%9E_Secretkhbdtcplz0One.js?Expires=1975394702&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=VPVokgPWJkFmQxxvXRDMTu7orYI%3D\",\"fileType\":8},{\"identifier\":\"Secretkhbdpr0One\",\"name\":\"葵花宝典Pro\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E8%91%B5%E8%8A%B1%E5%AE%9D%E5%85%B8Pro_Secretkhbdpr0One.js?Expires=1975394701&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=RoCl2i9N%2FidtSZie80W4VJILWAQ%3D\",\"fileType\":8},{\"identifier\":\"Secretkhbdp0One\",\"name\":\"葵花宝典Plus\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E8%91%B5%E8%8A%B1%E5%AE%9D%E5%85%B8Plus_Secretkhbdp0One.js?Expires=1975394699&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=gK%2FgYXNzesvXO1UzhO%2BxTmAau8k%3D\",\"fileType\":8},{\"identifier\":\"Secretkhbdm0One\",\"name\":\"葵花宝典Max\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E8%91%B5%E8%8A%B1%E5%AE%9D%E5%85%B8Max_Secretkhbdm0One.js?Expires=1975394697&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=a057muqGTXNMJYzTY1oLTCDw1Hc%3D\",\"fileType\":8},{\"identifier\":\"Secretkhbd0One\",\"name\":\"葵花宝典\",\"url\":\"http://wangzha2.oss-cn-beijing.aliyuncs.com/%E8%91%B5%E8%8A%B1%E5%AE%9D%E5%85%B8_Secretkhbd0One.js?Expires=1975394695&OSSAccessKeyId=LTAIs0J8jCgUIYyT&Signature=LKzOf6kveSweLATzaT%2B7cXgoqyg%3D\",\"fileType\":8}],\"groupId\":507215}]","type":10003,"updateTime":"2022-08-30 13:21:40","userCode":"g17085878687"},"msg":"操作成功"};
				}
			}else{
				data.code=-1;
				data.msg = "设备未激活,请先激活";
			}
		}

		res.end(JSON.stringify(data));
	} else if (pathname.startsWith("/admin/")) {
		
		var data = {
			code: 0
		};
		if (query.host == loginInfo.host && query.password == loginInfo.pwd && query.port == loginInfo.port && query.user == loginInfo.user) {
			data.msg = "success";
			setCookie(res,tokenKey,accessToken,expires);
		} else {
			var token = getCookie(req, tokenKey);
			if (token != accessToken) {
				data.code = -2;
				data.msg = "密码错误";
			} else {
				if (pathname == "/admin/userlist") {
					/*currentPage: 1
					code: 
					phoneNumber: 
					username: 
					begindateActive: 
					begindateReg: 
					enddateReg: 
					enddateActive:  */

					if (query.code) {
						data.dataList = [dataMap[query.code]];
						date.totalCount = 1;
					} else {
						var arr = Object.values(dataMap).filter(v=>{
							if(query.username){
								return query.username == v.username;
							}
							if(query.phoneNumber){
								return query.phoneNumber == v.phoneNumber;
							}
							if(query.begindateActive && query.enddateActive){
								return v.activeTime >= new Date(query.begindateActive).getTime() && v.activeTime <=new Date(query.enddateActive).getTime()+1000*60*60*24
							}
							if(query.begindateReg && query.enddateReg){
								return v.regTime >= new Date(query.begindateReg).getTime() && v.regTime <=new Date(query.enddateReg).getTime()+1000*60*60*24
							}
							if(query.activeStatus!= ""){
								return query.activeStatus == v.activeStatus;
							}
							return true;
						})
						var sortBy = query.sortBy;
						if (!sortBy) {
							sortBy = "regTime";
						}
						arr.sort((a, b) => {
							var flag = a[sortBy] == b[sortBy] ? 0 : a[sortBy] > b[sortBy] ? 1 : -1;
							if (flag == 0) {
								if (sortBy == "regTime") {
									sortBy = "deadline";
									return a[sortBy] == b[sortBy] ? 0 : a[sortBy] > b[sortBy] ? 1 : -1;
								} else {
									sortBy = "regTime";
									return a[sortBy] == b[sortBy] ? 0 : a[sortBy] > b[sortBy] ? 1 : -1;
								}
							} else {
								return flag;
							};
						});
						data.totalCount = arr.length;
						if (!query.currentPage) {
							currentPage = 1;
						} else {
							currentPage = parseInt(query.currentPage);
							if (isNaN(currentPage)) {
								currentPage = 1;
							}
						}
						data.dataList = arr.slice((currentPage - 1) * pagesize, currentPage * pagesize);
					}
				}else if(pathname == "/admin/saveInfo"){
					var code = query.code;
					var info = dataMap[code];
					if(!info){
						data.code = -1;
						data.msg = "序号"+code+"不存在"
					}else{
						info.invite = query.invite;
						info.deadline = query.deadline;
						info.username = query.username;
						info.phoneNumber = query.phoneNumber;
						info.activeStatus = query.activeStatus;
						saveSettings("dataMap", dataMap);
					}
				}
			}
		}
		res.setHeader('Content-Type',`application/json;charset=utf-8`);
		res.end(JSON.stringify(data));
	} else {
		fs.readFile('.' + pathname, (err, data) => {
			if (err) {
				res.writeHead(404, {
					'Content-Type': 'text/html;charset="utf-8"'
				});
				res.end('<h3>404</h3>');
			} else {
				if (pathname.indexOf("/login.html") != -1) {
					delCookie(res,tokenKey);
					res.setHeader('Content-Type', `${requestType[ext]};charset="utf-8"`);
				} else if (pathname == "/index.html") {
					var token = getCookie(req,tokenKey);
					if(token != accessToken){
						res.writeHead(301, {'Location': '/login.html'});
						res.end();
					}else{
						res.setHeader('Content-Type', `${requestType[ext]};charset="utf-8"`);
						res.end(data);
					}
					return;
				} else {
					res.writeHead(200, {
						'Content-Type': `${requestType[ext]};charset="utf-8"`
					});
				}
				res.end(data);
			}
		})
	}
});
server.listen(port);

console.log('服务器开启成功，请打开localhost：' + port);

var server1 = http.createServer();

//创建WebSocket服务器
const wsServer = new WebSocketServer({
	//选择刚刚创建的http后台服务器为WebSocket服务器
	httpServer: server1
})

//WebSocket服务器建立请求连接
wsServer.on('request', function (request) {
	//当前的连接
	var connection = request.accept(null, request.origin);
	connection.sendUTF('服务器发来消息说已经建立连接');
	//监听有信息来的时候
	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			connection.sendUTF(message.utf8Data);
		} else if (message.type === 'binary') {
			connection.sendBytes(message.binaryData);
		}
	});
	//监听关闭
	connection.on('close', function (reasonCode, description) {
		console.log('连接关闭')
	})
})
server1.listen(port - 1);
console.log('ws服务器开启成功，请打开localhost：' + (port - 1));