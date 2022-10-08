const axios = require("axios");

function sleep(interval) {
    return new Promise(resolve => {
        setTimeout(resolve, interval);
    })
}

async  function getData(version){
    var rs = await axios.get("http://47.97.98.67/api/verify?code=b0366f4efb7f4c5c&label="+encodeURIComponent("昊视科技")+"&version="+version);
    console.log(version,rs.data);
    if(version>9999){
        return;
    }
    version += 1;
    await sleep(500)
    await getData(version);
}

// getData(205)


const {readSettings,saveSettings } = require("./config");
var loginInfo = {
    host:"127.0.0.1",
    port:8080,
    user:'admin',
    pwd:'123123'
}
// for(var key in config){
//     var keyValue = config[key];
//     console.log("savekey "+key,keyValue);
//     saveSettings(key,keyValue);
// }


// for(var key in config){
//     var keyValue = readSettings(key);
//     console.log("readkey "+key,keyValue);
// }

saveSettings("loginInfo",loginInfo);

var host = readSettings("loginInfo:host");
console.log(host);
