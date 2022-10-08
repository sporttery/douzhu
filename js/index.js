var alert_like;
var show_div_html = $("#show_div").html();

function alert(msg, title, callback, cancelFn) {
    if (!title) {
        layer.alert(msg);
        return;
    }
    if (!alert_like) {
        alert_like = $("#alert_like");
    }
    if (title) {
        alert_like.find("#myModalLabel").html(title);
    }
    alert_like.find("#modal_con").html("<p>" + msg + "</p>");
    alert_like.modal();
    if (callback) {
        alert_like.find(".close").removeAttr("data-dismiss").click(() => {
            callback();
            if (alert_like.is(":visible")) {
                alert_like.modal("hide");
            }
        });
        alert_like.find("#ok_btn").removeAttr("data-dismiss").click(() => {
            callback();
            if (alert_like.is(":visible")) {
                alert_like.modal("hide");
            }
        });
        if (cancelFn) {
            alert_like.find(".modal-footer").append('<button id="cancel_btn" class="btn btn-sm btn-warning">退 出</button>');
            alert_like.find("#cancel_btn").click(() => {
                cancelFn();
                if (alert_like.is(":visible")) {
                    alert_like.modal("hide");
                }
            });
        }
    } else {
        alert_like.find(".close").attr("data-dismiss", "modal");
        alert_like.find("#ok_btn").attr("data-dismiss", "modal");
        alert_like.find("#cancel_btn").remove();
    }
}

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


function gotoLogin(msg) {
    loadIdx && layer.close(loadIdx);
    document.cookie = "__token=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    if(msg){
        layer.alert(msg,(idx,el)=>{layer.close(idx);
            location.href = '/login.html';
        })
    }else{
        location.href = '/login.html';
    }
}

function doLogin() {
    var cname = $("#cname");
    var cemail = $("#cemail");
    var curl = $("#curl");
    var name = cname.val().trim();
    var pwd = cemail.val().trim();
    var url = curl.val().trim();
    if (name == "") {
        layer.tips("请输入账户", cname);
        return;
    }
    if (pwd == "") {
        layer.tips("请输入密码", cemail);
        return;
    }
    if (url == "") {
        layer.tips("请输入服务地址", curl);
        return;
    }
    //强账户和强密码
    // if (name.length < 7) {
    //     layer.tips("账户至少7位数", cname);
    //     return;
    // }
    // if (pwd.length < 11) {
    //     layer.tips("密码至少11位数", cemail);
    //     return;
    // }
    var urls = url.split(/[:,：，]/g);
    if (urls.length != 2) {
        layer.tips("服务地址不正确", curl);
        return;
    }
    loadIdx = layer.load();
    $.get("/admin/login",{
        host: urls[0],
        password: pwd,
        port: urls[1],
        user: name
    },(data)=>{
        layer.close(loadIdx);
        if(data.code==0){
            location.href = '/index.html?t='+(+new Date);
        }else{
            layer.alert(data.msg || "密码不正确或者权限不够，请重新登录");
        }
    })
}


/**
*
* @param totalPage 总页数
* @param callback 调用ajax
*/
function setPage(data, callback) { 
    if (!data || !data.dataList || data.dataList== 0) {
        currentPage = 1;
        $('#page').hide();
    } else {
        totalCount = data.totalCount || 0;
        if (totalCount <= pagesize) {
            totalPage = 1;
        } else {
            totalPage = totalCount % pagesize == 0 ? totalCount / pagesize : Math.ceil(totalCount / pagesize);
        }
        console.info({ currentPage, totalPage, pagesize });
        if (totalPage > 1) {
            var options = {
                bootstrapMajorVersion: 3,
                currentPage: currentPage,
                totalPages: totalPage,
                onPageClicked: function (event, originalEvent, type, page) {
                    // 把当前点击的页码赋值给currentPage, 调用ajax,渲染页面
                    currentPage = page
                    callback && callback()
                }
            }
            $('#page').show().find(".pagination").bootstrapPaginator(options);
        } else {
            currentPage = 1;
            $('#page').hide();
        }
    }

}


function userlist (){
    console.log("in userlist");
    var userlistDiv = $("#userlist");
    var code = userlistDiv.find("input[name=code]").val();
    var phoneNumber = userlistDiv.find("input[name=phoneNumber]").val();
    var username = userlistDiv.find("input[name=username]").val();
    var activeStatus = userlistDiv.find("select[name=activeStatus]").val();
    var begindateActive = userlistDiv.find("input[name=begindateActive]").val();
    var enddateActive = userlistDiv.find("input[name=enddateActive]").val();
    var begindateReg = userlistDiv.find("input[name=begindateReg]").val();
    var enddateReg = userlistDiv.find("input[name=enddateReg]").val();
    $.get("/admin/userlist",{currentPage,code,phoneNumber,username,activeStatus,begindateActive,begindateReg,enddateReg,enddateActive},(data)=>{
        if(data.code==0){
            setPage(data,userlist);
            var html = [];
            data.dataList.forEach((e,idx)=>{
                html.push(`<tr data-info='${JSON.stringify(e)}'>
                <td>${idx+1}</td>
                <td>${e.code||''}</td>
                <td>${e.invite||''}</td>
                <td>${e.activeStatus=='1'?'已激活':''}</td>
                <td>${e.phoneNumber || ""}</td>
                <td>${e.username || ""}</td>
                <td>${e.brand||""}</td>
                <td>${e.model||""}</td>
                <td>${e.release||""}</td>
                <td>${e.memory||""}</td>
                <td>${e.regTime?new Date(parseInt(e.regTime)).toLocaleDateString():""}</td>
                <td>${e.activeTime?new Date(parseInt(e.activeTime)).toLocaleDateString():""}</td>
                <td>${e.deadline?new Date(parseInt(e.deadline)).toLocaleDateString():""}</td>
                <td><a class="btn btn-success" onclick="javascript:editNt(this)">修改</a></td>
                </tr>`);
            });
            if(html.length>0){
                $("#fillUserBet").html(html.join(''));
            }
        }else if(data.code==-2){
            gotoLogin("无效token,请重新登录");
        }else{
            layer.alert(data.msg);
        }
    })
}

function doSearch(ele){
    currentPage=1;
    var id = $(ele).parents(".tab-pane").attr("id");
    if(id){
        eval(id+"()");
    }
}

function editNt(obj){
    var tr = $(obj).parents("tr");
    var dataInfo = tr.attr("data-info");
    var data = JSON.parse(dataInfo);
    var editTable =  $("#editTable");
    editTable.attr("data-code",data.code);
    editTable.find(".code").text(data.code);
    editTable.find(".invite").val(data.invite || "");
    editTable.find(".phoneNumber").val(data.phoneNumber || "");
    editTable.find(".username").val(data.username || "");
    editTable.find(".activeStatus").val(data.activeStatus || "");
    if(data.deadline){
        var deadline = new Date(data.deadline);
        editTable.find(".deadline").val(deadline.format("yyyy-MM-dd"));
    }
    editTable.modal();
}
function saveEdit(){
    var editTable =  $("#editTable");
    var code = editTable.attr("data-code");
    var invite = editTable.find(".invite").val();
    var phoneNumber = editTable.find(".phoneNumber").val();
    var username = editTable.find(".username").val();
    var deadline = editTable.find(".deadline").val();
    var activeStatus = editTable.find(".activeStatus").val();
    if(deadline){
        deadline = new Date(deadline).getTime();
    }
    var data = {code,invite,phoneNumber,username,deadline,activeStatus}
    $.get("/admin/saveInfo",data,(data)=>{
        if(data.code==0){
            layer.alert("修改成功",(idx)=>{
                layer.close(idx);
                userlist();
            });
        }else{
            layer.alert(data.msg);
        }
    })
}