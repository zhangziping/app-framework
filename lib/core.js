/*
 Copyright (c) 2012 Alibaba Inc. All rights reserved. Proprietary and confidential.
*/
if(!Function.prototype.bind)Function.prototype.bind=function(){var _slice=Array.prototype.slice;return function(context){var fn=this,args=_slice.call(arguments,1);if(args.length)return function(){return arguments.length?fn.apply(context,args.concat(_slice.call(arguments))):fn.apply(context,args)};return function(){return arguments.length?fn.apply(context,arguments):fn.call(context)}}}();
(function($){$.namespace("ali");var s=function(){var q=arguments[0],u,s=0,r,t,p,f;u=window;p=q;if(p.indexOf(".")){t=p.split(".");t[0]=="window"?f=t[1]:f=t[0];for(r=t[0]=="window"?1:0;r<t.length;r++){u[t[r]]=u[t[r]]||{};u=u[t[r]];if(r==t.length-1)return u}}else{u[p]=u[p]||{};return u[p]}};ali.defineClass=function(){var cls=function(){if(typeof this._init=="function"&&arguments[0]!==undefined)this._init.apply(this,arguments)};var a=arguments;var sup=Object;var objfun=[],staticFun;for(var i=0;i<a.length;i++)if(typeof a[i]==
"function")objfun.push(a[i]);if(objfun.length>=1)for(var i=0;i<objfun.length;i++)if(!!objfun[i]["logger"])sup=objfun[i];else staticFun=objfun[i];if(sup!=Object){function t(){}t.prototype=sup.prototype;cls.prototype=new t({});cls.prototype.constructor=cls;cls._super=sup.prototype}typeof staticFun=="function"?staticFun(cls,cls.prototype):"";cls.prototype.aliClass=function(){return cls};for(var i=0;i<a.length;i++)if(typeof a[i]=="object")$.extend(cls.prototype,a[i]);else;if(typeof a[0]=="string"){var arr=
a[0].split(".");var la=arr.splice(-1,1);s(arr.join("."))[la]=cls}cls.logger=cls.prototype.logger=ali.getLogger(a[0]);return cls}})(jQuery);(function($){$.namespace("ali.uxcore.util");ali.uxcore.util.pubsub={sub:function(types,fct,scope){var ev;types=types.split(/\s+/);var calls=this._fcts||(this._fcts={});while(ev=types.shift()){var list=calls[ev]||(calls[ev]={});var tail=list.tail||(list.tail=list.next={});tail.fct=fct;tail.scope=scope;list.tail=tail.next={}}return this},unsub:function(events,fct,context){var ev,calls,node;if(!events)delete this._fcts;else if(calls=this._fcts){events=events.split(/\s+/);while(ev=events.shift()){node=
calls[ev];delete calls[ev];if(!fct||!node)continue;while((node=node.next)&&node.next){if(node.fct===fct&&(!context||node.context===context))continue;this.pub(ev,node.fct,node.context)}}}return this},pub:function(events){var event,node,calls,tail,args,all,rest;if(!(calls=this._fcts))return this;all=calls["all"];(events=events.split(/\s+/)).push(null);while(event=events.shift()){if(all)events.push({next:all.next,tail:all.tail,event:event});if(!(node=calls[event]))continue;events.push({next:node.next,
tail:node.tail})}rest=Array.prototype.slice.call(arguments,1);while(node=events.pop()){tail=node.tail;args=node.event?[node.event].concat(rest):rest;while((node=node.next)!==tail)node.fct.apply(node.context||this,args)}return this}};ali.pubsub=ali.uxcore.util.pubsub})(jQuery);(function($){$.namespace("ali.uxcore.util");ali.uxcore.util.Logger=function(){};ali.uxcore.util.Logger.level=4;ali.uxcore.util.Logger.setLevel=function(level){ali.uxcore.util.Logger.level=level};var methods=["error","warn","info","debug","log"];$.extend(ali.uxcore.util.Logger.prototype,{level:ali.uxcore.util.Logger.level,setEnableLevel:function(level){if(level>4||level<0)this.error(["wrong level setting. level should be 0-4, the int type,you set ",level,", so stupided."].join(""));this.level=parseInt(level)},
enabled:function(lev){if(lev>this.level)return false;return true},name:function(){return this._name},log:function(){this._log(4,arguments)},debug:function(){this._log(3,arguments)},info:function(){this._log(2,arguments)},warn:function(){this._log(1,arguments)},error:function(){this._log(0,arguments)},_handler:function(level,name,msg){var method=methods[level];msg=[[method,name+" |"].join(" | ")].concat(Array.prototype.slice.call(msg));if(!ali.uxcore.util.Logger.logPool)ali.uxcore.util.Logger.logPool=
[];ali.uxcore.util.Logger.logPool.push(msg.join(""));if(ali.monitor&&ali.monitor.trunOn)ali.monitor.appendMessage(msg.join(""));if(self.console&&self.console.error)if(console.log.apply)console[method].apply(console,msg);else console[console[method]?method:"log"](msg)},_log:function(level,msg){if(this.enabled(level))this._handler(level,this.name(),msg)}});var logs={};ali.uxcore.util.getLogger=function(name){if(!logs[name]){logs[name]=new ali.uxcore.util.Logger(name);logs[name]._name=name}return logs[name]};
ali.logger=ali.uxcore.util.Logger;ali.getLogger=ali.uxcore.util.getLogger})(jQuery);ali.defineClass("ali.model",ali.pubsub,{_init:function(){this.reuseModel=true;this.initialize.apply(this,arguments);this.initHook();this.pub("inited");this.sub("beforedoV",function(){this.closeAllServerError()}.bind(this))},$el:"",events:{},initialize:function(auxObj){for(var key in auxObj)this[key]=auxObj[key];this.delegateEvents()},initHook:function(){this.$(".editEl").each(function(index,e){this.$(e).css({"border-color":"#91c3d8","border-width":"1px","border-style":"solid"})}.bind(this));this.$(".editEl").focus(function(e){this.$(e.target).css({"border-color":"#fe876b"})}.bind(this));
this.$(".editEl").blur(function(e){this.$(e.target).css({"border-color":"#91c3d8"})}.bind(this));this.$(".readonly").blur(function(e){this.$(e.target).css({"border-color":"#dedede"})}.bind(this))},$:function(selector){return this.$el.find(selector)},delegateEvents:function(){var eventSplitter=/^(\S+)\s*(.*)$/;var events=this.events;for(var key in events){var method=events[key];if(!jQuery.isFunction(method))method=this[events[key]];if(!method)throw new Error('Event "'+events[key]+'" does not exist');
method=method.bind(this);var match=key.match(eventSplitter);var eventName=match[1],selector=match[2];if(this.reuseModel&&this.$(selector).length>0)this.$el.delegate(selector,eventName,method);else if(!this.reuseModel)this.$el.delegate(selector,eventName,method)}},doV:function(){},closeAllServerError:function(){this.$(".comp-ff-backend-error").css("display","none")}});(function($){$.namespace("ali.uxcore.util");ali.uxcore.util.system={STATICMODE:0,LIVEMODE:1,mode:1,systempath:"",dummydataPath:"",globalmsgtimeout:3E3,setMode:function(mode){this.mode=mode},needLogMonitor:false,openLogMemory:false};ali.system=ali.uxcore.util.system;$.namespace("ali.monitor");var KLASS=ali.monitor;KLASS.MONITOR_PAGE="monitor.html";KLASS.getName=function(){return"iLogger"};ali.monitor.trunOn=false;window.childOpen=false;if(ali.system.needLogMonitor)$(document).keydown(function(e){if(e.ctrlKey&&
e.altKey&&e.keyCode==76){ali.monitor.trunOn=true;KLASS._openWindow()}});KLASS._openWindow=function(){var url=window.location.href;url=url.replace(window.location.pathname,"/"+KLASS.MONITOR_PAGE);KLASS._window=window.open(url,"Monitor_","directories=no,"+"location=no,"+"menubar=no,"+"status=yes,"+"personalbar=no,"+"titlebar=yes,"+"toolbar=no,"+"resizable=yes,"+"scrollbars=no,"+"width=500,"+"height=400");window.childOpen=true;if(this._window)window.focus();window.onunload=this.UpdateChild};KLASS.UpdateChild=
function(){if(window.childOpen==true){this._window.opener=null;this._window.parentOpen=false;KLASS._window.close()}};KLASS.onHotKey=function(){if(this._window==null||this._window.closed)this._openWindow()};KLASS.appendMessage=function(msg){var w=this._window;if(!w||!window.childOpen){this._openWindow();w=this._window}if(w&&w.appendMessage){if(w.isFirstTime()){var memory=ali.logger.logPool;for(var i=0;i<memory.length;i++)w.appendMessage(memory[i])}w.appendMessage(msg)}}})(jQuery);(function($){$.namespace("ali.uxcore.util");var sys=ali.system;var showMsgObj={"msgEl":null,"errorMsg":"\u012c\ufffd\u03f4\ufffd\ufffd\ufffd\ufffd\ufffd\u03e2","successMsg":"\u012c\ufffd\u03f3\u0279\ufffd\ufffd\ufffd\u03e2"};var mylog=ali.getLogger("ali.network");ali.uxcore.util.network={ajax:function(){var objAux=arguments[0];var n=objAux.methodName;var scope=objAux.scope;showMsgObj=objAux.showMsgObj?objAux.showMsgObj:showMsgObj;var suc=objAux.success?objAux.success:function(){};var err=objAux.error?
objAux.error:function(){};if(objAux.dataType=="html");else if(objAux.dataType=="script");else if(objAux.dataType=="json"&&sys.mode==sys.STATICMODE);var args={url:objAux.url,dataType:objAux.dataType,success:suc,error:function(xhr,status,error){mylog.log("status:"+xhr.status);if(status!=="error")err.apply(null,arguments);if(xhr.readyState==4)err.apply(null,arguments);else mylog.log(xhr.readyState)},timeout:5E3,method:objAux.method,type:objAux.type?objAux.type:"get",data:objAux.data?objAux.data:"",beforeSend:objAux.beforeSend?
objAux.beforeSend:"",complete:objAux.complete?objAux.complete:"",cache:objAux.cache==undefined?true:objAux.cache};return jQuery.ajax(args).done(this.onSuccess).fail(this.onError).always(this.onComplete)},onSuccess:function(data){mylog.log("++++ onsuccess+++");data=jQuery.parseJSON(data);if(showMsgObj["msgEl"]&&!data.success){switch(data.level){case "WARN":showMsgObj["msgEl"].attr("class",showMsgObj["isBigIcon"]?"comp-ff-big-warn":"comp-ff-small-warn");break;case "FATAL":showMsgObj["msgEl"].attr("class",
showMsgObj["isBigIcon"]?"comp-ff-big-error":"comp-ff-small-error");break;default:break}showMsgObj["msgEl"].html(data["errMsg"])}},onError:function(xhr,textStatus,errorThrown){mylog.log("+++timout ++++");mylog.info(textStatus);if(showMsgObj["msgEl"]){showMsgObj["msgEl"].attr("class",showMsgObj["isBigIcon"]?"comp-ff-big-error":"comp-ff-small-error");switch(textStatus){case "timeout":showMsgObj["msgEl"].html("\ufffd\ufffd\ufffd\ufffd\u02b1\ufffd\ufffd");break;case "abort":showMsgObj["msgEl"].html("\ufffd\ufffd\ufffd\ufffd\u0221\ufffd\ufffd");
break;default:showMsgObj["msgEl"].html(showMsgObj.errorMsg);break}}},onComplete:function(){mylog.log("+++onComplete ++++")},getScript:function(){var objAux=arguments[0];objAux.dataType="script";ali.network.ajax(objAux)},getHTML:function(){var objAux=arguments[0];objAux.dataType="html";ali.network.ajax(objAux)},getJSON:function(){var objAux=arguments[0];objAux.dataType="json";ali.network.ajax(objAux)}};ali.network=ali.uxcore.util.network})(jQuery);