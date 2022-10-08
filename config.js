
var nconf = require('nconf').file({ file: getUserHome() + "/douzhu.json" });
function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}


function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}


module.exports = {
    readSettings,saveSettings
}