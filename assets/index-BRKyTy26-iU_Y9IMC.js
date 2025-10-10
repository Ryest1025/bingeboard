import{K as Zr,v as zr}from"./index-BPk3_MNU.js";import{E as Kv,c as qv}from"./hls-Gu2pieNd-D912zfQd.js";import{X as bn}from"./custom-media-element-BTc9lN-c-DnaVW_yH.js";var Yv=Object.defineProperty,Gv=Object.getPrototypeOf,jv=Reflect.get,Mh=e=>{throw TypeError(e)},Qv=(e,t,a)=>t in e?Yv(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,Zv=(e,t,a)=>Qv(e,t+"",a),yd=(e,t,a)=>t.has(e)||Mh("Cannot "+a),k=(e,t,a)=>(yd(e,t,"read from private field"),a?a.call(e):t.get(e)),Ve=(e,t,a)=>t.has(e)?Mh("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),Et=(e,t,a,i)=>(yd(e,t,"write to private field"),t.set(e,a),a),_t=(e,t,a)=>(yd(e,t,"access private method"),a),Mo=(e,t,a)=>jv(Gv(e),a,t),zv=Object.create,Oh=Object.defineProperty,Xv=Object.getOwnPropertyDescriptor,Jv=Object.getOwnPropertyNames,eE=Object.getPrototypeOf,tE=Object.prototype.hasOwnProperty,Nh=function(e,t){return function(){return e&&(t=e(e=0)),t}},Fe=function(e,t){return function(){return t||e((t={exports:{}}).exports,t),t.exports}},aE=function(e,t,a,i){if(t&&typeof t=="object"||typeof t=="function")for(var r=Jv(t),n=0,s=r.length,o;n<s;n++)o=r[n],!tE.call(e,o)&&o!==a&&Oh(e,o,{get:(function(l){return t[l]}).bind(null,o),enumerable:!(i=Xv(t,o))||i.enumerable});return e},Xe=function(e,t,a){return a=e!=null?zv(eE(e)):{},aE(!e||!e.__esModule?Oh(a,"default",{value:e,enumerable:!0}):a,e)},Tt=Fe(function(e,t){var a;typeof window<"u"?a=window:typeof global<"u"?a=global:typeof self<"u"?a=self:a={},t.exports=a});function ni(e,t){return t!=null&&typeof Symbol<"u"&&t[Symbol.hasInstance]?!!t[Symbol.hasInstance](e):ni(e,t)}var si=Nh(function(){si()});function xh(e){"@swc/helpers - typeof";return e&&typeof Symbol<"u"&&e.constructor===Symbol?"symbol":typeof e}var Ph=Nh(function(){}),Uh=Fe(function(e,t){var a=Array.prototype.slice;t.exports=i;function i(r,n){for(("length"in r)||(r=[r]),r=a.call(r);r.length;){var s=r.shift(),o=n(s);if(o)return o;s.childNodes&&s.childNodes.length&&(r=a.call(s.childNodes).concat(r))}}}),iE=Fe(function(e,t){si(),t.exports=a;function a(i,r){if(!ni(this,a))return new a(i,r);this.data=i,this.nodeValue=i,this.length=i.length,this.ownerDocument=r||null}a.prototype.nodeType=8,a.prototype.nodeName="#comment",a.prototype.toString=function(){return"[object Comment]"}}),rE=Fe(function(e,t){si(),t.exports=a;function a(i,r){if(!ni(this,a))return new a(i);this.data=i||"",this.length=this.data.length,this.ownerDocument=r||null}a.prototype.type="DOMTextNode",a.prototype.nodeType=3,a.prototype.nodeName="#text",a.prototype.toString=function(){return this.data},a.prototype.replaceData=function(i,r,n){var s=this.data,o=s.substring(0,i),l=s.substring(i+r,s.length);this.data=o+n+l,this.length=this.data.length}}),Bh=Fe(function(e,t){t.exports=a;function a(i){var r=this,n=i.type;i.target||(i.target=r),r.listeners||(r.listeners={});var s=r.listeners[n];if(s)return s.forEach(function(o){i.currentTarget=r,typeof o=="function"?o(i):o.handleEvent(i)});r.parentNode&&r.parentNode.dispatchEvent(i)}}),Hh=Fe(function(e,t){t.exports=a;function a(i,r){var n=this;n.listeners||(n.listeners={}),n.listeners[i]||(n.listeners[i]=[]),n.listeners[i].indexOf(r)===-1&&n.listeners[i].push(r)}}),Wh=Fe(function(e,t){t.exports=a;function a(i,r){var n=this;if(n.listeners&&n.listeners[i]){var s=n.listeners[i],o=s.indexOf(r);o!==-1&&s.splice(o,1)}}}),nE=Fe(function(e,t){Ph(),t.exports=i;var a=["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"];function i(m){switch(m.nodeType){case 3:return u(m.data);case 8:return"<!--"+m.data+"-->";default:return r(m)}}function r(m){var h=[],v=m.tagName;return m.namespaceURI==="https://www.w3.org/1999/xhtml"&&(v=v.toLowerCase()),h.push("<"+v+d(m)+o(m)),a.indexOf(v)>-1?h.push(" />"):(h.push(">"),m.childNodes.length?h.push.apply(h,m.childNodes.map(i)):m.textContent||m.innerText?h.push(u(m.textContent||m.innerText)):m.innerHTML&&h.push(m.innerHTML),h.push("</"+v+">")),h.join("")}function n(m,h){var v=xh(m[h]);return h==="style"&&Object.keys(m.style).length>0?!0:m.hasOwnProperty(h)&&(v==="string"||v==="boolean"||v==="number")&&h!=="nodeName"&&h!=="className"&&h!=="tagName"&&h!=="textContent"&&h!=="innerText"&&h!=="namespaceURI"&&h!=="innerHTML"}function s(m){if(typeof m=="string")return m;var h="";return Object.keys(m).forEach(function(v){var _=m[v];v=v.replace(/[A-Z]/g,function(b){return"-"+b.toLowerCase()}),h+=v+":"+_+";"}),h}function o(m){var h=m.dataset,v=[];for(var _ in h)v.push({name:"data-"+_,value:h[_]});return v.length?l(v):""}function l(m){var h=[];return m.forEach(function(v){var _=v.name,b=v.value;_==="style"&&(b=s(b)),h.push(_+'="'+p(b)+'"')}),h.length?" "+h.join(" "):""}function d(m){var h=[];for(var v in m)n(m,v)&&h.push({name:v,value:m[v]});for(var _ in m._attributes)for(var b in m._attributes[_]){var y=m._attributes[_][b],T=(y.prefix?y.prefix+":":"")+b;h.push({name:T,value:y.value})}return m.className&&h.push({name:"class",value:m.className}),h.length?l(h):""}function u(m){var h="";return typeof m=="string"?h=m:m&&(h=m.toString()),h.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function p(m){return u(m).replace(/"/g,"&quot;")}}),Vh=Fe(function(e,t){si();var a=Uh(),i=Bh(),r=Hh(),n=Wh(),s=nE(),o="https://www.w3.org/1999/xhtml";t.exports=l;function l(d,u,p){if(!ni(this,l))return new l(d);var m=p===void 0?o:p||null;this.tagName=m===o?String(d).toUpperCase():d,this.nodeName=this.tagName,this.className="",this.dataset={},this.childNodes=[],this.parentNode=null,this.style={},this.ownerDocument=u||null,this.namespaceURI=m,this._attributes={},this.tagName==="INPUT"&&(this.type="text")}l.prototype.type="DOMElement",l.prototype.nodeType=1,l.prototype.appendChild=function(d){return d.parentNode&&d.parentNode.removeChild(d),this.childNodes.push(d),d.parentNode=this,d},l.prototype.replaceChild=function(d,u){d.parentNode&&d.parentNode.removeChild(d);var p=this.childNodes.indexOf(u);return u.parentNode=null,this.childNodes[p]=d,d.parentNode=this,u},l.prototype.removeChild=function(d){var u=this.childNodes.indexOf(d);return this.childNodes.splice(u,1),d.parentNode=null,d},l.prototype.insertBefore=function(d,u){d.parentNode&&d.parentNode.removeChild(d);var p=u==null?-1:this.childNodes.indexOf(u);return p>-1?this.childNodes.splice(p,0,d):this.childNodes.push(d),d.parentNode=this,d},l.prototype.setAttributeNS=function(d,u,p){var m=null,h=u,v=u.indexOf(":");if(v>-1&&(m=u.substr(0,v),h=u.substr(v+1)),this.tagName==="INPUT"&&u==="type")this.type=p;else{var _=this._attributes[d]||(this._attributes[d]={});_[h]={value:p,prefix:m}}},l.prototype.getAttributeNS=function(d,u){var p=this._attributes[d],m=p&&p[u]&&p[u].value;return this.tagName==="INPUT"&&u==="type"?this.type:typeof m!="string"?null:m},l.prototype.removeAttributeNS=function(d,u){var p=this._attributes[d];p&&delete p[u]},l.prototype.hasAttributeNS=function(d,u){var p=this._attributes[d];return!!p&&u in p},l.prototype.setAttribute=function(d,u){return this.setAttributeNS(null,d,u)},l.prototype.getAttribute=function(d){return this.getAttributeNS(null,d)},l.prototype.removeAttribute=function(d){return this.removeAttributeNS(null,d)},l.prototype.hasAttribute=function(d){return this.hasAttributeNS(null,d)},l.prototype.removeEventListener=n,l.prototype.addEventListener=r,l.prototype.dispatchEvent=i,l.prototype.focus=function(){},l.prototype.toString=function(){return s(this)},l.prototype.getElementsByClassName=function(d){var u=d.split(" "),p=[];return a(this,function(m){if(m.nodeType===1){var h=m.className||"",v=h.split(" ");u.every(function(_){return v.indexOf(_)!==-1})&&p.push(m)}}),p},l.prototype.getElementsByTagName=function(d){d=d.toLowerCase();var u=[];return a(this.childNodes,function(p){p.nodeType===1&&(d==="*"||p.tagName.toLowerCase()===d)&&u.push(p)}),u},l.prototype.contains=function(d){return a(this,function(u){return d===u})||!1}}),sE=Fe(function(e,t){si();var a=Vh();t.exports=i;function i(r){if(!ni(this,i))return new i;this.childNodes=[],this.parentNode=null,this.ownerDocument=r||null}i.prototype.type="DocumentFragment",i.prototype.nodeType=11,i.prototype.nodeName="#document-fragment",i.prototype.appendChild=a.prototype.appendChild,i.prototype.replaceChild=a.prototype.replaceChild,i.prototype.removeChild=a.prototype.removeChild,i.prototype.toString=function(){return this.childNodes.map(function(r){return String(r)}).join("")}}),oE=Fe(function(e,t){t.exports=a;function a(i){}a.prototype.initEvent=function(i,r,n){this.type=i,this.bubbles=r,this.cancelable=n},a.prototype.preventDefault=function(){}}),lE=Fe(function(e,t){si();var a=Uh(),i=iE(),r=rE(),n=Vh(),s=sE(),o=oE(),l=Bh(),d=Hh(),u=Wh();t.exports=p;function p(){if(!ni(this,p))return new p;this.head=this.createElement("head"),this.body=this.createElement("body"),this.documentElement=this.createElement("html"),this.documentElement.appendChild(this.head),this.documentElement.appendChild(this.body),this.childNodes=[this.documentElement],this.nodeType=9}var m=p.prototype;m.createTextNode=function(h){return new r(h,this)},m.createElementNS=function(h,v){var _=h===null?null:String(h);return new n(v,this,_)},m.createElement=function(h){return new n(h,this)},m.createDocumentFragment=function(){return new s(this)},m.createEvent=function(h){return new o(h)},m.createComment=function(h){return new i(h,this)},m.getElementById=function(h){h=String(h);var v=a(this.childNodes,function(_){if(String(_.id)===h)return _});return v||null},m.getElementsByClassName=n.prototype.getElementsByClassName,m.getElementsByTagName=n.prototype.getElementsByTagName,m.contains=n.prototype.contains,m.removeEventListener=u,m.addEventListener=d,m.dispatchEvent=l}),dE=Fe(function(e,t){var a=lE();t.exports=new a}),Fh=Fe(function(e,t){var a=typeof global<"u"?global:typeof window<"u"?window:{},i=dE(),r;typeof document<"u"?r=document:(r=a["__GLOBAL_DOCUMENT_CACHE@4"],r||(r=a["__GLOBAL_DOCUMENT_CACHE@4"]=i)),t.exports=r});function uE(e){if(Array.isArray(e))return e}function cE(e,t){var a=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(a!=null){var i=[],r=!0,n=!1,s,o;try{for(a=a.call(e);!(r=(s=a.next()).done)&&(i.push(s.value),!(t&&i.length===t));r=!0);}catch(l){n=!0,o=l}finally{try{!r&&a.return!=null&&a.return()}finally{if(n)throw o}}return i}}function hE(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function nl(e,t){(t==null||t>e.length)&&(t=e.length);for(var a=0,i=new Array(t);a<t;a++)i[a]=e[a];return i}function $h(e,t){if(e){if(typeof e=="string")return nl(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);if(a==="Object"&&e.constructor&&(a=e.constructor.name),a==="Map"||a==="Set")return Array.from(a);if(a==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))return nl(e,t)}}function na(e,t){return uE(e)||cE(e,t)||$h(e,t)||hE()}var Wr=Xe(Tt()),tc=Xe(Tt()),mE=Xe(Tt()),pE={now:function(){var e=mE.default.performance,t=e&&e.timing,a=t&&t.navigationStart,i=typeof a=="number"&&typeof e.now=="function"?a+e.now():Date.now();return Math.round(i)}},Te=pE,Xr=function(){var e,t,a;if(typeof((e=tc.default.crypto)===null||e===void 0?void 0:e.getRandomValues)=="function"){a=new Uint8Array(32),tc.default.crypto.getRandomValues(a);for(var i=0;i<32;i++)a[i]=a[i]%16}else{a=[];for(var r=0;r<32;r++)a[r]=Math.random()*16|0}var n=0;t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(l){var d=l==="x"?a[n]:a[n]&3|8;return n++,d.toString(16)});var s=Te.now(),o=s==null?void 0:s.toString(16).substring(3);return o?t.substring(0,28)+o:t},Kh=function(){return("000000"+(Math.random()*Math.pow(36,6)<<0).toString(36)).slice(-6)},ht=function(e){if(e&&typeof e.nodeName<"u")return e.muxId||(e.muxId=Kh()),e.muxId;var t;try{t=document.querySelector(e)}catch{}return t&&!t.muxId&&(t.muxId=e),(t==null?void 0:t.muxId)||e},Vs=function(e){var t;e&&typeof e.nodeName<"u"?(t=e,e=ht(t)):t=document.querySelector(e);var a=t&&t.nodeName?t.nodeName.toLowerCase():"";return[t,e,a]};function vE(e){if(Array.isArray(e))return nl(e)}function EE(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function fE(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function mt(e){return vE(e)||EE(e)||$h(e)||fE()}var Ka={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4},bE=function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:3,a,i,r,n,s,o=[console,e],l=(a=console.trace).bind.apply(a,mt(o)),d=(i=console.info).bind.apply(i,mt(o)),u=(r=console.debug).bind.apply(r,mt(o)),p=(n=console.warn).bind.apply(n,mt(o)),m=(s=console.error).bind.apply(s,mt(o)),h=t;return{trace:function(){for(var v=arguments.length,_=new Array(v),b=0;b<v;b++)_[b]=arguments[b];if(!(h>Ka.TRACE))return l.apply(void 0,mt(_))},debug:function(){for(var v=arguments.length,_=new Array(v),b=0;b<v;b++)_[b]=arguments[b];if(!(h>Ka.DEBUG))return u.apply(void 0,mt(_))},info:function(){for(var v=arguments.length,_=new Array(v),b=0;b<v;b++)_[b]=arguments[b];if(!(h>Ka.INFO))return d.apply(void 0,mt(_))},warn:function(){for(var v=arguments.length,_=new Array(v),b=0;b<v;b++)_[b]=arguments[b];if(!(h>Ka.WARN))return p.apply(void 0,mt(_))},error:function(){for(var v=arguments.length,_=new Array(v),b=0;b<v;b++)_[b]=arguments[b];if(!(h>Ka.ERROR))return m.apply(void 0,mt(_))},get level(){return h},set level(v){v!==this.level&&(h=v??t)}}},te=bE("[mux]"),Oo=Xe(Tt());function sl(){var e=Oo.default.doNotTrack||Oo.default.navigator&&Oo.default.navigator.doNotTrack;return e==="1"}function P(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}si();function De(e,t){if(!ni(e,t))throw new TypeError("Cannot call a class as a function")}function gE(e,t){for(var a=0;a<t.length;a++){var i=t[a];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function Gt(e,t,a){return t&&gE(e.prototype,t),e}function w(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function Gi(e){return Gi=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},Gi(e)}function _E(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&(e=Gi(e),e!==null););return e}function xn(e,t,a){return typeof Reflect<"u"&&Reflect.get?xn=Reflect.get:xn=function(i,r,n){var s=_E(i,r);if(s){var o=Object.getOwnPropertyDescriptor(s,r);return o.get?o.get.call(n||i):o.value}},xn(e,t,a||e)}function ol(e,t){return ol=Object.setPrototypeOf||function(a,i){return a.__proto__=i,a},ol(e,t)}function yE(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ol(e,t)}function TE(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}Ph();function AE(e,t){return t&&(xh(t)==="object"||typeof t=="function")?t:P(e)}function kE(e){var t=TE();return function(){var a=Gi(e),i;if(t){var r=Gi(this).constructor;i=Reflect.construct(a,arguments,r)}else i=a.apply(this,arguments);return AE(this,i)}}var gt=function(e){return Jr(e)[0]},Jr=function(e){if(typeof e!="string"||e==="")return["localhost"];var t=/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,a=e.match(t)||[],i=a[4],r;return i&&(r=(i.match(/[^\.]+\.[^\.]+$/)||[])[0]),[i,r]},No=Xe(Tt()),wE={exists:function(){var e=No.default.performance,t=e&&e.timing;return t!==void 0},domContentLoadedEventEnd:function(){var e=No.default.performance,t=e&&e.timing;return t&&t.domContentLoadedEventEnd},navigationStart:function(){var e=No.default.performance,t=e&&e.timing;return t&&t.navigationStart}},Fs=wE;function ge(e,t,a){a=a===void 0?1:a,e[t]=e[t]||0,e[t]+=a}function $s(e){for(var t=1;t<arguments.length;t++){var a=arguments[t]!=null?arguments[t]:{},i=Object.keys(a);typeof Object.getOwnPropertySymbols=="function"&&(i=i.concat(Object.getOwnPropertySymbols(a).filter(function(r){return Object.getOwnPropertyDescriptor(a,r).enumerable}))),i.forEach(function(r){w(e,r,a[r])})}return e}function SE(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);a.push.apply(a,i)}return a}function Td(e,t){return t=t??{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):SE(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}),e}var IE=["x-cdn","content-type"],qh=["x-request-id","cf-ray","x-amz-cf-id","x-akamai-request-id"],RE=IE.concat(qh);function Ad(e){e=e||"";var t={},a=e.trim().split(/[\r\n]+/);return a.forEach(function(i){if(i){var r=i.split(": "),n=r.shift();n&&(RE.indexOf(n.toLowerCase())>=0||n.toLowerCase().indexOf("x-litix-")===0)&&(t[n]=r.join(": "))}}),t}function Ks(e){if(e){var t=qh.find(function(a){return e[a]!==void 0});return t?e[t]:void 0}}var DE=function(e){var t={};for(var a in e){var i=e[a],r=i["DATA-ID"].search("io.litix.data.");if(r!==-1){var n=i["DATA-ID"].replace("io.litix.data.","");t[n]=i.VALUE}}return t},Yh=DE,gn=function(e){if(!e)return{};var t=Fs.navigationStart(),a=e.loading,i=a?a.start:e.trequest,r=a?a.first:e.tfirst,n=a?a.end:e.tload;return{bytesLoaded:e.total,requestStart:Math.round(t+i),responseStart:Math.round(t+r),responseEnd:Math.round(t+n)}},sr=function(e){if(!(!e||typeof e.getAllResponseHeaders!="function"))return Ad(e.getAllResponseHeaders())},CE=function(e,t,a){var i=arguments.length>4?arguments[4]:void 0,r=e.log,n=e.utils.secondsToMs,s=function(b){var y=parseInt(i.version),T;return y===1&&b.programDateTime!==null&&(T=b.programDateTime),y===0&&b.pdt!==null&&(T=b.pdt),T};if(!Fs.exists()){r.warn("performance timing not supported. Not tracking HLS.js.");return}var o=function(b,y){return e.emit(t,b,y)},l=function(b,y){var T=y.levels,E=y.audioTracks,S=y.url,L=y.stats,x=y.networkDetails,W=y.sessionData,G={},z={};T.forEach(function(me,Pe){G[Pe]={width:me.width,height:me.height,bitrate:me.bitrate,attrs:me.attrs}}),E.forEach(function(me,Pe){z[Pe]={name:me.name,language:me.lang,bitrate:me.bitrate}});var F=gn(L),U=F.bytesLoaded,Oe=F.requestStart,$e=F.responseStart,Ke=F.responseEnd;o("requestcompleted",Td($s({},Yh(W)),{request_event_type:b,request_bytes_loaded:U,request_start:Oe,request_response_start:$e,request_response_end:Ke,request_type:"manifest",request_hostname:gt(S),request_response_headers:sr(x),request_rendition_lists:{media:G,audio:z,video:{}}}))};a.on(i.Events.MANIFEST_LOADED,l);var d=function(b,y){var T=y.details,E=y.level,S=y.networkDetails,L=y.stats,x=gn(L),W=x.bytesLoaded,G=x.requestStart,z=x.responseStart,F=x.responseEnd,U=T.fragments[T.fragments.length-1],Oe=s(U)+n(U.duration);o("requestcompleted",{request_event_type:b,request_bytes_loaded:W,request_start:G,request_response_start:z,request_response_end:F,request_current_level:E,request_type:"manifest",request_hostname:gt(T.url),request_response_headers:sr(S),video_holdback:T.holdBack&&n(T.holdBack),video_part_holdback:T.partHoldBack&&n(T.partHoldBack),video_part_target_duration:T.partTarget&&n(T.partTarget),video_target_duration:T.targetduration&&n(T.targetduration),video_source_is_live:T.live,player_manifest_newest_program_time:isNaN(Oe)?void 0:Oe})};a.on(i.Events.LEVEL_LOADED,d);var u=function(b,y){var T=y.details,E=y.networkDetails,S=y.stats,L=gn(S),x=L.bytesLoaded,W=L.requestStart,G=L.responseStart,z=L.responseEnd;o("requestcompleted",{request_event_type:b,request_bytes_loaded:x,request_start:W,request_response_start:G,request_response_end:z,request_type:"manifest",request_hostname:gt(T.url),request_response_headers:sr(E)})};a.on(i.Events.AUDIO_TRACK_LOADED,u);var p=function(b,y){var T=y.stats,E=y.networkDetails,S=y.frag;T=T||S.stats;var L=gn(T),x=L.bytesLoaded,W=L.requestStart,G=L.responseStart,z=L.responseEnd,F=E?sr(E):void 0,U={request_event_type:b,request_bytes_loaded:x,request_start:W,request_response_start:G,request_response_end:z,request_hostname:E?gt(E.responseURL):void 0,request_id:F?Ks(F):void 0,request_response_headers:F,request_media_duration:S.duration,request_url:E==null?void 0:E.responseURL};S.type==="main"?(U.request_type="media",U.request_current_level=S.level,U.request_video_width=(a.levels[S.level]||{}).width,U.request_video_height=(a.levels[S.level]||{}).height,U.request_labeled_bitrate=(a.levels[S.level]||{}).bitrate):U.request_type=S.type,o("requestcompleted",U)};a.on(i.Events.FRAG_LOADED,p);var m=function(b,y){var T=y.frag,E=T.start,S=s(T),L={currentFragmentPDT:S,currentFragmentStart:n(E)};o("fragmentchange",L)};a.on(i.Events.FRAG_CHANGED,m);var h=function(b,y){var T=y.type,E=y.details,S=y.response,L=y.fatal,x=y.frag,W=y.networkDetails,G=(x==null?void 0:x.url)||y.url||"",z=W?sr(W):void 0;if((E===i.ErrorDetails.MANIFEST_LOAD_ERROR||E===i.ErrorDetails.MANIFEST_LOAD_TIMEOUT||E===i.ErrorDetails.FRAG_LOAD_ERROR||E===i.ErrorDetails.FRAG_LOAD_TIMEOUT||E===i.ErrorDetails.LEVEL_LOAD_ERROR||E===i.ErrorDetails.LEVEL_LOAD_TIMEOUT||E===i.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||E===i.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT||E===i.ErrorDetails.SUBTITLE_LOAD_ERROR||E===i.ErrorDetails.SUBTITLE_LOAD_TIMEOUT||E===i.ErrorDetails.KEY_LOAD_ERROR||E===i.ErrorDetails.KEY_LOAD_TIMEOUT)&&o("requestfailed",{request_error:E,request_url:G,request_hostname:gt(G),request_id:z?Ks(z):void 0,request_type:E===i.ErrorDetails.FRAG_LOAD_ERROR||E===i.ErrorDetails.FRAG_LOAD_TIMEOUT?"media":E===i.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||E===i.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT?"audio":E===i.ErrorDetails.SUBTITLE_LOAD_ERROR||E===i.ErrorDetails.SUBTITLE_LOAD_TIMEOUT?"subtitle":E===i.ErrorDetails.KEY_LOAD_ERROR||E===i.ErrorDetails.KEY_LOAD_TIMEOUT?"encryption":"manifest",request_error_code:S==null?void 0:S.code,request_error_text:S==null?void 0:S.text}),L){var F,U="".concat(G?"url: ".concat(G,`
`):"")+"".concat(S&&(S.code||S.text)?"response: ".concat(S.code,", ").concat(S.text,`
`):"")+"".concat(y.reason?"failure reason: ".concat(y.reason,`
`):"")+"".concat(y.level?"level: ".concat(y.level,`
`):"")+"".concat(y.parent?"parent stream controller: ".concat(y.parent,`
`):"")+"".concat(y.buffer?"buffer length: ".concat(y.buffer,`
`):"")+"".concat(y.error?"error: ".concat(y.error,`
`):"")+"".concat(y.event?"event: ".concat(y.event,`
`):"")+"".concat(y.err?"error message: ".concat((F=y.err)===null||F===void 0?void 0:F.message,`
`):"");o("error",{player_error_code:T,player_error_message:E,player_error_context:U})}};a.on(i.Events.ERROR,h);var v=function(b,y){var T=y.frag,E=T&&T._url||"";o("requestcanceled",{request_event_type:b,request_url:E,request_type:"media",request_hostname:gt(E)})};a.on(i.Events.FRAG_LOAD_EMERGENCY_ABORTED,v);var _=function(b,y){var T=y.level,E=a.levels[T];if(E&&E.attrs&&E.attrs.BANDWIDTH){var S=E.attrs.BANDWIDTH,L,x=parseFloat(E.attrs["FRAME-RATE"]);isNaN(x)||(L=x),S?o("renditionchange",{video_source_fps:L,video_source_bitrate:S,video_source_width:E.width,video_source_height:E.height,video_source_rendition_name:E.name,video_source_codec:E==null?void 0:E.videoCodec}):r.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js")}};a.on(i.Events.LEVEL_SWITCHED,_),a._stopMuxMonitor=function(){a.off(i.Events.MANIFEST_LOADED,l),a.off(i.Events.LEVEL_LOADED,d),a.off(i.Events.AUDIO_TRACK_LOADED,u),a.off(i.Events.FRAG_LOADED,p),a.off(i.Events.FRAG_CHANGED,m),a.off(i.Events.ERROR,h),a.off(i.Events.FRAG_LOAD_EMERGENCY_ABORTED,v),a.off(i.Events.LEVEL_SWITCHED,_),a.off(i.Events.DESTROYING,a._stopMuxMonitor),delete a._stopMuxMonitor},a.on(i.Events.DESTROYING,a._stopMuxMonitor)},LE=function(e){e&&typeof e._stopMuxMonitor=="function"&&e._stopMuxMonitor()},ac=function(e,t){if(!e||!e.requestEndDate)return{};var a=gt(e.url),i=e.url,r=e.bytesLoaded,n=new Date(e.requestStartDate).getTime(),s=new Date(e.firstByteDate).getTime(),o=new Date(e.requestEndDate).getTime(),l=isNaN(e.duration)?0:e.duration,d=typeof t.getMetricsFor=="function"?t.getMetricsFor(e.mediaType).HttpList:t.getDashMetrics().getHttpRequests(e.mediaType),u;d.length>0&&(u=Ad(d[d.length-1]._responseHeaders||""));var p=u?Ks(u):void 0;return{requestStart:n,requestResponseStart:s,requestResponseEnd:o,requestBytesLoaded:r,requestResponseHeaders:u,requestMediaDuration:l,requestHostname:a,requestUrl:i,requestId:p}},ME=function(e,t){var a=t.getQualityFor(e),i=t.getCurrentTrackFor(e).bitrateList;return i?{currentLevel:a,renditionWidth:i[a].width||null,renditionHeight:i[a].height||null,renditionBitrate:i[a].bandwidth}:{}},OE=function(e){var t;return(t=e.match(/.*codecs\*?="(.*)"/))===null||t===void 0?void 0:t[1]},NE=function(e){try{var t,a,i=(a=e.getVersion)===null||a===void 0||(t=a.call(e))===null||t===void 0?void 0:t.split(".").map(function(r){return parseInt(r)})[0];return i}catch{return!1}},xE=function(e,t,a){var i=e.log;if(!a||!a.on){i.warn("Invalid dash.js player reference. Monitoring blocked.");return}var r=NE(a),n=function(T,E){return e.emit(t,T,E)},s=function(T){var E=T.type,S=T.data,L=(S||{}).url;n("requestcompleted",{request_event_type:E,request_start:0,request_response_start:0,request_response_end:0,request_bytes_loaded:-1,request_type:"manifest",request_hostname:gt(L),request_url:L})};a.on("manifestLoaded",s);var o={},l=function(T){if(typeof T.getRequests!="function")return null;var E=T.getRequests({state:"executed"});return E.length===0?null:E[E.length-1]},d=function(T){var E=T.type,S=T.fragmentModel,L=T.chunk,x=l(S);u({type:E,request:x,chunk:L})},u=function(T){var E=T.type,S=T.chunk,L=T.request,x=(S||{}).mediaInfo,W=x||{},G=W.type,z=W.bitrateList;z=z||[];var F={};z.forEach(function(kt,Be){F[Be]={},F[Be].width=kt.width,F[Be].height=kt.height,F[Be].bitrate=kt.bandwidth,F[Be].attrs={}}),G==="video"?o.video=F:G==="audio"?o.audio=F:o.media=F;var U=ac(L,a),Oe=U.requestStart,$e=U.requestResponseStart,Ke=U.requestResponseEnd,me=U.requestResponseHeaders,Pe=U.requestMediaDuration,At=U.requestHostname,Ue=U.requestUrl,dt=U.requestId;n("requestcompleted",{request_event_type:E,request_start:Oe,request_response_start:$e,request_response_end:Ke,request_bytes_loaded:-1,request_type:G+"_init",request_response_headers:me,request_hostname:At,request_id:dt,request_url:Ue,request_media_duration:Pe,request_rendition_lists:o})};r>=4?a.on("initFragmentLoaded",u):a.on("initFragmentLoaded",d);var p=function(T){var E=T.type,S=T.fragmentModel,L=T.chunk,x=l(S);m({type:E,request:x,chunk:L})},m=function(T){var E=T.type,S=T.chunk,L=T.request,x=S||{},W=x.mediaInfo,G=x.start,z=W||{},F=z.type,U=ac(L,a),Oe=U.requestStart,$e=U.requestResponseStart,Ke=U.requestResponseEnd,me=U.requestBytesLoaded,Pe=U.requestResponseHeaders,At=U.requestMediaDuration,Ue=U.requestHostname,dt=U.requestUrl,kt=U.requestId,Be=ME(F,a),qe=Be.currentLevel,et=Be.renditionWidth,oi=Be.renditionHeight,fn=Be.renditionBitrate;n("requestcompleted",{request_event_type:E,request_start:Oe,request_response_start:$e,request_response_end:Ke,request_bytes_loaded:me,request_type:F,request_response_headers:Pe,request_hostname:Ue,request_id:kt,request_url:dt,request_media_start_time:G,request_media_duration:At,request_current_level:qe,request_labeled_bitrate:fn,request_video_width:et,request_video_height:oi})};r>=4?a.on("mediaFragmentLoaded",m):a.on("mediaFragmentLoaded",p);var h={video:void 0,audio:void 0,totalBitrate:void 0},v=function(){if(h.video&&typeof h.video.bitrate=="number"){if(!(h.video.width&&h.video.height)){i.warn("have bitrate info for video but missing width/height");return}var T=h.video.bitrate;if(h.audio&&typeof h.audio.bitrate=="number"&&(T+=h.audio.bitrate),T!==h.totalBitrate)return h.totalBitrate=T,{video_source_bitrate:T,video_source_height:h.video.height,video_source_width:h.video.width,video_source_codec:OE(h.video.codec)}}},_=function(T,E,S){if(typeof T.newQuality!="number"){i.warn("missing evt.newQuality in qualityChangeRendered event",T);return}var L=T.mediaType;if(L==="audio"||L==="video"){var x=a.getBitrateInfoListFor(L).find(function(G){var z=G.qualityIndex;return z===T.newQuality});if(!(x&&typeof x.bitrate=="number")){i.warn("missing bitrate info for ".concat(L));return}h[L]=Td($s({},x),{codec:a.getCurrentTrackFor(L).codec});var W=v();W&&n("renditionchange",W)}};a.on("qualityChangeRendered",_);var b=function(T){var E=T.request,S=T.mediaType;E=E||{},n("requestcanceled",{request_event_type:E.type+"_"+E.action,request_url:E.url,request_type:S,request_hostname:gt(E.url)})};a.on("fragmentLoadingAbandoned",b);var y=function(T){var E=T.error,S,L,x=(E==null||(S=E.data)===null||S===void 0?void 0:S.request)||{},W=(E==null||(L=E.data)===null||L===void 0?void 0:L.response)||{};(E==null?void 0:E.code)===27&&n("requestfailed",{request_error:x.type+"_"+x.action,request_url:x.url,request_hostname:gt(x.url),request_type:x.mediaType,request_error_code:W.status,request_error_text:W.statusText});var G="".concat(x!=null&&x.url?"url: ".concat(x.url,`
`):"")+"".concat(W!=null&&W.status||W!=null&&W.statusText?"response: ".concat(W==null?void 0:W.status,", ").concat(W==null?void 0:W.statusText,`
`):"");n("error",{player_error_code:E==null?void 0:E.code,player_error_message:E==null?void 0:E.message,player_error_context:G})};a.on("error",y),a._stopMuxMonitor=function(){a.off("manifestLoaded",s),a.off("initFragmentLoaded",u),a.off("mediaFragmentLoaded",m),a.off("qualityChangeRendered",_),a.off("error",y),a.off("fragmentLoadingAbandoned",b),delete a._stopMuxMonitor}},PE=function(e){e&&typeof e._stopMuxMonitor=="function"&&e._stopMuxMonitor()},ic=0,UE=(function(){function e(){De(this,e),w(this,"_listeners",void 0)}return Gt(e,[{key:"on",value:function(t,a,i){return a._eventEmitterGuid=a._eventEmitterGuid||++ic,this._listeners=this._listeners||{},this._listeners[t]=this._listeners[t]||[],i&&(a=a.bind(i)),this._listeners[t].push(a),a}},{key:"off",value:function(t,a){var i=this._listeners&&this._listeners[t];i&&i.forEach(function(r,n){r._eventEmitterGuid===a._eventEmitterGuid&&i.splice(n,1)})}},{key:"one",value:function(t,a,i){var r=this;a._eventEmitterGuid=a._eventEmitterGuid||++ic;var n=function(){r.off(t,n),a.apply(i||this,arguments)};n._eventEmitterGuid=a._eventEmitterGuid,this.on(t,n)}},{key:"emit",value:function(t,a){var i=this;if(this._listeners){a=a||{};var r=this._listeners["before*"]||[],n=this._listeners[t]||[],s=this._listeners["after"+t]||[],o=function(l,d){l=l.slice(),l.forEach(function(u){u.call(i,{type:t},d)})};o(r,a),o(n,a),o(s,a)}}}]),e})(),BE=UE,xo=Xe(Tt()),HE=(function(){function e(t){var a=this;De(this,e),w(this,"_playbackHeartbeatInterval",void 0),w(this,"_playheadShouldBeProgressing",void 0),w(this,"pm",void 0),this.pm=t,this._playbackHeartbeatInterval=null,this._playheadShouldBeProgressing=!1,t.on("playing",function(){a._playheadShouldBeProgressing=!0}),t.on("play",this._startPlaybackHeartbeatInterval.bind(this)),t.on("playing",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adbreakstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplay",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplaying",this._startPlaybackHeartbeatInterval.bind(this)),t.on("devicewake",this._startPlaybackHeartbeatInterval.bind(this)),t.on("viewstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("rebufferstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("pause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("ended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("viewend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("error",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("aderror",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adpause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adbreakend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("seeked",function(){t.data.player_is_paused?a._stopPlaybackHeartbeatInterval():a._startPlaybackHeartbeatInterval()}),t.on("timeupdate",function(){a._playbackHeartbeatInterval!==null&&t.emit("playbackheartbeat")}),t.on("devicesleep",function(i,r){a._playbackHeartbeatInterval!==null&&(xo.default.clearInterval(a._playbackHeartbeatInterval),t.emit("playbackheartbeatend",{viewer_time:r.viewer_time}),a._playbackHeartbeatInterval=null)})}return Gt(e,[{key:"_startPlaybackHeartbeatInterval",value:function(){var t=this;this._playbackHeartbeatInterval===null&&(this.pm.emit("playbackheartbeat"),this._playbackHeartbeatInterval=xo.default.setInterval(function(){t.pm.emit("playbackheartbeat")},this.pm.playbackHeartbeatTime))}},{key:"_stopPlaybackHeartbeatInterval",value:function(){this._playheadShouldBeProgressing=!1,this._playbackHeartbeatInterval!==null&&(xo.default.clearInterval(this._playbackHeartbeatInterval),this.pm.emit("playbackheartbeatend"),this._playbackHeartbeatInterval=null)}}]),e})(),WE=HE,VE=function e(t){var a=this;De(this,e),w(this,"viewErrored",void 0),t.on("viewinit",function(){a.viewErrored=!1}),t.on("error",function(i,r){try{var n=t.errorTranslator({player_error_code:r.player_error_code,player_error_message:r.player_error_message,player_error_context:r.player_error_context,player_error_severity:r.player_error_severity,player_error_business_exception:r.player_error_business_exception});n&&(t.data.player_error_code=n.player_error_code||r.player_error_code,t.data.player_error_message=n.player_error_message||r.player_error_message,t.data.player_error_context=n.player_error_context||r.player_error_context,t.data.player_error_severity=n.player_error_severity||r.player_error_severity,t.data.player_error_business_exception=n.player_error_business_exception||r.player_error_business_exception,a.viewErrored=!0)}catch(s){t.mux.log.warn("Exception in error translator callback.",s),a.viewErrored=!0}}),t.on("aftererror",function(){var i,r,n,s,o;(i=t.data)===null||i===void 0||delete i.player_error_code,(r=t.data)===null||r===void 0||delete r.player_error_message,(n=t.data)===null||n===void 0||delete n.player_error_context,(s=t.data)===null||s===void 0||delete s.player_error_severity,(o=t.data)===null||o===void 0||delete o.player_error_business_exception})},FE=VE,$E=(function(){function e(t){De(this,e),w(this,"_watchTimeTrackerLastCheckedTime",void 0),w(this,"pm",void 0),this.pm=t,this._watchTimeTrackerLastCheckedTime=null,t.on("playbackheartbeat",this._updateWatchTime.bind(this)),t.on("playbackheartbeatend",this._clearWatchTimeState.bind(this))}return Gt(e,[{key:"_updateWatchTime",value:function(t,a){var i=a.viewer_time;this._watchTimeTrackerLastCheckedTime===null&&(this._watchTimeTrackerLastCheckedTime=i),ge(this.pm.data,"view_watch_time",i-this._watchTimeTrackerLastCheckedTime),this._watchTimeTrackerLastCheckedTime=i}},{key:"_clearWatchTimeState",value:function(t,a){this._updateWatchTime(t,a),this._watchTimeTrackerLastCheckedTime=null}}]),e})(),KE=$E,qE=(function(){function e(t){var a=this;De(this,e),w(this,"_playbackTimeTrackerLastPlayheadPosition",void 0),w(this,"_lastTime",void 0),w(this,"_isAdPlaying",void 0),w(this,"_callbackUpdatePlaybackTime",void 0),w(this,"pm",void 0),this.pm=t,this._playbackTimeTrackerLastPlayheadPosition=-1,this._lastTime=Te.now(),this._isAdPlaying=!1,this._callbackUpdatePlaybackTime=null;var i=this._startPlaybackTimeTracking.bind(this);t.on("playing",i),t.on("adplaying",i),t.on("seeked",i);var r=this._stopPlaybackTimeTracking.bind(this);t.on("playbackheartbeatend",r),t.on("seeking",r),t.on("adplaying",function(){a._isAdPlaying=!0}),t.on("adended",function(){a._isAdPlaying=!1}),t.on("adpause",function(){a._isAdPlaying=!1}),t.on("adbreakstart",function(){a._isAdPlaying=!1}),t.on("adbreakend",function(){a._isAdPlaying=!1}),t.on("adplay",function(){a._isAdPlaying=!1}),t.on("viewinit",function(){a._playbackTimeTrackerLastPlayheadPosition=-1,a._lastTime=Te.now(),a._isAdPlaying=!1,a._callbackUpdatePlaybackTime=null})}return Gt(e,[{key:"_startPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime===null&&(this._callbackUpdatePlaybackTime=this._updatePlaybackTime.bind(this),this._playbackTimeTrackerLastPlayheadPosition=this.pm.data.player_playhead_time,this.pm.on("playbackheartbeat",this._callbackUpdatePlaybackTime))}},{key:"_stopPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime&&(this._updatePlaybackTime(),this.pm.off("playbackheartbeat",this._callbackUpdatePlaybackTime),this._callbackUpdatePlaybackTime=null,this._playbackTimeTrackerLastPlayheadPosition=-1)}},{key:"_updatePlaybackTime",value:function(){var t=this.pm.data.player_playhead_time,a=Te.now(),i=-1;this._playbackTimeTrackerLastPlayheadPosition>=0&&t>this._playbackTimeTrackerLastPlayheadPosition?i=t-this._playbackTimeTrackerLastPlayheadPosition:this._isAdPlaying&&(i=a-this._lastTime),i>0&&i<=1e3&&ge(this.pm.data,"view_content_playback_time",i),this._playbackTimeTrackerLastPlayheadPosition=t,this._lastTime=a}}]),e})(),YE=qE,GE=(function(){function e(t){De(this,e),w(this,"pm",void 0),this.pm=t;var a=this._updatePlayheadTime.bind(this);t.on("playbackheartbeat",a),t.on("playbackheartbeatend",a),t.on("timeupdate",a),t.on("destroy",function(){t.off("timeupdate",a)})}return Gt(e,[{key:"_updateMaxPlayheadPosition",value:function(){this.pm.data.view_max_playhead_position=typeof this.pm.data.view_max_playhead_position>"u"?this.pm.data.player_playhead_time:Math.max(this.pm.data.view_max_playhead_position,this.pm.data.player_playhead_time)}},{key:"_updatePlayheadTime",value:function(t,a){var i=this,r=function(){i.pm.currentFragmentPDT&&i.pm.currentFragmentStart&&(i.pm.data.player_program_time=i.pm.currentFragmentPDT+i.pm.data.player_playhead_time-i.pm.currentFragmentStart)};if(a&&a.player_playhead_time)this.pm.data.player_playhead_time=a.player_playhead_time,r(),this._updateMaxPlayheadPosition();else if(this.pm.getPlayheadTime){var n=this.pm.getPlayheadTime();typeof n<"u"&&(this.pm.data.player_playhead_time=n,r(),this._updateMaxPlayheadPosition())}}}]),e})(),jE=GE,rc=300*1e3,QE=function e(t){if(De(this,e),!t.disableRebufferTracking){var a,i=function(n,s){r(s),a=void 0},r=function(n){if(a){var s=n.viewer_time-a;ge(t.data,"view_rebuffer_duration",s),a=n.viewer_time,t.data.view_rebuffer_duration>rc&&(t.emit("viewend"),t.send("viewend"),t.mux.log.warn("Ending view after rebuffering for longer than ".concat(rc,"ms, future events will be ignored unless a programchange or videochange occurs.")))}t.data.view_watch_time>=0&&t.data.view_rebuffer_count>0&&(t.data.view_rebuffer_frequency=t.data.view_rebuffer_count/t.data.view_watch_time,t.data.view_rebuffer_percentage=t.data.view_rebuffer_duration/t.data.view_watch_time)};t.on("playbackheartbeat",function(n,s){return r(s)}),t.on("rebufferstart",function(n,s){a||(ge(t.data,"view_rebuffer_count",1),a=s.viewer_time,t.one("rebufferend",i))}),t.on("viewinit",function(){a=void 0,t.off("rebufferend",i)})}},ZE=QE,zE=(function(){function e(t){var a=this;De(this,e),w(this,"_lastCheckedTime",void 0),w(this,"_lastPlayheadTime",void 0),w(this,"_lastPlayheadTimeUpdatedTime",void 0),w(this,"_rebuffering",void 0),w(this,"pm",void 0),this.pm=t,!(t.disableRebufferTracking||t.disablePlayheadRebufferTracking)&&(this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null,t.on("playbackheartbeat",this._checkIfRebuffering.bind(this)),t.on("playbackheartbeatend",this._cleanupRebufferTracker.bind(this)),t.on("seeking",function(){a._cleanupRebufferTracker(null,{viewer_time:Te.now()})}))}return Gt(e,[{key:"_checkIfRebuffering",value:function(t,a){if(this.pm.seekingTracker.isSeeking||this.pm.adTracker.isAdBreak||!this.pm.playbackHeartbeat._playheadShouldBeProgressing){this._cleanupRebufferTracker(t,a);return}if(this._lastCheckedTime===null){this._prepareRebufferTrackerState(a.viewer_time);return}if(this._lastPlayheadTime!==this.pm.data.player_playhead_time){this._cleanupRebufferTracker(t,a,!0);return}var i=a.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.sustainedRebufferThreshold=="number"&&i>=this.pm.sustainedRebufferThreshold&&(this._rebuffering||(this._rebuffering=!0,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}))),this._lastCheckedTime=a.viewer_time}},{key:"_clearRebufferTrackerState",value:function(){this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null}},{key:"_prepareRebufferTrackerState",value:function(t){this._lastCheckedTime=t,this._lastPlayheadTime=this.pm.data.player_playhead_time,this._lastPlayheadTimeUpdatedTime=t}},{key:"_cleanupRebufferTracker",value:function(t,a){var i=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1;if(this._rebuffering)this._rebuffering=!1,this.pm.emit("rebufferend",{viewer_time:a.viewer_time});else{if(this._lastCheckedTime===null)return;var r=this.pm.data.player_playhead_time-this._lastPlayheadTime,n=a.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.minimumRebufferDuration=="number"&&r>0&&n-r>this.pm.minimumRebufferDuration&&(this._lastCheckedTime=null,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}),this.pm.emit("rebufferend",{viewer_time:this._lastPlayheadTimeUpdatedTime+n-r}))}i?this._prepareRebufferTrackerState(a.viewer_time):this._clearRebufferTrackerState()}}]),e})(),XE=zE,JE=(function(){function e(t){var a=this;De(this,e),w(this,"NAVIGATION_START",void 0),w(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){var i=t.data,r=i.view_id;if(!i.view_program_changed){var n=function(s,o){var l=o.viewer_time;(s.type==="playing"&&typeof t.data.view_time_to_first_frame>"u"||s.type==="adplaying"&&(typeof t.data.view_time_to_first_frame>"u"||a._inPrerollPosition()))&&a.calculateTimeToFirstFrame(l||Te.now(),r)};t.one("playing",n),t.one("adplaying",n),t.one("viewend",function(){t.off("playing",n),t.off("adplaying",n)})}})}return Gt(e,[{key:"_inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time>"u"||this.pm.data.view_content_playback_time<=1e3}},{key:"calculateTimeToFirstFrame",value:function(t,a){a===this.pm.data.view_id&&(this.pm.watchTimeTracker._updateWatchTime(null,{viewer_time:t}),this.pm.data.view_time_to_first_frame=this.pm.data.view_watch_time,(this.pm.data.player_autoplay_on||this.pm.data.video_is_autoplay)&&this.NAVIGATION_START&&(this.pm.data.view_aggregate_startup_time=this.pm.data.view_start+this.pm.data.view_watch_time-this.NAVIGATION_START))}}]),e})(),ef=JE,tf=function e(t){var a=this;De(this,e),w(this,"_lastPlayerHeight",void 0),w(this,"_lastPlayerWidth",void 0),w(this,"_lastPlayheadPosition",void 0),w(this,"_lastSourceHeight",void 0),w(this,"_lastSourceWidth",void 0),t.on("viewinit",function(){a._lastPlayheadPosition=-1});var i=["pause","rebufferstart","seeking","error","adbreakstart","hb","renditionchange","orientationchange","viewend"],r=["playing","hb","renditionchange","orientationchange"];i.forEach(function(n){t.on(n,function(){if(a._lastPlayheadPosition>=0&&t.data.player_playhead_time>=0&&a._lastPlayerWidth>=0&&a._lastSourceWidth>0&&a._lastPlayerHeight>=0&&a._lastSourceHeight>0){var s=t.data.player_playhead_time-a._lastPlayheadPosition;if(s<0){a._lastPlayheadPosition=-1;return}var o=Math.min(a._lastPlayerWidth/a._lastSourceWidth,a._lastPlayerHeight/a._lastSourceHeight),l=Math.max(0,o-1),d=Math.max(0,1-o);t.data.view_max_upscale_percentage=Math.max(t.data.view_max_upscale_percentage||0,l),t.data.view_max_downscale_percentage=Math.max(t.data.view_max_downscale_percentage||0,d),ge(t.data,"view_total_content_playback_time",s),ge(t.data,"view_total_upscaling",l*s),ge(t.data,"view_total_downscaling",d*s)}a._lastPlayheadPosition=-1})}),r.forEach(function(n){t.on(n,function(){a._lastPlayheadPosition=t.data.player_playhead_time,a._lastPlayerWidth=t.data.player_width,a._lastPlayerHeight=t.data.player_height,a._lastSourceWidth=t.data.video_source_width,a._lastSourceHeight=t.data.video_source_height})})},af=tf,rf=2e3,nf=function e(t){var a=this;De(this,e),w(this,"isSeeking",void 0),this.isSeeking=!1;var i=-1,r=function(){var n=Te.now(),s=(t.data.viewer_time||n)-(i||n);ge(t.data,"view_seek_duration",s),t.data.view_max_seek_time=Math.max(t.data.view_max_seek_time||0,s),a.isSeeking=!1,i=-1};t.on("seeking",function(n,s){if(Object.assign(t.data,s),a.isSeeking&&s.viewer_time-i<=rf){i=s.viewer_time;return}a.isSeeking&&r(),a.isSeeking=!0,i=s.viewer_time,ge(t.data,"view_seek_count",1),t.send("seeking")}),t.on("seeked",function(){r()}),t.on("viewend",function(){a.isSeeking&&(r(),t.send("seeked")),a.isSeeking=!1,i=-1})},sf=nf,nc=function(e,t){e.push(t),e.sort(function(a,i){return a.viewer_time-i.viewer_time})},of=["adbreakstart","adrequest","adresponse","adplay","adplaying","adpause","adended","adbreakend","aderror","adclicked","adskipped"],lf=(function(){function e(t){var a=this;De(this,e),w(this,"_adHasPlayed",void 0),w(this,"_adRequests",void 0),w(this,"_adResponses",void 0),w(this,"_currentAdRequestNumber",void 0),w(this,"_currentAdResponseNumber",void 0),w(this,"_prerollPlayTime",void 0),w(this,"_wouldBeNewAdPlay",void 0),w(this,"isAdBreak",void 0),w(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){a.isAdBreak=!1,a._currentAdRequestNumber=0,a._currentAdResponseNumber=0,a._adRequests=[],a._adResponses=[],a._adHasPlayed=!1,a._wouldBeNewAdPlay=!0,a._prerollPlayTime=void 0}),of.forEach(function(r){return t.on(r,a._updateAdData.bind(a))});var i=function(){a.isAdBreak=!1};t.on("adbreakstart",function(){a.isAdBreak=!0}),t.on("play",i),t.on("playing",i),t.on("viewend",i),t.on("adrequest",function(r,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+a._currentAdRequestNumber++},n),nc(a._adRequests,n),ge(t.data,"view_ad_request_count"),a.inPrerollPosition()&&(t.data.view_preroll_requested=!0,a._adHasPlayed||ge(t.data,"view_preroll_request_count"))}),t.on("adresponse",function(r,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+a._currentAdResponseNumber++},n),nc(a._adResponses,n);var s=a.findAdRequest(n.ad_request_id);s&&ge(t.data,"view_ad_request_time",Math.max(0,n.viewer_time-s.viewer_time))}),t.on("adplay",function(r,n){a._adHasPlayed=!0,a._wouldBeNewAdPlay&&(a._wouldBeNewAdPlay=!1,ge(t.data,"view_ad_played_count")),a.inPrerollPosition()&&!t.data.view_preroll_played&&(t.data.view_preroll_played=!0,a._adRequests.length>0&&(t.data.view_preroll_request_time=Math.max(0,n.viewer_time-a._adRequests[0].viewer_time)),t.data.view_start&&(t.data.view_startup_preroll_request_time=Math.max(0,n.viewer_time-t.data.view_start)),a._prerollPlayTime=n.viewer_time)}),t.on("adplaying",function(r,n){a.inPrerollPosition()&&typeof t.data.view_preroll_load_time>"u"&&typeof a._prerollPlayTime<"u"&&(t.data.view_preroll_load_time=n.viewer_time-a._prerollPlayTime,t.data.view_startup_preroll_load_time=n.viewer_time-a._prerollPlayTime)}),t.on("adclicked",function(r,n){a._wouldBeNewAdPlay||ge(t.data,"view_ad_clicked_count")}),t.on("adskipped",function(r,n){a._wouldBeNewAdPlay||ge(t.data,"view_ad_skipped_count")}),t.on("adended",function(){a._wouldBeNewAdPlay=!0}),t.on("aderror",function(){a._wouldBeNewAdPlay=!0})}return Gt(e,[{key:"inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time>"u"||this.pm.data.view_content_playback_time<=1e3}},{key:"findAdRequest",value:function(t){for(var a=0;a<this._adRequests.length;a++)if(this._adRequests[a].ad_request_id===t)return this._adRequests[a]}},{key:"_updateAdData",value:function(t,a){if(this.inPrerollPosition()){if(!this.pm.data.view_preroll_ad_tag_hostname&&a.ad_tag_url){var i=na(Jr(a.ad_tag_url),2),r=i[0],n=i[1];this.pm.data.view_preroll_ad_tag_domain=n,this.pm.data.view_preroll_ad_tag_hostname=r}if(!this.pm.data.view_preroll_ad_asset_hostname&&a.ad_asset_url){var s=na(Jr(a.ad_asset_url),2),o=s[0],l=s[1];this.pm.data.view_preroll_ad_asset_domain=l,this.pm.data.view_preroll_ad_asset_hostname=o}}this.pm.data.ad_asset_url=a==null?void 0:a.ad_asset_url,this.pm.data.ad_tag_url=a==null?void 0:a.ad_tag_url,this.pm.data.ad_creative_id=a==null?void 0:a.ad_creative_id,this.pm.data.ad_id=a==null?void 0:a.ad_id,this.pm.data.ad_universal_id=a==null?void 0:a.ad_universal_id}}]),e})(),df=lf,sc=Xe(Tt()),uf=function e(t){De(this,e);var a,i,r=function(){t.disableRebufferTracking||(ge(t.data,"view_waiting_rebuffer_count",1),a=Te.now(),i=sc.default.setInterval(function(){if(a){var d=Te.now();ge(t.data,"view_waiting_rebuffer_duration",d-a),a=d}},250))},n=function(){t.disableRebufferTracking||a&&(ge(t.data,"view_waiting_rebuffer_duration",Te.now()-a),a=!1,sc.default.clearInterval(i))},s=!1,o=function(){s=!0},l=function(){s=!1,n()};t.on("waiting",function(){s&&r()}),t.on("playing",function(){n(),o()}),t.on("pause",l),t.on("seeking",l)},cf=uf,hf=function e(t){var a=this;De(this,e),w(this,"lastWallClockTime",void 0);var i=function(){a.lastWallClockTime=Te.now(),t.on("before*",r)},r=function(n){var s=Te.now(),o=a.lastWallClockTime;a.lastWallClockTime=s,s-o>3e4&&(t.emit("devicesleep",{viewer_time:o}),Object.assign(t.data,{viewer_time:o}),t.send("devicesleep"),t.emit("devicewake",{viewer_time:s}),Object.assign(t.data,{viewer_time:s}),t.send("devicewake"))};t.one("playbackheartbeat",i),t.on("playbackheartbeatend",function(){t.off("before*",r),t.one("playbackheartbeat",i)})},mf=hf,Po=Xe(Tt()),Gh=(function(e){return e()})(function(){var e=function(){for(var a=0,i={};a<arguments.length;a++){var r=arguments[a];for(var n in r)i[n]=r[n]}return i};function t(a){function i(r,n,s){var o;if(typeof document<"u"){if(arguments.length>1){if(s=e({path:"/"},i.defaults,s),typeof s.expires=="number"){var l=new Date;l.setMilliseconds(l.getMilliseconds()+s.expires*864e5),s.expires=l}try{o=JSON.stringify(n),/^[\{\[]/.test(o)&&(n=o)}catch{}return a.write?n=a.write(n,r):n=encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),r=r.replace(/[\(\)]/g,escape),document.cookie=[r,"=",n,s.expires?"; expires="+s.expires.toUTCString():"",s.path?"; path="+s.path:"",s.domain?"; domain="+s.domain:"",s.secure?"; secure":""].join("")}r||(o={});for(var d=document.cookie?document.cookie.split("; "):[],u=/(%[0-9A-Z]{2})+/g,p=0;p<d.length;p++){var m=d[p].split("="),h=m.slice(1).join("=");h.charAt(0)==='"'&&(h=h.slice(1,-1));try{var v=m[0].replace(u,decodeURIComponent);if(h=a.read?a.read(h,v):a(h,v)||h.replace(u,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch{}if(r===v){o=h;break}r||(o[v]=h)}catch{}}return o}}return i.set=i,i.get=function(r){return i.call(i,r)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(r,n){i(r,"",e(n,{expires:-1}))},i.withConverter=t,i}return t(function(){})}),jh="muxData",pf=function(e){return Object.entries(e).map(function(t){var a=na(t,2),i=a[0],r=a[1];return"".concat(i,"=").concat(r)}).join("&")},vf=function(e){return e.split("&").reduce(function(t,a){var i=na(a.split("="),2),r=i[0],n=i[1],s=+n,o=n&&s==n?s:n;return t[r]=o,t},{})},Qh=function(){var e;try{e=vf(Gh.get(jh)||"")}catch{e={}}return e},Zh=function(e){try{Gh.set(jh,pf(e),{expires:365})}catch{}},Ef=function(){var e=Qh();return e.mux_viewer_id=e.mux_viewer_id||Xr(),e.msn=e.msn||Math.random(),Zh(e),{mux_viewer_id:e.mux_viewer_id,mux_sample_number:e.msn}},ff=function(){var e=Qh(),t=Te.now();return e.session_start&&(e.sst=e.session_start,delete e.session_start),e.session_id&&(e.sid=e.session_id,delete e.session_id),e.session_expires&&(e.sex=e.session_expires,delete e.session_expires),(!e.sex||e.sex<t)&&(e.sid=Xr(),e.sst=t),e.sex=t+1500*1e3,Zh(e),{session_id:e.sid,session_start:e.sst,session_expires:e.sex}};function bf(e,t){var a=t.beaconCollectionDomain,i=t.beaconDomain;if(a)return"https://"+a;e=e||"inferred";var r=i||"litix.io";return e.match(/^[a-z0-9]+$/)?"https://"+e+"."+r:"https://img.litix.io/a.gif"}var gf=Xe(Tt()),zh=function(){var e;switch(Xh()){case"cellular":e="cellular";break;case"ethernet":e="wired";break;case"wifi":e="wifi";break;case void 0:break;default:e="other"}return e},Xh=function(){var e=gf.default.navigator,t=e&&(e.connection||e.mozConnection||e.webkitConnection);return t&&t.type};zh.getConnectionFromAPI=Xh;var _f=zh,yf={a:"env",b:"beacon",c:"custom",d:"ad",e:"event",f:"experiment",i:"internal",m:"mux",n:"response",p:"player",q:"request",r:"retry",s:"session",t:"timestamp",u:"viewer",v:"video",w:"page",x:"view",y:"sub"},Tf=Jh(yf),Af={ad:"ad",af:"affiliate",ag:"aggregate",ap:"api",al:"application",ao:"audio",ar:"architecture",as:"asset",au:"autoplay",av:"average",bi:"bitrate",bn:"brand",br:"break",bw:"browser",by:"bytes",bz:"business",ca:"cached",cb:"cancel",cc:"codec",cd:"code",cg:"category",ch:"changed",ci:"client",ck:"clicked",cl:"canceled",cn:"config",co:"count",ce:"counter",cp:"complete",cq:"creator",cr:"creative",cs:"captions",ct:"content",cu:"current",cx:"connection",cz:"context",dg:"downscaling",dm:"domain",dn:"cdn",do:"downscale",dr:"drm",dp:"dropped",du:"duration",dv:"device",dy:"dynamic",eb:"enabled",ec:"encoding",ed:"edge",en:"end",eg:"engine",em:"embed",er:"error",ep:"experiments",es:"errorcode",et:"errortext",ee:"event",ev:"events",ex:"expires",ez:"exception",fa:"failed",fi:"first",fm:"family",ft:"format",fp:"fps",fq:"frequency",fr:"frame",fs:"fullscreen",ha:"has",hb:"holdback",he:"headers",ho:"host",hn:"hostname",ht:"height",id:"id",ii:"init",in:"instance",ip:"ip",is:"is",ke:"key",la:"language",lb:"labeled",le:"level",li:"live",ld:"loaded",lo:"load",ls:"lists",lt:"latency",ma:"max",md:"media",me:"message",mf:"manifest",mi:"mime",ml:"midroll",mm:"min",mn:"manufacturer",mo:"model",mx:"mux",ne:"newest",nm:"name",no:"number",on:"on",or:"origin",os:"os",pa:"paused",pb:"playback",pd:"producer",pe:"percentage",pf:"played",pg:"program",ph:"playhead",pi:"plugin",pl:"preroll",pn:"playing",po:"poster",pp:"pip",pr:"preload",ps:"position",pt:"part",py:"property",px:"pop",pz:"plan",ra:"rate",rd:"requested",re:"rebuffer",rf:"rendition",rg:"range",rm:"remote",ro:"ratio",rp:"response",rq:"request",rs:"requests",sa:"sample",sd:"skipped",se:"session",sh:"shift",sk:"seek",sm:"stream",so:"source",sq:"sequence",sr:"series",ss:"status",st:"start",su:"startup",sv:"server",sw:"software",sy:"severity",ta:"tag",tc:"tech",te:"text",tg:"target",th:"throughput",ti:"time",tl:"total",to:"to",tt:"title",ty:"type",ug:"upscaling",un:"universal",up:"upscale",ur:"url",us:"user",va:"variant",vd:"viewed",vi:"video",ve:"version",vw:"view",vr:"viewer",wd:"width",wa:"watch",wt:"waiting"},oc=Jh(Af);function Jh(e){var t={};for(var a in e)e.hasOwnProperty(a)&&(t[e[a]]=a);return t}function ll(e){var t={},a={};return Object.keys(e).forEach(function(i){var r=!1;if(e.hasOwnProperty(i)&&e[i]!==void 0){var n=i.split("_"),s=n[0],o=Tf[s];o||(te.info("Data key word `"+n[0]+"` not expected in "+i),o=s+"_"),n.splice(1).forEach(function(l){l==="url"&&(r=!0),oc[l]?o+=oc[l]:Number.isInteger(Number(l))?o+=l:(te.info("Data key word `"+l+"` not expected in "+i),o+="_"+l+"_")}),r?a[o]=e[i]:t[o]=e[i]}}),Object.assign(t,a)}var qa=Xe(Tt()),kf=Xe(Fh()),wf={maxBeaconSize:300,maxQueueLength:3600,baseTimeBetweenBeacons:1e4,maxPayloadKBSize:500},Sf=56*1024,If=["hb","requestcompleted","requestfailed","requestcanceled"],Rf="https://img.litix.io",oa=function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this._beaconUrl=e||Rf,this._eventQueue=[],this._postInFlight=!1,this._resendAfterPost=!1,this._failureCount=0,this._sendTimeout=!1,this._options=Object.assign({},wf,t)};oa.prototype.queueEvent=function(e,t){var a=Object.assign({},t);return this._eventQueue.length<=this._options.maxQueueLength||e==="eventrateexceeded"?(this._eventQueue.push(a),this._sendTimeout||this._startBeaconSending(),this._eventQueue.length<=this._options.maxQueueLength):!1};oa.prototype.flushEvents=function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;if(e&&this._eventQueue.length===1){this._eventQueue.pop();return}this._eventQueue.length&&this._sendBeaconQueue(),this._startBeaconSending()};oa.prototype.destroy=function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;this.destroyed=!0,e?this._clearBeaconQueue():this.flushEvents(),qa.default.clearTimeout(this._sendTimeout)};oa.prototype._clearBeaconQueue=function(){var e=this._eventQueue.length>this._options.maxBeaconSize?this._eventQueue.length-this._options.maxBeaconSize:0,t=this._eventQueue.slice(e);e>0&&Object.assign(t[t.length-1],ll({mux_view_message:"event queue truncated"}));var a=this._createPayload(t);em(this._beaconUrl,a,!0,function(){})};oa.prototype._sendBeaconQueue=function(){var e=this;if(this._postInFlight){this._resendAfterPost=!0;return}var t=this._eventQueue.slice(0,this._options.maxBeaconSize);this._eventQueue=this._eventQueue.slice(this._options.maxBeaconSize),this._postInFlight=!0;var a=this._createPayload(t),i=Te.now();em(this._beaconUrl,a,!1,function(r,n){n?(e._eventQueue=t.concat(e._eventQueue),e._failureCount+=1,te.info("Error sending beacon: "+n)):e._failureCount=0,e._roundTripTime=Te.now()-i,e._postInFlight=!1,e._resendAfterPost&&(e._resendAfterPost=!1,e._eventQueue.length>0&&e._sendBeaconQueue())})};oa.prototype._getNextBeaconTime=function(){if(!this._failureCount)return this._options.baseTimeBetweenBeacons;var e=Math.pow(2,this._failureCount-1);return e=e*Math.random(),(1+e)*this._options.baseTimeBetweenBeacons};oa.prototype._startBeaconSending=function(){var e=this;qa.default.clearTimeout(this._sendTimeout),!this.destroyed&&(this._sendTimeout=qa.default.setTimeout(function(){e._eventQueue.length&&e._sendBeaconQueue(),e._startBeaconSending()},this._getNextBeaconTime()))};oa.prototype._createPayload=function(e){var t=this,a={transmission_timestamp:Math.round(Te.now())};this._roundTripTime&&(a.rtt_ms=Math.round(this._roundTripTime));var i,r,n,s=function(){i=JSON.stringify({metadata:a,events:r||e}),n=i.length/1024},o=function(){return n<=t._options.maxPayloadKBSize};return s(),o()||(te.info("Payload size is too big ("+n+" kb). Removing unnecessary events."),r=e.filter(function(l){return If.indexOf(l.e)===-1}),s()),o()||(te.info("Payload size still too big ("+n+" kb). Cropping fields.."),r.forEach(function(l){for(var d in l){var u=l[d],p=50*1024;typeof u=="string"&&u.length>p&&(l[d]=u.substring(0,p))}}),s()),i};var Df=typeof kf.default.exitPictureInPicture=="function"?function(e){return e.length<=Sf}:function(e){return!1},em=function(e,t,a,i){if(a&&navigator&&navigator.sendBeacon&&navigator.sendBeacon(e,t)){i();return}if(qa.default.fetch){qa.default.fetch(e,{method:"POST",body:t,headers:{"Content-Type":"text/plain"},keepalive:Df(t)}).then(function(n){return i(null,n.ok?null:"Error")}).catch(function(n){return i(null,n)});return}if(qa.default.XMLHttpRequest){var r=new qa.default.XMLHttpRequest;r.onreadystatechange=function(){if(r.readyState===4)return i(null,r.status!==200?"error":void 0)},r.open("POST",e),r.setRequestHeader("Content-Type","text/plain"),r.send(t);return}i()},Cf=oa,Lf=["env_key","view_id","view_sequence_number","player_sequence_number","beacon_domain","player_playhead_time","viewer_time","mux_api_version","event","video_id","player_instance_id","player_error_code","player_error_message","player_error_context","player_error_severity","player_error_business_exception"],Mf=["adplay","adplaying","adpause","adfirstquartile","admidpoint","adthirdquartile","adended","adresponse","adrequest"],Of=["ad_id","ad_creative_id","ad_universal_id"],Nf=["viewstart","error","ended","viewend"],xf=600*1e3,Pf=(function(){function e(t,a){var i=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};De(this,e);var r,n,s,o,l,d,u,p,m,h,v,_;w(this,"mux",void 0),w(this,"envKey",void 0),w(this,"options",void 0),w(this,"eventQueue",void 0),w(this,"sampleRate",void 0),w(this,"disableCookies",void 0),w(this,"respectDoNotTrack",void 0),w(this,"previousBeaconData",void 0),w(this,"lastEventTime",void 0),w(this,"rateLimited",void 0),w(this,"pageLevelData",void 0),w(this,"viewerData",void 0),this.mux=t,this.envKey=a,this.options=i,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.eventQueue=new Cf(bf(this.envKey,this.options));var b;this.sampleRate=(b=this.options.sampleRate)!==null&&b!==void 0?b:1;var y;this.disableCookies=(y=this.options.disableCookies)!==null&&y!==void 0?y:!1;var T;this.respectDoNotTrack=(T=this.options.respectDoNotTrack)!==null&&T!==void 0?T:!1,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.pageLevelData={mux_api_version:this.mux.API_VERSION,mux_embed:this.mux.NAME,mux_embed_version:this.mux.VERSION,viewer_application_name:(r=this.options.platform)===null||r===void 0?void 0:r.name,viewer_application_version:(n=this.options.platform)===null||n===void 0?void 0:n.version,viewer_application_engine:(s=this.options.platform)===null||s===void 0?void 0:s.layout,viewer_device_name:(o=this.options.platform)===null||o===void 0?void 0:o.product,viewer_device_category:"",viewer_device_manufacturer:(l=this.options.platform)===null||l===void 0?void 0:l.manufacturer,viewer_os_family:(u=this.options.platform)===null||u===void 0||(d=u.os)===null||d===void 0?void 0:d.family,viewer_os_architecture:(m=this.options.platform)===null||m===void 0||(p=m.os)===null||p===void 0?void 0:p.architecture,viewer_os_version:(v=this.options.platform)===null||v===void 0||(h=v.os)===null||h===void 0?void 0:h.version,viewer_connection_type:_f(),page_url:Po.default===null||Po.default===void 0||(_=Po.default.location)===null||_===void 0?void 0:_.href},this.viewerData=this.disableCookies?{}:Ef()}return Gt(e,[{key:"send",value:function(t,a){if(!(!t||!(a!=null&&a.view_id))){if(this.respectDoNotTrack&&sl())return te.info("Not sending `"+t+"` because Do Not Track is enabled");if(!a||typeof a!="object")return te.error("A data object was expected in send() but was not provided");var i=this.disableCookies?{}:ff(),r=Td($s({},this.pageLevelData,a,i,this.viewerData),{event:t,env_key:this.envKey});r.user_id&&(r.viewer_user_id=r.user_id,delete r.user_id);var n,s=((n=r.mux_sample_number)!==null&&n!==void 0?n:0)>=this.sampleRate,o=this._deduplicateBeaconData(t,r),l=ll(o);if(this.lastEventTime=this.mux.utils.now(),s)return te.info("Not sending event due to sample rate restriction",t,r,l);if(this.envKey||te.info("Missing environment key (envKey) - beacons will be dropped if the video source is not a valid mux video URL",t,r,l),!this.rateLimited){if(te.info("Sending event",t,r,l),this.rateLimited=!this.eventQueue.queueEvent(t,l),this.mux.WINDOW_UNLOADING&&t==="viewend")this.eventQueue.destroy(!0);else if(this.mux.WINDOW_HIDDEN&&t==="hb"?this.eventQueue.flushEvents(!0):Nf.indexOf(t)>=0&&this.eventQueue.flushEvents(),this.rateLimited)return r.event="eventrateexceeded",l=ll(r),this.eventQueue.queueEvent(r.event,l),te.error("Beaconing disabled due to rate limit.")}}}},{key:"destroy",value:function(){this.eventQueue.destroy(!1)}},{key:"_deduplicateBeaconData",value:function(t,a){var i=this,r={},n=a.view_id;if(n==="-1"||t==="viewstart"||t==="viewend"||!this.previousBeaconData||this.mux.utils.now()-this.lastEventTime>=xf)r=$s({},a),n&&(this.previousBeaconData=r),n&&t==="viewend"&&(this.previousBeaconData=null);else{var s=t.indexOf("request")===0;Object.entries(a).forEach(function(o){var l=na(o,2),d=l[0],u=l[1];i.previousBeaconData&&(u!==i.previousBeaconData[d]||Lf.indexOf(d)>-1||i.objectHasChanged(s,d,u,i.previousBeaconData[d])||i.eventRequiresKey(t,d))&&(r[d]=u,i.previousBeaconData[d]=u)})}return r}},{key:"objectHasChanged",value:function(t,a,i,r){return!t||a.indexOf("request_")!==0?!1:a==="request_response_headers"||typeof i!="object"||typeof r!="object"?!0:Object.keys(i||{}).length!==Object.keys(r||{}).length}},{key:"eventRequiresKey",value:function(t,a){return!!(t==="renditionchange"&&a.indexOf("video_source_")===0||Of.includes(a)&&Mf.includes(t))}}]),e})(),Uf=function e(t){De(this,e);var a=0,i=0,r=0,n=0,s=0,o=0,l=0,d=function(m,h){var v=h.request_start,_=h.request_response_start,b=h.request_response_end,y=h.request_bytes_loaded;n++;var T,E;if(_?(T=_-(v??0),E=(b??0)-_):E=(b??0)-(v??0),E>0&&y&&y>0){var S=y/E*8e3;s++,i+=y,r+=E,t.data.view_min_request_throughput=Math.min(t.data.view_min_request_throughput||1/0,S),t.data.view_average_request_throughput=i/r*8e3,t.data.view_request_count=n,T>0&&(a+=T,t.data.view_max_request_latency=Math.max(t.data.view_max_request_latency||0,T),t.data.view_average_request_latency=a/s)}},u=function(m,h){n++,o++,t.data.view_request_count=n,t.data.view_request_failed_count=o},p=function(m,h){n++,l++,t.data.view_request_count=n,t.data.view_request_canceled_count=l};t.on("requestcompleted",d),t.on("requestfailed",u),t.on("requestcanceled",p)},Bf=Uf,Hf=3600*1e3,Wf=function e(t){var a=this;De(this,e),w(this,"_lastEventTime",void 0),t.on("before*",function(i,r){var n=r.viewer_time,s=Te.now(),o=a._lastEventTime;if(a._lastEventTime=s,o&&s-o>Hf){var l=Object.keys(t.data).reduce(function(u,p){return p.indexOf("video_")===0?Object.assign(u,w({},p,t.data[p])):u},{});t.mux.log.info("Received event after at least an hour inactivity, creating a new view");var d=t.playbackHeartbeat._playheadShouldBeProgressing;t._resetView(Object.assign({viewer_time:n},l)),t.playbackHeartbeat._playheadShouldBeProgressing=d,t.playbackHeartbeat._playheadShouldBeProgressing&&i.type!=="play"&&i.type!=="adbreakstart"&&(t.emit("play",{viewer_time:n}),i.type!=="playing"&&t.emit("playing",{viewer_time:n}))}})},Vf=Wf,Ff=["viewstart","ended","loadstart","pause","play","playing","ratechange","waiting","adplay","adpause","adended","aderror","adplaying","adrequest","adresponse","adbreakstart","adbreakend","adfirstquartile","admidpoint","adthirdquartile","rebufferstart","rebufferend","seeked","error","hb","requestcompleted","requestfailed","requestcanceled","renditionchange"],$f=new Set(["requestcompleted","requestfailed","requestcanceled"]),Kf=(function(e){yE(a,e);var t=kE(a);function a(i,r,n){De(this,a);var s;s=t.call(this),w(P(s),"DOM_CONTENT_LOADED_EVENT_END",void 0),w(P(s),"NAVIGATION_START",void 0),w(P(s),"_destroyed",void 0),w(P(s),"_heartBeatTimeout",void 0),w(P(s),"adTracker",void 0),w(P(s),"dashjs",void 0),w(P(s),"data",void 0),w(P(s),"disablePlayheadRebufferTracking",void 0),w(P(s),"disableRebufferTracking",void 0),w(P(s),"errorTracker",void 0),w(P(s),"errorTranslator",void 0),w(P(s),"emitTranslator",void 0),w(P(s),"getAdData",void 0),w(P(s),"getPlayheadTime",void 0),w(P(s),"getStateData",void 0),w(P(s),"stateDataTranslator",void 0),w(P(s),"hlsjs",void 0),w(P(s),"id",void 0),w(P(s),"longResumeTracker",void 0),w(P(s),"minimumRebufferDuration",void 0),w(P(s),"mux",void 0),w(P(s),"playbackEventDispatcher",void 0),w(P(s),"playbackHeartbeat",void 0),w(P(s),"playbackHeartbeatTime",void 0),w(P(s),"playheadTime",void 0),w(P(s),"seekingTracker",void 0),w(P(s),"sustainedRebufferThreshold",void 0),w(P(s),"watchTimeTracker",void 0),w(P(s),"currentFragmentPDT",void 0),w(P(s),"currentFragmentStart",void 0),s.DOM_CONTENT_LOADED_EVENT_END=Fs.domContentLoadedEventEnd(),s.NAVIGATION_START=Fs.navigationStart();var o={debug:!1,minimumRebufferDuration:250,sustainedRebufferThreshold:1e3,playbackHeartbeatTime:25,beaconDomain:"litix.io",sampleRate:1,disableCookies:!1,respectDoNotTrack:!1,disableRebufferTracking:!1,disablePlayheadRebufferTracking:!1,errorTranslator:function(m){return m},emitTranslator:function(){for(var m=arguments.length,h=new Array(m),v=0;v<m;v++)h[v]=arguments[v];return h},stateDataTranslator:function(m){return m}};s.mux=i,s.id=r,n!=null&&n.beaconDomain&&s.mux.log.warn("The `beaconDomain` setting has been deprecated in favor of `beaconCollectionDomain`. Please change your integration to use `beaconCollectionDomain` instead of `beaconDomain`."),n=Object.assign(o,n),n.data=n.data||{},n.data.property_key&&(n.data.env_key=n.data.property_key,delete n.data.property_key),te.level=n.debug?Ka.DEBUG:Ka.WARN,s.getPlayheadTime=n.getPlayheadTime,s.getStateData=n.getStateData||function(){return{}},s.getAdData=n.getAdData||function(){},s.minimumRebufferDuration=n.minimumRebufferDuration,s.sustainedRebufferThreshold=n.sustainedRebufferThreshold,s.playbackHeartbeatTime=n.playbackHeartbeatTime,s.disableRebufferTracking=n.disableRebufferTracking,s.disableRebufferTracking&&s.mux.log.warn("Disabling rebuffer tracking. This should only be used in specific circumstances as a last resort when your player is known to unreliably track rebuffering."),s.disablePlayheadRebufferTracking=n.disablePlayheadRebufferTracking,s.errorTranslator=n.errorTranslator,s.emitTranslator=n.emitTranslator,s.stateDataTranslator=n.stateDataTranslator,s.playbackEventDispatcher=new Pf(i,n.data.env_key,n),s.data={player_instance_id:Xr(),mux_sample_rate:n.sampleRate,beacon_domain:n.beaconCollectionDomain||n.beaconDomain},s.data.view_sequence_number=1,s.data.player_sequence_number=1;var l=(function(){typeof this.data.view_start>"u"&&(this.data.view_start=this.mux.utils.now(),this.emit("viewstart"))}).bind(P(s));if(s.on("viewinit",function(m,h){this._resetVideoData(),this._resetViewData(),this._resetErrorData(),this._updateStateData(),Object.assign(this.data,h),this._initializeViewData(),this.one("play",l),this.one("adbreakstart",l)}),s.on("videochange",function(m,h){this._resetView(h)}),s.on("programchange",function(m,h){this.data.player_is_paused&&this.mux.log.warn("The `programchange` event is intended to be used when the content changes mid playback without the video source changing, however the video is not currently playing. If the video source is changing please use the videochange event otherwise you will lose startup time information."),this._resetView(Object.assign(h,{view_program_changed:!0})),l(),this.emit("play"),this.emit("playing")}),s.on("fragmentchange",function(m,h){this.currentFragmentPDT=h.currentFragmentPDT,this.currentFragmentStart=h.currentFragmentStart}),s.on("destroy",s.destroy),typeof window<"u"&&typeof window.addEventListener=="function"&&typeof window.removeEventListener=="function"){var d=function(){var m=typeof s.data.view_start<"u";s.mux.WINDOW_HIDDEN=document.visibilityState==="hidden",m&&s.mux.WINDOW_HIDDEN&&(s.data.player_is_paused||s.emit("hb"))};window.addEventListener("visibilitychange",d,!1);var u=function(m){m.persisted||s.destroy()};window.addEventListener("pagehide",u,!1),s.on("destroy",function(){window.removeEventListener("visibilitychange",d),window.removeEventListener("pagehide",u)})}s.on("playerready",function(m,h){Object.assign(this.data,h)}),Ff.forEach(function(m){s.on(m,function(h,v){m.indexOf("ad")!==0&&this._updateStateData(),Object.assign(this.data,v),this._sanitizeData()}),s.on("after"+m,function(){(m!=="error"||this.errorTracker.viewErrored)&&this.send(m)})}),s.on("viewend",function(m,h){Object.assign(s.data,h)});var p=function(m){var h=this.mux.utils.now();this.data.player_init_time&&(this.data.player_startup_time=h-this.data.player_init_time),!this.mux.PLAYER_TRACKED&&this.NAVIGATION_START&&(this.mux.PLAYER_TRACKED=!0,(this.data.player_init_time||this.DOM_CONTENT_LOADED_EVENT_END)&&(this.data.page_load_time=Math.min(this.data.player_init_time||1/0,this.DOM_CONTENT_LOADED_EVENT_END||1/0)-this.NAVIGATION_START)),this.send("playerready"),delete this.data.player_startup_time,delete this.data.page_load_time};return s.one("playerready",p),s.longResumeTracker=new Vf(P(s)),s.errorTracker=new FE(P(s)),new mf(P(s)),s.seekingTracker=new sf(P(s)),s.playheadTime=new jE(P(s)),s.playbackHeartbeat=new WE(P(s)),new af(P(s)),s.watchTimeTracker=new KE(P(s)),new YE(P(s)),s.adTracker=new df(P(s)),new XE(P(s)),new ZE(P(s)),new ef(P(s)),new cf(P(s)),new Bf(P(s)),n.hlsjs&&s.addHLSJS(n),n.dashjs&&s.addDashJS(n),s.emit("viewinit",n.data),s}return Gt(a,[{key:"emit",value:function(i,r){var n,s=Object.assign({viewer_time:this.mux.utils.now()},r),o=[i,s];if(this.emitTranslator)try{o=this.emitTranslator(i,s)}catch(l){this.mux.log.warn("Exception in emit translator callback.",l)}o!=null&&o.length&&(n=xn(Gi(a.prototype),"emit",this)).call.apply(n,[this].concat(mt(o)))}},{key:"destroy",value:function(){this._destroyed||(this._destroyed=!0,typeof this.data.view_start<"u"&&(this.emit("viewend"),this.send("viewend")),this.playbackEventDispatcher.destroy(),this.removeHLSJS(),this.removeDashJS(),window.clearTimeout(this._heartBeatTimeout))}},{key:"send",value:function(i){if(this.data.view_id){var r=Object.assign({},this.data),n=["player_program_time","player_manifest_newest_program_time","player_live_edge_program_time","player_program_time","video_holdback","video_part_holdback","video_target_duration","video_part_target_duration"];if(r.video_source_is_live===void 0&&(r.player_source_duration===1/0||r.video_source_duration===1/0?r.video_source_is_live=!0:(r.player_source_duration>0||r.video_source_duration>0)&&(r.video_source_is_live=!1)),r.video_source_is_live||n.forEach(function(d){r[d]=void 0}),r.video_source_url=r.video_source_url||r.player_source_url,r.video_source_url){var s=na(Jr(r.video_source_url),2),o=s[0],l=s[1];r.video_source_domain=l,r.video_source_hostname=o}delete r.ad_request_id,this.playbackEventDispatcher.send(i,r),this.data.view_sequence_number++,this.data.player_sequence_number++,$f.has(i)||this._restartHeartBeat(),i==="viewend"&&delete this.data.view_id}}},{key:"_resetView",value:function(i){this.emit("viewend"),this.send("viewend"),this.emit("viewinit",i)}},{key:"_updateStateData",value:function(){var i=this.getStateData();if(typeof this.stateDataTranslator=="function")try{i=this.stateDataTranslator(i)}catch(r){this.mux.log.warn("Exception in stateDataTranslator translator callback.",r)}Object.assign(this.data,i),this.playheadTime._updatePlayheadTime(),this._sanitizeData()}},{key:"_sanitizeData",value:function(){var i=this,r=["player_width","player_height","video_source_width","video_source_height","player_playhead_time","video_source_bitrate"];r.forEach(function(s){var o=parseInt(i.data[s],10);i.data[s]=isNaN(o)?void 0:o});var n=["player_source_url","video_source_url"];n.forEach(function(s){if(i.data[s]){var o=i.data[s].toLowerCase();(o.indexOf("data:")===0||o.indexOf("blob:")===0)&&(i.data[s]="MSE style URL")}})}},{key:"_resetVideoData",value:function(){var i=this;Object.keys(this.data).forEach(function(r){r.indexOf("video_")===0&&delete i.data[r]})}},{key:"_resetViewData",value:function(){var i=this;Object.keys(this.data).forEach(function(r){r.indexOf("view_")===0&&delete i.data[r]}),this.data.view_sequence_number=1}},{key:"_resetErrorData",value:function(){delete this.data.player_error_code,delete this.data.player_error_message,delete this.data.player_error_context,delete this.data.player_error_severity,delete this.data.player_error_business_exception}},{key:"_initializeViewData",value:function(){var i=this,r=this.data.view_id=Xr(),n=function(){r===i.data.view_id&&ge(i.data,"player_view_count",1)};this.data.player_is_paused?this.one("play",n):n()}},{key:"_restartHeartBeat",value:function(){var i=this;window.clearTimeout(this._heartBeatTimeout),this._heartBeatTimeout=window.setTimeout(function(){i.data.player_is_paused||i.emit("hb")},1e4)}},{key:"addHLSJS",value:function(i){if(!i.hlsjs){this.mux.log.warn("You must pass a valid hlsjs instance in order to track it.");return}if(this.hlsjs){this.mux.log.warn("An instance of HLS.js is already being monitored for this player.");return}this.hlsjs=i.hlsjs,CE(this.mux,this.id,i.hlsjs,{},i.Hls||window.Hls)}},{key:"removeHLSJS",value:function(){this.hlsjs&&(LE(this.hlsjs),this.hlsjs=void 0)}},{key:"addDashJS",value:function(i){if(!i.dashjs){this.mux.log.warn("You must pass a valid dashjs instance in order to track it.");return}if(this.dashjs){this.mux.log.warn("An instance of Dash.js is already being monitored for this player.");return}this.dashjs=i.dashjs,xE(this.mux,this.id,i.dashjs)}},{key:"removeDashJS",value:function(){this.dashjs&&(PE(this.dashjs),this.dashjs=void 0)}}]),a})(BE),qf=Kf,or=Xe(Fh());function Yf(){return or.default&&!!(or.default.fullscreenElement||or.default.webkitFullscreenElement||or.default.mozFullScreenElement||or.default.msFullscreenElement)}var Gf=["loadstart","pause","play","playing","seeking","seeked","timeupdate","ratechange","stalled","waiting","error","ended"],jf={1:"MEDIA_ERR_ABORTED",2:"MEDIA_ERR_NETWORK",3:"MEDIA_ERR_DECODE",4:"MEDIA_ERR_SRC_NOT_SUPPORTED"};function Qf(e,t,a){var i=na(Vs(t),3),r=i[0],n=i[1],s=i[2],o=e.log,l=e.utils.getComputedStyle,d=e.utils.secondsToMs,u={automaticErrorTracking:!0};if(r){if(s!=="video"&&s!=="audio")return o.error("The element of `"+n+"` was not a media element.")}else return o.error("No element was found with the `"+n+"` query selector.");r.mux&&(r.mux.destroy(),delete r.mux,o.warn("Already monitoring this video element, replacing existing event listeners"));var p={getPlayheadTime:function(){return d(r.currentTime)},getStateData:function(){var h,v,_,b=((h=(v=this).getPlayheadTime)===null||h===void 0?void 0:h.call(v))||d(r.currentTime),y=this.hlsjs&&this.hlsjs.url,T=this.dashjs&&typeof this.dashjs.getSource=="function"&&this.dashjs.getSource(),E={player_is_paused:r.paused,player_width:parseInt(l(r,"width")),player_height:parseInt(l(r,"height")),player_autoplay_on:r.autoplay,player_preload_on:r.preload,player_language_code:r.lang,player_is_fullscreen:Yf(),video_poster_url:r.poster,video_source_url:y||T||r.currentSrc,video_source_duration:d(r.duration),video_source_height:r.videoHeight,video_source_width:r.videoWidth,view_dropped_frame_count:r==null||(_=r.getVideoPlaybackQuality)===null||_===void 0?void 0:_.call(r).droppedVideoFrames};if(r.getStartDate&&b>0){var S=r.getStartDate();if(S&&typeof S.getTime=="function"&&S.getTime()){var L=S.getTime();if(E.player_program_time=L+b,r.seekable.length>0){var x=L+r.seekable.end(r.seekable.length-1);E.player_live_edge_program_time=x}}}return E}};a=Object.assign(u,a,p),a.data=Object.assign({player_software:"HTML5 Video Element",player_mux_plugin_name:"VideoElementMonitor",player_mux_plugin_version:e.VERSION},a.data),r.mux=r.mux||{},r.mux.deleted=!1,r.mux.emit=function(h,v){e.emit(n,h,v)},r.mux.updateData=function(h){r.mux.emit("hb",h)};var m=function(){o.error("The monitor for this video element has already been destroyed.")};r.mux.destroy=function(){Object.keys(r.mux.listeners).forEach(function(h){r.removeEventListener(h,r.mux.listeners[h],!1)}),delete r.mux.listeners,r.mux.destroy=m,r.mux.swapElement=m,r.mux.emit=m,r.mux.addHLSJS=m,r.mux.addDashJS=m,r.mux.removeHLSJS=m,r.mux.removeDashJS=m,r.mux.updateData=m,r.mux.setEmitTranslator=m,r.mux.setStateDataTranslator=m,r.mux.setGetPlayheadTime=m,r.mux.deleted=!0,e.emit(n,"destroy")},r.mux.swapElement=function(h){var v=na(Vs(h),3),_=v[0],b=v[1],y=v[2];if(_){if(y!=="video"&&y!=="audio")return e.log.error("The element of `"+b+"` was not a media element.")}else return e.log.error("No element was found with the `"+b+"` query selector.");_.muxId=r.muxId,delete r.muxId,_.mux=_.mux||{},_.mux.listeners=Object.assign({},r.mux.listeners),delete r.mux.listeners,Object.keys(_.mux.listeners).forEach(function(T){r.removeEventListener(T,_.mux.listeners[T],!1),_.addEventListener(T,_.mux.listeners[T],!1)}),_.mux.swapElement=r.mux.swapElement,_.mux.destroy=r.mux.destroy,delete r.mux,r=_},r.mux.addHLSJS=function(h){e.addHLSJS(n,h)},r.mux.addDashJS=function(h){e.addDashJS(n,h)},r.mux.removeHLSJS=function(){e.removeHLSJS(n)},r.mux.removeDashJS=function(){e.removeDashJS(n)},r.mux.setEmitTranslator=function(h){e.setEmitTranslator(n,h)},r.mux.setStateDataTranslator=function(h){e.setStateDataTranslator(n,h)},r.mux.setGetPlayheadTime=function(h){h||(h=a.getPlayheadTime),e.setGetPlayheadTime(n,h)},e.init(n,a),e.emit(n,"playerready"),r.paused||(e.emit(n,"play"),r.readyState>2&&e.emit(n,"playing")),r.mux.listeners={},Gf.forEach(function(h){h==="error"&&!a.automaticErrorTracking||(r.mux.listeners[h]=function(){var v={};if(h==="error"){if(!r.error||r.error.code===1)return;v.player_error_code=r.error.code,v.player_error_message=jf[r.error.code]||r.error.message}e.emit(n,h,v)},r.addEventListener(h,r.mux.listeners[h],!1))})}function Zf(e,t,a,i){var r=i;if(e&&typeof e[t]=="function")try{r=e[t].apply(e,a)}catch(n){te.info("safeCall error",n)}return r}var Vr=Xe(Tt()),vi;Vr.default&&Vr.default.WeakMap&&(vi=new WeakMap);function zf(e,t){if(!e||!t||!Vr.default||typeof Vr.default.getComputedStyle!="function")return"";var a;return vi&&vi.has(e)&&(a=vi.get(e)),a||(a=Vr.default.getComputedStyle(e,null),vi&&vi.set(e,a)),a.getPropertyValue(t)}function Xf(e){return Math.floor(e*1e3)}var Ca={TARGET_DURATION:"#EXT-X-TARGETDURATION",PART_INF:"#EXT-X-PART-INF",SERVER_CONTROL:"#EXT-X-SERVER-CONTROL",INF:"#EXTINF",PROGRAM_DATE_TIME:"#EXT-X-PROGRAM-DATE-TIME",VERSION:"#EXT-X-VERSION",SESSION_DATA:"#EXT-X-SESSION-DATA"},mo=function(e){return this.buffer="",this.manifest={segments:[],serverControl:{},sessionData:{}},this.currentUri={},this.process(e),this.manifest};mo.prototype.process=function(e){var t;for(this.buffer+=e,t=this.buffer.indexOf(`
`);t>-1;t=this.buffer.indexOf(`
`))this.processLine(this.buffer.substring(0,t)),this.buffer=this.buffer.substring(t+1)};mo.prototype.processLine=function(e){var t=e.indexOf(":"),a=ab(e,t),i=a[0],r=a.length===2?kd(a[1]):void 0;if(i[0]!=="#")this.currentUri.uri=i,this.manifest.segments.push(this.currentUri),this.manifest.targetDuration&&!("duration"in this.currentUri)&&(this.currentUri.duration=this.manifest.targetDuration),this.currentUri={};else switch(i){case Ca.TARGET_DURATION:{if(!isFinite(r)||r<0)return;this.manifest.targetDuration=r,this.setHoldBack();break}case Ca.PART_INF:{Uo(this.manifest,a),this.manifest.partInf.partTarget&&(this.manifest.partTargetDuration=this.manifest.partInf.partTarget),this.setHoldBack();break}case Ca.SERVER_CONTROL:{Uo(this.manifest,a),this.setHoldBack();break}case Ca.INF:{r===0?this.currentUri.duration=.01:r>0&&(this.currentUri.duration=r);break}case Ca.PROGRAM_DATE_TIME:{var n=r,s=new Date(n);this.manifest.dateTimeString||(this.manifest.dateTimeString=n,this.manifest.dateTimeObject=s),this.currentUri.dateTimeString=n,this.currentUri.dateTimeObject=s;break}case Ca.VERSION:{Uo(this.manifest,a);break}case Ca.SESSION_DATA:{var o=ib(a[1]),l=Yh(o);Object.assign(this.manifest.sessionData,l)}}};mo.prototype.setHoldBack=function(){var e=this.manifest,t=e.serverControl,a=e.targetDuration,i=e.partTargetDuration;if(t){var r="holdBack",n="partHoldBack",s=a&&a*3,o=i&&i*2;a&&!t.hasOwnProperty(r)&&(t[r]=s),s&&t[r]<s&&(t[r]=s),i&&!t.hasOwnProperty(n)&&(t[n]=i*3),i&&t[n]<o&&(t[n]=o)}};var Uo=function(e,t){var a=tm(t[0].replace("#EXT-X-","")),i;tb(t[1])?(i={},i=Object.assign(eb(t[1]),i)):i=kd(t[1]),e[a]=i},tm=function(e){return e.toLowerCase().replace(/-(\w)/g,function(t){return t[1].toUpperCase()})},kd=function(e){if(e.toLowerCase()==="yes"||e.toLowerCase()==="no")return e.toLowerCase()==="yes";var t=e.indexOf(":")!==-1?e:parseFloat(e);return isNaN(t)?e:t},Jf=function(e){var t={},a=e.split("=");if(a.length>1){var i=tm(a[0]);t[i]=kd(a[1])}return t},eb=function(e){for(var t=e.split(","),a={},i=0;t.length>i;i++){var r=t[i],n=Jf(r);a=Object.assign(n,a)}return a},tb=function(e){return e.indexOf("=")>-1},ab=function(e,t){return t===-1?[e]:[e.substring(0,t),e.substring(t+1)]},ib=function(e){var t={};if(e){var a=e.search(","),i=e.slice(0,a),r=e.slice(a+1),n=[i,r];return n.forEach(function(s,o){for(var l=s.replace(/['"]+/g,"").split("="),d=0;d<l.length;d++)l[d]==="DATA-ID"&&(t["DATA-ID"]=l[1-d]),l[d]==="VALUE"&&(t.VALUE=l[1-d])}),{data:t}}},rb=mo,nb={safeCall:Zf,safeIncrement:ge,getComputedStyle:zf,secondsToMs:Xf,assign:Object.assign,headersStringToObject:Ad,cdnHeadersToRequestId:Ks,extractHostnameAndDomain:Jr,extractHostname:gt,manifestParser:rb,generateShortID:Kh,generateUUID:Xr,now:Te.now,findMediaElement:Vs},sb=nb,ob={PLAYER_READY:"playerready",VIEW_INIT:"viewinit",VIDEO_CHANGE:"videochange",PLAY:"play",PAUSE:"pause",PLAYING:"playing",TIME_UPDATE:"timeupdate",SEEKING:"seeking",SEEKED:"seeked",REBUFFER_START:"rebufferstart",REBUFFER_END:"rebufferend",ERROR:"error",ENDED:"ended",RENDITION_CHANGE:"renditionchange",ORIENTATION_CHANGE:"orientationchange",AD_REQUEST:"adrequest",AD_RESPONSE:"adresponse",AD_BREAK_START:"adbreakstart",AD_PLAY:"adplay",AD_PLAYING:"adplaying",AD_PAUSE:"adpause",AD_FIRST_QUARTILE:"adfirstquartile",AD_MID_POINT:"admidpoint",AD_THIRD_QUARTILE:"adthirdquartile",AD_ENDED:"adended",AD_BREAK_END:"adbreakend",AD_ERROR:"aderror",REQUEST_COMPLETED:"requestcompleted",REQUEST_FAILED:"requestfailed",REQUEST_CANCELLED:"requestcanceled",HEARTBEAT:"hb",DESTROY:"destroy"},lb=ob,db="mux-embed",ub="5.9.0",cb="2.1",pe={},wa=function(e){var t=arguments;typeof e=="string"?wa.hasOwnProperty(e)?Wr.default.setTimeout(function(){t=Array.prototype.splice.call(t,1),wa[e].apply(null,t)},0):te.warn("`"+e+"` is an unknown task"):typeof e=="function"?Wr.default.setTimeout(function(){e(wa)},0):te.warn("`"+e+"` is invalid.")},hb={loaded:Te.now(),NAME:db,VERSION:ub,API_VERSION:cb,PLAYER_TRACKED:!1,monitor:function(e,t){return Qf(wa,e,t)},destroyMonitor:function(e){var t=na(Vs(e),1),a=t[0];a&&a.mux&&typeof a.mux.destroy=="function"?a.mux.destroy():te.error("A video element monitor for `"+e+"` has not been initialized via `mux.monitor`.")},addHLSJS:function(e,t){var a=ht(e);pe[a]?pe[a].addHLSJS(t):te.error("A monitor for `"+a+"` has not been initialized.")},addDashJS:function(e,t){var a=ht(e);pe[a]?pe[a].addDashJS(t):te.error("A monitor for `"+a+"` has not been initialized.")},removeHLSJS:function(e){var t=ht(e);pe[t]?pe[t].removeHLSJS():te.error("A monitor for `"+t+"` has not been initialized.")},removeDashJS:function(e){var t=ht(e);pe[t]?pe[t].removeDashJS():te.error("A monitor for `"+t+"` has not been initialized.")},init:function(e,t){sl()&&t&&t.respectDoNotTrack&&te.info("The browser's Do Not Track flag is enabled - Mux beaconing is disabled.");var a=ht(e);pe[a]=new qf(wa,a,t)},emit:function(e,t,a){var i=ht(e);pe[i]?(pe[i].emit(t,a),t==="destroy"&&delete pe[i]):te.error("A monitor for `"+i+"` has not been initialized.")},updateData:function(e,t){var a=ht(e);pe[a]?pe[a].emit("hb",t):te.error("A monitor for `"+a+"` has not been initialized.")},setEmitTranslator:function(e,t){var a=ht(e);pe[a]?pe[a].emitTranslator=t:te.error("A monitor for `"+a+"` has not been initialized.")},setStateDataTranslator:function(e,t){var a=ht(e);pe[a]?pe[a].stateDataTranslator=t:te.error("A monitor for `"+a+"` has not been initialized.")},setGetPlayheadTime:function(e,t){var a=ht(e);pe[a]?pe[a].getPlayheadTime=t:te.error("A monitor for `"+a+"` has not been initialized.")},checkDoNotTrack:sl,log:te,utils:sb,events:lb,WINDOW_HIDDEN:!1,WINDOW_UNLOADING:!1};Object.assign(wa,hb);typeof Wr.default<"u"&&typeof Wr.default.addEventListener=="function"&&Wr.default.addEventListener("pagehide",function(e){e.persisted||(wa.WINDOW_UNLOADING=!0)},!1);var wd=wa;/*!
* JavaScript Cookie v2.1.3
* https://github.com/js-cookie/js-cookie
*
* Copyright 2006, 2015 Klaus Hartl & Fagner Brack
* Released under the MIT license
*/var V=Kv,ie={VIDEO:"video",THUMBNAIL:"thumbnail",STORYBOARD:"storyboard",DRM:"drm"},N={NOT_AN_ERROR:0,NETWORK_OFFLINE:2000002,NETWORK_UNKNOWN_ERROR:2e6,NETWORK_NO_STATUS:2000001,NETWORK_INVALID_URL:24e5,NETWORK_NOT_FOUND:2404e3,NETWORK_NOT_READY:2412e3,NETWORK_GENERIC_SERVER_FAIL:25e5,NETWORK_TOKEN_MISSING:2403201,NETWORK_TOKEN_MALFORMED:2412202,NETWORK_TOKEN_EXPIRED:2403210,NETWORK_TOKEN_AUD_MISSING:2403221,NETWORK_TOKEN_AUD_MISMATCH:2403222,NETWORK_TOKEN_SUB_MISMATCH:2403232,ENCRYPTED_ERROR:5e6,ENCRYPTED_UNSUPPORTED_KEY_SYSTEM:5000001,ENCRYPTED_GENERATE_REQUEST_FAILED:5000002,ENCRYPTED_UPDATE_LICENSE_FAILED:5000003,ENCRYPTED_UPDATE_SERVER_CERT_FAILED:5000004,ENCRYPTED_CDM_ERROR:5000005,ENCRYPTED_OUTPUT_RESTRICTED:5000006,ENCRYPTED_MISSING_TOKEN:5000002},po=e=>e===ie.VIDEO?"playback":e,ha=class gr extends Error{constructor(t,a=gr.MEDIA_ERR_CUSTOM,i,r){var n;super(t),this.name="MediaError",this.code=a,this.context=r,this.fatal=i??(a>=gr.MEDIA_ERR_NETWORK&&a<=gr.MEDIA_ERR_ENCRYPTED),this.message||(this.message=(n=gr.defaultMessages[this.code])!=null?n:"")}};ha.MEDIA_ERR_ABORTED=1,ha.MEDIA_ERR_NETWORK=2,ha.MEDIA_ERR_DECODE=3,ha.MEDIA_ERR_SRC_NOT_SUPPORTED=4,ha.MEDIA_ERR_ENCRYPTED=5,ha.MEDIA_ERR_CUSTOM=100,ha.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail.",3:"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",4:"An unsupported error occurred. The server or network failed, or your browser does not support this format.",5:"The media is encrypted and there are no keys to decrypt it."};var I=ha,mb=e=>e==null,Sd=(e,t)=>mb(t)?!1:e in t,dl={ANY:"any",MUTED:"muted"},Q={ON_DEMAND:"on-demand",LIVE:"live",UNKNOWN:"unknown"},Ft={MSE:"mse",NATIVE:"native"},_r={HEADER:"header",QUERY:"query",NONE:"none"},qs=Object.values(_r),ia={M3U8:"application/vnd.apple.mpegurl",MP4:"video/mp4"},lc={HLS:ia.M3U8};[...Object.values(ia)];var jT={upTo720p:"720p",upTo1080p:"1080p",upTo1440p:"1440p",upTo2160p:"2160p"},QT={noLessThan480p:"480p",noLessThan540p:"540p",noLessThan720p:"720p",noLessThan1080p:"1080p",noLessThan1440p:"1440p",noLessThan2160p:"2160p"},ZT={DESCENDING:"desc"},pb="en",ul={code:pb},Ee=(e,t,a,i,r=e)=>{r.addEventListener(t,a,i),e.addEventListener("teardown",()=>{r.removeEventListener(t,a)},{once:!0})};function vb(e,t,a){t&&a>t&&(a=t);for(let i=0;i<e.length;i++)if(e.start(i)<=a&&e.end(i)>=a)return!0;return!1}var Id=e=>{let t=e.indexOf("?");if(t<0)return[e];let a=e.slice(0,t),i=e.slice(t);return[a,i]},vo=e=>{let{type:t}=e;if(t){let a=t.toUpperCase();return Sd(a,lc)?lc[a]:t}return Eb(e)},am=e=>e==="VOD"?Q.ON_DEMAND:Q.LIVE,im=e=>e==="EVENT"?Number.POSITIVE_INFINITY:e==="VOD"?Number.NaN:0,Eb=e=>{let{src:t}=e;if(!t)return"";let a="";try{a=new URL(t).pathname}catch{console.error("invalid url")}let i=a.lastIndexOf(".");if(i<0)return bb(e)?ia.M3U8:"";let r=a.slice(i+1).toUpperCase();return Sd(r,ia)?ia[r]:""},fb="mux.com",bb=({src:e,customDomain:t=fb})=>{let a;try{a=new URL(`${e}`)}catch{return!1}let i=a.protocol==="https:",r=a.hostname===`stream.${t}`.toLowerCase(),n=a.pathname.split("/"),s=n.length===2,o=!(n!=null&&n[1].includes("."));return i&&r&&s&&o},Hi=e=>{let t=(e??"").split(".")[1];if(t)try{let a=t.replace(/-/g,"+").replace(/_/g,"/"),i=decodeURIComponent(atob(a).split("").map(function(r){return"%"+("00"+r.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(i)}catch{return}},gb=({exp:e},t=Date.now())=>!e||e*1e3<t,_b=({sub:e},t)=>e!==t,yb=({aud:e},t)=>!e,Tb=({aud:e},t)=>e!==t,rm="en";function M(e,t=!0){var a,i;let r=t&&(i=(a=ul)==null?void 0:a[e])!=null?i:e,n=t?ul.code:rm;return new Ab(r,n)}var Ab=class{constructor(e,t=(a=>(a=ul)!=null?a:rm)()){this.message=e,this.locale=t}format(e){return this.message.replace(/\{(\w+)\}/g,(t,a)=>{var i;return(i=e[a])!=null?i:""})}toString(){return this.message}},kb=Object.values(dl),dc=e=>typeof e=="boolean"||typeof e=="string"&&kb.includes(e),wb=(e,t,a)=>{let{autoplay:i}=e,r=!1,n=!1,s=dc(i)?i:!!i,o=()=>{r||Ee(t,"playing",()=>{r=!0},{once:!0})};if(o(),Ee(t,"loadstart",()=>{r=!1,o(),Bo(t,s)},{once:!0}),Ee(t,"loadstart",()=>{a||(e.streamType&&e.streamType!==Q.UNKNOWN?n=e.streamType===Q.LIVE:n=!Number.isFinite(t.duration)),Bo(t,s)},{once:!0}),a&&a.once(V.Events.LEVEL_LOADED,(l,d)=>{var u;e.streamType&&e.streamType!==Q.UNKNOWN?n=e.streamType===Q.LIVE:n=(u=d.details.live)!=null?u:!1}),!s){let l=()=>{!n||Number.isFinite(e.startTime)||(a!=null&&a.liveSyncPosition?t.currentTime=a.liveSyncPosition:Number.isFinite(t.seekable.end(0))&&(t.currentTime=t.seekable.end(0)))};a&&Ee(t,"play",()=>{t.preload==="metadata"?a.once(V.Events.LEVEL_UPDATED,l):l()},{once:!0})}return l=>{r||(s=dc(l)?l:!!l,Bo(t,s))}},Bo=(e,t)=>{if(!t)return;let a=e.muted,i=()=>e.muted=a;switch(t){case dl.ANY:e.play().catch(()=>{e.muted=!0,e.play().catch(i)});break;case dl.MUTED:e.muted=!0,e.play().catch(i);break;default:e.play().catch(()=>{});break}},Sb=({preload:e,src:t},a,i)=>{let r=p=>{p!=null&&["","none","metadata","auto"].includes(p)?a.setAttribute("preload",p):a.removeAttribute("preload")};if(!i)return r(e),r;let n=!1,s=!1,o=i.config.maxBufferLength,l=i.config.maxBufferSize,d=p=>{r(p);let m=p??a.preload;s||m==="none"||(m==="metadata"?(i.config.maxBufferLength=1,i.config.maxBufferSize=1):(i.config.maxBufferLength=o,i.config.maxBufferSize=l),u())},u=()=>{!n&&t&&(n=!0,i.loadSource(t))};return Ee(a,"play",()=>{s=!0,i.config.maxBufferLength=o,i.config.maxBufferSize=l,u()},{once:!0}),d(e),d};function Ib(e,t){var a;if(!("videoTracks"in e))return;let i=new WeakMap;t.on(V.Events.MANIFEST_PARSED,function(l,d){o();let u=e.addVideoTrack("main");u.selected=!0;for(let[p,m]of d.levels.entries()){let h=u.addRendition(m.url[0],m.width,m.height,m.videoCodec,m.bitrate);i.set(m,`${p}`),h.id=`${p}`}}),t.on(V.Events.AUDIO_TRACKS_UPDATED,function(l,d){s();for(let u of d.audioTracks){let p=u.default?"main":"alternative",m=e.addAudioTrack(p,u.name,u.lang);m.id=`${u.id}`,u.default&&(m.enabled=!0)}}),e.audioTracks.addEventListener("change",()=>{var l;let d=+((l=[...e.audioTracks].find(p=>p.enabled))==null?void 0:l.id),u=t.audioTracks.map(p=>p.id);d!=t.audioTrack&&u.includes(d)&&(t.audioTrack=d)}),t.on(V.Events.LEVELS_UPDATED,function(l,d){var u;let p=e.videoTracks[(u=e.videoTracks.selectedIndex)!=null?u:0];if(!p)return;let m=d.levels.map(h=>i.get(h));for(let h of e.videoRenditions)h.id&&!m.includes(h.id)&&p.removeRendition(h)});let r=l=>{let d=l.target.selectedIndex;d!=t.nextLevel&&(t.nextLevel=d)};(a=e.videoRenditions)==null||a.addEventListener("change",r);let n=()=>{for(let l of e.videoTracks)e.removeVideoTrack(l)},s=()=>{for(let l of e.audioTracks)e.removeAudioTrack(l)},o=()=>{n(),s()};t.once(V.Events.DESTROYING,o)}var Ho=e=>"time"in e?e.time:e.startTime;function Rb(e,t){t.on(V.Events.NON_NATIVE_TEXT_TRACKS_FOUND,(r,{tracks:n})=>{n.forEach(s=>{var o,l;let d=(o=s.subtitleTrack)!=null?o:s.closedCaptions,u=t.subtitleTracks.findIndex(({lang:m,name:h,type:v})=>m==(d==null?void 0:d.lang)&&h===s.label&&v.toLowerCase()===s.kind),p=((l=s._id)!=null?l:s.default)?"default":`${s.kind}${u}`;Rd(e,s.kind,s.label,d==null?void 0:d.lang,p,s.default)})});let a=()=>{if(!t.subtitleTracks.length)return;let r=Array.from(e.textTracks).find(o=>o.id&&o.mode==="showing"&&["subtitles","captions"].includes(o.kind));if(!r)return;let n=t.subtitleTracks[t.subtitleTrack],s=n?n.default?"default":`${t.subtitleTracks[t.subtitleTrack].type.toLowerCase()}${t.subtitleTrack}`:void 0;if(t.subtitleTrack<0||(r==null?void 0:r.id)!==s){let o=t.subtitleTracks.findIndex(({lang:l,name:d,type:u,default:p})=>r.id==="default"&&p||l==r.language&&d===r.label&&u.toLowerCase()===r.kind);t.subtitleTrack=o}(r==null?void 0:r.id)===s&&r.cues&&Array.from(r.cues).forEach(o=>{r.addCue(o)})};e.textTracks.addEventListener("change",a),t.on(V.Events.CUES_PARSED,(r,{track:n,cues:s})=>{let o=e.textTracks.getTrackById(n);if(!o)return;let l=o.mode==="disabled";l&&(o.mode="hidden"),s.forEach(d=>{var u;(u=o.cues)!=null&&u.getCueById(d.id)||o.addCue(d)}),l&&(o.mode="disabled")}),t.once(V.Events.DESTROYING,()=>{e.textTracks.removeEventListener("change",a),e.querySelectorAll("track[data-removeondestroy]").forEach(r=>{r.remove()})});let i=()=>{Array.from(e.textTracks).forEach(r=>{var n,s;if(!["subtitles","caption"].includes(r.kind)&&(r.label==="thumbnails"||r.kind==="chapters")){if(!((n=r.cues)!=null&&n.length)){let o="track";r.kind&&(o+=`[kind="${r.kind}"]`),r.label&&(o+=`[label="${r.label}"]`);let l=e.querySelector(o),d=(s=l==null?void 0:l.getAttribute("src"))!=null?s:"";l==null||l.removeAttribute("src"),setTimeout(()=>{l==null||l.setAttribute("src",d)},0)}r.mode!=="hidden"&&(r.mode="hidden")}})};t.once(V.Events.MANIFEST_LOADED,i),t.once(V.Events.MEDIA_ATTACHED,i)}function Rd(e,t,a,i,r,n){let s=document.createElement("track");return s.kind=t,s.label=a,i&&(s.srclang=i),r&&(s.id=r),n&&(s.default=!0),s.track.mode=["subtitles","captions"].includes(t)?"disabled":"hidden",s.setAttribute("data-removeondestroy",""),e.append(s),s.track}function Db(e,t){let a=Array.prototype.find.call(e.querySelectorAll("track"),i=>i.track===t);a==null||a.remove()}function vn(e,t,a){var i;return(i=Array.from(e.querySelectorAll("track")).find(r=>r.track.label===t&&r.track.kind===a))==null?void 0:i.track}async function nm(e,t,a,i){let r=vn(e,a,i);return r||(r=Rd(e,i,a),r.mode="hidden",await new Promise(n=>setTimeout(()=>n(void 0),0))),r.mode!=="hidden"&&(r.mode="hidden"),[...t].sort((n,s)=>Ho(s)-Ho(n)).forEach(n=>{var s,o;let l=n.value,d=Ho(n);if("endTime"in n&&n.endTime!=null)r==null||r.addCue(new VTTCue(d,n.endTime,i==="chapters"?l:JSON.stringify(l??null)));else{let u=Array.prototype.findIndex.call(r==null?void 0:r.cues,v=>v.startTime>=d),p=(s=r==null?void 0:r.cues)==null?void 0:s[u],m=p?p.startTime:Number.isFinite(e.duration)?e.duration:Number.MAX_SAFE_INTEGER,h=(o=r==null?void 0:r.cues)==null?void 0:o[u-1];h&&(h.endTime=d),r==null||r.addCue(new VTTCue(d,m,i==="chapters"?l:JSON.stringify(l??null)))}}),e.textTracks.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),r}var Dd="cuepoints",sm=Object.freeze({label:Dd});async function om(e,t,a=sm){return nm(e,t,a.label,"metadata")}var cl=e=>({time:e.startTime,value:JSON.parse(e.text)});function Cb(e,t={label:Dd}){let a=vn(e,t.label,"metadata");return a!=null&&a.cues?Array.from(a.cues,i=>cl(i)):[]}function lm(e,t={label:Dd}){var a,i;let r=vn(e,t.label,"metadata");if(!((a=r==null?void 0:r.activeCues)!=null&&a.length))return;if(r.activeCues.length===1)return cl(r.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((i=r.activeCues)!=null?i:[],({startTime:o,endTime:l})=>o<=n&&l>n);return cl(s||r.activeCues[0])}async function Lb(e,t=sm){return new Promise(a=>{Ee(e,"loadstart",async()=>{let i=await om(e,[],t);Ee(e,"cuechange",()=>{let r=lm(e);if(r){let n=new CustomEvent("cuepointchange",{composed:!0,bubbles:!0,detail:r});e.dispatchEvent(n)}},{},i),a(i)})})}var Cd="chapters",dm=Object.freeze({label:Cd}),hl=e=>({startTime:e.startTime,endTime:e.endTime,value:e.text});async function um(e,t,a=dm){return nm(e,t,a.label,"chapters")}function Mb(e,t={label:Cd}){var a;let i=vn(e,t.label,"chapters");return(a=i==null?void 0:i.cues)!=null&&a.length?Array.from(i.cues,r=>hl(r)):[]}function cm(e,t={label:Cd}){var a,i;let r=vn(e,t.label,"chapters");if(!((a=r==null?void 0:r.activeCues)!=null&&a.length))return;if(r.activeCues.length===1)return hl(r.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((i=r.activeCues)!=null?i:[],({startTime:o,endTime:l})=>o<=n&&l>n);return hl(s||r.activeCues[0])}async function Ob(e,t=dm){return new Promise(a=>{Ee(e,"loadstart",async()=>{let i=await um(e,[],t);Ee(e,"cuechange",()=>{let r=cm(e);if(r){let n=new CustomEvent("chapterchange",{composed:!0,bubbles:!0,detail:r});e.dispatchEvent(n)}},{},i),a(i)})})}function Nb(e,t){if(t){let a=t.playingDate;if(a!=null)return new Date(a.getTime()-e.currentTime*1e3)}return typeof e.getStartDate=="function"?e.getStartDate():new Date(NaN)}function xb(e,t){if(t&&t.playingDate)return t.playingDate;if(typeof e.getStartDate=="function"){let a=e.getStartDate();return new Date(a.getTime()+e.currentTime*1e3)}return new Date(NaN)}var Fr={VIDEO:"v",THUMBNAIL:"t",STORYBOARD:"s",DRM:"d"},Pb=e=>{if(e===ie.VIDEO)return Fr.VIDEO;if(e===ie.DRM)return Fr.DRM},Ub=(e,t)=>{var a,i;let r=po(e),n=`${r}Token`;return(a=t.tokens)!=null&&a[r]?(i=t.tokens)==null?void 0:i[r]:Sd(n,t)?t[n]:void 0},Ys=(e,t,a,i,r=!1,n=!(s=>(s=globalThis.navigator)==null?void 0:s.onLine)())=>{var s,o;if(n){let y=M("Your device appears to be offline",r),T,E=I.MEDIA_ERR_NETWORK,S=new I(y,E,!1,T);return S.errorCategory=t,S.muxCode=N.NETWORK_OFFLINE,S.data=e,S}let l="status"in e?e.status:e.code,d=Date.now(),u=I.MEDIA_ERR_NETWORK;if(l===200)return;let p=po(t),m=Ub(t,a),h=Pb(t),[v]=Id((s=a.playbackId)!=null?s:"");if(!l||!v)return;let _=Hi(m);if(m&&!_){let y=M("The {tokenNamePrefix}-token provided is invalid or malformed.",r).format({tokenNamePrefix:p}),T=M("Compact JWT string: {token}",r).format({token:m}),E=new I(y,u,!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_MALFORMED,E.data=e,E}if(l>=500){let y=new I("",u,i??!0);return y.errorCategory=t,y.muxCode=N.NETWORK_UNKNOWN_ERROR,y}if(l===403)if(_){if(gb(_,d)){let y={timeStyle:"medium",dateStyle:"medium"},T=M("The video’s secured {tokenNamePrefix}-token has expired.",r).format({tokenNamePrefix:p}),E=M("Expired at: {expiredDate}. Current time: {currentDate}.",r).format({expiredDate:new Intl.DateTimeFormat("en",y).format((o=_.exp)!=null?o:0*1e3),currentDate:new Intl.DateTimeFormat("en",y).format(d)}),S=new I(T,u,!0,E);return S.errorCategory=t,S.muxCode=N.NETWORK_TOKEN_EXPIRED,S.data=e,S}if(_b(_,v)){let y=M("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",r).format({tokenNamePrefix:p}),T=M("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}",r).format({tokenNamePrefix:p,playbackId:v,tokenPlaybackId:_.sub}),E=new I(y,u,!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_SUB_MISMATCH,E.data=e,E}if(yb(_)){let y=M("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:p}),T=M("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.",r).format({tokenNamePrefix:p,expectedAud:h}),E=new I(y,u,!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_AUD_MISSING,E.data=e,E}if(Tb(_,h)){let y=M("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:p}),T=M("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.",r).format({tokenNamePrefix:p,expectedAud:h,aud:_.aud}),E=new I(y,u,!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_AUD_MISMATCH,E.data=e,E}}else{let y=M("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.",r).format({tokenNamePrefix:p,category:t}),T=M("Specified playback ID: {playbackId}",r).format({playbackId:v}),E=new I(y,u,i??!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_MISSING,E.data=e,E}if(l===412){let y=M("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.",r),T=M("Specified playback ID: {playbackId}",r).format({playbackId:v}),E=new I(y,u,i??!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_NOT_READY,E.streamType=a.streamType===Q.LIVE?"live":a.streamType===Q.ON_DEMAND?"on-demand":"unknown",E.data=e,E}if(l===404){let y=M("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.",r),T=M("Specified playback ID: {playbackId}",r).format({playbackId:v}),E=new I(y,u,i??!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_NOT_FOUND,E.data=e,E}if(l===400){let y=M("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."),T=M("Specified playback ID: {playbackId}",r).format({playbackId:v}),E=new I(y,u,i??!0,T);return E.errorCategory=t,E.muxCode=N.NETWORK_INVALID_URL,E.data=e,E}let b=new I("",u,i??!0);return b.errorCategory=t,b.muxCode=N.NETWORK_UNKNOWN_ERROR,b.data=e,b},uc=V.DefaultConfig.capLevelController,hm=class mm extends uc{constructor(t){super(t)}get levels(){var t;return(t=this.hls.levels)!=null?t:[]}getValidLevels(t){return this.levels.filter((a,i)=>this.isLevelAllowed(a)&&i<=t)}getMaxLevel(t){let a=super.getMaxLevel(t),i=this.getValidLevels(t);if(!i[a])return a;let r=Math.min(i[a].width,i[a].height),n=mm.minMaxResolution;return r>=n?a:uc.getMaxLevelByMediaSize(i,n*(16/9),n)}};hm.minMaxResolution=720;var Bb=hm,Hb=Bb,Pn={FAIRPLAY:"fairplay",PLAYREADY:"playready",WIDEVINE:"widevine"},Wb=e=>{if(e.includes("fps"))return Pn.FAIRPLAY;if(e.includes("playready"))return Pn.PLAYREADY;if(e.includes("widevine"))return Pn.WIDEVINE},Vb=e=>{let t=e.split(`
`).find((a,i,r)=>i&&r[i-1].startsWith("#EXT-X-STREAM-INF"));return fetch(t).then(a=>a.status!==200?Promise.reject(a):a.text())},Fb=e=>{let t=e.split(`
`).filter(i=>i.startsWith("#EXT-X-SESSION-DATA"));if(!t.length)return{};let a={};for(let i of t){let r=Kb(i),n=r["DATA-ID"];n&&(a[n]={...r})}return{sessionData:a}},$b=/([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g;function Kb(e){let t=[...e.matchAll($b)];return Object.fromEntries(t.map(([,a,i])=>[a,i]))}var qb=e=>{var t,a,i;let r=e.split(`
`),n=(a=((t=r.find(d=>d.startsWith("#EXT-X-PLAYLIST-TYPE")))!=null?t:"").split(":")[1])==null?void 0:a.trim(),s=am(n),o=im(n),l;if(s===Q.LIVE){let d=r.find(u=>u.startsWith("#EXT-X-PART-INF"));if(d)l=+d.split(":")[1].split("=")[1]*2;else{let u=r.find(m=>m.startsWith("#EXT-X-TARGETDURATION"));l=+(((i=u==null?void 0:u.split(":"))==null?void 0:i[1])??6)*3}}return{streamType:s,targetLiveWindow:o,liveEdgeStartOffset:l}},Yb=async(e,t)=>{if(t===ia.MP4)return{streamType:Q.ON_DEMAND,targetLiveWindow:Number.NaN,liveEdgeStartOffset:void 0,sessionData:void 0};if(t===ia.M3U8){let a=await fetch(e);if(!a.ok)return Promise.reject(a);let i=await a.text(),r=await Vb(i);return{...Fb(i),...qb(r)}}return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`),{streamType:void 0,targetLiveWindow:void 0,liveEdgeStartOffset:void 0,sessionData:void 0}},Gb=async(e,t,a=vo({src:e}))=>{var i,r,n,s;let{streamType:o,targetLiveWindow:l,liveEdgeStartOffset:d,sessionData:u}=await Yb(e,a),p=u==null?void 0:u["com.apple.hls.chapters"];(p!=null&&p.URI||p!=null&&p.VALUE.toLocaleLowerCase().startsWith("http"))&&Ld((i=p.URI)!=null?i:p.VALUE,t),((r=ue.get(t))!=null?r:{}).liveEdgeStartOffset=d,((n=ue.get(t))!=null?n:{}).targetLiveWindow=l,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((s=ue.get(t))!=null?s:{}).streamType=o,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},Ld=async(e,t)=>{var a,i;try{let r=await fetch(e);if(!r.ok)throw new Error(`Failed to fetch Mux metadata: ${r.status} ${r.statusText}`);let n=await r.json(),s={};if(!((a=n==null?void 0:n[0])!=null&&a.metadata))return;for(let l of n[0].metadata)l.key&&l.value&&(s[l.key]=l.value);((i=ue.get(t))!=null?i:{}).metadata=s;let o=new CustomEvent("muxmetadata");t.dispatchEvent(o)}catch(r){console.error(r)}},jb=e=>{var t;let a=e.type,i=am(a),r=im(a),n,s=!!((t=e.partList)!=null&&t.length);return i===Q.LIVE&&(n=s?e.partTarget*2:e.targetduration*3),{streamType:i,targetLiveWindow:r,liveEdgeStartOffset:n,lowLatency:s}},Qb=(e,t,a)=>{var i,r,n,s,o,l,d,u;let{streamType:p,targetLiveWindow:m,liveEdgeStartOffset:h,lowLatency:v}=jb(e);if(p===Q.LIVE){v?(a.config.backBufferLength=(i=a.userConfig.backBufferLength)!=null?i:4,a.config.maxFragLookUpTolerance=(r=a.userConfig.maxFragLookUpTolerance)!=null?r:.001,a.config.abrBandWidthUpFactor=(n=a.userConfig.abrBandWidthUpFactor)!=null?n:a.config.abrBandWidthFactor):a.config.backBufferLength=(s=a.userConfig.backBufferLength)!=null?s:8;let _=Object.freeze({get length(){return t.seekable.length},start(b){return t.seekable.start(b)},end(b){var y;return b>this.length||b<0||Number.isFinite(t.duration)?t.seekable.end(b):(y=a.liveSyncPosition)!=null?y:t.seekable.end(b)}});((o=ue.get(t))!=null?o:{}).seekable=_}((l=ue.get(t))!=null?l:{}).liveEdgeStartOffset=h,((d=ue.get(t))!=null?d:{}).targetLiveWindow=m,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((u=ue.get(t))!=null?u:{}).streamType=p,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},cc,hc,Zb=(hc=(cc=globalThis==null?void 0:globalThis.navigator)==null?void 0:cc.userAgent)!=null?hc:"",mc,pc,vc,zb=(vc=(pc=(mc=globalThis==null?void 0:globalThis.navigator)==null?void 0:mc.userAgentData)==null?void 0:pc.platform)!=null?vc:"",Xb=Zb.toLowerCase().includes("android")||["x11","android"].some(e=>zb.toLowerCase().includes(e)),ue=new WeakMap,ra="mux.com",Ec,fc,pm=(fc=(Ec=V).isSupported)==null?void 0:fc.call(Ec),Jb=Xb,Md=()=>wd.utils.now(),e0=wd.utils.generateUUID,ml=({playbackId:e,customDomain:t=ra,maxResolution:a,minResolution:i,renditionOrder:r,programStartTime:n,programEndTime:s,assetStartTime:o,assetEndTime:l,playbackToken:d,tokens:{playback:u=d}={},extraSourceParams:p={}}={})=>{if(!e)return;let[m,h=""]=Id(e),v=new URL(`https://stream.${t}/${m}.m3u8${h}`);return u||v.searchParams.has("token")?(v.searchParams.forEach((_,b)=>{b!="token"&&v.searchParams.delete(b)}),u&&v.searchParams.set("token",u)):(a&&v.searchParams.set("max_resolution",a),i&&(v.searchParams.set("min_resolution",i),a&&+a.slice(0,-1)<+i.slice(0,-1)&&console.error("minResolution must be <= maxResolution","minResolution",i,"maxResolution",a)),r&&v.searchParams.set("rendition_order",r),n&&v.searchParams.set("program_start_time",`${n}`),s&&v.searchParams.set("program_end_time",`${s}`),o&&v.searchParams.set("asset_start_time",`${o}`),l&&v.searchParams.set("asset_end_time",`${l}`),Object.entries(p).forEach(([_,b])=>{b!=null&&v.searchParams.set(_,b)})),v.toString()},Eo=e=>{if(!e)return;let[t]=e.split("?");return t||void 0},Od=e=>{if(!e||!e.startsWith("https://stream."))return;let[t]=new URL(e).pathname.slice(1).split(/\.m3u8|\//);return t||void 0},t0=e=>{var t,a,i;return(t=e==null?void 0:e.metadata)!=null&&t.video_id?e.metadata.video_id:Tm(e)&&(i=(a=Eo(e.playbackId))!=null?a:Od(e.src))!=null?i:e.src},vm=e=>{var t;return(t=ue.get(e))==null?void 0:t.error},a0=e=>{var t;return(t=ue.get(e))==null?void 0:t.metadata},pl=e=>{var t,a;return(a=(t=ue.get(e))==null?void 0:t.streamType)!=null?a:Q.UNKNOWN},i0=e=>{var t,a;return(a=(t=ue.get(e))==null?void 0:t.targetLiveWindow)!=null?a:Number.NaN},Nd=e=>{var t,a;return(a=(t=ue.get(e))==null?void 0:t.seekable)!=null?a:e.seekable},r0=e=>{var t;let a=(t=ue.get(e))==null?void 0:t.liveEdgeStartOffset;if(typeof a!="number")return Number.NaN;let i=Nd(e);return i.length?i.end(i.length-1)-a:Number.NaN},xd=.034,n0=(e,t,a=xd)=>Math.abs(e-t)<=a,Em=(e,t,a=xd)=>e>t||n0(e,t,a),s0=(e,t=xd)=>e.paused&&Em(e.currentTime,e.duration,t),fm=(e,t)=>{var a,i,r;if(!t||!e.buffered.length)return;if(e.readyState>2)return!1;let n=t.currentLevel>=0?(i=(a=t.levels)==null?void 0:a[t.currentLevel])==null?void 0:i.details:(r=t.levels.find(p=>!!p.details))==null?void 0:r.details;if(!n||n.live)return;let{fragments:s}=n;if(!(s!=null&&s.length))return;if(e.currentTime<e.duration-(n.targetduration+.5))return!1;let o=s[s.length-1];if(e.currentTime<=o.start)return!1;let l=o.start+o.duration/2,d=e.buffered.start(e.buffered.length-1),u=e.buffered.end(e.buffered.length-1);return l>d&&l<u},bm=(e,t)=>e.ended||e.loop?e.ended:t&&fm(e,t)?!0:s0(e),o0=(e,t,a)=>{gm(t,a,e);let{metadata:i={}}=e,{view_session_id:r=e0()}=i,n=t0(e);i.view_session_id=r,i.video_id=n,e.metadata=i;let s=u=>{var p;(p=t.mux)==null||p.emit("hb",{view_drm_type:u})};e.drmTypeCb=s,ue.set(t,{retryCount:0});let o=l0(e,t),l=Sb(e,t,o);e!=null&&e.muxDataKeepSession&&t!=null&&t.mux&&!t.mux.deleted?o&&t.mux.addHLSJS({hlsjs:o,Hls:o?V:void 0}):p0(e,t,o),v0(e,t,o),Lb(t),Ob(t);let d=wb(e,t,o);return{engine:o,setAutoplay:d,setPreload:l}},gm=(e,t,a)=>{let i=t==null?void 0:t.engine;e!=null&&e.mux&&!e.mux.deleted&&(a!=null&&a.muxDataKeepSession?i&&e.mux.removeHLSJS():(e.mux.destroy(),delete e.mux)),i&&(i.detachMedia(),i.destroy()),e&&(e.hasAttribute("src")&&(e.removeAttribute("src"),e.load()),e.removeEventListener("error",km),e.removeEventListener("error",vl),e.removeEventListener("durationchange",Am),ue.delete(e),e.dispatchEvent(new Event("teardown")))};function _m(e,t){var a;let i=vo(e);if(i!==ia.M3U8)return!0;let r=!i||((a=t.canPlayType(i))!=null?a:!0),{preferPlayback:n}=e,s=n===Ft.MSE,o=n===Ft.NATIVE;return r&&(o||!(pm&&(s||Jb)))}var l0=(e,t)=>{let{debug:a,streamType:i,startTime:r=-1,metadata:n,preferCmcd:s,_hlsConfig:o={}}=e,l=vo(e)===ia.M3U8,d=_m(e,t);if(l&&!d&&pm){let u={backBufferLength:30,renderTextTracksNatively:!1,liveDurationInfinity:!0,capLevelToPlayerSize:!0,capLevelOnFPSDrop:!0},p=d0(i),m=u0(e),h=[_r.QUERY,_r.HEADER].includes(s)?{useHeaders:s===_r.HEADER,sessionId:n==null?void 0:n.view_session_id,contentId:n==null?void 0:n.video_id}:void 0,v=new V({debug:a,startPosition:r,cmcd:h,xhrSetup:(_,b)=>{var y,T;if(s&&s!==_r.QUERY)return;let E=new URL(b);if(!E.searchParams.has("CMCD"))return;let S=((T=(y=E.searchParams.get("CMCD"))==null?void 0:y.split(","))!=null?T:[]).filter(L=>L.startsWith("sid")||L.startsWith("cid")).join(",");E.searchParams.set("CMCD",S),_.open("GET",E)},capLevelController:Hb,...u,...p,...m,...o});return v.on(V.Events.MANIFEST_PARSED,async function(_,b){var y,T;let E=(y=b.sessionData)==null?void 0:y["com.apple.hls.chapters"];(E!=null&&E.URI||E!=null&&E.VALUE.toLocaleLowerCase().startsWith("http"))&&Ld((T=E==null?void 0:E.URI)!=null?T:E==null?void 0:E.VALUE,t)}),v}},d0=e=>e===Q.LIVE?{backBufferLength:8}:{},u0=e=>{let{tokens:{drm:t}={},playbackId:a,drmTypeCb:i}=e,r=Eo(a);return!t||!r?{}:{emeEnabled:!0,drmSystems:{"com.apple.fps":{licenseUrl:Un(e,"fairplay"),serverCertificateUrl:ym(e,"fairplay")},"com.widevine.alpha":{licenseUrl:Un(e,"widevine")},"com.microsoft.playready":{licenseUrl:Un(e,"playready")}},requestMediaKeySystemAccessFunc:(n,s)=>(n==="com.widevine.alpha"&&(s=[...s.map(o=>{var l;let d=(l=o.videoCapabilities)==null?void 0:l.map(u=>({...u,robustness:"HW_SECURE_ALL"}));return{...o,videoCapabilities:d}}),...s]),navigator.requestMediaKeySystemAccess(n,s).then(o=>{let l=Wb(n);return i==null||i(l),o}))}},c0=async e=>{let t=await fetch(e);return t.status!==200?Promise.reject(t):await t.arrayBuffer()},h0=async(e,t)=>{let a=await fetch(t,{method:"POST",headers:{"Content-type":"application/octet-stream"},body:e});if(a.status!==200)return Promise.reject(a);let i=await a.arrayBuffer();return new Uint8Array(i)},m0=(e,t)=>{Ee(t,"encrypted",async a=>{try{let i=a.initDataType;if(i!=="skd"){console.error(`Received unexpected initialization data type "${i}"`);return}if(!t.mediaKeys){let l=await navigator.requestMediaKeySystemAccess("com.apple.fps",[{initDataTypes:[i],videoCapabilities:[{contentType:"application/vnd.apple.mpegurl",robustness:""}],distinctiveIdentifier:"not-allowed",persistentState:"not-allowed",sessionTypes:["temporary"]}]).then(u=>{var p;return(p=e.drmTypeCb)==null||p.call(e,Pn.FAIRPLAY),u}).catch(()=>{let u=M("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),p=new I(u,I.MEDIA_ERR_ENCRYPTED,!0);p.errorCategory=ie.DRM,p.muxCode=N.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM,st(t,p)});if(!l)return;let d=await l.createMediaKeys();try{let u=await c0(ym(e,"fairplay")).catch(p=>{if(p instanceof Response){let m=Ys(p,ie.DRM,e);return console.error("mediaError",m==null?void 0:m.message,m==null?void 0:m.context),m?Promise.reject(m):Promise.reject(new Error("Unexpected error in app cert request"))}return Promise.reject(p)});await d.setServerCertificate(u).catch(()=>{let p=M("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),m=new I(p,I.MEDIA_ERR_ENCRYPTED,!0);return m.errorCategory=ie.DRM,m.muxCode=N.ENCRYPTED_UPDATE_SERVER_CERT_FAILED,Promise.reject(m)})}catch(u){st(t,u);return}await t.setMediaKeys(d)}let r=a.initData;if(r==null){console.error(`Could not start encrypted playback due to missing initData in ${a.type} event`);return}let n=t.mediaKeys.createSession();n.addEventListener("keystatuseschange",()=>{n.keyStatuses.forEach(l=>{let d;if(l==="internal-error"){let u=M("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");d=new I(u,I.MEDIA_ERR_ENCRYPTED,!0),d.errorCategory=ie.DRM,d.muxCode=N.ENCRYPTED_CDM_ERROR}else if(l==="output-restricted"||l==="output-downscaled"){let u=M("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");d=new I(u,I.MEDIA_ERR_ENCRYPTED,!1),d.errorCategory=ie.DRM,d.muxCode=N.ENCRYPTED_OUTPUT_RESTRICTED}d&&st(t,d)})});let s=await Promise.all([n.generateRequest(i,r).catch(()=>{let l=M("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),d=new I(l,I.MEDIA_ERR_ENCRYPTED,!0);d.errorCategory=ie.DRM,d.muxCode=N.ENCRYPTED_GENERATE_REQUEST_FAILED,st(t,d)}),new Promise(l=>{n.addEventListener("message",d=>{l(d.message)},{once:!0})})]).then(([,l])=>l),o=await h0(s,Un(e,"fairplay")).catch(l=>{if(l instanceof Response){let d=Ys(l,ie.DRM,e);return console.error("mediaError",d==null?void 0:d.message,d==null?void 0:d.context),d?Promise.reject(d):Promise.reject(new Error("Unexpected error in license key request"))}return Promise.reject(l)});await n.update(o).catch(()=>{let l=M("Failed to update DRM license. This may be an issue with the player or your protected content."),d=new I(l,I.MEDIA_ERR_ENCRYPTED,!0);return d.errorCategory=ie.DRM,d.muxCode=N.ENCRYPTED_UPDATE_LICENSE_FAILED,Promise.reject(d)})}catch(i){st(t,i);return}})},Un=({playbackId:e,tokens:{drm:t}={},customDomain:a=ra},i)=>{let r=Eo(e);return`https://license.${a.toLocaleLowerCase().endsWith(ra)?a:ra}/license/${i}/${r}?token=${t}`},ym=({playbackId:e,tokens:{drm:t}={},customDomain:a=ra},i)=>{let r=Eo(e);return`https://license.${a.toLocaleLowerCase().endsWith(ra)?a:ra}/appcert/${i}/${r}?token=${t}`},Tm=({playbackId:e,src:t,customDomain:a})=>{if(e)return!0;if(typeof t!="string")return!1;let i=window==null?void 0:window.location.href,r=new URL(t,i).hostname.toLocaleLowerCase();return r.includes(ra)||!!a&&r.includes(a.toLocaleLowerCase())},p0=(e,t,a)=>{var i;let{envKey:r,disableTracking:n,muxDataSDK:s=wd,muxDataSDKOptions:o={}}=e,l=Tm(e);if(!n&&(r||l)){let{playerInitTime:d,playerSoftwareName:u,playerSoftwareVersion:p,beaconCollectionDomain:m,debug:h,disableCookies:v}=e,_={...e.metadata,video_title:((i=e==null?void 0:e.metadata)==null?void 0:i.video_title)||void 0},b=y=>typeof y.player_error_code=="string"?!1:typeof e.errorTranslator=="function"?e.errorTranslator(y):y;s.monitor(t,{debug:h,beaconCollectionDomain:m,hlsjs:a,Hls:a?V:void 0,automaticErrorTracking:!1,errorTranslator:b,disableCookies:v,...o,data:{...r?{env_key:r}:{},player_software_name:u,player_software:u,player_software_version:p,player_init_time:d,..._}})}},v0=(e,t,a)=>{var i,r;let n=_m(e,t),{src:s,customDomain:o=ra}=e,l=()=>{t.ended||!bm(t,a)||(fm(t,a)?t.currentTime=t.buffered.end(t.buffered.length-1):t.dispatchEvent(new Event("ended")))},d,u,p=()=>{let m=Nd(t),h,v;m.length>0&&(h=m.start(0),v=m.end(0)),(u!==v||d!==h)&&t.dispatchEvent(new CustomEvent("seekablechange",{composed:!0})),d=h,u=v};if(Ee(t,"durationchange",p),t&&n){let m=vo(e);if(typeof s=="string"){if(s.endsWith(".mp4")&&s.includes(o)){let _=Od(s),b=new URL(`https://stream.${o}/${_}/metadata.json`);Ld(b.toString(),t)}let h=()=>{if(pl(t)!==Q.LIVE||Number.isFinite(t.duration))return;let _=setInterval(p,1e3);t.addEventListener("teardown",()=>{clearInterval(_)},{once:!0}),Ee(t,"durationchange",()=>{Number.isFinite(t.duration)&&clearInterval(_)})},v=async()=>Gb(s,t,m).then(h).catch(_=>{if(_ instanceof Response){let b=Ys(_,ie.VIDEO,e);if(b){st(t,b);return}}});if(t.preload==="none"){let _=()=>{v(),t.removeEventListener("loadedmetadata",b)},b=()=>{v(),t.removeEventListener("play",_)};Ee(t,"play",_,{once:!0}),Ee(t,"loadedmetadata",b,{once:!0})}else v();(i=e.tokens)!=null&&i.drm?m0(e,t):Ee(t,"encrypted",()=>{let _=M("Attempting to play DRM-protected content without providing a DRM token."),b=new I(_,I.MEDIA_ERR_ENCRYPTED,!0);b.errorCategory=ie.DRM,b.muxCode=N.ENCRYPTED_MISSING_TOKEN,st(t,b)},{once:!0}),t.setAttribute("src",s),e.startTime&&(((r=ue.get(t))!=null?r:{}).startTime=e.startTime,t.addEventListener("durationchange",Am,{once:!0}))}else t.removeAttribute("src");t.addEventListener("error",km),t.addEventListener("error",vl),t.addEventListener("emptied",()=>{t.querySelectorAll("track[data-removeondestroy]").forEach(h=>{h.remove()})},{once:!0}),Ee(t,"pause",l),Ee(t,"seeked",l),Ee(t,"play",()=>{t.ended||Em(t.currentTime,t.duration)&&(t.currentTime=t.seekable.length?t.seekable.start(0):0)})}else a&&s?(a.once(V.Events.LEVEL_LOADED,(m,h)=>{Qb(h.details,t,a),p(),pl(t)===Q.LIVE&&!Number.isFinite(t.duration)&&(a.on(V.Events.LEVEL_UPDATED,p),Ee(t,"durationchange",()=>{Number.isFinite(t.duration)&&a.off(V.Events.LEVELS_UPDATED,p)}))}),a.on(V.Events.ERROR,(m,h)=>{var v,_;let b=E0(h,e);if(b.muxCode===N.NETWORK_NOT_READY){let y=(v=ue.get(t))!=null?v:{},T=(_=y.retryCount)!=null?_:0;if(T<6){let E=T===0?5e3:6e4,S=new I(`Retrying in ${E/1e3} seconds...`,b.code,b.fatal);Object.assign(S,b),st(t,S),setTimeout(()=>{y.retryCount=T+1,h.details==="manifestLoadError"&&h.url&&a.loadSource(h.url)},E);return}else{y.retryCount=0;let E=new I('Try again later or <a href="#" onclick="window.location.reload(); return false;" style="color: #4a90e2;">click here to retry</a>',b.code,b.fatal);Object.assign(E,b),st(t,E);return}}st(t,b)}),a.on(V.Events.MANIFEST_LOADED,()=>{let m=ue.get(t);m&&m.error&&(m.error=null,m.retryCount=0,t.dispatchEvent(new Event("emptied")),t.dispatchEvent(new Event("loadstart")))}),t.addEventListener("error",vl),Ee(t,"waiting",l),Ib(e,a),Rb(t,a),a.attachMedia(t)):console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.")};function Am(e){var t;let a=e.target,i=(t=ue.get(a))==null?void 0:t.startTime;if(i&&vb(a.seekable,a.duration,i)){let r=a.preload==="auto";r&&(a.preload="none"),a.currentTime=i,r&&(a.preload="auto")}}async function km(e){if(!e.isTrusted)return;e.stopImmediatePropagation();let t=e.target;if(!(t!=null&&t.error))return;let{message:a,code:i}=t.error,r=new I(a,i);if(t.src&&i===I.MEDIA_ERR_SRC_NOT_SUPPORTED&&t.readyState===HTMLMediaElement.HAVE_NOTHING){setTimeout(()=>{var n;let s=(n=vm(t))!=null?n:t.error;(s==null?void 0:s.code)===I.MEDIA_ERR_SRC_NOT_SUPPORTED&&st(t,r)},500);return}if(t.src&&(i!==I.MEDIA_ERR_DECODE||i!==void 0))try{let{status:n}=await fetch(t.src);r.data={response:{code:n}}}catch{}st(t,r)}function st(e,t){var a;t.fatal&&(((a=ue.get(e))!=null?a:{}).error=t,e.dispatchEvent(new CustomEvent("error",{detail:t})))}function vl(e){var t,a;if(!(e instanceof CustomEvent)||!(e.detail instanceof I))return;let i=e.target,r=e.detail;!r||!r.fatal||(((t=ue.get(i))!=null?t:{}).error=r,(a=i.mux)==null||a.emit("error",{player_error_code:r.code,player_error_message:r.message,player_error_context:r.context}))}var E0=(e,t)=>{var a,i,r;console.error("getErrorFromHlsErrorData()",e);let n={[V.ErrorTypes.NETWORK_ERROR]:I.MEDIA_ERR_NETWORK,[V.ErrorTypes.MEDIA_ERROR]:I.MEDIA_ERR_DECODE,[V.ErrorTypes.KEY_SYSTEM_ERROR]:I.MEDIA_ERR_ENCRYPTED},s=u=>[V.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED,V.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(u.details)?I.MEDIA_ERR_NETWORK:n[u.type],o=u=>{if(u.type===V.ErrorTypes.KEY_SYSTEM_ERROR)return ie.DRM;if(u.type===V.ErrorTypes.NETWORK_ERROR)return ie.VIDEO},l,d=s(e);if(d===I.MEDIA_ERR_NETWORK&&e.response){let u=(a=o(e))!=null?a:ie.VIDEO;l=(i=Ys(e.response,u,t,e.fatal))!=null?i:new I("",d,e.fatal)}else if(d===I.MEDIA_ERR_ENCRYPTED)if(e.details===V.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE){let u=M("Attempting to play DRM-protected content without providing a DRM token.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_MISSING_TOKEN}else if(e.details===V.ErrorDetails.KEY_SYSTEM_NO_ACCESS){let u=M("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM}else if(e.details===V.ErrorDetails.KEY_SYSTEM_NO_SESSION){let u=M("Failed to generate a DRM license request. This may be an issue with the player or your protected content.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,!0),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_GENERATE_REQUEST_FAILED}else if(e.details===V.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED){let u=M("Failed to update DRM license. This may be an issue with the player or your protected content.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_UPDATE_LICENSE_FAILED}else if(e.details===V.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED){let u=M("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_UPDATE_SERVER_CERT_FAILED}else if(e.details===V.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR){let u=M("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_CDM_ERROR}else if(e.details===V.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED){let u=M("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");l=new I(u,I.MEDIA_ERR_ENCRYPTED,!1),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_OUTPUT_RESTRICTED}else l=new I(e.error.message,I.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=ie.DRM,l.muxCode=N.ENCRYPTED_ERROR;else l=new I("",d,e.fatal);return l.context||(l.context=`${e.url?`url: ${e.url}
`:""}${e.response&&(e.response.code||e.response.text)?`response: ${e.response.code}, ${e.response.text}
`:""}${e.reason?`failure reason: ${e.reason}
`:""}${e.level?`level: ${e.level}
`:""}${e.parent?`parent stream controller: ${e.parent}
`:""}${e.buffer?`buffer length: ${e.buffer}
`:""}${e.error?`error: ${e.error}
`:""}${e.event?`event: ${e.event}
`:""}${e.err?`error message: ${(r=e.err)==null?void 0:r.message}
`:""}`),l.data=e,l},wm=e=>{throw TypeError(e)},Pd=(e,t,a)=>t.has(e)||wm("Cannot "+a),Le=(e,t,a)=>(Pd(e,t,"read from private field"),a?a.call(e):t.get(e)),ct=(e,t,a)=>t.has(e)?wm("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),it=(e,t,a,i)=>(Pd(e,t,"write to private field"),t.set(e,a),a),Wo=(e,t,a)=>(Pd(e,t,"access private method"),a),f0=()=>{try{return"0.26.1"}catch{}return"UNKNOWN"},b0=f0(),g0=()=>b0,_0=`
<svg xmlns="https://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`,g={BEACON_COLLECTION_DOMAIN:"beacon-collection-domain",CUSTOM_DOMAIN:"custom-domain",DEBUG:"debug",DISABLE_TRACKING:"disable-tracking",DISABLE_COOKIES:"disable-cookies",DRM_TOKEN:"drm-token",PLAYBACK_TOKEN:"playback-token",ENV_KEY:"env-key",MAX_RESOLUTION:"max-resolution",MIN_RESOLUTION:"min-resolution",RENDITION_ORDER:"rendition-order",PROGRAM_START_TIME:"program-start-time",PROGRAM_END_TIME:"program-end-time",ASSET_START_TIME:"asset-start-time",ASSET_END_TIME:"asset-end-time",METADATA_URL:"metadata-url",PLAYBACK_ID:"playback-id",PLAYER_SOFTWARE_NAME:"player-software-name",PLAYER_SOFTWARE_VERSION:"player-software-version",PLAYER_INIT_TIME:"player-init-time",PREFER_CMCD:"prefer-cmcd",PREFER_PLAYBACK:"prefer-playback",START_TIME:"start-time",STREAM_TYPE:"stream-type",TARGET_LIVE_WINDOW:"target-live-window",LIVE_EDGE_OFFSET:"live-edge-offset",TYPE:"type",LOGO:"logo"},y0=Object.values(g),bc=g0(),gc="mux-video",Rt,yr,Bn,Tr,Hn,Wn,Vn,Fn,$n,Ar,kr,Kn,T0=class extends bn{constructor(){super(),ct(this,kr),ct(this,Rt),ct(this,yr),ct(this,Bn),ct(this,Tr,{}),ct(this,Hn,{}),ct(this,Wn),ct(this,Vn),ct(this,Fn),ct(this,$n),ct(this,Ar,""),it(this,Bn,Md()),this.nativeEl.addEventListener("muxmetadata",e=>{var t;let a=a0(this.nativeEl),i=(t=this.metadata)!=null?t:{};this.metadata={...a,...i},(a==null?void 0:a["com.mux.video.branding"])==="mux-free-plan"&&(it(this,Ar,"default"),this.updateLogo())})}static get NAME(){return gc}static get VERSION(){return bc}static get observedAttributes(){var e;return[...y0,...(e=bn.observedAttributes)!=null?e:[]]}static getLogoHTML(e){return!e||e==="false"?"":e==="default"?_0:`<img part="logo" src="${e}" />`}static getTemplateHTML(e={}){var t;return`
      ${bn.getTemplateHTML(e)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML((t=e[g.LOGO])!=null?t:"")}
      </slot>
    `}get preferCmcd(){var e;return(e=this.getAttribute(g.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?qs.includes(e)?this.setAttribute(g.PREFER_CMCD,e):console.warn(`Invalid value for preferCmcd. Must be one of ${qs.join()}`):this.removeAttribute(g.PREFER_CMCD))}get playerInitTime(){return this.hasAttribute(g.PLAYER_INIT_TIME)?+this.getAttribute(g.PLAYER_INIT_TIME):Le(this,Bn)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(g.PLAYER_INIT_TIME):this.setAttribute(g.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=Le(this,Fn))!=null?e:gc}set playerSoftwareName(e){it(this,Fn,e)}get playerSoftwareVersion(){var e;return(e=Le(this,Vn))!=null?e:bc}set playerSoftwareVersion(e){it(this,Vn,e)}get _hls(){var e;return(e=Le(this,Rt))==null?void 0:e.engine}get mux(){var e;return(e=this.nativeEl)==null?void 0:e.mux}get error(){var e;return(e=vm(this.nativeEl))!=null?e:null}get errorTranslator(){return Le(this,$n)}set errorTranslator(e){it(this,$n,e)}get src(){return this.getAttribute("src")}set src(e){e!==this.src&&(e==null?this.removeAttribute("src"):this.setAttribute("src",e))}get type(){var e;return(e=this.getAttribute(g.TYPE))!=null?e:void 0}set type(e){e!==this.type&&(e?this.setAttribute(g.TYPE,e):this.removeAttribute(g.TYPE))}get preload(){let e=this.getAttribute("preload");return e===""?"auto":["none","metadata","auto"].includes(e)?e:super.preload}set preload(e){e!=this.getAttribute("preload")&&(["","none","metadata","auto"].includes(e)?this.setAttribute("preload",e):this.removeAttribute("preload"))}get debug(){return this.getAttribute(g.DEBUG)!=null}set debug(e){e!==this.debug&&(e?this.setAttribute(g.DEBUG,""):this.removeAttribute(g.DEBUG))}get disableTracking(){return this.hasAttribute(g.DISABLE_TRACKING)}set disableTracking(e){e!==this.disableTracking&&this.toggleAttribute(g.DISABLE_TRACKING,!!e)}get disableCookies(){return this.hasAttribute(g.DISABLE_COOKIES)}set disableCookies(e){e!==this.disableCookies&&(e?this.setAttribute(g.DISABLE_COOKIES,""):this.removeAttribute(g.DISABLE_COOKIES))}get startTime(){let e=this.getAttribute(g.START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set startTime(e){e!==this.startTime&&(e==null?this.removeAttribute(g.START_TIME):this.setAttribute(g.START_TIME,`${e}`))}get playbackId(){var e;return this.hasAttribute(g.PLAYBACK_ID)?this.getAttribute(g.PLAYBACK_ID):(e=Od(this.src))!=null?e:void 0}set playbackId(e){e!==this.playbackId&&(e?this.setAttribute(g.PLAYBACK_ID,e):this.removeAttribute(g.PLAYBACK_ID))}get maxResolution(){var e;return(e=this.getAttribute(g.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(g.MAX_RESOLUTION,e):this.removeAttribute(g.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(g.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(g.MIN_RESOLUTION,e):this.removeAttribute(g.MIN_RESOLUTION))}get renditionOrder(){var e;return(e=this.getAttribute(g.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(g.RENDITION_ORDER,e):this.removeAttribute(g.RENDITION_ORDER))}get programStartTime(){let e=this.getAttribute(g.PROGRAM_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programStartTime(e){e==null?this.removeAttribute(g.PROGRAM_START_TIME):this.setAttribute(g.PROGRAM_START_TIME,`${e}`)}get programEndTime(){let e=this.getAttribute(g.PROGRAM_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programEndTime(e){e==null?this.removeAttribute(g.PROGRAM_END_TIME):this.setAttribute(g.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){let e=this.getAttribute(g.ASSET_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetStartTime(e){e==null?this.removeAttribute(g.ASSET_START_TIME):this.setAttribute(g.ASSET_START_TIME,`${e}`)}get assetEndTime(){let e=this.getAttribute(g.ASSET_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetEndTime(e){e==null?this.removeAttribute(g.ASSET_END_TIME):this.setAttribute(g.ASSET_END_TIME,`${e}`)}get customDomain(){var e;return(e=this.getAttribute(g.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(g.CUSTOM_DOMAIN,e):this.removeAttribute(g.CUSTOM_DOMAIN))}get drmToken(){var e;return(e=this.getAttribute(g.DRM_TOKEN))!=null?e:void 0}set drmToken(e){e!==this.drmToken&&(e?this.setAttribute(g.DRM_TOKEN,e):this.removeAttribute(g.DRM_TOKEN))}get playbackToken(){var e,t,a,i;if(this.hasAttribute(g.PLAYBACK_TOKEN))return(e=this.getAttribute(g.PLAYBACK_TOKEN))!=null?e:void 0;if(this.hasAttribute(g.PLAYBACK_ID)){let[,r]=Id((t=this.playbackId)!=null?t:"");return(a=new URLSearchParams(r).get("token"))!=null?a:void 0}if(this.src)return(i=new URLSearchParams(this.src).get("token"))!=null?i:void 0}set playbackToken(e){e!==this.playbackToken&&(e?this.setAttribute(g.PLAYBACK_TOKEN,e):this.removeAttribute(g.PLAYBACK_TOKEN))}get tokens(){let e=this.getAttribute(g.PLAYBACK_TOKEN),t=this.getAttribute(g.DRM_TOKEN);return{...Le(this,Hn),...e!=null?{playback:e}:{},...t!=null?{drm:t}:{}}}set tokens(e){it(this,Hn,e??{})}get ended(){return bm(this.nativeEl,this._hls)}get envKey(){var e;return(e=this.getAttribute(g.ENV_KEY))!=null?e:void 0}set envKey(e){e!==this.envKey&&(e?this.setAttribute(g.ENV_KEY,e):this.removeAttribute(g.ENV_KEY))}get beaconCollectionDomain(){var e;return(e=this.getAttribute(g.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(g.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(g.BEACON_COLLECTION_DOMAIN))}get streamType(){var e;return(e=this.getAttribute(g.STREAM_TYPE))!=null?e:pl(this.nativeEl)}set streamType(e){e!==this.streamType&&(e?this.setAttribute(g.STREAM_TYPE,e):this.removeAttribute(g.STREAM_TYPE))}get targetLiveWindow(){return this.hasAttribute(g.TARGET_LIVE_WINDOW)?+this.getAttribute(g.TARGET_LIVE_WINDOW):i0(this.nativeEl)}set targetLiveWindow(e){e!=this.targetLiveWindow&&(e==null?this.removeAttribute(g.TARGET_LIVE_WINDOW):this.setAttribute(g.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e,t;if(this.hasAttribute(g.LIVE_EDGE_OFFSET)){let{liveEdgeOffset:a}=this,i=(e=this.nativeEl.seekable.end(0))!=null?e:0,r=(t=this.nativeEl.seekable.start(0))!=null?t:0;return Math.max(r,i-a)}return r0(this.nativeEl)}get liveEdgeOffset(){if(this.hasAttribute(g.LIVE_EDGE_OFFSET))return+this.getAttribute(g.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){e!=this.liveEdgeOffset&&(e==null?this.removeAttribute(g.LIVE_EDGE_OFFSET):this.setAttribute(g.LIVE_EDGE_OFFSET,`${+e}`))}get seekable(){return Nd(this.nativeEl)}async addCuePoints(e){return om(this.nativeEl,e)}get activeCuePoint(){return lm(this.nativeEl)}get cuePoints(){return Cb(this.nativeEl)}async addChapters(e){return um(this.nativeEl,e)}get activeChapter(){return cm(this.nativeEl)}get chapters(){return Mb(this.nativeEl)}getStartDate(){return Nb(this.nativeEl,this._hls)}get currentPdt(){return xb(this.nativeEl,this._hls)}get preferPlayback(){let e=this.getAttribute(g.PREFER_PLAYBACK);if(e===Ft.MSE||e===Ft.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===Ft.MSE||e===Ft.NATIVE?this.setAttribute(g.PREFER_PLAYBACK,e):this.removeAttribute(g.PREFER_PLAYBACK))}get metadata(){return{...this.getAttributeNames().filter(e=>e.startsWith("metadata-")&&![g.METADATA_URL].includes(e)).reduce((e,t)=>{let a=this.getAttribute(t);return a!=null&&(e[t.replace(/^metadata-/,"").replace(/-/g,"_")]=a),e},{}),...Le(this,Tr)}}set metadata(e){it(this,Tr,e??{}),this.mux&&this.mux.emit("hb",Le(this,Tr))}get _hlsConfig(){return Le(this,Wn)}set _hlsConfig(e){it(this,Wn,e)}get logo(){var e;return(e=this.getAttribute(g.LOGO))!=null?e:Le(this,Ar)}set logo(e){e?this.setAttribute(g.LOGO,e):this.removeAttribute(g.LOGO)}load(){it(this,Rt,o0(this,this.nativeEl,Le(this,Rt)))}unload(){gm(this.nativeEl,Le(this,Rt),this),it(this,Rt,void 0)}attributeChangedCallback(e,t,a){var i,r;switch(bn.observedAttributes.includes(e)&&!["src","autoplay","preload"].includes(e)&&super.attributeChangedCallback(e,t,a),e){case g.PLAYER_SOFTWARE_NAME:this.playerSoftwareName=a??void 0;break;case g.PLAYER_SOFTWARE_VERSION:this.playerSoftwareVersion=a??void 0;break;case"src":{let n=!!t,s=!!a;!n&&s?Wo(this,kr,Kn).call(this):n&&!s?this.unload():n&&s&&(this.unload(),Wo(this,kr,Kn).call(this));break}case"autoplay":if(a===t)break;(i=Le(this,Rt))==null||i.setAutoplay(this.autoplay);break;case"preload":if(a===t)break;(r=Le(this,Rt))==null||r.setPreload(a);break;case g.PLAYBACK_ID:this.src=ml(this);break;case g.DEBUG:{let n=this.debug;this.mux&&console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."),this._hls&&(this._hls.config.debug=n);break}case g.METADATA_URL:a&&fetch(a).then(n=>n.json()).then(n=>this.metadata=n).catch(()=>console.error(`Unable to load or parse metadata JSON from metadata-url ${a}!`));break;case g.STREAM_TYPE:(a==null||a!==t)&&this.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}));break;case g.TARGET_LIVE_WINDOW:(a==null||a!==t)&&this.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0,detail:this.targetLiveWindow}));break;case g.LOGO:(a==null||a!==t)&&this.updateLogo();break}}updateLogo(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector('slot[name="logo"]');if(!e)return;let t=this.constructor.getLogoHTML(Le(this,Ar)||this.logo);e.innerHTML=t}connectedCallback(){var e;(e=super.connectedCallback)==null||e.call(this),this.nativeEl&&this.src&&!Le(this,Rt)&&Wo(this,kr,Kn).call(this)}disconnectedCallback(){this.unload()}handleEvent(e){e.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(e.type,{composed:!0,detail:e.detail}))}};Rt=new WeakMap,yr=new WeakMap,Bn=new WeakMap,Tr=new WeakMap,Hn=new WeakMap,Wn=new WeakMap,Vn=new WeakMap,Fn=new WeakMap,$n=new WeakMap,Ar=new WeakMap,kr=new WeakSet,Kn=async function(){Le(this,yr)||(await it(this,yr,Promise.resolve()),it(this,yr,null),this.load())};const Xa=new WeakMap;class Vo extends Error{}class A0 extends Error{}const k0=["application/x-mpegURL","application/vnd.apple.mpegurl","audio/mpegurl"],w0=globalThis.WeakRef?class extends Set{add(e){super.add(new WeakRef(e))}forEach(e){super.forEach(t=>{const a=t.deref();a&&e(a)})}}:Set;function S0(e){var t,a,i;(a=(t=globalThis.chrome)==null?void 0:t.cast)!=null&&a.isAvailable?(i=globalThis.cast)!=null&&i.framework?e():customElements.whenDefined("google-cast-button").then(e):globalThis.__onGCastApiAvailable=()=>{customElements.whenDefined("google-cast-button").then(e)}}function I0(){return globalThis.chrome}function R0(){var e;const t="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";if((e=globalThis.chrome)!=null&&e.cast||document.querySelector(`script[src="${t}"]`))return;const a=document.createElement("script");a.src=t,document.head.append(a)}function Sa(){var e,t;return(t=(e=globalThis.cast)==null?void 0:e.framework)==null?void 0:t.CastContext.getInstance()}function Ud(){var e;return(e=Sa())==null?void 0:e.getCurrentSession()}function Bd(){var e;return(e=Ud())==null?void 0:e.getSessionObj().media[0]}function D0(e){return new Promise((t,a)=>{Bd().editTracksInfo(e,t,a)})}function C0(e){return new Promise((t,a)=>{Bd().getStatus(e,t,a)})}function Sm(e){return Sa().setOptions({...Im(),...e})}function Im(){return{receiverApplicationId:"CC1AD845",autoJoinPolicy:"origin_scoped",androidReceiverCompatible:!1,language:"en-US",resumeSavedSession:!0}}function L0(e){if(!e)return;const t=/\.([a-zA-Z0-9]+)(?:\?.*)?$/,a=e.match(t);return a?a[1]:null}function M0(e){const t=e.split(`
`),a=[];for(let i=0;i<t.length;i++)if(t[i].trim().startsWith("#EXT-X-STREAM-INF")){const r=t[i+1]?t[i+1].trim():"";r&&!r.startsWith("#")&&a.push(r)}return a}function O0(e){return e.split(`
`).find(t=>!t.trim().startsWith("#")&&t.trim()!=="")}async function N0(e){try{const t=(await fetch(e,{method:"HEAD"})).headers.get("Content-Type");return k0.some(a=>t===a)}catch(t){return console.error("Error while trying to get the Content-Type of the manifest",t),!1}}async function x0(e){try{const t=await(await fetch(e)).text();let a=t;const i=M0(t);if(i.length>0){const n=new URL(i[0],e).toString();a=await(await fetch(n)).text()}const r=O0(a);return L0(r)}catch(t){console.error("Error while trying to parse the manifest playlist",t);return}}const qn=new w0,Ta=new WeakSet;let _e;S0(()=>{var e,t,a,i;if(!((t=(e=globalThis.chrome)==null?void 0:e.cast)!=null&&t.isAvailable)){console.debug("chrome.cast.isAvailable",(i=(a=globalThis.chrome)==null?void 0:a.cast)==null?void 0:i.isAvailable);return}_e||(_e=cast.framework,Sa().addEventListener(_e.CastContextEventType.CAST_STATE_CHANGED,r=>{qn.forEach(n=>{var s,o;return(o=(s=Xa.get(n)).onCastStateChanged)==null?void 0:o.call(s,r)})}),Sa().addEventListener(_e.CastContextEventType.SESSION_STATE_CHANGED,r=>{qn.forEach(n=>{var s,o;return(o=(s=Xa.get(n)).onSessionStateChanged)==null?void 0:o.call(s,r)})}),qn.forEach(r=>{var n,s;return(s=(n=Xa.get(r)).init)==null?void 0:s.call(n)}))});let _c=0;var j,Yn,rt,_a,Ni,Ei,Ya,El,Re,Na,yc,Rm,fl,Dm,bl,Tc,Fo;class P0 extends EventTarget{constructor(t){super(),Ve(this,Re),Ve(this,j),Ve(this,Yn),Ve(this,rt),Ve(this,_a),Ve(this,Ni,"disconnected"),Ve(this,Ei,!1),Ve(this,Ya,new Set),Ve(this,El,new WeakMap),Et(this,j,t),qn.add(this),Xa.set(this,{init:()=>_t(this,Re,bl).call(this),onCastStateChanged:()=>_t(this,Re,fl).call(this),onSessionStateChanged:()=>_t(this,Re,Dm).call(this),getCastPlayer:()=>k(this,Re,Na)}),_t(this,Re,bl).call(this)}get state(){return k(this,Ni)}async watchAvailability(t){if(k(this,j).disableRemotePlayback)throw new Vo("disableRemotePlayback attribute is present.");return k(this,El).set(t,++_c),k(this,Ya).add(t),queueMicrotask(()=>t(_t(this,Re,Rm).call(this))),_c}async cancelWatchAvailability(t){if(k(this,j).disableRemotePlayback)throw new Vo("disableRemotePlayback attribute is present.");t?k(this,Ya).delete(t):k(this,Ya).clear()}async prompt(){var t,a,i,r;if(k(this,j).disableRemotePlayback)throw new Vo("disableRemotePlayback attribute is present.");if(!((a=(t=globalThis.chrome)==null?void 0:t.cast)!=null&&a.isAvailable))throw new A0("The RemotePlayback API is disabled on this platform.");const n=Ta.has(k(this,j));Ta.add(k(this,j)),Sm(k(this,j).castOptions),Object.entries(k(this,_a)).forEach(([s,o])=>{k(this,rt).controller.addEventListener(s,o)});try{await Sa().requestSession()}catch(s){if(n||Ta.delete(k(this,j)),s==="cancel")return;throw new Error(s)}(r=(i=Xa.get(k(this,j)))==null?void 0:i.loadOnPrompt)==null||r.call(i)}}j=new WeakMap,Yn=new WeakMap,rt=new WeakMap,_a=new WeakMap,Ni=new WeakMap,Ei=new WeakMap,Ya=new WeakMap,El=new WeakMap,Re=new WeakSet,Na=function(){if(Ta.has(k(this,j)))return k(this,rt)},yc=function(){Ta.has(k(this,j))&&(Object.entries(k(this,_a)).forEach(([e,t])=>{k(this,rt).controller.removeEventListener(e,t)}),Ta.delete(k(this,j)),k(this,j).muted=k(this,rt).isMuted,k(this,j).currentTime=k(this,rt).savedPlayerState.currentTime,k(this,rt).savedPlayerState.isPaused===!1&&k(this,j).play())},Rm=function(){var e;const t=(e=Sa())==null?void 0:e.getCastState();return t&&t!=="NO_DEVICES_AVAILABLE"},fl=function(){const e=Sa().getCastState();if(Ta.has(k(this,j))&&e==="CONNECTING"&&(Et(this,Ni,"connecting"),this.dispatchEvent(new Event("connecting"))),!k(this,Ei)&&e!=null&&e.includes("CONNECT")){Et(this,Ei,!0);for(let t of k(this,Ya))t(!0)}else if(k(this,Ei)&&(!e||e==="NO_DEVICES_AVAILABLE")){Et(this,Ei,!1);for(let t of k(this,Ya))t(!1)}},Dm=async function(){var e;const{SESSION_RESUMED:t}=_e.SessionState;if(Sa().getSessionState()===t&&k(this,j).castSrc===((e=Bd())==null?void 0:e.media.contentId)){Ta.add(k(this,j)),Object.entries(k(this,_a)).forEach(([a,i])=>{k(this,rt).controller.addEventListener(a,i)});try{await C0(new chrome.cast.media.GetStatusRequest)}catch(a){console.error(a)}k(this,_a)[_e.RemotePlayerEventType.IS_PAUSED_CHANGED](),k(this,_a)[_e.RemotePlayerEventType.PLAYER_STATE_CHANGED]()}},bl=function(){!_e||k(this,Yn)||(Et(this,Yn,!0),Sm(k(this,j).castOptions),k(this,j).textTracks.addEventListener("change",()=>_t(this,Re,Fo).call(this)),_t(this,Re,fl).call(this),Et(this,rt,new _e.RemotePlayer),new _e.RemotePlayerController(k(this,rt)),Et(this,_a,{[_e.RemotePlayerEventType.IS_CONNECTED_CHANGED]:({value:e})=>{e===!0?(Et(this,Ni,"connected"),this.dispatchEvent(new Event("connect"))):(_t(this,Re,yc).call(this),Et(this,Ni,"disconnected"),this.dispatchEvent(new Event("disconnect")))},[_e.RemotePlayerEventType.DURATION_CHANGED]:()=>{k(this,j).dispatchEvent(new Event("durationchange"))},[_e.RemotePlayerEventType.VOLUME_LEVEL_CHANGED]:()=>{k(this,j).dispatchEvent(new Event("volumechange"))},[_e.RemotePlayerEventType.IS_MUTED_CHANGED]:()=>{k(this,j).dispatchEvent(new Event("volumechange"))},[_e.RemotePlayerEventType.CURRENT_TIME_CHANGED]:()=>{var e;(e=k(this,Re,Na))!=null&&e.isMediaLoaded&&k(this,j).dispatchEvent(new Event("timeupdate"))},[_e.RemotePlayerEventType.VIDEO_INFO_CHANGED]:()=>{k(this,j).dispatchEvent(new Event("resize"))},[_e.RemotePlayerEventType.IS_PAUSED_CHANGED]:()=>{k(this,j).dispatchEvent(new Event(this.paused?"pause":"play"))},[_e.RemotePlayerEventType.PLAYER_STATE_CHANGED]:()=>{var e,t;((e=k(this,Re,Na))==null?void 0:e.playerState)!==chrome.cast.media.PlayerState.PAUSED&&k(this,j).dispatchEvent(new Event({[chrome.cast.media.PlayerState.PLAYING]:"playing",[chrome.cast.media.PlayerState.BUFFERING]:"waiting",[chrome.cast.media.PlayerState.IDLE]:"emptied"}[(t=k(this,Re,Na))==null?void 0:t.playerState]))},[_e.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED]:async()=>{var e;(e=k(this,Re,Na))!=null&&e.isMediaLoaded&&(await Promise.resolve(),_t(this,Re,Tc).call(this))}}))},Tc=function(){_t(this,Re,Fo).call(this)},Fo=async function(){var e,t,a;if(!k(this,Re,Na))return;const i=(((e=k(this,rt).mediaInfo)==null?void 0:e.tracks)??[]).filter(({type:u})=>u===chrome.cast.media.TrackType.TEXT),r=[...k(this,j).textTracks].filter(({kind:u})=>u==="subtitles"||u==="captions"),n=i.map(({language:u,name:p,trackId:m})=>{const{mode:h}=r.find(v=>v.language===u&&v.label===p)??{};return h?{mode:h,trackId:m}:!1}).filter(Boolean),s=n.filter(({mode:u})=>u!=="showing").map(({trackId:u})=>u),o=n.find(({mode:u})=>u==="showing"),l=((a=(t=Ud())==null?void 0:t.getSessionObj().media[0])==null?void 0:a.activeTrackIds)??[];let d=l;if(l.length&&(d=d.filter(u=>!s.includes(u))),o!=null&&o.trackId&&(d=[...d,o.trackId]),d=[...new Set(d)],!((u,p)=>u.length===p.length&&u.every(m=>p.includes(m)))(l,d))try{const u=new chrome.cast.media.EditTracksInfoRequest(d);await D0(u)}catch(u){console.error(u)}};const U0=e=>{var t,a,i,r,n,s,o,l;return t=class extends e{constructor(){super(...arguments),Ve(this,s),Ve(this,a,{paused:!1}),Ve(this,i,Im()),Ve(this,r),Ve(this,n)}get remote(){return k(this,n)?k(this,n):I0()?(this.disableRemotePlayback||R0(),Xa.set(this,{loadOnPrompt:()=>_t(this,s,l).call(this)}),Et(this,n,new P0(this))):super.remote}attributeChangedCallback(d,u,p){if(super.attributeChangedCallback(d,u,p),d==="cast-receiver"&&p){k(this,i).receiverApplicationId=p;return}if(k(this,s,o))switch(d){case"cast-stream-type":case"cast-src":this.load();break}}async load(){var d;if(!k(this,s,o))return super.load();const u=new chrome.cast.media.MediaInfo(this.castSrc,this.castContentType);u.customData=this.castCustomData;const p=[...this.querySelectorAll("track")].filter(({kind:_,src:b})=>b&&(_==="subtitles"||_==="captions")),m=[];let h=0;if(p.length&&(u.tracks=p.map(_=>{const b=++h;m.length===0&&_.track.mode==="showing"&&m.push(b);const y=new chrome.cast.media.Track(b,chrome.cast.media.TrackType.TEXT);return y.trackContentId=_.src,y.trackContentType="text/vtt",y.subtype=_.kind==="captions"?chrome.cast.media.TextTrackType.CAPTIONS:chrome.cast.media.TextTrackType.SUBTITLES,y.name=_.label,y.language=_.srclang,y})),this.castStreamType==="live"?u.streamType=chrome.cast.media.StreamType.LIVE:u.streamType=chrome.cast.media.StreamType.BUFFERED,u.metadata=new chrome.cast.media.GenericMediaMetadata,u.metadata.title=this.title,u.metadata.images=[{url:this.poster}],N0(this.castSrc)){const _=await x0(this.castSrc);(_!=null&&_.includes("m4s")||_!=null&&_.includes("mp4"))&&(u.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.FMP4,u.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.FMP4)}const v=new chrome.cast.media.LoadRequest(u);v.currentTime=super.currentTime??0,v.autoplay=!k(this,a).paused,v.activeTrackIds=m,await((d=Ud())==null?void 0:d.loadMedia(v)),this.dispatchEvent(new Event("volumechange"))}play(){var d;if(k(this,s,o)){k(this,s,o).isPaused&&((d=k(this,s,o).controller)==null||d.playOrPause());return}return super.play()}pause(){var d;if(k(this,s,o)){k(this,s,o).isPaused||(d=k(this,s,o).controller)==null||d.playOrPause();return}super.pause()}get castOptions(){return k(this,i)}get castReceiver(){return this.getAttribute("cast-receiver")??void 0}set castReceiver(d){this.castReceiver!=d&&this.setAttribute("cast-receiver",`${d}`)}get castSrc(){var d;return this.getAttribute("cast-src")??((d=this.querySelector("source"))==null?void 0:d.src)??this.currentSrc}set castSrc(d){this.castSrc!=d&&this.setAttribute("cast-src",`${d}`)}get castContentType(){return this.getAttribute("cast-content-type")??void 0}set castContentType(d){this.setAttribute("cast-content-type",`${d}`)}get castStreamType(){return this.getAttribute("cast-stream-type")??this.streamType??void 0}set castStreamType(d){this.setAttribute("cast-stream-type",`${d}`)}get castCustomData(){return k(this,r)}set castCustomData(d){const u=typeof d;if(!["object","undefined"].includes(u)){console.error(`castCustomData must be nullish or an object but value was of type ${u}`);return}Et(this,r,d)}get readyState(){if(k(this,s,o))switch(k(this,s,o).playerState){case chrome.cast.media.PlayerState.IDLE:return 0;case chrome.cast.media.PlayerState.BUFFERING:return 2;default:return 3}return super.readyState}get paused(){return k(this,s,o)?k(this,s,o).isPaused:super.paused}get muted(){var d;return k(this,s,o)?(d=k(this,s,o))==null?void 0:d.isMuted:super.muted}set muted(d){var u;if(k(this,s,o)){(d&&!k(this,s,o).isMuted||!d&&k(this,s,o).isMuted)&&((u=k(this,s,o).controller)==null||u.muteOrUnmute());return}super.muted=d}get volume(){var d;return k(this,s,o)?((d=k(this,s,o))==null?void 0:d.volumeLevel)??1:super.volume}set volume(d){var u;if(k(this,s,o)){k(this,s,o).volumeLevel=+d,(u=k(this,s,o).controller)==null||u.setVolumeLevel();return}super.volume=d}get duration(){var d,u;return k(this,s,o)&&(d=k(this,s,o))!=null&&d.isMediaLoaded?((u=k(this,s,o))==null?void 0:u.duration)??NaN:super.duration}get currentTime(){var d,u;return k(this,s,o)&&(d=k(this,s,o))!=null&&d.isMediaLoaded?((u=k(this,s,o))==null?void 0:u.currentTime)??0:super.currentTime}set currentTime(d){var u;if(k(this,s,o)){k(this,s,o).currentTime=d,(u=k(this,s,o).controller)==null||u.seek();return}super.currentTime=d}},a=new WeakMap,i=new WeakMap,r=new WeakMap,n=new WeakMap,s=new WeakSet,o=function(){var d,u;return(u=(d=Xa.get(this.remote))==null?void 0:d.getCastPlayer)==null?void 0:u.call(d)},l=async function(){k(this,a).paused=Mo(t.prototype,this,"paused"),Mo(t.prototype,this,"pause").call(this),this.muted=Mo(t.prototype,this,"muted");try{await this.load()}catch(d){console.error(d)}},Zv(t,"observedAttributes",[...e.observedAttributes??[],"cast-src","cast-content-type","cast-stream-type","cast-receiver"]),t};var Cm=e=>{throw TypeError(e)},Lm=(e,t,a)=>t.has(e)||Cm("Cannot "+a),B0=(e,t,a)=>(Lm(e,t,"read from private field"),a?a.call(e):t.get(e)),H0=(e,t,a)=>t.has(e)?Cm("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),W0=(e,t,a,i)=>(Lm(e,t,"write to private field"),t.set(e,a),a),Mm=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment>"u"){class e extends Mm{}globalThis.DocumentFragment=e}var V0=class extends Mm{},F0={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(V0)}},$0={customElements:F0},K0=typeof window>"u"||typeof globalThis.customElements>"u",$o=K0?$0:globalThis,Gn,Ac=class extends U0(qv(T0)){constructor(){super(...arguments),H0(this,Gn)}get autoplay(){let e=this.getAttribute("autoplay");return e===null?!1:e===""?!0:e}set autoplay(e){let t=this.autoplay;e!==t&&(e?this.setAttribute("autoplay",typeof e=="string"?e:""):this.removeAttribute("autoplay"))}get muxCastCustomData(){return{mux:{playbackId:this.playbackId,minResolution:this.minResolution,maxResolution:this.maxResolution,renditionOrder:this.renditionOrder,customDomain:this.customDomain,tokens:{drm:this.drmToken},envKey:this.envKey,metadata:this.metadata,disableCookies:this.disableCookies,disableTracking:this.disableTracking,beaconCollectionDomain:this.beaconCollectionDomain,startTime:this.startTime,preferCmcd:this.preferCmcd}}}get castCustomData(){var e;return(e=B0(this,Gn))!=null?e:this.muxCastCustomData}set castCustomData(e){W0(this,Gn,e)}};Gn=new WeakMap;$o.customElements.get("mux-video")||($o.customElements.define("mux-video",Ac),$o.MuxVideoElement=Ac);const D={MEDIA_PLAY_REQUEST:"mediaplayrequest",MEDIA_PAUSE_REQUEST:"mediapauserequest",MEDIA_MUTE_REQUEST:"mediamuterequest",MEDIA_UNMUTE_REQUEST:"mediaunmuterequest",MEDIA_VOLUME_REQUEST:"mediavolumerequest",MEDIA_SEEK_REQUEST:"mediaseekrequest",MEDIA_AIRPLAY_REQUEST:"mediaairplayrequest",MEDIA_ENTER_FULLSCREEN_REQUEST:"mediaenterfullscreenrequest",MEDIA_EXIT_FULLSCREEN_REQUEST:"mediaexitfullscreenrequest",MEDIA_PREVIEW_REQUEST:"mediapreviewrequest",MEDIA_ENTER_PIP_REQUEST:"mediaenterpiprequest",MEDIA_EXIT_PIP_REQUEST:"mediaexitpiprequest",MEDIA_ENTER_CAST_REQUEST:"mediaentercastrequest",MEDIA_EXIT_CAST_REQUEST:"mediaexitcastrequest",MEDIA_SHOW_TEXT_TRACKS_REQUEST:"mediashowtexttracksrequest",MEDIA_HIDE_TEXT_TRACKS_REQUEST:"mediahidetexttracksrequest",MEDIA_SHOW_SUBTITLES_REQUEST:"mediashowsubtitlesrequest",MEDIA_DISABLE_SUBTITLES_REQUEST:"mediadisablesubtitlesrequest",MEDIA_TOGGLE_SUBTITLES_REQUEST:"mediatogglesubtitlesrequest",MEDIA_PLAYBACK_RATE_REQUEST:"mediaplaybackraterequest",MEDIA_RENDITION_REQUEST:"mediarenditionrequest",MEDIA_AUDIO_TRACK_REQUEST:"mediaaudiotrackrequest",MEDIA_SEEK_TO_LIVE_REQUEST:"mediaseektoliverequest",REGISTER_MEDIA_STATE_RECEIVER:"registermediastatereceiver",UNREGISTER_MEDIA_STATE_RECEIVER:"unregistermediastatereceiver"},Y={MEDIA_CHROME_ATTRIBUTES:"mediachromeattributes",MEDIA_CONTROLLER:"mediacontroller"},Om={MEDIA_AIRPLAY_UNAVAILABLE:"mediaAirplayUnavailable",MEDIA_AUDIO_TRACK_ENABLED:"mediaAudioTrackEnabled",MEDIA_AUDIO_TRACK_LIST:"mediaAudioTrackList",MEDIA_AUDIO_TRACK_UNAVAILABLE:"mediaAudioTrackUnavailable",MEDIA_BUFFERED:"mediaBuffered",MEDIA_CAST_UNAVAILABLE:"mediaCastUnavailable",MEDIA_CHAPTERS_CUES:"mediaChaptersCues",MEDIA_CURRENT_TIME:"mediaCurrentTime",MEDIA_DURATION:"mediaDuration",MEDIA_ENDED:"mediaEnded",MEDIA_ERROR:"mediaError",MEDIA_ERROR_CODE:"mediaErrorCode",MEDIA_ERROR_MESSAGE:"mediaErrorMessage",MEDIA_FULLSCREEN_UNAVAILABLE:"mediaFullscreenUnavailable",MEDIA_HAS_PLAYED:"mediaHasPlayed",MEDIA_HEIGHT:"mediaHeight",MEDIA_IS_AIRPLAYING:"mediaIsAirplaying",MEDIA_IS_CASTING:"mediaIsCasting",MEDIA_IS_FULLSCREEN:"mediaIsFullscreen",MEDIA_IS_PIP:"mediaIsPip",MEDIA_LOADING:"mediaLoading",MEDIA_MUTED:"mediaMuted",MEDIA_PAUSED:"mediaPaused",MEDIA_PIP_UNAVAILABLE:"mediaPipUnavailable",MEDIA_PLAYBACK_RATE:"mediaPlaybackRate",MEDIA_PREVIEW_CHAPTER:"mediaPreviewChapter",MEDIA_PREVIEW_COORDS:"mediaPreviewCoords",MEDIA_PREVIEW_IMAGE:"mediaPreviewImage",MEDIA_PREVIEW_TIME:"mediaPreviewTime",MEDIA_RENDITION_LIST:"mediaRenditionList",MEDIA_RENDITION_SELECTED:"mediaRenditionSelected",MEDIA_RENDITION_UNAVAILABLE:"mediaRenditionUnavailable",MEDIA_SEEKABLE:"mediaSeekable",MEDIA_STREAM_TYPE:"mediaStreamType",MEDIA_SUBTITLES_LIST:"mediaSubtitlesList",MEDIA_SUBTITLES_SHOWING:"mediaSubtitlesShowing",MEDIA_TARGET_LIVE_WINDOW:"mediaTargetLiveWindow",MEDIA_TIME_IS_LIVE:"mediaTimeIsLive",MEDIA_VOLUME:"mediaVolume",MEDIA_VOLUME_LEVEL:"mediaVolumeLevel",MEDIA_VOLUME_UNAVAILABLE:"mediaVolumeUnavailable",MEDIA_WIDTH:"mediaWidth"},Nm=Object.entries(Om),c=Nm.reduce((e,[t,a])=>(e[t]=a.toLowerCase(),e),{}),q0={USER_INACTIVE_CHANGE:"userinactivechange",BREAKPOINTS_CHANGE:"breakpointchange",BREAKPOINTS_COMPUTED:"breakpointscomputed"},sa=Nm.reduce((e,[t,a])=>(e[t]=a.toLowerCase(),e),{...q0});Object.entries(sa).reduce((e,[t,a])=>{const i=c[t];return i&&(e[a]=i),e},{userinactivechange:"userinactive"});const Y0=Object.entries(c).reduce((e,[t,a])=>{const i=sa[t];return i&&(e[a]=i),e},{userinactive:"userinactivechange"}),qt={SUBTITLES:"subtitles",CAPTIONS:"captions",CHAPTERS:"chapters",METADATA:"metadata"},Wi={DISABLED:"disabled",SHOWING:"showing"},kc={MOUSE:"mouse",TOUCH:"touch"},tt={UNAVAILABLE:"unavailable",UNSUPPORTED:"unsupported"},ea={LIVE:"live",ON_DEMAND:"on-demand",UNKNOWN:"unknown"},G0={FULLSCREEN:"fullscreen"};function j0(e){return e==null?void 0:e.map(Z0).join(" ")}function Q0(e){return e==null?void 0:e.split(/\s+/).map(z0)}function Z0(e){if(e){const{id:t,width:a,height:i}=e;return[t,a,i].filter(r=>r!=null).join(":")}}function z0(e){if(e){const[t,a,i]=e.split(":");return{id:t,width:+a,height:+i}}}function X0(e){return e==null?void 0:e.map(eg).join(" ")}function J0(e){return e==null?void 0:e.split(/\s+/).map(tg)}function eg(e){if(e){const{id:t,kind:a,language:i,label:r}=e;return[t,a,i,r].filter(n=>n!=null).join(":")}}function tg(e){if(e){const[t,a,i,r]=e.split(":");return{id:t,kind:a,language:i,label:r}}}function ag(e){return e.replace(/[-_]([a-z])/g,(t,a)=>a.toUpperCase())}function Hd(e){return typeof e=="number"&&!Number.isNaN(e)&&Number.isFinite(e)}function xm(e){return typeof e!="string"?!1:!isNaN(e)&&!isNaN(parseFloat(e))}const Pm=e=>new Promise(t=>setTimeout(t,e)),wc=[{singular:"hour",plural:"hours"},{singular:"minute",plural:"minutes"},{singular:"second",plural:"seconds"}],ig=(e,t)=>{const a=e===1?wc[t].singular:wc[t].plural;return`${e} ${a}`},$r=e=>{if(!Hd(e))return"";const t=Math.abs(e),a=t!==e,i=new Date(0,0,0,0,0,t,0);return`${[i.getHours(),i.getMinutes(),i.getSeconds()].map((r,n)=>r&&ig(r,n)).filter(r=>r).join(", ")}${a?" remaining":""}`};function Ia(e,t){let a=!1;e<0&&(a=!0,e=0-e),e=e<0?0:e;let i=Math.floor(e%60),r=Math.floor(e/60%60),n=Math.floor(e/3600);const s=Math.floor(t/60%60),o=Math.floor(t/3600);return(isNaN(e)||e===1/0)&&(n=r=i="0"),n=n>0||o>0?n+":":"",r=((n||s>=10)&&r<10?"0"+r:r)+":",i=i<10?"0"+i:i,(a?"-":"")+n+r+i}const rg={"Start airplay":"Start airplay","Stop airplay":"Stop airplay",Audio:"Audio",Captions:"Captions","Enable captions":"Enable captions","Disable captions":"Disable captions","Start casting":"Start casting","Stop casting":"Stop casting","Enter fullscreen mode":"Enter fullscreen mode","Exit fullscreen mode":"Exit fullscreen mode",Mute:"Mute",Unmute:"Unmute","Enter picture in picture mode":"Enter picture in picture mode","Exit picture in picture mode":"Exit picture in picture mode",Play:"Play",Pause:"Pause","Playback rate":"Playback rate","Playback rate {playbackRate}":"Playback rate {playbackRate}",Quality:"Quality","Seek backward":"Seek backward","Seek forward":"Seek forward",Settings:"Settings",Auto:"Auto","audio player":"audio player","video player":"video player",volume:"volume",seek:"seek","closed captions":"closed captions","current playback rate":"current playback rate","playback time":"playback time","media loading":"media loading",settings:"settings","audio tracks":"audio tracks",quality:"quality",play:"play",pause:"pause",mute:"mute",unmute:"unmute",live:"live",Off:"Off","start airplay":"start airplay","stop airplay":"stop airplay","start casting":"start casting","stop casting":"stop casting","enter fullscreen mode":"enter fullscreen mode","exit fullscreen mode":"exit fullscreen mode","enter picture in picture mode":"enter picture in picture mode","exit picture in picture mode":"exit picture in picture mode","seek to live":"seek to live","playing live":"playing live","seek back {seekOffset} seconds":"seek back {seekOffset} seconds","seek forward {seekOffset} seconds":"seek forward {seekOffset} seconds","Network Error":"Network Error","Decode Error":"Decode Error","Source Not Supported":"Source Not Supported","Encryption Error":"Encryption Error","A network error caused the media download to fail.":"A network error caused the media download to fail.","A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.","An unsupported error occurred. The server or network failed, or your browser does not support this format.":"An unsupported error occurred. The server or network failed, or your browser does not support this format.","The media is encrypted and there are no keys to decrypt it.":"The media is encrypted and there are no keys to decrypt it."};var Sc;const Ko={en:rg};let gl=((Sc=globalThis.navigator)==null?void 0:Sc.language)||"en";const ng=e=>{gl=e},sg=e=>{var t,a,i;const[r]=gl.split("-");return((t=Ko[gl])==null?void 0:t[e])||((a=Ko[r])==null?void 0:a[e])||((i=Ko.en)==null?void 0:i[e])||e},C=(e,t={})=>sg(e).replace(/\{(\w+)\}/g,(a,i)=>i in t?String(t[i]):`{${i}}`);let Um=class{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}};class Bm extends Um{}let Ic=class extends Bm{constructor(){super(...arguments),this.role=null}};class og{observe(){}unobserve(){}disconnect(){}}const Hm={createElement:function(){return new en.HTMLElement},createElementNS:function(){return new en.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent(e){return!1}},en={ResizeObserver:og,document:Hm,Node:Bm,Element:Ic,HTMLElement:class extends Ic{constructor(){super(...arguments),this.innerHTML=""}get content(){return new en.DocumentFragment}},DocumentFragment:class extends Um{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem(e){return null},setItem(e,t){},removeItem(e){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return""}},matchMedia(e){return{matches:!1,media:e}},DOMParser:class{parseFromString(e,t){return{body:{textContent:e}}}}},Wm=typeof window>"u"||typeof window.customElements>"u",Vm=Object.keys(en).every(e=>e in globalThis),f=Wm&&!Vm?en:globalThis,Ae=Wm&&!Vm?Hm:globalThis.document,Rc=new WeakMap,Wd=e=>{let t=Rc.get(e);return t||Rc.set(e,t=new Set),t},Fm=new f.ResizeObserver(e=>{for(const t of e)for(const a of Wd(t.target))a(t)});function ji(e,t){Wd(e).add(t),Fm.observe(e)}function Qi(e,t){const a=Wd(e);a.delete(t),a.size||Fm.unobserve(e)}function Je(e){const t={};for(const a of e)t[a.name]=a.value;return t}function lt(e){var t;return(t=_l(e))!=null?t:er(e,"media-controller")}function _l(e){var t;const{MEDIA_CONTROLLER:a}=Y,i=e.getAttribute(a);if(i)return(t=fo(e))==null?void 0:t.getElementById(i)}const $m=(e,t,a=".value")=>{const i=e.querySelector(a);i&&(i.textContent=t)},lg=(e,t)=>{const a=`slot[name="${t}"]`,i=e.shadowRoot.querySelector(a);return i?i.children:[]},Km=(e,t)=>lg(e,t)[0],la=(e,t)=>!e||!t?!1:e!=null&&e.contains(t)?!0:la(e,t.getRootNode().host),er=(e,t)=>e?e.closest(t)||er(e.getRootNode().host,t):null;function Vd(e=document){var t;const a=e==null?void 0:e.activeElement;return a?(t=Vd(a.shadowRoot))!=null?t:a:null}function fo(e){var t;const a=(t=e==null?void 0:e.getRootNode)==null?void 0:t.call(e);return a instanceof ShadowRoot||a instanceof Document?a:null}function qm(e,{depth:t=3,checkOpacity:a=!0,checkVisibilityCSS:i=!0}={}){if(e.checkVisibility)return e.checkVisibility({checkOpacity:a,checkVisibilityCSS:i});let r=e;for(;r&&t>0;){const n=getComputedStyle(r);if(a&&n.opacity==="0"||i&&n.visibility==="hidden"||n.display==="none")return!1;r=r.parentElement,t--}return!0}function dg(e,t,a,i){const r=i.x-a.x,n=i.y-a.y,s=r*r+n*n;if(s===0)return 0;const o=((e-a.x)*r+(t-a.y)*n)/s;return Math.max(0,Math.min(1,o))}function be(e,t){return ug(e,i=>i===t)||Ym(e,t)}function ug(e,t){var a,i;let r;for(r of(a=e.querySelectorAll("style:not([media])"))!=null?a:[]){let n;try{n=(i=r.sheet)==null?void 0:i.cssRules}catch{continue}for(const s of n??[])if(t(s.selectorText))return s}}function Ym(e,t){var a,i;const r=(a=e.querySelectorAll("style:not([media])"))!=null?a:[],n=r==null?void 0:r[r.length-1];return n!=null&&n.sheet?(n==null||n.sheet.insertRule(`${t}{}`,n.sheet.cssRules.length),(i=n.sheet.cssRules)==null?void 0:i[n.sheet.cssRules.length-1]):(console.warn("Media Chrome: No style sheet found on style tag of",e),{style:{setProperty:()=>{},removeProperty:()=>"",getPropertyValue:()=>""}})}function re(e,t,a=Number.NaN){const i=e.getAttribute(t);return i!=null?+i:a}function ce(e,t,a){const i=+a;if(a==null||Number.isNaN(i)){e.hasAttribute(t)&&e.removeAttribute(t);return}re(e,t,void 0)!==i&&e.setAttribute(t,`${i}`)}function $(e,t){return e.hasAttribute(t)}function K(e,t,a){if(a==null){e.hasAttribute(t)&&e.removeAttribute(t);return}$(e,t)!=a&&e.toggleAttribute(t,a)}function ne(e,t,a=null){var i;return(i=e.getAttribute(t))!=null?i:a}function se(e,t,a){if(a==null){e.hasAttribute(t)&&e.removeAttribute(t);return}const i=`${a}`;ne(e,t,void 0)!==i&&e.setAttribute(t,i)}var Gm=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},da=(e,t,a)=>(Gm(e,t,"read from private field"),a?a.call(e):t.get(e)),cg=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},_n=(e,t,a,i)=>(Gm(e,t,"write to private field"),t.set(e,a),a),He;function hg(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `}class bo extends f.HTMLElement{constructor(){if(super(),cg(this,He,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[Y.MEDIA_CONTROLLER,c.MEDIA_PAUSED]}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===Y.MEDIA_CONTROLLER&&(a&&((n=(r=da(this,He))==null?void 0:r.unassociateElement)==null||n.call(r,this),_n(this,He,null)),i&&this.isConnected&&(_n(this,He,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=da(this,He))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,a,i,r;this.tabIndex=-1,this.setAttribute("aria-hidden","true"),_n(this,He,mg(this)),this.getAttribute(Y.MEDIA_CONTROLLER)&&((a=(t=da(this,He))==null?void 0:t.associateElement)==null||a.call(t,this)),(i=da(this,He))==null||i.addEventListener("pointerdown",this),(r=da(this,He))==null||r.addEventListener("click",this)}disconnectedCallback(){var t,a,i,r;this.getAttribute(Y.MEDIA_CONTROLLER)&&((a=(t=da(this,He))==null?void 0:t.unassociateElement)==null||a.call(t,this)),(i=da(this,He))==null||i.removeEventListener("pointerdown",this),(r=da(this,He))==null||r.removeEventListener("click",this),_n(this,He,null)}handleEvent(t){var a;const i=(a=t.composedPath())==null?void 0:a[0];if(["video","media-controller"].includes(i==null?void 0:i.localName)){if(t.type==="pointerdown")this._pointerType=t.pointerType;else if(t.type==="click"){const{clientX:r,clientY:n}=t,{left:s,top:o,width:l,height:d}=this.getBoundingClientRect(),u=r-s,p=n-o;if(u<0||p<0||u>l||p>d||l===0&&d===0)return;const{pointerType:m=this._pointerType}=t;if(this._pointerType=void 0,m===kc.TOUCH){this.handleTap(t);return}else if(m===kc.MOUSE){this.handleMouseClick(t);return}}}}get mediaPaused(){return $(this,c.MEDIA_PAUSED)}set mediaPaused(t){K(this,c.MEDIA_PAUSED,t)}handleTap(t){}handleMouseClick(t){const a=this.mediaPaused?D.MEDIA_PLAY_REQUEST:D.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new f.CustomEvent(a,{composed:!0,bubbles:!0}))}}He=new WeakMap;bo.shadowRootOptions={mode:"open"};bo.getTemplateHTML=hg;function mg(e){var t;const a=e.getAttribute(Y.MEDIA_CONTROLLER);return a?(t=e.getRootNode())==null?void 0:t.getElementById(a):er(e,"media-controller")}f.customElements.get("media-gesture-receiver")||f.customElements.define("media-gesture-receiver",bo);var Dc=bo,Fd=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},ze=(e,t,a)=>(Fd(e,t,"read from private field"),a?a.call(e):t.get(e)),je=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},xa=(e,t,a,i)=>(Fd(e,t,"write to private field"),t.set(e,a),a),ot=(e,t,a)=>(Fd(e,t,"access private method"),a),Gs,fi,tn,xi,jn,yl,jm,wr,Qn,Tl,Qm,Al,Zm,an,go,_o,$d,Zi,rn;const O={AUDIO:"audio",AUTOHIDE:"autohide",BREAKPOINTS:"breakpoints",GESTURES_DISABLED:"gesturesdisabled",KEYBOARD_CONTROL:"keyboardcontrol",NO_AUTOHIDE:"noautohide",USER_INACTIVE:"userinactive",AUTOHIDE_OVER_CONTROLS:"autohideovercontrols"};function pg(e){return`
    <style>
      
      :host([${c.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
      }

      :host(:not([${O.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${O.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${O.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${O.AUDIO}])[${O.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${O.AUDIO}])[${O.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${O.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${O.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${O.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${O.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${O.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${O.USER_INACTIVE}]:not([${c.MEDIA_PAUSED}]):not([${c.MEDIA_IS_AIRPLAYING}]):not([${c.MEDIA_IS_CASTING}]):not([${O.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${O.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${O.USER_INACTIVE}]:not([${O.NO_AUTOHIDE}]):not([${c.MEDIA_PAUSED}]):not([${c.MEDIA_IS_CASTING}]):not([${O.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${O.USER_INACTIVE}][${O.AUTOHIDE_OVER_CONTROLS}]:not([${O.NO_AUTOHIDE}]):not([${c.MEDIA_PAUSED}]):not([${c.MEDIA_IS_CASTING}]):not([${O.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      :host(:not([${O.AUDIO}])[${c.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${Dc.shadowRootOptions.mode}">
          ${Dc.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `}const vg=Object.values(c),Eg="sm:384 md:576 lg:768 xl:960";function fg(e){zm(e.target,e.contentRect.width)}function zm(e,t){var a;if(!e.isConnected)return;const i=(a=e.getAttribute(O.BREAKPOINTS))!=null?a:Eg,r=bg(i),n=gg(r,t);let s=!1;if(Object.keys(r).forEach(o=>{if(n.includes(o)){e.hasAttribute(`breakpoint${o}`)||(e.setAttribute(`breakpoint${o}`,""),s=!0);return}e.hasAttribute(`breakpoint${o}`)&&(e.removeAttribute(`breakpoint${o}`),s=!0)}),s){const o=new CustomEvent(sa.BREAKPOINTS_CHANGE,{detail:n});e.dispatchEvent(o)}e.breakpointsComputed||(e.breakpointsComputed=!0,e.dispatchEvent(new CustomEvent(sa.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}function bg(e){const t=e.split(/\s+/);return Object.fromEntries(t.map(a=>a.split(":")))}function gg(e,t){return Object.keys(e).filter(a=>t>=parseInt(e[a]))}class yo extends f.HTMLElement{constructor(){if(super(),je(this,yl),je(this,Tl),je(this,Al),je(this,an),je(this,_o),je(this,Zi),je(this,Gs,0),je(this,fi,null),je(this,tn,null),je(this,xi,void 0),this.breakpointsComputed=!1,je(this,jn,new MutationObserver(ot(this,yl,jm).bind(this))),je(this,wr,!1),je(this,Qn,a=>{ze(this,wr)||(setTimeout(()=>{fg(a),xa(this,wr,!1)},0),xa(this,wr,!0))}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const a=Je(this.attributes),i=this.constructor.getTemplateHTML(a);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}const t=this.querySelector(":scope > slot[slot=media]");t&&t.addEventListener("slotchange",()=>{if(!t.assignedElements({flatten:!0}).length){ze(this,fi)&&this.mediaUnsetCallback(ze(this,fi));return}this.handleMediaUpdated(this.media)})}static get observedAttributes(){return[O.AUTOHIDE,O.GESTURES_DISABLED].concat(vg).filter(t=>![c.MEDIA_RENDITION_LIST,c.MEDIA_AUDIO_TRACK_LIST,c.MEDIA_CHAPTERS_CUES,c.MEDIA_WIDTH,c.MEDIA_HEIGHT,c.MEDIA_ERROR,c.MEDIA_ERROR_MESSAGE].includes(t))}attributeChangedCallback(t,a,i){t.toLowerCase()==O.AUTOHIDE&&(this.autohide=i)}get media(){let t=this.querySelector(":scope > [slot=media]");return(t==null?void 0:t.nodeName)=="SLOT"&&(t=t.assignedElements({flatten:!0})[0]),t}async handleMediaUpdated(t){t&&(xa(this,fi,t),t.localName.includes("-")&&await f.customElements.whenDefined(t.localName),this.mediaSetCallback(t))}connectedCallback(){var t;ze(this,jn).observe(this,{childList:!0,subtree:!0}),ji(this,ze(this,Qn));const a=this.getAttribute(O.AUDIO)!=null,i=C(a?"audio player":"video player");this.setAttribute("role","region"),this.setAttribute("aria-label",i),this.handleMediaUpdated(this.media),this.setAttribute(O.USER_INACTIVE,""),zm(this,this.getBoundingClientRect().width),this.addEventListener("pointerdown",this),this.addEventListener("pointermove",this),this.addEventListener("pointerup",this),this.addEventListener("mouseleave",this),this.addEventListener("keyup",this),(t=f.window)==null||t.addEventListener("mouseup",this)}disconnectedCallback(){var t;ze(this,jn).disconnect(),Qi(this,ze(this,Qn)),this.media&&this.mediaUnsetCallback(this.media),(t=f.window)==null||t.removeEventListener("mouseup",this)}mediaSetCallback(t){}mediaUnsetCallback(t){xa(this,fi,null)}handleEvent(t){switch(t.type){case"pointerdown":xa(this,Gs,t.timeStamp);break;case"pointermove":ot(this,Tl,Qm).call(this,t);break;case"pointerup":ot(this,Al,Zm).call(this,t);break;case"mouseleave":ot(this,an,go).call(this);break;case"mouseup":this.removeAttribute(O.KEYBOARD_CONTROL);break;case"keyup":ot(this,Zi,rn).call(this),this.setAttribute(O.KEYBOARD_CONTROL,"");break}}set autohide(t){const a=Number(t);xa(this,xi,isNaN(a)?0:a)}get autohide(){return(ze(this,xi)===void 0?2:ze(this,xi)).toString()}get breakpoints(){return ne(this,O.BREAKPOINTS)}set breakpoints(t){se(this,O.BREAKPOINTS,t)}get audio(){return $(this,O.AUDIO)}set audio(t){K(this,O.AUDIO,t)}get gesturesDisabled(){return $(this,O.GESTURES_DISABLED)}set gesturesDisabled(t){K(this,O.GESTURES_DISABLED,t)}get keyboardControl(){return $(this,O.KEYBOARD_CONTROL)}set keyboardControl(t){K(this,O.KEYBOARD_CONTROL,t)}get noAutohide(){return $(this,O.NO_AUTOHIDE)}set noAutohide(t){K(this,O.NO_AUTOHIDE,t)}get autohideOverControls(){return $(this,O.AUTOHIDE_OVER_CONTROLS)}set autohideOverControls(t){K(this,O.AUTOHIDE_OVER_CONTROLS,t)}get userInteractive(){return $(this,O.USER_INACTIVE)}set userInteractive(t){K(this,O.USER_INACTIVE,t)}}Gs=new WeakMap;fi=new WeakMap;tn=new WeakMap;xi=new WeakMap;jn=new WeakMap;yl=new WeakSet;jm=function(e){const t=this.media;for(const a of e){if(a.type!=="childList")continue;const i=a.removedNodes;for(const r of i){if(r.slot!="media"||a.target!=this)continue;let n=a.previousSibling&&a.previousSibling.previousElementSibling;if(!n||!t)this.mediaUnsetCallback(r);else{let s=n.slot!=="media";for(;(n=n.previousSibling)!==null;)n.slot=="media"&&(s=!1);s&&this.mediaUnsetCallback(r)}}if(t)for(const r of a.addedNodes)r===t&&this.handleMediaUpdated(t)}};wr=new WeakMap;Qn=new WeakMap;Tl=new WeakSet;Qm=function(e){if(e.pointerType!=="mouse"&&e.timeStamp-ze(this,Gs)<250)return;ot(this,_o,$d).call(this),clearTimeout(ze(this,tn));const t=this.hasAttribute(O.AUTOHIDE_OVER_CONTROLS);([this,this.media].includes(e.target)||t)&&ot(this,Zi,rn).call(this)};Al=new WeakSet;Zm=function(e){if(e.pointerType==="touch"){const t=!this.hasAttribute(O.USER_INACTIVE);[this,this.media].includes(e.target)&&t?ot(this,an,go).call(this):ot(this,Zi,rn).call(this)}else e.composedPath().some(t=>["media-play-button","media-fullscreen-button"].includes(t==null?void 0:t.localName))&&ot(this,Zi,rn).call(this)};an=new WeakSet;go=function(){if(ze(this,xi)<0||this.hasAttribute(O.USER_INACTIVE))return;this.setAttribute(O.USER_INACTIVE,"");const e=new f.CustomEvent(sa.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(e)};_o=new WeakSet;$d=function(){if(!this.hasAttribute(O.USER_INACTIVE))return;this.removeAttribute(O.USER_INACTIVE);const e=new f.CustomEvent(sa.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(e)};Zi=new WeakSet;rn=function(){ot(this,_o,$d).call(this),clearTimeout(ze(this,tn));const e=parseInt(this.autohide);e<0||xa(this,tn,setTimeout(()=>{ot(this,an,go).call(this)},e*1e3))};yo.shadowRootOptions={mode:"open"};yo.getTemplateHTML=pg;f.customElements.get("media-container")||f.customElements.define("media-container",yo);var Xm=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Ie=(e,t,a)=>(Xm(e,t,"read from private field"),a?a.call(e):t.get(e)),lr=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},yn=(e,t,a,i)=>(Xm(e,t,"write to private field"),t.set(e,a),a),bi,gi,js,Ga,Xt,ma;class Kd{constructor(t,a,{defaultValue:i}={defaultValue:void 0}){lr(this,Xt),lr(this,bi,void 0),lr(this,gi,void 0),lr(this,js,void 0),lr(this,Ga,new Set),yn(this,bi,t),yn(this,gi,a),yn(this,js,new Set(i))}[Symbol.iterator](){return Ie(this,Xt,ma).values()}get length(){return Ie(this,Xt,ma).size}get value(){var t;return(t=[...Ie(this,Xt,ma)].join(" "))!=null?t:""}set value(t){var a;t!==this.value&&(yn(this,Ga,new Set),this.add(...(a=t==null?void 0:t.split(" "))!=null?a:[]))}toString(){return this.value}item(t){return[...Ie(this,Xt,ma)][t]}values(){return Ie(this,Xt,ma).values()}forEach(t,a){Ie(this,Xt,ma).forEach(t,a)}add(...t){var a,i;t.forEach(r=>Ie(this,Ga).add(r)),!(this.value===""&&!((a=Ie(this,bi))!=null&&a.hasAttribute(`${Ie(this,gi)}`)))&&((i=Ie(this,bi))==null||i.setAttribute(`${Ie(this,gi)}`,`${this.value}`))}remove(...t){var a;t.forEach(i=>Ie(this,Ga).delete(i)),(a=Ie(this,bi))==null||a.setAttribute(`${Ie(this,gi)}`,`${this.value}`)}contains(t){return Ie(this,Xt,ma).has(t)}toggle(t,a){return typeof a<"u"?a?(this.add(t),!0):(this.remove(t),!1):this.contains(t)?(this.remove(t),!1):(this.add(t),!0)}replace(t,a){return this.remove(t),this.add(a),t===a}}bi=new WeakMap;gi=new WeakMap;js=new WeakMap;Ga=new WeakMap;Xt=new WeakSet;ma=function(){return Ie(this,Ga).size?Ie(this,Ga):Ie(this,js)};const _g=(e="")=>e.split(/\s+/),Jm=(e="")=>{const[t,a,i]=e.split(":"),r=i?decodeURIComponent(i):void 0;return{kind:t==="cc"?qt.CAPTIONS:qt.SUBTITLES,language:a,label:r}},To=(e="",t={})=>_g(e).map(a=>{const i=Jm(a);return{...t,...i}}),ep=e=>e?Array.isArray(e)?e.map(t=>typeof t=="string"?Jm(t):t):typeof e=="string"?To(e):[e]:[],kl=({kind:e,label:t,language:a}={kind:"subtitles"})=>t?`${e==="captions"?"cc":"sb"}:${a}:${encodeURIComponent(t)}`:a,nn=(e=[])=>Array.prototype.map.call(e,kl).join(" "),yg=(e,t)=>a=>a[e]===t,tp=e=>{const t=Object.entries(e).map(([a,i])=>yg(a,i));return a=>t.every(i=>i(a))},Kr=(e,t=[],a=[])=>{const i=ep(a).map(tp),r=n=>i.some(s=>s(n));Array.from(t).filter(r).forEach(n=>{n.mode=e})},Ao=(e,t=()=>!0)=>{if(!(e!=null&&e.textTracks))return[];const a=typeof t=="function"?t:tp(t);return Array.from(e.textTracks).filter(a)},ap=e=>{var t;return!!((t=e.mediaSubtitlesShowing)!=null&&t.length)||e.hasAttribute(c.MEDIA_SUBTITLES_SHOWING)},Tg=e=>{var t;const{media:a,fullscreenElement:i}=e;try{const r=i&&"requestFullscreen"in i?"requestFullscreen":i&&"webkitRequestFullScreen"in i?"webkitRequestFullScreen":void 0;if(r){const n=(t=i[r])==null?void 0:t.call(i);if(n instanceof Promise)return n.catch(()=>{})}else a!=null&&a.webkitEnterFullscreen?a.webkitEnterFullscreen():a!=null&&a.requestFullscreen&&a.requestFullscreen()}catch(r){console.error(r)}},Cc="exitFullscreen"in Ae?"exitFullscreen":"webkitExitFullscreen"in Ae?"webkitExitFullscreen":"webkitCancelFullScreen"in Ae?"webkitCancelFullScreen":void 0,Ag=e=>{var t;const{documentElement:a}=e;if(Cc){const i=(t=a==null?void 0:a[Cc])==null?void 0:t.call(a);if(i instanceof Promise)return i.catch(()=>{})}},Sr="fullscreenElement"in Ae?"fullscreenElement":"webkitFullscreenElement"in Ae?"webkitFullscreenElement":void 0,kg=e=>{const{documentElement:t,media:a}=e,i=t==null?void 0:t[Sr];return!i&&"webkitDisplayingFullscreen"in a&&"webkitPresentationMode"in a&&a.webkitDisplayingFullscreen&&a.webkitPresentationMode===G0.FULLSCREEN?a:i},wg=e=>{var t;const{media:a,documentElement:i,fullscreenElement:r=a}=e;if(!a||!i)return!1;const n=kg(e);if(!n)return!1;if(n===r||n===a)return!0;if(n.localName.includes("-")){let s=n.shadowRoot;if(!(Sr in s))return la(n,r);for(;s!=null&&s[Sr];){if(s[Sr]===r)return!0;s=(t=s[Sr])==null?void 0:t.shadowRoot}}return!1},Sg="fullscreenEnabled"in Ae?"fullscreenEnabled":"webkitFullscreenEnabled"in Ae?"webkitFullscreenEnabled":void 0,Ig=e=>{const{documentElement:t,media:a}=e;return!!(t!=null&&t[Sg])||a&&"webkitSupportsFullscreen"in a};let qo;const qd=()=>{var e,t;return qo||(qo=(t=(e=Ae)==null?void 0:e.createElement)==null?void 0:t.call(e,"video"),qo)},Rg=async(e=qd())=>{if(!e)return!1;const t=e.volume;e.volume=t/2+.1;const a=new AbortController,i=await Promise.race([Dg(e,a.signal),Cg(e,t)]);return a.abort(),i},Dg=(e,t)=>new Promise(a=>{e.addEventListener("volumechange",()=>a(!0),{signal:t})}),Cg=async(e,t)=>{for(let a=0;a<10;a++){if(e.volume===t)return!1;await Pm(10)}return e.volume!==t},Lg=/.*Version\/.*Safari\/.*/.test(f.navigator.userAgent),ip=(e=qd())=>f.matchMedia("(display-mode: standalone)").matches&&Lg?!1:typeof(e==null?void 0:e.requestPictureInPicture)=="function",rp=(e=qd())=>Ig({documentElement:Ae,media:e}),Mg=rp(),Og=ip(),Ng=!!f.WebKitPlaybackTargetAvailabilityEvent,xg=!!f.chrome,Qs=e=>Ao(e.media,t=>[qt.SUBTITLES,qt.CAPTIONS].includes(t.kind)).sort((t,a)=>t.kind>=a.kind?1:-1),np=e=>Ao(e.media,t=>t.mode===Wi.SHOWING&&[qt.SUBTITLES,qt.CAPTIONS].includes(t.kind)),sp=(e,t)=>{const a=Qs(e),i=np(e),r=!!i.length;if(a.length){if(t===!1||r&&t!==!0)Kr(Wi.DISABLED,a,i);else if(t===!0||!r&&t!==!1){let n=a[0];const{options:s}=e;if(!(s!=null&&s.noSubtitlesLangPref)){const u=globalThis.localStorage.getItem("media-chrome-pref-subtitles-lang"),p=u?[u,...globalThis.navigator.languages]:globalThis.navigator.languages,m=a.filter(h=>p.some(v=>h.language.toLowerCase().startsWith(v.split("-")[0]))).sort((h,v)=>{const _=p.findIndex(y=>h.language.toLowerCase().startsWith(y.split("-")[0])),b=p.findIndex(y=>v.language.toLowerCase().startsWith(y.split("-")[0]));return _-b});m[0]&&(n=m[0])}const{language:o,label:l,kind:d}=n;Kr(Wi.DISABLED,a,i),Kr(Wi.SHOWING,a,[{language:o,label:l,kind:d}])}}},Yd=(e,t)=>e===t?!0:e==null||t==null||typeof e!=typeof t?!1:typeof e=="number"&&Number.isNaN(e)&&Number.isNaN(t)?!0:typeof e!="object"?!1:Array.isArray(e)?Pg(e,t):Object.entries(e).every(([a,i])=>a in t&&Yd(i,t[a])),Pg=(e,t)=>{const a=Array.isArray(e),i=Array.isArray(t);return a!==i?!1:a||i?e.length!==t.length?!1:e.every((r,n)=>Yd(r,t[n])):!0},Ug=Object.values(ea);let Zs;const Bg=Rg().then(e=>(Zs=e,Zs)),Hg=async(...e)=>{await Promise.all(e.filter(t=>t).map(async t=>{if(!("localName"in t&&t instanceof f.HTMLElement))return;const a=t.localName;if(!a.includes("-"))return;const i=f.customElements.get(a);i&&t instanceof i||(await f.customElements.whenDefined(a),f.customElements.upgrade(t))}))},Wg=new f.DOMParser,Vg=e=>e&&(Wg.parseFromString(e,"text/html").body.textContent||e),Ir={mediaError:{get(e,t){const{media:a}=e;if((t==null?void 0:t.type)!=="playing")return a==null?void 0:a.error},mediaEvents:["emptied","error","playing"]},mediaErrorCode:{get(e,t){var a;const{media:i}=e;if((t==null?void 0:t.type)!=="playing")return(a=i==null?void 0:i.error)==null?void 0:a.code},mediaEvents:["emptied","error","playing"]},mediaErrorMessage:{get(e,t){var a,i;const{media:r}=e;if((t==null?void 0:t.type)!=="playing")return(i=(a=r==null?void 0:r.error)==null?void 0:a.message)!=null?i:""},mediaEvents:["emptied","error","playing"]},mediaWidth:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.videoWidth)!=null?t:0},mediaEvents:["resize"]},mediaHeight:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.videoHeight)!=null?t:0},mediaEvents:["resize"]},mediaPaused:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.paused)!=null?t:!0},set(e,t){var a;const{media:i}=t;i&&(e?i.pause():(a=i.play())==null||a.catch(()=>{}))},mediaEvents:["play","playing","pause","emptied"]},mediaHasPlayed:{get(e,t){const{media:a}=e;return a?t?t.type==="playing":!a.paused:!1},mediaEvents:["playing","emptied"]},mediaEnded:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.ended)!=null?t:!1},mediaEvents:["seeked","ended","emptied"]},mediaPlaybackRate:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.playbackRate)!=null?t:1},set(e,t){const{media:a}=t;a&&Number.isFinite(+e)&&(a.playbackRate=+e)},mediaEvents:["ratechange","loadstart"]},mediaMuted:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.muted)!=null?t:!1},set(e,t){const{media:a}=t;if(a){try{f.localStorage.setItem("media-chrome-pref-muted",e?"true":"false")}catch(i){console.debug("Error setting muted pref",i)}a.muted=e}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{const{options:{noMutedPref:a}}=t,{media:i}=t;if(!(!i||i.muted||a))try{const r=f.localStorage.getItem("media-chrome-pref-muted")==="true";Ir.mediaMuted.set(r,t),e(r)}catch(r){console.debug("Error getting muted pref",r)}}]},mediaVolume:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.volume)!=null?t:1},set(e,t){const{media:a}=t;if(a){try{e==null?f.localStorage.removeItem("media-chrome-pref-volume"):f.localStorage.setItem("media-chrome-pref-volume",e.toString())}catch(i){console.debug("Error setting volume pref",i)}Number.isFinite(+e)&&(a.volume=+e)}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{const{options:{noVolumePref:a}}=t;if(!a)try{const{media:i}=t;if(!i)return;const r=f.localStorage.getItem("media-chrome-pref-volume");if(r==null)return;Ir.mediaVolume.set(+r,t),e(+r)}catch(i){console.debug("Error getting volume pref",i)}}]},mediaVolumeLevel:{get(e){const{media:t}=e;return typeof(t==null?void 0:t.volume)>"u"?"high":t.muted||t.volume===0?"off":t.volume<.5?"low":t.volume<.75?"medium":"high"},mediaEvents:["volumechange"]},mediaCurrentTime:{get(e){var t;const{media:a}=e;return(t=a==null?void 0:a.currentTime)!=null?t:0},set(e,t){const{media:a}=t;!a||!Hd(e)||(a.currentTime=e)},mediaEvents:["timeupdate","loadedmetadata"]},mediaDuration:{get(e){const{media:t,options:{defaultDuration:a}={}}=e;return a&&(!t||!t.duration||Number.isNaN(t.duration)||!Number.isFinite(t.duration))?a:Number.isFinite(t==null?void 0:t.duration)?t.duration:Number.NaN},mediaEvents:["durationchange","loadedmetadata","emptied"]},mediaLoading:{get(e){const{media:t}=e;return(t==null?void 0:t.readyState)<3},mediaEvents:["waiting","playing","emptied"]},mediaSeekable:{get(e){var t;const{media:a}=e;if(!((t=a==null?void 0:a.seekable)!=null&&t.length))return;const i=a.seekable.start(0),r=a.seekable.end(a.seekable.length-1);if(!(!i&&!r))return[Number(i.toFixed(3)),Number(r.toFixed(3))]},mediaEvents:["loadedmetadata","emptied","progress","seekablechange"]},mediaBuffered:{get(e){var t;const{media:a}=e,i=(t=a==null?void 0:a.buffered)!=null?t:[];return Array.from(i).map((r,n)=>[Number(i.start(n).toFixed(3)),Number(i.end(n).toFixed(3))])},mediaEvents:["progress","emptied"]},mediaStreamType:{get(e){const{media:t,options:{defaultStreamType:a}={}}=e,i=[ea.LIVE,ea.ON_DEMAND].includes(a)?a:void 0;if(!t)return i;const{streamType:r}=t;if(Ug.includes(r))return r===ea.UNKNOWN?i:r;const n=t.duration;return n===1/0?ea.LIVE:Number.isFinite(n)?ea.ON_DEMAND:i},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange"]},mediaTargetLiveWindow:{get(e){const{media:t}=e;if(!t)return Number.NaN;const{targetLiveWindow:a}=t,i=Ir.mediaStreamType.get(e);return(a==null||Number.isNaN(a))&&i===ea.LIVE?0:a},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange","targetlivewindowchange"]},mediaTimeIsLive:{get(e){const{media:t,options:{liveEdgeOffset:a=10}={}}=e;if(!t)return!1;if(typeof t.liveEdgeStart=="number")return Number.isNaN(t.liveEdgeStart)?!1:t.currentTime>=t.liveEdgeStart;if(Ir.mediaStreamType.get(e)!==ea.LIVE)return!1;const i=t.seekable;if(!i)return!0;if(!i.length)return!1;const r=i.end(i.length-1)-a;return t.currentTime>=r},mediaEvents:["playing","timeupdate","progress","waiting","emptied"]},mediaSubtitlesList:{get(e){return Qs(e).map(({kind:t,label:a,language:i})=>({kind:t,label:a,language:i}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack"]},mediaSubtitlesShowing:{get(e){return np(e).map(({kind:t,label:a,language:i})=>({kind:t,label:a,language:i}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var a,i;const{media:r,options:n}=t;if(!r)return;const s=o=>{var l;!n.defaultSubtitles||o&&![qt.CAPTIONS,qt.SUBTITLES].includes((l=o==null?void 0:o.track)==null?void 0:l.kind)||sp(t,!0)};return r.addEventListener("loadstart",s),(a=r.textTracks)==null||a.addEventListener("addtrack",s),(i=r.textTracks)==null||i.addEventListener("removetrack",s),()=>{var o,l;r.removeEventListener("loadstart",s),(o=r.textTracks)==null||o.removeEventListener("addtrack",s),(l=r.textTracks)==null||l.removeEventListener("removetrack",s)}}]},mediaChaptersCues:{get(e){var t;const{media:a}=e;if(!a)return[];const[i]=Ao(a,{kind:qt.CHAPTERS});return Array.from((t=i==null?void 0:i.cues)!=null?t:[]).map(({text:r,startTime:n,endTime:s})=>({text:Vg(r),startTime:n,endTime:s}))},mediaEvents:["loadstart","loadedmetadata"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var a;const{media:i}=t;if(!i)return;const r=i.querySelector('track[kind="chapters"][default][src]'),n=(a=i.shadowRoot)==null?void 0:a.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');return r==null||r.addEventListener("load",e),n==null||n.addEventListener("load",e),()=>{r==null||r.removeEventListener("load",e),n==null||n.removeEventListener("load",e)}}]},mediaIsPip:{get(e){var t,a;const{media:i,documentElement:r}=e;if(!i||!r||!r.pictureInPictureElement)return!1;if(r.pictureInPictureElement===i)return!0;if(r.pictureInPictureElement instanceof HTMLMediaElement)return(t=i.localName)!=null&&t.includes("-")?la(i,r.pictureInPictureElement):!1;if(r.pictureInPictureElement.localName.includes("-")){let n=r.pictureInPictureElement.shadowRoot;for(;n!=null&&n.pictureInPictureElement;){if(n.pictureInPictureElement===i)return!0;n=(a=n.pictureInPictureElement)==null?void 0:a.shadowRoot}}return!1},set(e,t){const{media:a}=t;if(a)if(e){if(!Ae.pictureInPictureEnabled){console.warn("MediaChrome: Picture-in-picture is not enabled");return}if(!a.requestPictureInPicture){console.warn("MediaChrome: The current media does not support picture-in-picture");return}const i=()=>{console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.")};a.requestPictureInPicture().catch(r=>{if(r.code===11){if(!a.src){console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");return}if(a.readyState===0&&a.preload==="none"){const n=()=>{a.removeEventListener("loadedmetadata",s),a.preload="none"},s=()=>{a.requestPictureInPicture().catch(i),n()};a.addEventListener("loadedmetadata",s),a.preload="metadata",setTimeout(()=>{a.readyState===0&&i(),n()},1e3)}else throw r}else throw r})}else Ae.pictureInPictureElement&&Ae.exitPictureInPicture()},mediaEvents:["enterpictureinpicture","leavepictureinpicture"]},mediaRenditionList:{get(e){var t;const{media:a}=e;return[...(t=a==null?void 0:a.videoRenditions)!=null?t:[]].map(i=>({...i}))},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaRenditionSelected:{get(e){var t,a,i;const{media:r}=e;return(i=(a=r==null?void 0:r.videoRenditions)==null?void 0:a[(t=r.videoRenditions)==null?void 0:t.selectedIndex])==null?void 0:i.id},set(e,t){const{media:a}=t;if(!(a!=null&&a.videoRenditions)){console.warn("MediaController: Rendition selection not supported by this media.");return}const i=e,r=Array.prototype.findIndex.call(a.videoRenditions,n=>n.id==i);a.videoRenditions.selectedIndex!=r&&(a.videoRenditions.selectedIndex=r)},mediaEvents:["emptied"],videoRenditionsEvents:["addrendition","removerendition","change"]},mediaAudioTrackList:{get(e){var t;const{media:a}=e;return[...(t=a==null?void 0:a.audioTracks)!=null?t:[]]},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaAudioTrackEnabled:{get(e){var t,a;const{media:i}=e;return(a=[...(t=i==null?void 0:i.audioTracks)!=null?t:[]].find(r=>r.enabled))==null?void 0:a.id},set(e,t){const{media:a}=t;if(!(a!=null&&a.audioTracks)){console.warn("MediaChrome: Audio track selection not supported by this media.");return}const i=e;for(const r of a.audioTracks)r.enabled=i==r.id},mediaEvents:["emptied"],audioTracksEvents:["addtrack","removetrack","change"]},mediaIsFullscreen:{get(e){return wg(e)},set(e,t){e?Tg(t):Ag(t)},rootEvents:["fullscreenchange","webkitfullscreenchange"],mediaEvents:["webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"]},mediaIsCasting:{get(e){var t;const{media:a}=e;return!(a!=null&&a.remote)||((t=a.remote)==null?void 0:t.state)==="disconnected"?!1:!!a.remote.state},set(e,t){var a,i;const{media:r}=t;if(r&&!(e&&((a=r.remote)==null?void 0:a.state)!=="disconnected")&&!(!e&&((i=r.remote)==null?void 0:i.state)!=="connected")){if(typeof r.remote.prompt!="function"){console.warn("MediaChrome: Casting is not supported in this environment");return}r.remote.prompt().catch(()=>{})}},remoteEvents:["connect","connecting","disconnect"]},mediaIsAirplaying:{get(){return!1},set(e,t){const{media:a}=t;if(a){if(!(a.webkitShowPlaybackTargetPicker&&f.WebKitPlaybackTargetAvailabilityEvent)){console.error("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");return}a.webkitShowPlaybackTargetPicker()}},mediaEvents:["webkitcurrentplaybacktargetiswirelesschanged"]},mediaFullscreenUnavailable:{get(e){const{media:t}=e;if(!Mg||!rp(t))return tt.UNSUPPORTED}},mediaPipUnavailable:{get(e){const{media:t}=e;if(!Og||!ip(t))return tt.UNSUPPORTED}},mediaVolumeUnavailable:{get(e){const{media:t}=e;if(Zs===!1||(t==null?void 0:t.volume)==null)return tt.UNSUPPORTED},stateOwnersUpdateHandlers:[e=>{Zs==null&&Bg.then(t=>e(t?void 0:tt.UNSUPPORTED))}]},mediaCastUnavailable:{get(e,{availability:t="not-available"}={}){var a;const{media:i}=e;if(!xg||!((a=i==null?void 0:i.remote)!=null&&a.state))return tt.UNSUPPORTED;if(!(t==null||t==="available"))return tt.UNAVAILABLE},stateOwnersUpdateHandlers:[(e,t)=>{var a;const{media:i}=t;return i?(i.disableRemotePlayback||i.hasAttribute("disableremoteplayback")||(a=i==null?void 0:i.remote)==null||a.watchAvailability(r=>{e({availability:r?"available":"not-available"})}).catch(r=>{r.name==="NotSupportedError"?e({availability:null}):e({availability:"not-available"})}),()=>{var r;(r=i==null?void 0:i.remote)==null||r.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaAirplayUnavailable:{get(e,t){if(!Ng)return tt.UNSUPPORTED;if((t==null?void 0:t.availability)==="not-available")return tt.UNAVAILABLE},mediaEvents:["webkitplaybacktargetavailabilitychanged"],stateOwnersUpdateHandlers:[(e,t)=>{var a;const{media:i}=t;return i?(i.disableRemotePlayback||i.hasAttribute("disableremoteplayback")||(a=i==null?void 0:i.remote)==null||a.watchAvailability(r=>{e({availability:r?"available":"not-available"})}).catch(r=>{r.name==="NotSupportedError"?e({availability:null}):e({availability:"not-available"})}),()=>{var r;(r=i==null?void 0:i.remote)==null||r.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaRenditionUnavailable:{get(e){var t;const{media:a}=e;if(!(a!=null&&a.videoRenditions))return tt.UNSUPPORTED;if(!((t=a.videoRenditions)!=null&&t.length))return tt.UNAVAILABLE},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaAudioTrackUnavailable:{get(e){var t,a;const{media:i}=e;if(!(i!=null&&i.audioTracks))return tt.UNSUPPORTED;if(((a=(t=i.audioTracks)==null?void 0:t.length)!=null?a:0)<=1)return tt.UNAVAILABLE},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]}},Fg={[D.MEDIA_PREVIEW_REQUEST](e,t,{detail:a}){var i,r,n;const{media:s}=t,o=a??void 0;let l,d;if(s&&o!=null){const[m]=Ao(s,{kind:qt.METADATA,label:"thumbnails"}),h=Array.prototype.find.call((i=m==null?void 0:m.cues)!=null?i:[],(v,_,b)=>_===0?v.endTime>o:_===b.length-1?v.startTime<=o:v.startTime<=o&&v.endTime>o);if(h){const v=/'^(?:[a-z]+:)?\/\//i.test(h.text)||(r=s==null?void 0:s.querySelector('track[label="thumbnails"]'))==null?void 0:r.src,_=new URL(h.text,v);d=new URLSearchParams(_.hash).get("#xywh").split(",").map(b=>+b),l=_.href}}const u=e.mediaDuration.get(t);let p=(n=e.mediaChaptersCues.get(t).find((m,h,v)=>h===v.length-1&&u===m.endTime?m.startTime<=o&&m.endTime>=o:m.startTime<=o&&m.endTime>o))==null?void 0:n.text;return a!=null&&p==null&&(p=""),{mediaPreviewTime:o,mediaPreviewImage:l,mediaPreviewCoords:d,mediaPreviewChapter:p}},[D.MEDIA_PAUSE_REQUEST](e,t){e.mediaPaused.set(!0,t)},[D.MEDIA_PLAY_REQUEST](e,t){var a,i,r,n;const s="mediaPaused",o=e.mediaStreamType.get(t)===ea.LIVE,l=!((a=t.options)!=null&&a.noAutoSeekToLive),d=e.mediaTargetLiveWindow.get(t)>0;if(o&&l&&!d){const u=(i=e.mediaSeekable.get(t))==null?void 0:i[1];if(u){const p=(n=(r=t.options)==null?void 0:r.seekToLiveOffset)!=null?n:0,m=u-p;e.mediaCurrentTime.set(m,t)}}e[s].set(!1,t)},[D.MEDIA_PLAYBACK_RATE_REQUEST](e,t,{detail:a}){const i="mediaPlaybackRate",r=a;e[i].set(r,t)},[D.MEDIA_MUTE_REQUEST](e,t){e.mediaMuted.set(!0,t)},[D.MEDIA_UNMUTE_REQUEST](e,t){e.mediaVolume.get(t)||e.mediaVolume.set(.25,t),e["mediaMuted"].set(!1,t)},[D.MEDIA_VOLUME_REQUEST](e,t,{detail:a}){const i="mediaVolume",r=a;r&&e.mediaMuted.get(t)&&e.mediaMuted.set(!1,t),e[i].set(r,t)},[D.MEDIA_SEEK_REQUEST](e,t,{detail:a}){const i="mediaCurrentTime",r=a;e[i].set(r,t)},[D.MEDIA_SEEK_TO_LIVE_REQUEST](e,t){var a,i,r;const n="mediaCurrentTime",s=(a=e.mediaSeekable.get(t))==null?void 0:a[1];if(Number.isNaN(Number(s)))return;const o=(r=(i=t.options)==null?void 0:i.seekToLiveOffset)!=null?r:0,l=s-o;e[n].set(l,t)},[D.MEDIA_SHOW_SUBTITLES_REQUEST](e,t,{detail:a}){var i;const{options:r}=t,n=Qs(t),s=ep(a),o=(i=s[0])==null?void 0:i.language;o&&!r.noSubtitlesLangPref&&f.localStorage.setItem("media-chrome-pref-subtitles-lang",o),Kr(Wi.SHOWING,n,s)},[D.MEDIA_DISABLE_SUBTITLES_REQUEST](e,t,{detail:a}){const i=Qs(t),r=a??[];Kr(Wi.DISABLED,i,r)},[D.MEDIA_TOGGLE_SUBTITLES_REQUEST](e,t,{detail:a}){sp(t,a)},[D.MEDIA_RENDITION_REQUEST](e,t,{detail:a}){const i="mediaRenditionSelected",r=a;e[i].set(r,t)},[D.MEDIA_AUDIO_TRACK_REQUEST](e,t,{detail:a}){const i="mediaAudioTrackEnabled",r=a;e[i].set(r,t)},[D.MEDIA_ENTER_PIP_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e["mediaIsPip"].set(!0,t)},[D.MEDIA_EXIT_PIP_REQUEST](e,t){e.mediaIsPip.set(!1,t)},[D.MEDIA_ENTER_FULLSCREEN_REQUEST](e,t){e.mediaIsPip.get(t)&&e.mediaIsPip.set(!1,t),e["mediaIsFullscreen"].set(!0,t)},[D.MEDIA_EXIT_FULLSCREEN_REQUEST](e,t){e.mediaIsFullscreen.set(!1,t)},[D.MEDIA_ENTER_CAST_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e["mediaIsCasting"].set(!0,t)},[D.MEDIA_EXIT_CAST_REQUEST](e,t){e.mediaIsCasting.set(!1,t)},[D.MEDIA_AIRPLAY_REQUEST](e,t){e.mediaIsAirplaying.set(!0,t)}},$g=({media:e,fullscreenElement:t,documentElement:a,stateMediator:i=Ir,requestMap:r=Fg,options:n={},monitorStateOwnersOnlyWithSubscriptions:s=!0})=>{const o=[],l={options:{...n}};let d=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0});const u=_=>{_!=null&&(Yd(_,d)||(d=Object.freeze({...d,..._}),o.forEach(b=>b(d))))},p=()=>{const _=Object.entries(i).reduce((b,[y,{get:T}])=>(b[y]=T(l),b),{});u(_)},m={};let h;const v=async(_,b)=>{var y,T,E,S,L,x,W,G,z,F,U,Oe,$e,Ke,me,Pe;const At=!!h;if(h={...l,...h??{},..._},At)return;await Hg(...Object.values(_));const Ue=o.length>0&&b===0&&s,dt=l.media!==h.media,kt=((y=l.media)==null?void 0:y.textTracks)!==((T=h.media)==null?void 0:T.textTracks),Be=((E=l.media)==null?void 0:E.videoRenditions)!==((S=h.media)==null?void 0:S.videoRenditions),qe=((L=l.media)==null?void 0:L.audioTracks)!==((x=h.media)==null?void 0:x.audioTracks),et=((W=l.media)==null?void 0:W.remote)!==((G=h.media)==null?void 0:G.remote),oi=l.documentElement!==h.documentElement,fn=!!l.media&&(dt||Ue),Vu=!!((z=l.media)!=null&&z.textTracks)&&(kt||Ue),Fu=!!((F=l.media)!=null&&F.videoRenditions)&&(Be||Ue),$u=!!((U=l.media)!=null&&U.audioTracks)&&(qe||Ue),Ku=!!((Oe=l.media)!=null&&Oe.remote)&&(et||Ue),qu=!!l.documentElement&&(oi||Ue),Yu=fn||Vu||Fu||$u||Ku||qu,li=o.length===0&&b===1&&s,Gu=!!h.media&&(dt||li),ju=!!(($e=h.media)!=null&&$e.textTracks)&&(kt||li),Qu=!!((Ke=h.media)!=null&&Ke.videoRenditions)&&(Be||li),Zu=!!((me=h.media)!=null&&me.audioTracks)&&(qe||li),zu=!!((Pe=h.media)!=null&&Pe.remote)&&(et||li),Xu=!!h.documentElement&&(oi||li),Ju=Gu||ju||Qu||Zu||zu||Xu;if(!(Yu||Ju)){Object.entries(h).forEach(([X,nr])=>{l[X]=nr}),p(),h=void 0;return}Object.entries(i).forEach(([X,{get:nr,mediaEvents:Uv=[],textTracksEvents:Bv=[],videoRenditionsEvents:Hv=[],audioTracksEvents:Wv=[],remoteEvents:Vv=[],rootEvents:Fv=[],stateOwnersUpdateHandlers:$v=[]}])=>{m[X]||(m[X]={});const Ye=he=>{const Ge=nr(l,he);u({[X]:Ge})};let ke;ke=m[X].mediaEvents,Uv.forEach(he=>{ke&&fn&&(l.media.removeEventListener(he,ke),m[X].mediaEvents=void 0),Gu&&(h.media.addEventListener(he,Ye),m[X].mediaEvents=Ye)}),ke=m[X].textTracksEvents,Bv.forEach(he=>{var Ge,ut;ke&&Vu&&((Ge=l.media.textTracks)==null||Ge.removeEventListener(he,ke),m[X].textTracksEvents=void 0),ju&&((ut=h.media.textTracks)==null||ut.addEventListener(he,Ye),m[X].textTracksEvents=Ye)}),ke=m[X].videoRenditionsEvents,Hv.forEach(he=>{var Ge,ut;ke&&Fu&&((Ge=l.media.videoRenditions)==null||Ge.removeEventListener(he,ke),m[X].videoRenditionsEvents=void 0),Qu&&((ut=h.media.videoRenditions)==null||ut.addEventListener(he,Ye),m[X].videoRenditionsEvents=Ye)}),ke=m[X].audioTracksEvents,Wv.forEach(he=>{var Ge,ut;ke&&$u&&((Ge=l.media.audioTracks)==null||Ge.removeEventListener(he,ke),m[X].audioTracksEvents=void 0),Zu&&((ut=h.media.audioTracks)==null||ut.addEventListener(he,Ye),m[X].audioTracksEvents=Ye)}),ke=m[X].remoteEvents,Vv.forEach(he=>{var Ge,ut;ke&&Ku&&((Ge=l.media.remote)==null||Ge.removeEventListener(he,ke),m[X].remoteEvents=void 0),zu&&((ut=h.media.remote)==null||ut.addEventListener(he,Ye),m[X].remoteEvents=Ye)}),ke=m[X].rootEvents,Fv.forEach(he=>{ke&&qu&&(l.documentElement.removeEventListener(he,ke),m[X].rootEvents=void 0),Xu&&(h.documentElement.addEventListener(he,Ye),m[X].rootEvents=Ye)});const ec=m[X].stateOwnersUpdateHandlers;$v.forEach(he=>{ec&&Yu&&ec(),Ju&&(m[X].stateOwnersUpdateHandlers=he(Ye,h))})}),Object.entries(h).forEach(([X,nr])=>{l[X]=nr}),p(),h=void 0};return v({media:e,fullscreenElement:t,documentElement:a,options:n}),{dispatch(_){const{type:b,detail:y}=_;if(r[b]&&d.mediaErrorCode==null){u(r[b](i,l,_));return}b==="mediaelementchangerequest"?v({media:y}):b==="fullscreenelementchangerequest"?v({fullscreenElement:y}):b==="documentelementchangerequest"?v({documentElement:y}):b==="optionschangerequest"&&Object.entries(y??{}).forEach(([T,E])=>{l.options[T]=E})},getState(){return d},subscribe(_){return v({},o.length+1),o.push(_),_(d),()=>{const b=o.indexOf(_);b>=0&&(v({},o.length-1),o.splice(b,1))}}}};var Gd=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},H=(e,t,a)=>(Gd(e,t,"read from private field"),a?a.call(e):t.get(e)),Qt=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},ua=(e,t,a,i)=>(Gd(e,t,"write to private field"),t.set(e,a),a),Aa=(e,t,a)=>(Gd(e,t,"access private method"),a),ja,Rr,ee,Dr,Dt,Zn,zn,wl,zi,sn,Xn,Sl;const op=["ArrowLeft","ArrowRight","Enter"," ","f","m","k","c"],Lc=10,R={DEFAULT_SUBTITLES:"defaultsubtitles",DEFAULT_STREAM_TYPE:"defaultstreamtype",DEFAULT_DURATION:"defaultduration",FULLSCREEN_ELEMENT:"fullscreenelement",HOTKEYS:"hotkeys",KEYS_USED:"keysused",LIVE_EDGE_OFFSET:"liveedgeoffset",SEEK_TO_LIVE_OFFSET:"seektoliveoffset",NO_AUTO_SEEK_TO_LIVE:"noautoseektolive",NO_HOTKEYS:"nohotkeys",NO_VOLUME_PREF:"novolumepref",NO_SUBTITLES_LANG_PREF:"nosubtitleslangpref",NO_DEFAULT_STORE:"nodefaultstore",KEYBOARD_FORWARD_SEEK_OFFSET:"keyboardforwardseekoffset",KEYBOARD_BACKWARD_SEEK_OFFSET:"keyboardbackwardseekoffset",LANG:"lang"};class lp extends yo{constructor(){super(),Qt(this,zn),Qt(this,zi),Qt(this,Xn),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,Qt(this,ja,new Kd(this,R.HOTKEYS)),Qt(this,Rr,void 0),Qt(this,ee,void 0),Qt(this,Dr,void 0),Qt(this,Dt,void 0),Qt(this,Zn,a=>{var i;(i=H(this,ee))==null||i.dispatch(a)}),this.associateElement(this);let t={};ua(this,Dr,a=>{Object.entries(a).forEach(([i,r])=>{if(i in t&&t[i]===r)return;this.propagateMediaState(i,r);const n=i.toLowerCase(),s=new f.CustomEvent(Y0[n],{composed:!0,detail:r});this.dispatchEvent(s)}),t=a}),this.enableHotkeys()}static get observedAttributes(){return super.observedAttributes.concat(R.NO_HOTKEYS,R.HOTKEYS,R.DEFAULT_STREAM_TYPE,R.DEFAULT_SUBTITLES,R.DEFAULT_DURATION,R.LANG)}get mediaStore(){return H(this,ee)}set mediaStore(t){var a,i;if(H(this,ee)&&((a=H(this,Dt))==null||a.call(this),ua(this,Dt,void 0)),ua(this,ee,t),!H(this,ee)&&!this.hasAttribute(R.NO_DEFAULT_STORE)){Aa(this,zn,wl).call(this);return}ua(this,Dt,(i=H(this,ee))==null?void 0:i.subscribe(H(this,Dr)))}get fullscreenElement(){var t;return(t=H(this,Rr))!=null?t:this}set fullscreenElement(t){var a;this.hasAttribute(R.FULLSCREEN_ELEMENT)&&this.removeAttribute(R.FULLSCREEN_ELEMENT),ua(this,Rr,t),(a=H(this,ee))==null||a.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}get defaultSubtitles(){return $(this,R.DEFAULT_SUBTITLES)}set defaultSubtitles(t){K(this,R.DEFAULT_SUBTITLES,t)}get defaultStreamType(){return ne(this,R.DEFAULT_STREAM_TYPE)}set defaultStreamType(t){se(this,R.DEFAULT_STREAM_TYPE,t)}get defaultDuration(){return re(this,R.DEFAULT_DURATION)}set defaultDuration(t){ce(this,R.DEFAULT_DURATION,t)}get noHotkeys(){return $(this,R.NO_HOTKEYS)}set noHotkeys(t){K(this,R.NO_HOTKEYS,t)}get keysUsed(){return ne(this,R.KEYS_USED)}set keysUsed(t){se(this,R.KEYS_USED,t)}get liveEdgeOffset(){return re(this,R.LIVE_EDGE_OFFSET)}set liveEdgeOffset(t){ce(this,R.LIVE_EDGE_OFFSET,t)}get noAutoSeekToLive(){return $(this,R.NO_AUTO_SEEK_TO_LIVE)}set noAutoSeekToLive(t){K(this,R.NO_AUTO_SEEK_TO_LIVE,t)}get noVolumePref(){return $(this,R.NO_VOLUME_PREF)}set noVolumePref(t){K(this,R.NO_VOLUME_PREF,t)}get noSubtitlesLangPref(){return $(this,R.NO_SUBTITLES_LANG_PREF)}set noSubtitlesLangPref(t){K(this,R.NO_SUBTITLES_LANG_PREF,t)}get noDefaultStore(){return $(this,R.NO_DEFAULT_STORE)}set noDefaultStore(t){K(this,R.NO_DEFAULT_STORE,t)}attributeChangedCallback(t,a,i){var r,n,s,o,l,d,u,p;if(super.attributeChangedCallback(t,a,i),t===R.NO_HOTKEYS)i!==a&&i===""?(this.hasAttribute(R.HOTKEYS)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):i!==a&&i===null&&this.enableHotkeys();else if(t===R.HOTKEYS)H(this,ja).value=i;else if(t===R.DEFAULT_SUBTITLES&&i!==a)(r=H(this,ee))==null||r.dispatch({type:"optionschangerequest",detail:{defaultSubtitles:this.hasAttribute(R.DEFAULT_SUBTITLES)}});else if(t===R.DEFAULT_STREAM_TYPE)(s=H(this,ee))==null||s.dispatch({type:"optionschangerequest",detail:{defaultStreamType:(n=this.getAttribute(R.DEFAULT_STREAM_TYPE))!=null?n:void 0}});else if(t===R.LIVE_EDGE_OFFSET)(o=H(this,ee))==null||o.dispatch({type:"optionschangerequest",detail:{liveEdgeOffset:this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?void 0:+this.getAttribute(R.LIVE_EDGE_OFFSET)}});else if(t===R.SEEK_TO_LIVE_OFFSET)(l=H(this,ee))==null||l.dispatch({type:"optionschangerequest",detail:{seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(R.SEEK_TO_LIVE_OFFSET):void 0}});else if(t===R.NO_AUTO_SEEK_TO_LIVE)(d=H(this,ee))==null||d.dispatch({type:"optionschangerequest",detail:{noAutoSeekToLive:this.hasAttribute(R.NO_AUTO_SEEK_TO_LIVE)}});else if(t===R.FULLSCREEN_ELEMENT){const m=i?(u=this.getRootNode())==null?void 0:u.getElementById(i):void 0;ua(this,Rr,m),(p=H(this,ee))==null||p.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}else t===R.LANG&&i!==a&&ng(i)}connectedCallback(){var t,a;!H(this,ee)&&!this.hasAttribute(R.NO_DEFAULT_STORE)&&Aa(this,zn,wl).call(this),(t=H(this,ee))==null||t.dispatch({type:"documentelementchangerequest",detail:Ae}),super.connectedCallback(),H(this,ee)&&!H(this,Dt)&&ua(this,Dt,(a=H(this,ee))==null?void 0:a.subscribe(H(this,Dr))),this.enableHotkeys()}disconnectedCallback(){var t,a,i,r;(t=super.disconnectedCallback)==null||t.call(this),H(this,ee)&&((a=H(this,ee))==null||a.dispatch({type:"documentelementchangerequest",detail:void 0}),(i=H(this,ee))==null||i.dispatch({type:D.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})),H(this,Dt)&&((r=H(this,Dt))==null||r.call(this),ua(this,Dt,void 0))}mediaSetCallback(t){var a;super.mediaSetCallback(t),(a=H(this,ee))==null||a.dispatch({type:"mediaelementchangerequest",detail:t}),t.hasAttribute("tabindex")||(t.tabIndex=-1)}mediaUnsetCallback(t){var a;super.mediaUnsetCallback(t),(a=H(this,ee))==null||a.dispatch({type:"mediaelementchangerequest",detail:void 0})}propagateMediaState(t,a){Nc(this.mediaStateReceivers,t,a)}associateElement(t){if(!t)return;const{associatedElementSubscriptions:a}=this;if(a.has(t))return;const i=this.registerMediaStateReceiver.bind(this),r=this.unregisterMediaStateReceiver.bind(this),n=Qg(t,i,r);Object.values(D).forEach(s=>{t.addEventListener(s,H(this,Zn))}),a.set(t,n)}unassociateElement(t){if(!t)return;const{associatedElementSubscriptions:a}=this;a.has(t)&&(a.get(t)(),a.delete(t),Object.values(D).forEach(i=>{t.removeEventListener(i,H(this,Zn))}))}registerMediaStateReceiver(t){if(!t)return;const a=this.mediaStateReceivers;a.indexOf(t)>-1||(a.push(t),H(this,ee)&&Object.entries(H(this,ee).getState()).forEach(([i,r])=>{Nc([t],i,r)}))}unregisterMediaStateReceiver(t){const a=this.mediaStateReceivers,i=a.indexOf(t);i<0||a.splice(i,1)}enableHotkeys(){this.addEventListener("keydown",Aa(this,Xn,Sl))}disableHotkeys(){this.removeEventListener("keydown",Aa(this,Xn,Sl)),this.removeEventListener("keyup",Aa(this,zi,sn))}get hotkeys(){return ne(this,R.HOTKEYS)}set hotkeys(t){se(this,R.HOTKEYS,t)}keyboardShortcutHandler(t){var a,i,r,n,s;const o=t.target;if(((r=(i=(a=o.getAttribute(R.KEYS_USED))==null?void 0:a.split(" "))!=null?i:o==null?void 0:o.keysUsed)!=null?r:[]).map(p=>p==="Space"?" ":p).filter(Boolean).includes(t.key))return;let l,d,u;if(!H(this,ja).contains(`no${t.key.toLowerCase()}`)&&!(t.key===" "&&H(this,ja).contains("nospace")))switch(t.key){case" ":case"k":l=H(this,ee).getState().mediaPaused?D.MEDIA_PLAY_REQUEST:D.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new f.CustomEvent(l,{composed:!0,bubbles:!0}));break;case"m":l=this.mediaStore.getState().mediaVolumeLevel==="off"?D.MEDIA_UNMUTE_REQUEST:D.MEDIA_MUTE_REQUEST,this.dispatchEvent(new f.CustomEvent(l,{composed:!0,bubbles:!0}));break;case"f":l=this.mediaStore.getState().mediaIsFullscreen?D.MEDIA_EXIT_FULLSCREEN_REQUEST:D.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new f.CustomEvent(l,{composed:!0,bubbles:!0}));break;case"c":this.dispatchEvent(new f.CustomEvent(D.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case"ArrowLeft":{const p=this.hasAttribute(R.KEYBOARD_BACKWARD_SEEK_OFFSET)?+this.getAttribute(R.KEYBOARD_BACKWARD_SEEK_OFFSET):Lc;d=Math.max(((n=this.mediaStore.getState().mediaCurrentTime)!=null?n:0)-p,0),u=new f.CustomEvent(D.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:d}),this.dispatchEvent(u);break}case"ArrowRight":{const p=this.hasAttribute(R.KEYBOARD_FORWARD_SEEK_OFFSET)?+this.getAttribute(R.KEYBOARD_FORWARD_SEEK_OFFSET):Lc;d=Math.max(((s=this.mediaStore.getState().mediaCurrentTime)!=null?s:0)+p,0),u=new f.CustomEvent(D.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:d}),this.dispatchEvent(u);break}}}}ja=new WeakMap;Rr=new WeakMap;ee=new WeakMap;Dr=new WeakMap;Dt=new WeakMap;Zn=new WeakMap;zn=new WeakSet;wl=function(){var e;this.mediaStore=$g({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(R.DEFAULT_SUBTITLES),defaultDuration:this.hasAttribute(R.DEFAULT_DURATION)?+this.getAttribute(R.DEFAULT_DURATION):void 0,defaultStreamType:(e=this.getAttribute(R.DEFAULT_STREAM_TYPE))!=null?e:void 0,liveEdgeOffset:this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(R.SEEK_TO_LIVE_OFFSET):this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,noAutoSeekToLive:this.hasAttribute(R.NO_AUTO_SEEK_TO_LIVE),noVolumePref:this.hasAttribute(R.NO_VOLUME_PREF),noSubtitlesLangPref:this.hasAttribute(R.NO_SUBTITLES_LANG_PREF)}})};zi=new WeakSet;sn=function(e){const{key:t}=e;if(!op.includes(t)){this.removeEventListener("keyup",Aa(this,zi,sn));return}this.keyboardShortcutHandler(e)};Xn=new WeakSet;Sl=function(e){const{metaKey:t,altKey:a,key:i}=e;if(t||a||!op.includes(i)){this.removeEventListener("keyup",Aa(this,zi,sn));return}[" ","ArrowLeft","ArrowRight"].includes(i)&&!(H(this,ja).contains(`no${i.toLowerCase()}`)||i===" "&&H(this,ja).contains("nospace"))&&e.preventDefault(),this.addEventListener("keyup",Aa(this,zi,sn),{once:!0})};const Kg=Object.values(c),qg=Object.values(Om),dp=e=>{var t,a,i,r;let{observedAttributes:n}=e.constructor;!n&&(t=e.nodeName)!=null&&t.includes("-")&&(f.customElements.upgrade(e),{observedAttributes:n}=e.constructor);const s=(r=(i=(a=e==null?void 0:e.getAttribute)==null?void 0:a.call(e,Y.MEDIA_CHROME_ATTRIBUTES))==null?void 0:i.split)==null?void 0:r.call(i,/\s+/);return Array.isArray(n||s)?(n||s).filter(o=>Kg.includes(o)):[]},Yg=e=>{var t,a;return(t=e.nodeName)!=null&&t.includes("-")&&f.customElements.get((a=e.nodeName)==null?void 0:a.toLowerCase())&&!(e instanceof f.customElements.get(e.nodeName.toLowerCase()))&&f.customElements.upgrade(e),qg.some(i=>i in e)},Il=e=>Yg(e)||!!dp(e).length,Mc=e=>{var t;return(t=e==null?void 0:e.join)==null?void 0:t.call(e,":")},Oc={[c.MEDIA_SUBTITLES_LIST]:nn,[c.MEDIA_SUBTITLES_SHOWING]:nn,[c.MEDIA_SEEKABLE]:Mc,[c.MEDIA_BUFFERED]:e=>e==null?void 0:e.map(Mc).join(" "),[c.MEDIA_PREVIEW_COORDS]:e=>e==null?void 0:e.join(" "),[c.MEDIA_RENDITION_LIST]:j0,[c.MEDIA_AUDIO_TRACK_LIST]:X0},Gg=async(e,t,a)=>{var i,r;if(e.isConnected||await Pm(0),typeof a=="boolean"||a==null)return K(e,t,a);if(typeof a=="number")return ce(e,t,a);if(typeof a=="string")return se(e,t,a);if(Array.isArray(a)&&!a.length)return e.removeAttribute(t);const n=(r=(i=Oc[t])==null?void 0:i.call(Oc,a))!=null?r:a;return e.setAttribute(t,n)},jg=e=>{var t;return!!((t=e.closest)!=null&&t.call(e,'*[slot="media"]'))},Pa=(e,t)=>{if(jg(e))return;const a=(r,n)=>{var s,o;Il(r)&&n(r);const{children:l=[]}=r??{},d=(o=(s=r==null?void 0:r.shadowRoot)==null?void 0:s.children)!=null?o:[];[...l,...d].forEach(u=>Pa(u,n))},i=e==null?void 0:e.nodeName.toLowerCase();if(i.includes("-")&&!Il(e)){f.customElements.whenDefined(i).then(()=>{a(e,t)});return}a(e,t)},Nc=(e,t,a)=>{e.forEach(i=>{if(t in i){i[t]=a;return}const r=dp(i),n=t.toLowerCase();r.includes(n)&&Gg(i,n,a)})},Qg=(e,t,a)=>{Pa(e,t);const i=d=>{var u;const p=(u=d==null?void 0:d.composedPath()[0])!=null?u:d.target;t(p)},r=d=>{var u;const p=(u=d==null?void 0:d.composedPath()[0])!=null?u:d.target;a(p)};e.addEventListener(D.REGISTER_MEDIA_STATE_RECEIVER,i),e.addEventListener(D.UNREGISTER_MEDIA_STATE_RECEIVER,r);const n=d=>{d.forEach(u=>{const{addedNodes:p=[],removedNodes:m=[],type:h,target:v,attributeName:_}=u;h==="childList"?(Array.prototype.forEach.call(p,b=>Pa(b,t)),Array.prototype.forEach.call(m,b=>Pa(b,a))):h==="attributes"&&_===Y.MEDIA_CHROME_ATTRIBUTES&&(Il(v)?t(v):a(v))})};let s=[];const o=d=>{const u=d.target;u.name!=="media"&&(s.forEach(p=>Pa(p,a)),s=[...u.assignedElements({flatten:!0})],s.forEach(p=>Pa(p,t)))};e.addEventListener("slotchange",o);const l=new MutationObserver(n);return l.observe(e,{childList:!0,attributes:!0,subtree:!0}),()=>{Pa(e,a),e.removeEventListener("slotchange",o),l.disconnect(),e.removeEventListener(D.REGISTER_MEDIA_STATE_RECEIVER,i),e.removeEventListener(D.UNREGISTER_MEDIA_STATE_RECEIVER,r)}};f.customElements.get("media-controller")||f.customElements.define("media-controller",lp);var Zg=lp;const di={PLACEMENT:"placement",BOUNDS:"bounds"};function zg(e){return`
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `}class ko extends f.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{var t;if(!qm(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;const a=this.placement;if(a==="left"||a==="right"){this.style.removeProperty("--media-tooltip-offset-x");return}const i=getComputedStyle(this),r=(t=er(this,"#"+this.bounds))!=null?t:lt(this);if(!r)return;const{x:n,width:s}=r.getBoundingClientRect(),{x:o,width:l}=this.getBoundingClientRect(),d=o+l,u=n+s,p=i.getPropertyValue("--media-tooltip-offset-x"),m=p?parseFloat(p.replace("px","")):0,h=i.getPropertyValue("--media-tooltip-container-margin"),v=h?parseFloat(h.replace("px","")):0,_=o-n+m-v,b=d-u+m+v;if(_<0){this.style.setProperty("--media-tooltip-offset-x",`${_}px`);return}if(b>0){this.style.setProperty("--media-tooltip-offset-x",`${b}px`);return}this.style.removeProperty("--media-tooltip-offset-x")},!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}if(this.arrowEl=this.shadowRoot.querySelector("#arrow"),Object.prototype.hasOwnProperty.call(this,"placement")){const t=this.placement;delete this.placement,this.placement=t}}static get observedAttributes(){return[di.PLACEMENT,di.BOUNDS]}get placement(){return ne(this,di.PLACEMENT)}set placement(t){se(this,di.PLACEMENT,t)}get bounds(){return ne(this,di.BOUNDS)}set bounds(t){se(this,di.BOUNDS,t)}}ko.shadowRootOptions={mode:"open"};ko.getTemplateHTML=zg;f.customElements.get("media-tooltip")||f.customElements.define("media-tooltip",ko);var xc=ko,jd=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},ve=(e,t,a)=>(jd(e,t,"read from private field"),a?a.call(e):t.get(e)),ui=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Tn=(e,t,a,i)=>(jd(e,t,"write to private field"),t.set(e,a),a),Xg=(e,t,a)=>(jd(e,t,"access private method"),a),Ct,Pi,ka,_i,Jn,Rl,up;const ca={TOOLTIP_PLACEMENT:"tooltipplacement",DISABLED:"disabled",NO_TOOLTIP:"notooltip"};function Jg(e,t={}){return`
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${xc.shadowRootOptions.mode}">
          ${xc.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(e)}
        </slot>
      </media-tooltip>
    </slot>
  `}function e1(e,t){return`
    <slot></slot>
  `}function t1(){return""}class Me extends f.HTMLElement{constructor(){if(super(),ui(this,Rl),ui(this,Ct,void 0),this.preventClick=!1,this.tooltipEl=null,ui(this,Pi,t=>{this.preventClick||this.handleClick(t),setTimeout(ve(this,ka),0)}),ui(this,ka,()=>{var t,a;(a=(t=this.tooltipEl)==null?void 0:t.updateXOffset)==null||a.call(t)}),ui(this,_i,t=>{const{key:a}=t;if(!this.keysUsed.includes(a)){this.removeEventListener("keyup",ve(this,_i));return}this.preventClick||this.handleClick(t)}),ui(this,Jn,t=>{const{metaKey:a,altKey:i,key:r}=t;if(a||i||!this.keysUsed.includes(r)){this.removeEventListener("keyup",ve(this,_i));return}this.addEventListener("keyup",ve(this,_i),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes),a=this.constructor.getTemplateHTML(t);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(a):this.shadowRoot.innerHTML=a}this.tooltipEl=this.shadowRoot.querySelector("media-tooltip")}static get observedAttributes(){return["disabled",ca.TOOLTIP_PLACEMENT,Y.MEDIA_CONTROLLER]}enable(){this.addEventListener("click",ve(this,Pi)),this.addEventListener("keydown",ve(this,Jn)),this.tabIndex=0}disable(){this.removeEventListener("click",ve(this,Pi)),this.removeEventListener("keydown",ve(this,Jn)),this.removeEventListener("keyup",ve(this,_i)),this.tabIndex=-1}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===Y.MEDIA_CONTROLLER?(a&&((n=(r=ve(this,Ct))==null?void 0:r.unassociateElement)==null||n.call(r,this),Tn(this,Ct,null)),i&&this.isConnected&&(Tn(this,Ct,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=ve(this,Ct))==null?void 0:o.associateElement)==null||l.call(o,this))):t==="disabled"&&i!==a?i==null?this.enable():this.disable():t===ca.TOOLTIP_PLACEMENT&&this.tooltipEl&&i!==a&&(this.tooltipEl.placement=i),ve(this,ka).call(this)}connectedCallback(){var t,a,i;const{style:r}=be(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute("disabled")?this.disable():this.enable(),this.setAttribute("role","button");const n=this.getAttribute(Y.MEDIA_CONTROLLER);n&&(Tn(this,Ct,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(i=(a=ve(this,Ct))==null?void 0:a.associateElement)==null||i.call(a,this)),f.customElements.whenDefined("media-tooltip").then(()=>Xg(this,Rl,up).call(this))}disconnectedCallback(){var t,a;this.disable(),(a=(t=ve(this,Ct))==null?void 0:t.unassociateElement)==null||a.call(t,this),Tn(this,Ct,null),this.removeEventListener("mouseenter",ve(this,ka)),this.removeEventListener("focus",ve(this,ka)),this.removeEventListener("click",ve(this,Pi))}get keysUsed(){return["Enter"," "]}get tooltipPlacement(){return ne(this,ca.TOOLTIP_PLACEMENT)}set tooltipPlacement(t){se(this,ca.TOOLTIP_PLACEMENT,t)}get mediaController(){return ne(this,Y.MEDIA_CONTROLLER)}set mediaController(t){se(this,Y.MEDIA_CONTROLLER,t)}get disabled(){return $(this,ca.DISABLED)}set disabled(t){K(this,ca.DISABLED,t)}get noTooltip(){return $(this,ca.NO_TOOLTIP)}set noTooltip(t){K(this,ca.NO_TOOLTIP,t)}handleClick(t){}}Ct=new WeakMap;Pi=new WeakMap;ka=new WeakMap;_i=new WeakMap;Jn=new WeakMap;Rl=new WeakSet;up=function(){this.addEventListener("mouseenter",ve(this,ka)),this.addEventListener("focus",ve(this,ka)),this.addEventListener("click",ve(this,Pi));const e=this.tooltipPlacement;e&&this.tooltipEl&&(this.tooltipEl.placement=e)};Me.shadowRootOptions={mode:"open"};Me.getTemplateHTML=Jg;Me.getSlotTemplateHTML=e1;Me.getTooltipContentHTML=t1;f.customElements.get("media-chrome-button")||f.customElements.define("media-chrome-button",Me);const Pc=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;function a1(e){return`
    <style>
      :host([${c.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${c.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${c.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${c.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Pc}</slot>
      <slot name="exit">${Pc}</slot>
    </slot>
  `}function i1(){return`
    <slot name="tooltip-enter">${C("start airplay")}</slot>
    <slot name="tooltip-exit">${C("stop airplay")}</slot>
  `}const Uc=e=>{const t=e.mediaIsAirplaying?C("stop airplay"):C("start airplay");e.setAttribute("aria-label",t)};class Qd extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_IS_AIRPLAYING,c.MEDIA_AIRPLAY_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Uc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_IS_AIRPLAYING&&Uc(this)}get mediaIsAirplaying(){return $(this,c.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(t){K(this,c.MEDIA_IS_AIRPLAYING,t)}get mediaAirplayUnavailable(){return ne(this,c.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(t){se(this,c.MEDIA_AIRPLAY_UNAVAILABLE,t)}handleClick(){const t=new f.CustomEvent(D.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(t)}}Qd.getSlotTemplateHTML=a1;Qd.getTooltipContentHTML=i1;f.customElements.get("media-airplay-button")||f.customElements.define("media-airplay-button",Qd);const r1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,n1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function s1(e){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${r1}</slot>
      <slot name="off">${n1}</slot>
    </slot>
  `}function o1(){return`
    <slot name="tooltip-enable">${C("Enable captions")}</slot>
    <slot name="tooltip-disable">${C("Disable captions")}</slot>
  `}const Bc=e=>{e.setAttribute("aria-checked",ap(e).toString())};class Zd extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_SUBTITLES_LIST,c.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("role","switch"),this.setAttribute("aria-label",C("closed captions")),Bc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_SUBTITLES_SHOWING&&Bc(this)}get mediaSubtitlesList(){return Hc(this,c.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){Wc(this,c.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return Hc(this,c.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){Wc(this,c.MEDIA_SUBTITLES_SHOWING,t)}handleClick(){this.dispatchEvent(new f.CustomEvent(D.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}}Zd.getSlotTemplateHTML=s1;Zd.getTooltipContentHTML=o1;const Hc=(e,t)=>{const a=e.getAttribute(t);return a?To(a):[]},Wc=(e,t,a)=>{if(!(a!=null&&a.length)){e.removeAttribute(t);return}const i=nn(a);e.getAttribute(t)!==i&&e.setAttribute(t,i)};f.customElements.get("media-captions-button")||f.customElements.define("media-captions-button",Zd);const l1='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>',d1='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>';function u1(e){return`
    <style>
      :host([${c.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${c.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${c.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${c.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${l1}</slot>
      <slot name="exit">${d1}</slot>
    </slot>
  `}function c1(){return`
    <slot name="tooltip-enter">${C("Start casting")}</slot>
    <slot name="tooltip-exit">${C("Stop casting")}</slot>
  `}const Vc=e=>{const t=e.mediaIsCasting?C("stop casting"):C("start casting");e.setAttribute("aria-label",t)};class zd extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_IS_CASTING,c.MEDIA_CAST_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Vc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_IS_CASTING&&Vc(this)}get mediaIsCasting(){return $(this,c.MEDIA_IS_CASTING)}set mediaIsCasting(t){K(this,c.MEDIA_IS_CASTING,t)}get mediaCastUnavailable(){return ne(this,c.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(t){se(this,c.MEDIA_CAST_UNAVAILABLE,t)}handleClick(){const t=this.mediaIsCasting?D.MEDIA_EXIT_CAST_REQUEST:D.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new f.CustomEvent(t,{composed:!0,bubbles:!0}))}}zd.getSlotTemplateHTML=u1;zd.getTooltipContentHTML=c1;f.customElements.get("media-cast-button")||f.customElements.define("media-cast-button",zd);var Xd=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Ja=(e,t,a)=>(Xd(e,t,"read from private field"),t.get(e)),Zt=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Jd=(e,t,a,i)=>(Xd(e,t,"write to private field"),t.set(e,a),a),La=(e,t,a)=>(Xd(e,t,"access private method"),a),zs,on,ri,es,Dl,Cl,cp,Ll,hp,Ml,mp,Ol,pp,Nl,vp;function h1(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `}function m1(e){return`
    <slot id="content"></slot>
  `}const dr={OPEN:"open",ANCHOR:"anchor"};class En extends f.HTMLElement{constructor(){super(),Zt(this,es),Zt(this,Cl),Zt(this,Ll),Zt(this,Ml),Zt(this,Ol),Zt(this,Nl),Zt(this,zs,!1),Zt(this,on,null),Zt(this,ri,null),this.addEventListener("invoke",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this)}static get observedAttributes(){return[dr.OPEN,dr.ANCHOR]}get open(){return $(this,dr.OPEN)}set open(t){K(this,dr.OPEN,t)}handleEvent(t){switch(t.type){case"invoke":La(this,Ml,mp).call(this,t);break;case"focusout":La(this,Ol,pp).call(this,t);break;case"keydown":La(this,Nl,vp).call(this,t);break}}connectedCallback(){La(this,es,Dl).call(this),this.role||(this.role="dialog")}attributeChangedCallback(t,a,i){La(this,es,Dl).call(this),t===dr.OPEN&&i!==a&&(this.open?La(this,Cl,cp).call(this):La(this,Ll,hp).call(this))}focus(){Jd(this,on,Vd());const t=!this.dispatchEvent(new Event("focus",{composed:!0,cancelable:!0})),a=!this.dispatchEvent(new Event("focusin",{composed:!0,bubbles:!0,cancelable:!0}));if(t||a)return;const i=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');i==null||i.focus()}get keysUsed(){return["Escape","Tab"]}}zs=new WeakMap;on=new WeakMap;ri=new WeakMap;es=new WeakSet;Dl=function(){if(!Ja(this,zs)&&(Jd(this,zs,!0),!this.shadowRoot)){this.attachShadow(this.constructor.shadowRootOptions);const e=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e),queueMicrotask(()=>{const{style:t}=be(this.shadowRoot,":host");t.setProperty("transition","display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in")})}};Cl=new WeakSet;cp=function(){var e;(e=Ja(this,ri))==null||e.setAttribute("aria-expanded","true"),this.dispatchEvent(new Event("open",{composed:!0,bubbles:!0})),this.addEventListener("transitionend",()=>this.focus(),{once:!0})};Ll=new WeakSet;hp=function(){var e;(e=Ja(this,ri))==null||e.setAttribute("aria-expanded","false"),this.dispatchEvent(new Event("close",{composed:!0,bubbles:!0}))};Ml=new WeakSet;mp=function(e){Jd(this,ri,e.relatedTarget),la(this,e.relatedTarget)||(this.open=!this.open)};Ol=new WeakSet;pp=function(e){var t;la(this,e.relatedTarget)||((t=Ja(this,on))==null||t.focus(),Ja(this,ri)&&Ja(this,ri)!==e.relatedTarget&&this.open&&(this.open=!1))};Nl=new WeakSet;vp=function(e){var t,a,i,r,n;const{key:s,ctrlKey:o,altKey:l,metaKey:d}=e;o||l||d||this.keysUsed.includes(s)&&(e.preventDefault(),e.stopPropagation(),s==="Tab"?(e.shiftKey?(a=(t=this.previousElementSibling)==null?void 0:t.focus)==null||a.call(t):(r=(i=this.nextElementSibling)==null?void 0:i.focus)==null||r.call(i),this.blur()):s==="Escape"&&((n=Ja(this,on))==null||n.focus(),this.open=!1))};En.shadowRootOptions={mode:"open"};En.getTemplateHTML=h1;En.getSlotTemplateHTML=m1;f.customElements.get("media-chrome-dialog")||f.customElements.define("media-chrome-dialog",En);var eu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},le=(e,t,a)=>(eu(e,t,"read from private field"),a?a.call(e):t.get(e)),Ce=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},pa=(e,t,a,i)=>(eu(e,t,"write to private field"),t.set(e,a),a),vt=(e,t,a)=>(eu(e,t,"access private method"),a),Lt,wo,ts,as,ft,Xs,is,rs,ns,tu,Ep,ss,xl,os,Pl,Js,au,Ul,fp,Bl,bp,Hl,gp,Wl,_p;function p1(e){return`
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, -7px);
        height: var(--media-time-range-hover-height, max(100% + 7px, 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, -5px);
          height: var(--media-time-range-hover-height, max(100% + 5px, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
      <input id="range" type="range" min="0" max="1" step="any" value="0">
    </div>
    <div id="rightgap"></div>
  `}class tr extends f.HTMLElement{constructor(){if(super(),Ce(this,tu),Ce(this,ss),Ce(this,os),Ce(this,Js),Ce(this,Ul),Ce(this,Bl),Ce(this,Hl),Ce(this,Wl),Ce(this,Lt,void 0),Ce(this,wo,void 0),Ce(this,ts,void 0),Ce(this,as,void 0),Ce(this,ft,{}),Ce(this,Xs,[]),Ce(this,is,()=>{if(this.range.matches(":focus-visible")){const{style:t}=be(this.shadowRoot,":host");t.setProperty("--_focus-visible-box-shadow","var(--_focus-box-shadow)")}}),Ce(this,rs,()=>{const{style:t}=be(this.shadowRoot,":host");t.removeProperty("--_focus-visible-box-shadow")}),Ce(this,ns,()=>{const t=this.shadowRoot.querySelector("#segments-clipping");t&&t.parentNode.append(t)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes),a=this.constructor.getTemplateHTML(t);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(a):this.shadowRoot.innerHTML=a}this.container=this.shadowRoot.querySelector("#container"),pa(this,ts,this.shadowRoot.querySelector("#startpoint")),pa(this,as,this.shadowRoot.querySelector("#endpoint")),this.range=this.shadowRoot.querySelector("#range"),this.appearance=this.shadowRoot.querySelector("#appearance")}static get observedAttributes(){return["disabled","aria-disabled",Y.MEDIA_CONTROLLER]}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===Y.MEDIA_CONTROLLER?(a&&((n=(r=le(this,Lt))==null?void 0:r.unassociateElement)==null||n.call(r,this),pa(this,Lt,null)),i&&this.isConnected&&(pa(this,Lt,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=le(this,Lt))==null?void 0:o.associateElement)==null||l.call(o,this))):(t==="disabled"||t==="aria-disabled"&&a!==i)&&(i==null?(this.range.removeAttribute(t),vt(this,ss,xl).call(this)):(this.range.setAttribute(t,i),vt(this,os,Pl).call(this)))}connectedCallback(){var t,a,i;const{style:r}=be(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),le(this,ft).pointer=be(this.shadowRoot,"#pointer"),le(this,ft).progress=be(this.shadowRoot,"#progress"),le(this,ft).thumb=be(this.shadowRoot,'#thumb, ::slotted([slot="thumb"])'),le(this,ft).activeSegment=be(this.shadowRoot,"#segments-clipping rect:nth-child(0)");const n=this.getAttribute(Y.MEDIA_CONTROLLER);n&&(pa(this,Lt,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(i=(a=le(this,Lt))==null?void 0:a.associateElement)==null||i.call(a,this)),this.updateBar(),this.shadowRoot.addEventListener("focusin",le(this,is)),this.shadowRoot.addEventListener("focusout",le(this,rs)),vt(this,ss,xl).call(this),ji(this.container,le(this,ns))}disconnectedCallback(){var t,a;vt(this,os,Pl).call(this),(a=(t=le(this,Lt))==null?void 0:t.unassociateElement)==null||a.call(t,this),pa(this,Lt,null),this.shadowRoot.removeEventListener("focusin",le(this,is)),this.shadowRoot.removeEventListener("focusout",le(this,rs)),Qi(this.container,le(this,ns))}updatePointerBar(t){var a;(a=le(this,ft).pointer)==null||a.style.setProperty("width",`${this.getPointerRatio(t)*100}%`)}updateBar(){var t,a;const i=this.range.valueAsNumber*100;(t=le(this,ft).progress)==null||t.style.setProperty("width",`${i}%`),(a=le(this,ft).thumb)==null||a.style.setProperty("left",`${i}%`)}updateSegments(t){const a=this.shadowRoot.querySelector("#segments-clipping");if(a.textContent="",this.container.classList.toggle("segments",!!(t!=null&&t.length)),!(t!=null&&t.length))return;const i=[...new Set([+this.range.min,...t.flatMap(n=>[n.start,n.end]),+this.range.max])];pa(this,Xs,[...i]);const r=i.pop();for(const[n,s]of i.entries()){const[o,l]=[n===0,n===i.length-1],d=o?"calc(var(--segments-gap) / -1)":`${s*100}%`,u=`calc(${((l?r:i[n+1])-s)*100}%${o||l?"":" - var(--segments-gap)"})`,p=Ae.createElementNS("https://www.w3.org/2000/svg","rect"),m=be(this.shadowRoot,`#segments-clipping rect:nth-child(${n+1})`);m.style.setProperty("x",d),m.style.setProperty("width",u),a.append(p)}}getPointerRatio(t){return dg(t.clientX,t.clientY,le(this,ts).getBoundingClientRect(),le(this,as).getBoundingClientRect())}get dragging(){return this.hasAttribute("dragging")}handleEvent(t){switch(t.type){case"pointermove":vt(this,Wl,_p).call(this,t);break;case"input":this.updateBar();break;case"pointerenter":vt(this,Ul,fp).call(this,t);break;case"pointerdown":vt(this,Js,au).call(this,t);break;case"pointerup":vt(this,Bl,bp).call(this);break;case"pointerleave":vt(this,Hl,gp).call(this);break}}get keysUsed(){return["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]}}Lt=new WeakMap;wo=new WeakMap;ts=new WeakMap;as=new WeakMap;ft=new WeakMap;Xs=new WeakMap;is=new WeakMap;rs=new WeakMap;ns=new WeakMap;tu=new WeakSet;Ep=function(e){const t=le(this,ft).activeSegment;if(!t)return;const a=this.getPointerRatio(e),i=`#segments-clipping rect:nth-child(${le(this,Xs).findIndex((r,n,s)=>{const o=s[n+1];return o!=null&&a>=r&&a<=o})+1})`;(t.selectorText!=i||!t.style.transform)&&(t.selectorText=i,t.style.setProperty("transform","var(--media-range-segment-hover-transform, scaleY(2))"))};ss=new WeakSet;xl=function(){this.hasAttribute("disabled")||(this.addEventListener("input",this),this.addEventListener("pointerdown",this),this.addEventListener("pointerenter",this))};os=new WeakSet;Pl=function(){var e,t;this.removeEventListener("input",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointerenter",this),(e=f.window)==null||e.removeEventListener("pointerup",this),(t=f.window)==null||t.removeEventListener("pointermove",this)};Js=new WeakSet;au=function(e){var t;pa(this,wo,e.composedPath().includes(this.range)),(t=f.window)==null||t.addEventListener("pointerup",this)};Ul=new WeakSet;fp=function(e){var t;e.pointerType!=="mouse"&&vt(this,Js,au).call(this,e),this.addEventListener("pointerleave",this),(t=f.window)==null||t.addEventListener("pointermove",this)};Bl=new WeakSet;bp=function(){var e;(e=f.window)==null||e.removeEventListener("pointerup",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled")};Hl=new WeakSet;gp=function(){var e,t;this.removeEventListener("pointerleave",this),(e=f.window)==null||e.removeEventListener("pointermove",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled"),(t=le(this,ft).activeSegment)==null||t.style.removeProperty("transform")};Wl=new WeakSet;_p=function(e){this.toggleAttribute("dragging",e.buttons===1||e.pointerType!=="mouse"),this.updatePointerBar(e),vt(this,tu,Ep).call(this,e),this.dragging&&(e.pointerType!=="mouse"||!le(this,wo))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(e),this.range.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})))};tr.shadowRootOptions={mode:"open"};tr.getTemplateHTML=p1;f.customElements.get("media-chrome-range")||f.customElements.define("media-chrome-range",tr);var yp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},An=(e,t,a)=>(yp(e,t,"read from private field"),a?a.call(e):t.get(e)),v1=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},kn=(e,t,a,i)=>(yp(e,t,"write to private field"),t.set(e,a),a),Mt;function E1(e){return`
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `}class iu extends f.HTMLElement{constructor(){if(super(),v1(this,Mt,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[Y.MEDIA_CONTROLLER]}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===Y.MEDIA_CONTROLLER&&(a&&((n=(r=An(this,Mt))==null?void 0:r.unassociateElement)==null||n.call(r,this),kn(this,Mt,null)),i&&this.isConnected&&(kn(this,Mt,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=An(this,Mt))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,a,i;const r=this.getAttribute(Y.MEDIA_CONTROLLER);r&&(kn(this,Mt,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(i=(a=An(this,Mt))==null?void 0:a.associateElement)==null||i.call(a,this))}disconnectedCallback(){var t,a;(a=(t=An(this,Mt))==null?void 0:t.unassociateElement)==null||a.call(t,this),kn(this,Mt,null)}}Mt=new WeakMap;iu.shadowRootOptions={mode:"open"};iu.getTemplateHTML=E1;f.customElements.get("media-control-bar")||f.customElements.define("media-control-bar",iu);var Tp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},wn=(e,t,a)=>(Tp(e,t,"read from private field"),a?a.call(e):t.get(e)),f1=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Sn=(e,t,a,i)=>(Tp(e,t,"write to private field"),t.set(e,a),a),Ot;function b1(e,t={}){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}
  `}function g1(e,t){return`
    <slot></slot>
  `}class Da extends f.HTMLElement{constructor(){if(super(),f1(this,Ot,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[Y.MEDIA_CONTROLLER]}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===Y.MEDIA_CONTROLLER&&(a&&((n=(r=wn(this,Ot))==null?void 0:r.unassociateElement)==null||n.call(r,this),Sn(this,Ot,null)),i&&this.isConnected&&(Sn(this,Ot,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=wn(this,Ot))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,a,i;const{style:r}=be(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);const n=this.getAttribute(Y.MEDIA_CONTROLLER);n&&(Sn(this,Ot,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(i=(a=wn(this,Ot))==null?void 0:a.associateElement)==null||i.call(a,this))}disconnectedCallback(){var t,a;(a=(t=wn(this,Ot))==null?void 0:t.unassociateElement)==null||a.call(t,this),Sn(this,Ot,null)}}Ot=new WeakMap;Da.shadowRootOptions={mode:"open"};Da.getTemplateHTML=b1;Da.getSlotTemplateHTML=g1;f.customElements.get("media-text-display")||f.customElements.define("media-text-display",Da);var Ap=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Fc=(e,t,a)=>(Ap(e,t,"read from private field"),a?a.call(e):t.get(e)),_1=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},y1=(e,t,a,i)=>(Ap(e,t,"write to private field"),t.set(e,a),a),Cr;function T1(e,t){return`
    <slot>${Ia(t.mediaDuration)}</slot>
  `}class kp extends Da{constructor(){var t;super(),_1(this,Cr,void 0),y1(this,Cr,this.shadowRoot.querySelector("slot")),Fc(this,Cr).textContent=Ia((t=this.mediaDuration)!=null?t:0)}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_DURATION]}attributeChangedCallback(t,a,i){t===c.MEDIA_DURATION&&(Fc(this,Cr).textContent=Ia(+i)),super.attributeChangedCallback(t,a,i)}get mediaDuration(){return re(this,c.MEDIA_DURATION)}set mediaDuration(t){ce(this,c.MEDIA_DURATION,t)}}Cr=new WeakMap;kp.getSlotTemplateHTML=T1;f.customElements.get("media-duration-display")||f.customElements.define("media-duration-display",kp);const A1={2:C("Network Error"),3:C("Decode Error"),4:C("Source Not Supported"),5:C("Encryption Error")},k1={2:C("A network error caused the media download to fail."),3:C("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."),4:C("An unsupported error occurred. The server or network failed, or your browser does not support this format."),5:C("The media is encrypted and there are no keys to decrypt it.")},wp=e=>{var t,a;return e.code===1?null:{title:(t=A1[e.code])!=null?t:`Error ${e.code}`,message:(a=k1[e.code])!=null?a:e.message}};var Sp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},w1=(e,t,a)=>(Sp(e,t,"read from private field"),a?a.call(e):t.get(e)),S1=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},I1=(e,t,a,i)=>(Sp(e,t,"write to private field"),t.set(e,a),a),ls;function R1(e){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${e.mediaerrorcode}" id="content">
      ${Ip({code:+e.mediaerrorcode,message:e.mediaerrormessage})}
    </slot>
  `}function D1(e){return e.code&&wp(e)!==null}function Ip(e){var t;const{title:a,message:i}=(t=wp(e))!=null?t:{};let r="";return a&&(r+=`<slot name="error-${e.code}-title"><h3>${a}</h3></slot>`),i&&(r+=`<slot name="error-${e.code}-message"><p>${i}</p></slot>`),r}const $c=[c.MEDIA_ERROR_CODE,c.MEDIA_ERROR_MESSAGE];class So extends En{constructor(){super(...arguments),S1(this,ls,null)}static get observedAttributes(){return[...super.observedAttributes,...$c]}formatErrorMessage(t){return this.constructor.formatErrorMessage(t)}attributeChangedCallback(t,a,i){var r;if(super.attributeChangedCallback(t,a,i),!$c.includes(t))return;const n=(r=this.mediaError)!=null?r:{code:this.mediaErrorCode,message:this.mediaErrorMessage};this.open=D1(n),this.open&&(this.shadowRoot.querySelector("slot").name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector("#content").innerHTML=this.formatErrorMessage(n))}get mediaError(){return w1(this,ls)}set mediaError(t){I1(this,ls,t)}get mediaErrorCode(){return re(this,"mediaerrorcode")}set mediaErrorCode(t){ce(this,"mediaerrorcode",t)}get mediaErrorMessage(){return ne(this,"mediaerrormessage")}set mediaErrorMessage(t){se(this,"mediaerrormessage",t)}}ls=new WeakMap;So.getSlotTemplateHTML=R1;So.formatErrorMessage=Ip;f.customElements.get("media-error-dialog")||f.customElements.define("media-error-dialog",So);var Rp=So;const C1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,L1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;function M1(e){return`
    <style>
      :host([${c.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${c.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${c.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${c.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${C1}</slot>
      <slot name="exit">${L1}</slot>
    </slot>
  `}function O1(){return`
    <slot name="tooltip-enter">${C("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${C("Exit fullscreen mode")}</slot>
  `}const Kc=e=>{const t=e.mediaIsFullscreen?C("exit fullscreen mode"):C("enter fullscreen mode");e.setAttribute("aria-label",t)};class ru extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_IS_FULLSCREEN,c.MEDIA_FULLSCREEN_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Kc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_IS_FULLSCREEN&&Kc(this)}get mediaFullscreenUnavailable(){return ne(this,c.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(t){se(this,c.MEDIA_FULLSCREEN_UNAVAILABLE,t)}get mediaIsFullscreen(){return $(this,c.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(t){K(this,c.MEDIA_IS_FULLSCREEN,t)}handleClick(){const t=this.mediaIsFullscreen?D.MEDIA_EXIT_FULLSCREEN_REQUEST:D.MEDIA_ENTER_FULLSCREEN_REQUEST;this.dispatchEvent(new f.CustomEvent(t,{composed:!0,bubbles:!0}))}}ru.getSlotTemplateHTML=M1;ru.getTooltipContentHTML=O1;f.customElements.get("media-fullscreen-button")||f.customElements.define("media-fullscreen-button",ru);const{MEDIA_TIME_IS_LIVE:ds,MEDIA_PAUSED:qr}=c,{MEDIA_SEEK_TO_LIVE_REQUEST:N1,MEDIA_PLAY_REQUEST:x1}=D,P1='<svg viewBox="0 0 6 12"><circle cx="3" cy="6" r="2"></circle></svg>';function U1(e){return`
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${ds}]:not([${qr}])) slot[name=indicator] > *,
      :host([${ds}]:not([${qr}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${ds}]:not([${qr}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${P1}</slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${C("live")}</slot>
  `}const qc=e=>{const t=e.mediaPaused||!e.mediaTimeIsLive,a=C(t?"seek to live":"playing live");e.setAttribute("aria-label",a),t?e.removeAttribute("aria-disabled"):e.setAttribute("aria-disabled","true")};class Dp extends Me{static get observedAttributes(){return[...super.observedAttributes,ds,qr]}connectedCallback(){super.connectedCallback(),qc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),qc(this)}get mediaPaused(){return $(this,c.MEDIA_PAUSED)}set mediaPaused(t){K(this,c.MEDIA_PAUSED,t)}get mediaTimeIsLive(){return $(this,c.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(t){K(this,c.MEDIA_TIME_IS_LIVE,t)}handleClick(){!this.mediaPaused&&this.mediaTimeIsLive||(this.dispatchEvent(new f.CustomEvent(N1,{composed:!0,bubbles:!0})),this.hasAttribute(qr)&&this.dispatchEvent(new f.CustomEvent(x1,{composed:!0,bubbles:!0})))}}Dp.getSlotTemplateHTML=U1;f.customElements.get("media-live-button")||f.customElements.define("media-live-button",Dp);var Cp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},ur=(e,t,a)=>(Cp(e,t,"read from private field"),a?a.call(e):t.get(e)),Yc=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},cr=(e,t,a,i)=>(Cp(e,t,"write to private field"),t.set(e,a),a),Nt,us;const In={LOADING_DELAY:"loadingdelay",NO_AUTOHIDE:"noautohide"},Lp=500,B1=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;function H1(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${Lp}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${c.MEDIA_LOADING}]:not([${c.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${c.MEDIA_LOADING}]:not([${c.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${c.MEDIA_LOADING}]:not([${c.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${B1}</slot>
    <div id="status" role="status" aria-live="polite">${C("media loading")}</div>
  `}class nu extends f.HTMLElement{constructor(){if(super(),Yc(this,Nt,void 0),Yc(this,us,Lp),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[Y.MEDIA_CONTROLLER,c.MEDIA_PAUSED,c.MEDIA_LOADING,In.LOADING_DELAY]}attributeChangedCallback(t,a,i){var r,n,s,o,l;t===In.LOADING_DELAY&&a!==i?this.loadingDelay=Number(i):t===Y.MEDIA_CONTROLLER&&(a&&((n=(r=ur(this,Nt))==null?void 0:r.unassociateElement)==null||n.call(r,this),cr(this,Nt,null)),i&&this.isConnected&&(cr(this,Nt,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=ur(this,Nt))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,a,i;const r=this.getAttribute(Y.MEDIA_CONTROLLER);r&&(cr(this,Nt,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(i=(a=ur(this,Nt))==null?void 0:a.associateElement)==null||i.call(a,this))}disconnectedCallback(){var t,a;(a=(t=ur(this,Nt))==null?void 0:t.unassociateElement)==null||a.call(t,this),cr(this,Nt,null)}get loadingDelay(){return ur(this,us)}set loadingDelay(t){cr(this,us,t);const{style:a}=be(this.shadowRoot,":host");a.setProperty("--_loading-indicator-delay",`var(--media-loading-indicator-transition-delay, ${t}ms)`)}get mediaPaused(){return $(this,c.MEDIA_PAUSED)}set mediaPaused(t){K(this,c.MEDIA_PAUSED,t)}get mediaLoading(){return $(this,c.MEDIA_LOADING)}set mediaLoading(t){K(this,c.MEDIA_LOADING,t)}get mediaController(){return ne(this,Y.MEDIA_CONTROLLER)}set mediaController(t){se(this,Y.MEDIA_CONTROLLER,t)}get noAutohide(){return $(this,In.NO_AUTOHIDE)}set noAutohide(t){K(this,In.NO_AUTOHIDE,t)}}Nt=new WeakMap;us=new WeakMap;nu.shadowRootOptions={mode:"open"};nu.getTemplateHTML=H1;f.customElements.get("media-loading-indicator")||f.customElements.define("media-loading-indicator",nu);const W1=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,Gc=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,V1=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;function F1(e){return`
    <style>
      :host(:not([${c.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${c.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${c.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${c.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${c.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${c.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${c.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${W1}</slot>
      <slot name="low">${Gc}</slot>
      <slot name="medium">${Gc}</slot>
      <slot name="high">${V1}</slot>
    </slot>
  `}function $1(){return`
    <slot name="tooltip-mute">${C("Mute")}</slot>
    <slot name="tooltip-unmute">${C("Unmute")}</slot>
  `}const jc=e=>{const t=e.mediaVolumeLevel==="off",a=C(t?"unmute":"mute");e.setAttribute("aria-label",a)};class su extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_VOLUME_LEVEL]}connectedCallback(){super.connectedCallback(),jc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_VOLUME_LEVEL&&jc(this)}get mediaVolumeLevel(){return ne(this,c.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(t){se(this,c.MEDIA_VOLUME_LEVEL,t)}handleClick(){const t=this.mediaVolumeLevel==="off"?D.MEDIA_UNMUTE_REQUEST:D.MEDIA_MUTE_REQUEST;this.dispatchEvent(new f.CustomEvent(t,{composed:!0,bubbles:!0}))}}su.getSlotTemplateHTML=F1;su.getTooltipContentHTML=$1;f.customElements.get("media-mute-button")||f.customElements.define("media-mute-button",su);const Qc=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;function K1(e){return`
    <style>
      :host([${c.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${c.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${c.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${c.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Qc}</slot>
      <slot name="exit">${Qc}</slot>
    </slot>
  `}function q1(){return`
    <slot name="tooltip-enter">${C("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${C("Exit picture in picture mode")}</slot>
  `}const Zc=e=>{const t=e.mediaIsPip?C("exit picture in picture mode"):C("enter picture in picture mode");e.setAttribute("aria-label",t)};class ou extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_IS_PIP,c.MEDIA_PIP_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Zc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_IS_PIP&&Zc(this)}get mediaPipUnavailable(){return ne(this,c.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(t){se(this,c.MEDIA_PIP_UNAVAILABLE,t)}get mediaIsPip(){return $(this,c.MEDIA_IS_PIP)}set mediaIsPip(t){K(this,c.MEDIA_IS_PIP,t)}handleClick(){const t=this.mediaIsPip?D.MEDIA_EXIT_PIP_REQUEST:D.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new f.CustomEvent(t,{composed:!0,bubbles:!0}))}}ou.getSlotTemplateHTML=K1;ou.getTooltipContentHTML=q1;f.customElements.get("media-pip-button")||f.customElements.define("media-pip-button",ou);var Y1=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},ci=(e,t,a)=>(Y1(e,t,"read from private field"),a?a.call(e):t.get(e)),G1=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},va;const Yo={RATES:"rates"},Mp=[1,1.2,1.5,1.7,2],Ui=1;function j1(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate||Ui}x</slot>
  `}function Q1(){return C("Playback rate")}class lu extends Me{constructor(){var t;super(),G1(this,va,new Kd(this,Yo.RATES,{defaultValue:Mp})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${(t=this.mediaPlaybackRate)!=null?t:Ui}x`}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PLAYBACK_RATE,Yo.RATES]}attributeChangedCallback(t,a,i){if(super.attributeChangedCallback(t,a,i),t===Yo.RATES&&(ci(this,va).value=i),t===c.MEDIA_PLAYBACK_RATE){const r=i?+i:Number.NaN,n=Number.isNaN(r)?Ui:r;this.container.innerHTML=`${n}x`,this.setAttribute("aria-label",C("Playback rate {playbackRate}",{playbackRate:n}))}}get rates(){return ci(this,va)}set rates(t){t?Array.isArray(t)?ci(this,va).value=t.join(" "):typeof t=="string"&&(ci(this,va).value=t):ci(this,va).value=""}get mediaPlaybackRate(){return re(this,c.MEDIA_PLAYBACK_RATE,Ui)}set mediaPlaybackRate(t){ce(this,c.MEDIA_PLAYBACK_RATE,t)}handleClick(){var t,a;const i=Array.from(ci(this,va).values(),s=>+s).sort((s,o)=>s-o),r=(a=(t=i.find(s=>s>this.mediaPlaybackRate))!=null?t:i[0])!=null?a:Ui,n=new f.CustomEvent(D.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:r});this.dispatchEvent(n)}}va=new WeakMap;lu.getSlotTemplateHTML=j1;lu.getTooltipContentHTML=Q1;f.customElements.get("media-playback-rate-button")||f.customElements.define("media-playback-rate-button",lu);const Z1=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,z1=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;function X1(e){return`
    <style>
      :host([${c.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${c.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${c.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${c.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${Z1}</slot>
      <slot name="pause">${z1}</slot>
    </slot>
  `}function J1(){return`
    <slot name="tooltip-play">${C("Play")}</slot>
    <slot name="tooltip-pause">${C("Pause")}</slot>
  `}const zc=e=>{const t=e.mediaPaused?C("play"):C("pause");e.setAttribute("aria-label",t)};class du extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PAUSED,c.MEDIA_ENDED]}connectedCallback(){super.connectedCallback(),zc(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_PAUSED&&zc(this)}get mediaPaused(){return $(this,c.MEDIA_PAUSED)}set mediaPaused(t){K(this,c.MEDIA_PAUSED,t)}handleClick(){const t=this.mediaPaused?D.MEDIA_PLAY_REQUEST:D.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new f.CustomEvent(t,{composed:!0,bubbles:!0}))}}du.getSlotTemplateHTML=X1;du.getTooltipContentHTML=J1;f.customElements.get("media-play-button")||f.customElements.define("media-play-button",du);const wt={PLACEHOLDER_SRC:"placeholdersrc",SRC:"src"};function e_(e){return`
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `}const t_=e=>{e.style.removeProperty("background-image")},a_=(e,t)=>{e.style["background-image"]=`url('${t}')`};class uu extends f.HTMLElement{static get observedAttributes(){return[wt.PLACEHOLDER_SRC,wt.SRC]}constructor(){if(super(),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.image=this.shadowRoot.querySelector("#image")}attributeChangedCallback(t,a,i){t===wt.SRC&&(i==null?this.image.removeAttribute(wt.SRC):this.image.setAttribute(wt.SRC,i)),t===wt.PLACEHOLDER_SRC&&(i==null?t_(this.image):a_(this.image,i))}get placeholderSrc(){return ne(this,wt.PLACEHOLDER_SRC)}set placeholderSrc(t){se(this,wt.SRC,t)}get src(){return ne(this,wt.SRC)}set src(t){se(this,wt.SRC,t)}}uu.shadowRootOptions={mode:"open"};uu.getTemplateHTML=e_;f.customElements.get("media-poster-image")||f.customElements.define("media-poster-image",uu);var Op=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},i_=(e,t,a)=>(Op(e,t,"read from private field"),a?a.call(e):t.get(e)),r_=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},n_=(e,t,a,i)=>(Op(e,t,"write to private field"),t.set(e,a),a),cs;class s_ extends Da{constructor(){super(),r_(this,cs,void 0),n_(this,cs,this.shadowRoot.querySelector("slot"))}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PREVIEW_CHAPTER]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_PREVIEW_CHAPTER&&i!==a&&i!=null&&(i_(this,cs).textContent=i,i!==""?this.setAttribute("aria-valuetext",`chapter: ${i}`):this.removeAttribute("aria-valuetext"))}get mediaPreviewChapter(){return ne(this,c.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(t){se(this,c.MEDIA_PREVIEW_CHAPTER,t)}}cs=new WeakMap;f.customElements.get("media-preview-chapter-display")||f.customElements.define("media-preview-chapter-display",s_);var Np=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Rn=(e,t,a)=>(Np(e,t,"read from private field"),a?a.call(e):t.get(e)),o_=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Dn=(e,t,a,i)=>(Np(e,t,"write to private field"),t.set(e,a),a),xt;function l_(e){return`
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `}class Io extends f.HTMLElement{constructor(){if(super(),o_(this,xt,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[Y.MEDIA_CONTROLLER,c.MEDIA_PREVIEW_IMAGE,c.MEDIA_PREVIEW_COORDS]}connectedCallback(){var t,a,i;const r=this.getAttribute(Y.MEDIA_CONTROLLER);r&&(Dn(this,xt,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(i=(a=Rn(this,xt))==null?void 0:a.associateElement)==null||i.call(a,this))}disconnectedCallback(){var t,a;(a=(t=Rn(this,xt))==null?void 0:t.unassociateElement)==null||a.call(t,this),Dn(this,xt,null)}attributeChangedCallback(t,a,i){var r,n,s,o,l;[c.MEDIA_PREVIEW_IMAGE,c.MEDIA_PREVIEW_COORDS].includes(t)&&this.update(),t===Y.MEDIA_CONTROLLER&&(a&&((n=(r=Rn(this,xt))==null?void 0:r.unassociateElement)==null||n.call(r,this),Dn(this,xt,null)),i&&this.isConnected&&(Dn(this,xt,(s=this.getRootNode())==null?void 0:s.getElementById(i)),(l=(o=Rn(this,xt))==null?void 0:o.associateElement)==null||l.call(o,this)))}get mediaPreviewImage(){return ne(this,c.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(t){se(this,c.MEDIA_PREVIEW_IMAGE,t)}get mediaPreviewCoords(){const t=this.getAttribute(c.MEDIA_PREVIEW_COORDS);if(t)return t.split(/\s+/).map(a=>+a)}set mediaPreviewCoords(t){if(!t){this.removeAttribute(c.MEDIA_PREVIEW_COORDS);return}this.setAttribute(c.MEDIA_PREVIEW_COORDS,t.join(" "))}update(){const t=this.mediaPreviewCoords,a=this.mediaPreviewImage;if(!(t&&a))return;const[i,r,n,s]=t,o=a.split("#")[0],l=getComputedStyle(this),{maxWidth:d,maxHeight:u,minWidth:p,minHeight:m}=l,h=Math.min(parseInt(d)/n,parseInt(u)/s),v=Math.max(parseInt(p)/n,parseInt(m)/s),_=h<1,b=_?h:v>1?v:1,{style:y}=be(this.shadowRoot,":host"),T=be(this.shadowRoot,"img").style,E=this.shadowRoot.querySelector("img"),S=_?"min":"max";y.setProperty(`${S}-width`,"initial","important"),y.setProperty(`${S}-height`,"initial","important"),y.width=`${n*b}px`,y.height=`${s*b}px`;const L=()=>{T.width=`${this.imgWidth*b}px`,T.height=`${this.imgHeight*b}px`,T.display="block"};E.src!==o&&(E.onload=()=>{this.imgWidth=E.naturalWidth,this.imgHeight=E.naturalHeight,L()},E.src=o,L()),L(),T.transform=`translate(-${i*b}px, -${r*b}px)`}}xt=new WeakMap;Io.shadowRootOptions={mode:"open"};Io.getTemplateHTML=l_;f.customElements.get("media-preview-thumbnail")||f.customElements.define("media-preview-thumbnail",Io);var Xc=Io,xp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Jc=(e,t,a)=>(xp(e,t,"read from private field"),a?a.call(e):t.get(e)),d_=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},u_=(e,t,a,i)=>(xp(e,t,"write to private field"),t.set(e,a),a),Lr;class c_ extends Da{constructor(){super(),d_(this,Lr,void 0),u_(this,Lr,this.shadowRoot.querySelector("slot")),Jc(this,Lr).textContent=Ia(0)}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PREVIEW_TIME]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_PREVIEW_TIME&&i!=null&&(Jc(this,Lr).textContent=Ia(parseFloat(i)))}get mediaPreviewTime(){return re(this,c.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(t){ce(this,c.MEDIA_PREVIEW_TIME,t)}}Lr=new WeakMap;f.customElements.get("media-preview-time-display")||f.customElements.define("media-preview-time-display",c_);const hi={SEEK_OFFSET:"seekoffset"},Go=30,h_=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${e}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;function m_(e,t){return`
    <slot name="icon">${h_(t.seekOffset)}</slot>
  `}function p_(){return C("Seek backward")}const v_=0;class cu extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_CURRENT_TIME,hi.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=re(this,hi.SEEK_OFFSET,Go)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===hi.SEEK_OFFSET&&(this.seekOffset=re(this,hi.SEEK_OFFSET,Go))}get seekOffset(){return re(this,hi.SEEK_OFFSET,Go)}set seekOffset(t){ce(this,hi.SEEK_OFFSET,t),this.setAttribute("aria-label",C("seek back {seekOffset} seconds",{seekOffset:this.seekOffset})),$m(Km(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return re(this,c.MEDIA_CURRENT_TIME,v_)}set mediaCurrentTime(t){ce(this,c.MEDIA_CURRENT_TIME,t)}handleClick(){const t=Math.max(this.mediaCurrentTime-this.seekOffset,0),a=new f.CustomEvent(D.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(a)}}cu.getSlotTemplateHTML=m_;cu.getTooltipContentHTML=p_;f.customElements.get("media-seek-backward-button")||f.customElements.define("media-seek-backward-button",cu);const mi={SEEK_OFFSET:"seekoffset"},jo=30,E_=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${e}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;function f_(e,t){return`
    <slot name="icon">${E_(t.seekOffset)}</slot>
  `}function b_(){return C("Seek forward")}const g_=0;class hu extends Me{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_CURRENT_TIME,mi.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=re(this,mi.SEEK_OFFSET,jo)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===mi.SEEK_OFFSET&&(this.seekOffset=re(this,mi.SEEK_OFFSET,jo))}get seekOffset(){return re(this,mi.SEEK_OFFSET,jo)}set seekOffset(t){ce(this,mi.SEEK_OFFSET,t),this.setAttribute("aria-label",C("seek forward {seekOffset} seconds",{seekOffset:this.seekOffset})),$m(Km(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return re(this,c.MEDIA_CURRENT_TIME,g_)}set mediaCurrentTime(t){ce(this,c.MEDIA_CURRENT_TIME,t)}handleClick(){const t=this.mediaCurrentTime+this.seekOffset,a=new f.CustomEvent(D.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(a)}}hu.getSlotTemplateHTML=f_;hu.getTooltipContentHTML=b_;f.customElements.get("media-seek-forward-button")||f.customElements.define("media-seek-forward-button",hu);var Pp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Qo=(e,t,a)=>(Pp(e,t,"read from private field"),a?a.call(e):t.get(e)),__=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},y_=(e,t,a,i)=>(Pp(e,t,"write to private field"),t.set(e,a),a),yi;const Ua={REMAINING:"remaining",SHOW_DURATION:"showduration",NO_TOGGLE:"notoggle"},eh=[...Object.values(Ua),c.MEDIA_CURRENT_TIME,c.MEDIA_DURATION,c.MEDIA_SEEKABLE],th=["Enter"," "],T_="&nbsp;/&nbsp;",Vl=(e,{timesSep:t=T_}={})=>{var a,i;const r=(a=e.mediaCurrentTime)!=null?a:0,[,n]=(i=e.mediaSeekable)!=null?i:[];let s=0;Number.isFinite(e.mediaDuration)?s=e.mediaDuration:Number.isFinite(n)&&(s=n);const o=e.remaining?Ia(0-(s-r)):Ia(r);return e.showDuration?`${o}${t}${Ia(s)}`:o},A_="video not loaded, unknown time.",k_=e=>{var t;const a=e.mediaCurrentTime,[,i]=(t=e.mediaSeekable)!=null?t:[];let r=null;if(Number.isFinite(e.mediaDuration)?r=e.mediaDuration:Number.isFinite(i)&&(r=i),a==null||r===null){e.setAttribute("aria-valuetext",A_);return}const n=e.remaining?$r(0-(r-a)):$r(a);if(!e.showDuration){e.setAttribute("aria-valuetext",n);return}const s=$r(r),o=`${n} of ${s}`;e.setAttribute("aria-valuetext",o)};function w_(e,t){return`
    <slot>${Vl(t)}</slot>
  `}class Up extends Da{constructor(){super(),__(this,yi,void 0),y_(this,yi,this.shadowRoot.querySelector("slot")),Qo(this,yi).innerHTML=`${Vl(this)}`}static get observedAttributes(){return[...super.observedAttributes,...eh,"disabled"]}connectedCallback(){const{style:t}=be(this.shadowRoot,":host(:hover:not([notoggle]))");t.setProperty("cursor","var(--media-cursor, pointer)"),t.setProperty("background","var(--media-control-hover-background, rgba(50 50 70 / .7))"),this.hasAttribute("disabled")||this.enable(),this.setAttribute("role","progressbar"),this.setAttribute("aria-label",C("playback time"));const a=i=>{const{key:r}=i;if(!th.includes(r)){this.removeEventListener("keyup",a);return}this.toggleTimeDisplay()};this.addEventListener("keydown",i=>{const{metaKey:r,altKey:n,key:s}=i;if(r||n||!th.includes(s)){this.removeEventListener("keyup",a);return}this.addEventListener("keyup",a)}),this.addEventListener("click",this.toggleTimeDisplay),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute("remaining")?this.removeAttribute("remaining"):this.setAttribute("remaining",""))}disconnectedCallback(){this.disable(),super.disconnectedCallback()}attributeChangedCallback(t,a,i){eh.includes(t)?this.update():t==="disabled"&&i!==a&&(i==null?this.enable():this.disable()),super.attributeChangedCallback(t,a,i)}enable(){this.tabIndex=0}disable(){this.tabIndex=-1}get remaining(){return $(this,Ua.REMAINING)}set remaining(t){K(this,Ua.REMAINING,t)}get showDuration(){return $(this,Ua.SHOW_DURATION)}set showDuration(t){K(this,Ua.SHOW_DURATION,t)}get noToggle(){return $(this,Ua.NO_TOGGLE)}set noToggle(t){K(this,Ua.NO_TOGGLE,t)}get mediaDuration(){return re(this,c.MEDIA_DURATION)}set mediaDuration(t){ce(this,c.MEDIA_DURATION,t)}get mediaCurrentTime(){return re(this,c.MEDIA_CURRENT_TIME)}set mediaCurrentTime(t){ce(this,c.MEDIA_CURRENT_TIME,t)}get mediaSeekable(){const t=this.getAttribute(c.MEDIA_SEEKABLE);if(t)return t.split(":").map(a=>+a)}set mediaSeekable(t){if(t==null){this.removeAttribute(c.MEDIA_SEEKABLE);return}this.setAttribute(c.MEDIA_SEEKABLE,t.join(":"))}update(){const t=Vl(this);k_(this),t!==Qo(this,yi).innerHTML&&(Qo(this,yi).innerHTML=t)}}yi=new WeakMap;Up.getSlotTemplateHTML=w_;f.customElements.get("media-time-display")||f.customElements.define("media-time-display",Up);var Bp=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Se=(e,t,a)=>(Bp(e,t,"read from private field"),t.get(e)),St=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Qe=(e,t,a,i)=>(Bp(e,t,"write to private field"),t.set(e,a),a),S_=(e,t,a,i)=>({set _(r){Qe(e,t,r)},get _(){return Se(e,t)}}),Ti,hs,Ai,Mr,ms,ps,vs,ki,Ba,Es;class I_{constructor(t,a,i){St(this,Ti,void 0),St(this,hs,void 0),St(this,Ai,void 0),St(this,Mr,void 0),St(this,ms,void 0),St(this,ps,void 0),St(this,vs,void 0),St(this,ki,void 0),St(this,Ba,0),St(this,Es,(r=performance.now())=>{Qe(this,Ba,requestAnimationFrame(Se(this,Es))),Qe(this,Mr,performance.now()-Se(this,Ai));const n=1e3/this.fps;if(Se(this,Mr)>n){Qe(this,Ai,r-Se(this,Mr)%n);const s=1e3/((r-Se(this,hs))/++S_(this,ms)._),o=(r-Se(this,ps))/1e3/this.duration;let l=Se(this,vs)+o*this.playbackRate;l-Se(this,Ti).valueAsNumber>0?Qe(this,ki,this.playbackRate/this.duration/s):(Qe(this,ki,.995*Se(this,ki)),l=Se(this,Ti).valueAsNumber+Se(this,ki)),this.callback(l)}}),Qe(this,Ti,t),this.callback=a,this.fps=i}start(){Se(this,Ba)===0&&(Qe(this,Ai,performance.now()),Qe(this,hs,Se(this,Ai)),Qe(this,ms,0),Se(this,Es).call(this))}stop(){Se(this,Ba)!==0&&(cancelAnimationFrame(Se(this,Ba)),Qe(this,Ba,0))}update({start:t,duration:a,playbackRate:i}){const r=t-Se(this,Ti).valueAsNumber,n=Math.abs(a-this.duration);(r>0||r<-.03||n>=.5)&&this.callback(t),Qe(this,vs,t),Qe(this,ps,performance.now()),this.duration=a,this.playbackRate=i}}Ti=new WeakMap;hs=new WeakMap;Ai=new WeakMap;Mr=new WeakMap;ms=new WeakMap;ps=new WeakMap;vs=new WeakMap;ki=new WeakMap;Ba=new WeakMap;Es=new WeakMap;var mu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},ye=(e,t,a)=>(mu(e,t,"read from private field"),a?a.call(e):t.get(e)),we=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Pt=(e,t,a,i)=>(mu(e,t,"write to private field"),t.set(e,a),a),xe=(e,t,a)=>(mu(e,t,"access private method"),a),wi,ei,eo,Yr,to,fs,ln,dn,Si,Ii,Or,pu,Hp,Fl,ao,vu,io,Eu,ro,fu,$l,Wp,un,no,Kl,Vp;const R_="video not loaded, unknown time.",D_=e=>{const t=e.range,a=$r(+Fp(e)),i=$r(+e.mediaSeekableEnd),r=a&&i?`${a} of ${i}`:R_;t.setAttribute("aria-valuetext",r)};function C_(e){return`
    ${tr.getTemplateHTML(e)}
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${c.MEDIA_PREVIEW_IMAGE}], [${c.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${c.MEDIA_PREVIEW_IMAGE}], [${c.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${c.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${c.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${c.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${c.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${c.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${c.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${c.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${c.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${c.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${c.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${c.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${c.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${Xc.shadowRootOptions.mode}">
            ${Xc.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `}const Cn=(e,t=e.mediaCurrentTime)=>{const a=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,i=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;if(Number.isNaN(i))return 0;const r=(t-a)/(i-a);return Math.max(0,Math.min(r,1))},Fp=(e,t=e.range.valueAsNumber)=>{const a=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,i=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(i)?0:t*(i-a)+a};class bu extends tr{constructor(){super(),we(this,Ii),we(this,pu),we(this,ao),we(this,io),we(this,ro),we(this,$l),we(this,un),we(this,Kl),we(this,wi,void 0),we(this,ei,void 0),we(this,eo,void 0),we(this,Yr,void 0),we(this,to,void 0),we(this,fs,void 0),we(this,ln,void 0),we(this,dn,void 0),we(this,Si,void 0),we(this,Fl,a=>{this.dragging||(Hd(a)&&(this.range.valueAsNumber=a),this.updateBar())}),this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin",'<div id="buffered" part="buffered"></div>'),Pt(this,eo,this.shadowRoot.querySelectorAll('[part~="box"]')),Pt(this,to,this.shadowRoot.querySelector('[part~="preview-box"]')),Pt(this,fs,this.shadowRoot.querySelector('[part~="current-box"]'));const t=getComputedStyle(this);Pt(this,ln,parseInt(t.getPropertyValue("--media-box-padding-left"))),Pt(this,dn,parseInt(t.getPropertyValue("--media-box-padding-right"))),Pt(this,ei,new I_(this.range,ye(this,Fl),60))}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PAUSED,c.MEDIA_DURATION,c.MEDIA_SEEKABLE,c.MEDIA_CURRENT_TIME,c.MEDIA_PREVIEW_IMAGE,c.MEDIA_PREVIEW_TIME,c.MEDIA_PREVIEW_CHAPTER,c.MEDIA_BUFFERED,c.MEDIA_PLAYBACK_RATE,c.MEDIA_LOADING,c.MEDIA_ENDED]}connectedCallback(){var t;super.connectedCallback(),this.range.setAttribute("aria-label",C("seek")),xe(this,Ii,Or).call(this),Pt(this,wi,this.getRootNode()),(t=ye(this,wi))==null||t.addEventListener("transitionstart",this)}disconnectedCallback(){var t;super.disconnectedCallback(),xe(this,Ii,Or).call(this),(t=ye(this,wi))==null||t.removeEventListener("transitionstart",this),Pt(this,wi,null)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),a!=i&&(t===c.MEDIA_CURRENT_TIME||t===c.MEDIA_PAUSED||t===c.MEDIA_ENDED||t===c.MEDIA_LOADING||t===c.MEDIA_DURATION||t===c.MEDIA_SEEKABLE?(ye(this,ei).update({start:Cn(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),xe(this,Ii,Or).call(this),D_(this)):t===c.MEDIA_BUFFERED&&this.updateBufferedBar(),(t===c.MEDIA_DURATION||t===c.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=ye(this,Si),this.updateBar()))}get mediaChaptersCues(){return ye(this,Si)}set mediaChaptersCues(t){var a;Pt(this,Si,t),this.updateSegments((a=ye(this,Si))==null?void 0:a.map(i=>({start:Cn(this,i.startTime),end:Cn(this,i.endTime)})))}get mediaPaused(){return $(this,c.MEDIA_PAUSED)}set mediaPaused(t){K(this,c.MEDIA_PAUSED,t)}get mediaLoading(){return $(this,c.MEDIA_LOADING)}set mediaLoading(t){K(this,c.MEDIA_LOADING,t)}get mediaDuration(){return re(this,c.MEDIA_DURATION)}set mediaDuration(t){ce(this,c.MEDIA_DURATION,t)}get mediaCurrentTime(){return re(this,c.MEDIA_CURRENT_TIME)}set mediaCurrentTime(t){ce(this,c.MEDIA_CURRENT_TIME,t)}get mediaPlaybackRate(){return re(this,c.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(t){ce(this,c.MEDIA_PLAYBACK_RATE,t)}get mediaBuffered(){const t=this.getAttribute(c.MEDIA_BUFFERED);return t?t.split(" ").map(a=>a.split(":").map(i=>+i)):[]}set mediaBuffered(t){if(!t){this.removeAttribute(c.MEDIA_BUFFERED);return}const a=t.map(i=>i.join(":")).join(" ");this.setAttribute(c.MEDIA_BUFFERED,a)}get mediaSeekable(){const t=this.getAttribute(c.MEDIA_SEEKABLE);if(t)return t.split(":").map(a=>+a)}set mediaSeekable(t){if(t==null){this.removeAttribute(c.MEDIA_SEEKABLE);return}this.setAttribute(c.MEDIA_SEEKABLE,t.join(":"))}get mediaSeekableEnd(){var t;const[,a=this.mediaDuration]=(t=this.mediaSeekable)!=null?t:[];return a}get mediaSeekableStart(){var t;const[a=0]=(t=this.mediaSeekable)!=null?t:[];return a}get mediaPreviewImage(){return ne(this,c.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(t){se(this,c.MEDIA_PREVIEW_IMAGE,t)}get mediaPreviewTime(){return re(this,c.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(t){ce(this,c.MEDIA_PREVIEW_TIME,t)}get mediaEnded(){return $(this,c.MEDIA_ENDED)}set mediaEnded(t){K(this,c.MEDIA_ENDED,t)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){var t;const a=this.mediaBuffered;if(!a.length)return;let i;if(this.mediaEnded)i=1;else{const n=this.mediaCurrentTime,[,s=this.mediaSeekableStart]=(t=a.find(([o,l])=>o<=n&&n<=l))!=null?t:[];i=Cn(this,s)}const{style:r}=be(this.shadowRoot,"#buffered");r.setProperty("width",`${i*100}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length)return;const t=be(this.shadowRoot,"#current-rail"),a=be(this.shadowRoot,'[part~="current-box"]'),i=xe(this,ao,vu).call(this,ye(this,fs)),r=xe(this,io,Eu).call(this,i,this.range.valueAsNumber),n=xe(this,ro,fu).call(this,i,this.range.valueAsNumber);t.style.transform=`translateX(${r})`,t.style.setProperty("--_range-width",`${i.range.width}`),a.style.setProperty("--_box-shift",`${n}`),a.style.setProperty("--_box-width",`${i.box.width}px`),a.style.setProperty("visibility","initial")}handleEvent(t){switch(super.handleEvent(t),t.type){case"input":xe(this,Kl,Vp).call(this);break;case"pointermove":xe(this,$l,Wp).call(this,t);break;case"pointerup":case"pointerleave":xe(this,un,no).call(this,null);break;case"transitionstart":la(t.target,this)&&setTimeout(()=>xe(this,Ii,Or).call(this),0);break}}}wi=new WeakMap;ei=new WeakMap;eo=new WeakMap;Yr=new WeakMap;to=new WeakMap;fs=new WeakMap;ln=new WeakMap;dn=new WeakMap;Si=new WeakMap;Ii=new WeakSet;Or=function(){xe(this,pu,Hp).call(this)?ye(this,ei).start():ye(this,ei).stop()};pu=new WeakSet;Hp=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&qm(this)};Fl=new WeakMap;ao=new WeakSet;vu=function(e){var t;const a=((t=this.getAttribute("bounds")?er(this,`#${this.getAttribute("bounds")}`):this.parentElement)!=null?t:this).getBoundingClientRect(),i=this.range.getBoundingClientRect(),r=e.offsetWidth,n=-(i.left-a.left-r/2),s=a.right-i.left-r/2;return{box:{width:r,min:n,max:s},bounds:a,range:i}};io=new WeakSet;Eu=function(e,t){let a=`${t*100}%`;const{width:i,min:r,max:n}=e.box;if(!i)return a;if(Number.isNaN(r)||(a=`max(${`calc(1 / var(--_range-width) * 100 * ${r}% + var(--media-box-padding-left))`}, ${a})`),!Number.isNaN(n)){const s=`calc(1 / var(--_range-width) * 100 * ${n}% - var(--media-box-padding-right))`;a=`min(${a}, ${s})`}return a};ro=new WeakSet;fu=function(e,t){const{width:a,min:i,max:r}=e.box,n=t*e.range.width;if(n<i+ye(this,ln)){const s=e.range.left-e.bounds.left-ye(this,ln);return`${n-a/2+s}px`}if(n>r-ye(this,dn)){const s=e.bounds.right-e.range.right-ye(this,dn);return`${n+a/2-s-e.range.width}px`}return 0};$l=new WeakSet;Wp=function(e){const t=[...ye(this,eo)].some(u=>e.composedPath().includes(u));if(!this.dragging&&(t||!e.composedPath().includes(this))){xe(this,un,no).call(this,null);return}const a=this.mediaSeekableEnd;if(!a)return;const i=be(this.shadowRoot,"#preview-rail"),r=be(this.shadowRoot,'[part~="preview-box"]'),n=xe(this,ao,vu).call(this,ye(this,to));let s=(e.clientX-n.range.left)/n.range.width;s=Math.max(0,Math.min(1,s));const o=xe(this,io,Eu).call(this,n,s),l=xe(this,ro,fu).call(this,n,s);i.style.transform=`translateX(${o})`,i.style.setProperty("--_range-width",`${n.range.width}`),r.style.setProperty("--_box-shift",`${l}`),r.style.setProperty("--_box-width",`${n.box.width}px`);const d=Math.round(ye(this,Yr))-Math.round(s*a);Math.abs(d)<1&&s>.01&&s<.99||(Pt(this,Yr,s*a),xe(this,un,no).call(this,ye(this,Yr)))};un=new WeakSet;no=function(e){this.dispatchEvent(new f.CustomEvent(D.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:e}))};Kl=new WeakSet;Vp=function(){ye(this,ei).stop();const e=Fp(this);this.dispatchEvent(new f.CustomEvent(D.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e}))};bu.shadowRootOptions={mode:"open"};bu.getTemplateHTML=C_;f.customElements.get("media-time-range")||f.customElements.define("media-time-range",bu);const L_=1,M_=e=>e.mediaMuted?0:e.mediaVolume,O_=e=>`${Math.round(e*100)}%`;class N_ extends tr{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_VOLUME,c.MEDIA_MUTED,c.MEDIA_VOLUME_UNAVAILABLE]}constructor(){super(),this.range.addEventListener("input",()=>{const t=this.range.value,a=new f.CustomEvent(D.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(a)})}connectedCallback(){super.connectedCallback(),this.range.setAttribute("aria-label",C("volume"))}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),(t===c.MEDIA_VOLUME||t===c.MEDIA_MUTED)&&(this.range.valueAsNumber=M_(this),this.range.setAttribute("aria-valuetext",O_(this.range.valueAsNumber)),this.updateBar())}get mediaVolume(){return re(this,c.MEDIA_VOLUME,L_)}set mediaVolume(t){ce(this,c.MEDIA_VOLUME,t)}get mediaMuted(){return $(this,c.MEDIA_MUTED)}set mediaMuted(t){K(this,c.MEDIA_MUTED,t)}get mediaVolumeUnavailable(){return ne(this,c.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(t){se(this,c.MEDIA_VOLUME_UNAVAILABLE,t)}}f.customElements.get("media-volume-range")||f.customElements.define("media-volume-range",N_);var $p=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},B=(e,t,a)=>($p(e,t,"read from private field"),a?a.call(e):t.get(e)),Ht=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},aa=(e,t,a,i)=>($p(e,t,"write to private field"),t.set(e,a),a),Ri,bs,Ha,Nr,Ea,fa,ba,Wa,Di,gs,pt;const ah=1,ih=0,x_=1,P_={processCallback(e,t,a){if(a){for(const[i,r]of t)if(i in a){const n=a[i];typeof n=="boolean"&&r instanceof yt&&typeof r.element[r.attributeName]=="boolean"?r.booleanValue=n:typeof n=="function"&&r instanceof yt?r.element[r.attributeName]=n:r.value=n}}}};class Ro extends f.DocumentFragment{constructor(t,a,i=P_){var r;super(),Ht(this,Ri,void 0),Ht(this,bs,void 0),this.append(t.content.cloneNode(!0)),aa(this,Ri,Kp(this)),aa(this,bs,i),(r=i.createCallback)==null||r.call(i,this,B(this,Ri),a),i.processCallback(this,B(this,Ri),a)}update(t){B(this,bs).processCallback(this,B(this,Ri),t)}}Ri=new WeakMap;bs=new WeakMap;const Kp=(e,t=[])=>{let a,i;for(const r of e.attributes||[])if(r.value.includes("{{")){const n=new B_;for([a,i]of nh(r.value))if(!a)n.append(i);else{const s=new yt(e,r.name,r.namespaceURI);n.append(s),t.push([i,s])}r.value=n.toString()}for(const r of e.childNodes)if(r.nodeType===ah&&!(r instanceof HTMLTemplateElement))Kp(r,t);else{const n=r.data;if(r.nodeType===ah||n.includes("{{")){const s=[];if(n)for([a,i]of nh(n))if(!a)s.push(new Text(i));else{const o=new ar(e);s.push(o),t.push([i,o])}else if(r instanceof HTMLTemplateElement){const o=new Gp(e,r);s.push(o),t.push([o.expression,o])}r.replaceWith(...s.flatMap(o=>o.replacementNodes||[o]))}}return t},rh={},nh=e=>{let t="",a=0,i=rh[e],r=0,n;if(i)return i;for(i=[];n=e[r];r++)n==="{"&&e[r+1]==="{"&&e[r-1]!=="\\"&&e[r+2]&&++a==1?(t&&i.push([ih,t]),t="",r++):n==="}"&&e[r+1]==="}"&&e[r-1]!=="\\"&&!--a?(i.push([x_,t.trim()]),t="",r++):t+=n||"";return t&&i.push([ih,(a>0?"{{":"")+t]),rh[e]=i},U_=11;class qp{get value(){return""}set value(t){}toString(){return this.value}}const Yp=new WeakMap;class B_{constructor(){Ht(this,Ha,[])}[Symbol.iterator](){return B(this,Ha).values()}get length(){return B(this,Ha).length}item(t){return B(this,Ha)[t]}append(...t){for(const a of t)a instanceof yt&&Yp.set(a,this),B(this,Ha).push(a)}toString(){return B(this,Ha).join("")}}Ha=new WeakMap;class yt extends qp{constructor(t,a,i){super(),Ht(this,Wa),Ht(this,Nr,""),Ht(this,Ea,void 0),Ht(this,fa,void 0),Ht(this,ba,void 0),aa(this,Ea,t),aa(this,fa,a),aa(this,ba,i)}get attributeName(){return B(this,fa)}get attributeNamespace(){return B(this,ba)}get element(){return B(this,Ea)}get value(){return B(this,Nr)}set value(t){B(this,Nr)!==t&&(aa(this,Nr,t),!B(this,Wa,Di)||B(this,Wa,Di).length===1?t==null?B(this,Ea).removeAttributeNS(B(this,ba),B(this,fa)):B(this,Ea).setAttributeNS(B(this,ba),B(this,fa),t):B(this,Ea).setAttributeNS(B(this,ba),B(this,fa),B(this,Wa,Di).toString()))}get booleanValue(){return B(this,Ea).hasAttributeNS(B(this,ba),B(this,fa))}set booleanValue(t){if(!B(this,Wa,Di)||B(this,Wa,Di).length===1)this.value=t?"":null;else throw new DOMException("Value is not fully templatized")}}Nr=new WeakMap;Ea=new WeakMap;fa=new WeakMap;ba=new WeakMap;Wa=new WeakSet;Di=function(){return Yp.get(this)};class ar extends qp{constructor(t,a){super(),Ht(this,gs,void 0),Ht(this,pt,void 0),aa(this,gs,t),aa(this,pt,a?[...a]:[new Text])}get replacementNodes(){return B(this,pt)}get parentNode(){return B(this,gs)}get nextSibling(){return B(this,pt)[B(this,pt).length-1].nextSibling}get previousSibling(){return B(this,pt)[0].previousSibling}get value(){return B(this,pt).map(t=>t.textContent).join("")}set value(t){this.replace(t)}replace(...t){const a=t.flat().flatMap(i=>i==null?[new Text]:i.forEach?[...i]:i.nodeType===U_?[...i.childNodes]:i.nodeType?[i]:[new Text(i)]);a.length||a.push(new Text),aa(this,pt,H_(B(this,pt)[0].parentNode,B(this,pt),a,this.nextSibling))}}gs=new WeakMap;pt=new WeakMap;class Gp extends ar{constructor(t,a){const i=a.getAttribute("directive")||a.getAttribute("type");let r=a.getAttribute("expression")||a.getAttribute(i)||"";r.startsWith("{{")&&(r=r.trim().slice(2,-2).trim()),super(t),this.expression=r,this.template=a,this.directive=i}}function H_(e,t,a,i=null){let r=0,n,s,o,l=a.length,d=t.length;for(;r<l&&r<d&&t[r]==a[r];)r++;for(;r<l&&r<d&&a[l-1]==t[d-1];)i=a[--d,--l];if(r==d)for(;r<l;)e.insertBefore(a[r++],i);if(r==l)for(;r<d;)e.removeChild(t[r++]);else{for(n=t[r];r<l;)o=a[r++],s=n?n.nextSibling:i,n==o?n=s:r<l&&a[r]==s?(e.replaceChild(o,n),n=s):e.insertBefore(o,n);for(;n!=i;)s=n.nextSibling,e.removeChild(n),n=s}return a}const sh={string:e=>String(e)};class jp{constructor(t){this.template=t,this.state=void 0}}const Qa=new WeakMap,Za=new WeakMap,ql={partial:(e,t)=>{t[e.expression]=new jp(e.template)},if:(e,t)=>{var a;if(Qp(e.expression,t))if(Qa.get(e)!==e.template){Qa.set(e,e.template);const i=new Ro(e.template,t,gu);e.replace(i),Za.set(e,i)}else(a=Za.get(e))==null||a.update(t);else e.replace(""),Qa.delete(e),Za.delete(e)}},W_=Object.keys(ql),gu={processCallback(e,t,a){var i,r;if(a)for(const[n,s]of t){if(s instanceof Gp){if(!s.directive){const l=W_.find(d=>s.template.hasAttribute(d));l&&(s.directive=l,s.expression=s.template.getAttribute(l))}(i=ql[s.directive])==null||i.call(ql,s,a);continue}let o=Qp(n,a);if(o instanceof jp){Qa.get(s)!==o.template?(Qa.set(s,o.template),o=new Ro(o.template,o.state,gu),s.value=o,Za.set(s,o)):(r=Za.get(s))==null||r.update(o.state);continue}o?(s instanceof yt&&s.attributeName.startsWith("aria-")&&(o=String(o)),s instanceof yt?typeof o=="boolean"?s.booleanValue=o:typeof o=="function"?s.element[s.attributeName]=o:s.value=o:(s.value=o,Qa.delete(s),Za.delete(s))):s instanceof yt?s.value=void 0:(s.value=void 0,Qa.delete(s),Za.delete(s))}}},oh={"!":e=>!e,"!!":e=>!!e,"==":(e,t)=>e==t,"!=":(e,t)=>e!=t,">":(e,t)=>e>t,">=":(e,t)=>e>=t,"<":(e,t)=>e<t,"<=":(e,t)=>e<=t,"??":(e,t)=>e??t,"|":(e,t)=>{var a;return(a=sh[t])==null?void 0:a.call(sh,e)}};function V_(e){return F_(e,{boolean:/true|false/,number:/-?\d+\.?\d*/,string:/(["'])((?:\\.|[^\\])*?)\1/,operator:/[!=><][=!]?|\?\?|\|/,ws:/\s+/,param:/[$a-z_][$\w]*/i}).filter(({type:t})=>t!=="ws")}function Qp(e,t={}){var a,i,r,n,s,o,l;const d=V_(e);if(d.length===0||d.some(({type:u})=>!u))return hr(e);if(((a=d[0])==null?void 0:a.token)===">"){const u=t[(i=d[1])==null?void 0:i.token];if(!u)return hr(e);const p={...t};u.state=p;const m=d.slice(2);for(let h=0;h<m.length;h+=3){const v=(r=m[h])==null?void 0:r.token,_=(n=m[h+1])==null?void 0:n.token,b=(s=m[h+2])==null?void 0:s.token;v&&_==="="&&(p[v]=mr(b,t))}return u}if(d.length===1)return Ln(d[0])?mr(d[0].token,t):hr(e);if(d.length===2){const u=(o=d[0])==null?void 0:o.token,p=oh[u];if(!p||!Ln(d[1]))return hr(e);const m=mr(d[1].token,t);return p(m)}if(d.length===3){const u=(l=d[1])==null?void 0:l.token,p=oh[u];if(!p||!Ln(d[0])||!Ln(d[2]))return hr(e);const m=mr(d[0].token,t);if(u==="|")return p(m,d[2].token);const h=mr(d[2].token,t);return p(m,h)}}function hr(e){return console.warn(`Warning: invalid expression \`${e}\``),!1}function Ln({type:e}){return["number","boolean","string","param"].includes(e)}function mr(e,t){const a=e[0],i=e.slice(-1);return e==="true"||e==="false"?e==="true":a===i&&["'",'"'].includes(a)?e.slice(1,-1):xm(e)?parseFloat(e):t[e]}function F_(e,t){let a,i,r;const n=[];for(;e;){r=null,a=e.length;for(const s in t)i=t[s].exec(e),i&&i.index<a&&(r={token:i[0],type:s,matches:i.slice(1)},a=i.index);a&&n.push({token:e.substr(0,a),type:void 0}),r&&n.push(r),e=e.substr(a+(r?r.token.length:0))}return n}var _u=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Yl=(e,t,a)=>(_u(e,t,"read from private field"),a?a.call(e):t.get(e)),pr=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},za=(e,t,a,i)=>(_u(e,t,"write to private field"),t.set(e,a),a),Zo=(e,t,a)=>(_u(e,t,"access private method"),a),Vi,_s,Fi,Gl,Zp,ys,jl;const zo={mediatargetlivewindow:"targetlivewindow",mediastreamtype:"streamtype"},zp=Ae.createElement("template");zp.innerHTML=`
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;class Do extends f.HTMLElement{constructor(){super(),pr(this,Gl),pr(this,ys),pr(this,Vi,void 0),pr(this,_s,void 0),pr(this,Fi,void 0),this.shadowRoot?this.renderRoot=this.shadowRoot:(this.renderRoot=this.attachShadow({mode:"open"}),this.createRenderer());const t=new MutationObserver(a=>{var i;this.mediaController&&!((i=this.mediaController)!=null&&i.breakpointsComputed)||a.some(r=>{const n=r.target;return n===this?!0:n.localName!=="media-controller"?!1:!!(zo[r.attributeName]||r.attributeName.startsWith("breakpoint"))})&&this.render()});t.observe(this,{attributes:!0}),t.observe(this.renderRoot,{attributes:!0,subtree:!0}),this.addEventListener(sa.BREAKPOINTS_COMPUTED,this.render),Zo(this,Gl,Zp).call(this,"template")}get mediaController(){return this.renderRoot.querySelector("media-controller")}get template(){var t;return(t=Yl(this,Vi))!=null?t:this.constructor.template}set template(t){za(this,Fi,null),za(this,Vi,t),this.createRenderer()}get props(){var t,a,i;const r=[...Array.from((a=(t=this.mediaController)==null?void 0:t.attributes)!=null?a:[]).filter(({name:s})=>zo[s]||s.startsWith("breakpoint")),...Array.from(this.attributes)],n={};for(const s of r){const o=(i=zo[s.name])!=null?i:ag(s.name);let{value:l}=s;l!=null?(xm(l)&&(l=parseFloat(l)),n[o]=l===""?!0:l):n[o]=!1}return n}attributeChangedCallback(t,a,i){t==="template"&&a!=i&&Zo(this,ys,jl).call(this)}connectedCallback(){Zo(this,ys,jl).call(this)}createRenderer(){this.template&&this.template!==Yl(this,_s)&&(za(this,_s,this.template),this.renderer=new Ro(this.template,this.props,this.constructor.processor),this.renderRoot.textContent="",this.renderRoot.append(zp.content.cloneNode(!0),this.renderer))}render(){var t;(t=this.renderer)==null||t.update(this.props)}}Vi=new WeakMap;_s=new WeakMap;Fi=new WeakMap;Gl=new WeakSet;Zp=function(e){if(Object.prototype.hasOwnProperty.call(this,e)){const t=this[e];delete this[e],this[e]=t}};ys=new WeakSet;jl=function(){var e;const t=this.getAttribute("template");if(!t||t===Yl(this,Fi))return;const a=this.getRootNode(),i=(e=a==null?void 0:a.getElementById)==null?void 0:e.call(a,t);if(i){za(this,Fi,t),za(this,Vi,i),this.createRenderer();return}$_(t)&&(za(this,Fi,t),K_(t).then(r=>{const n=Ae.createElement("template");n.innerHTML=r,za(this,Vi,n),this.createRenderer()}).catch(console.error))};Do.observedAttributes=["template"];Do.processor=gu;function $_(e){if(!/^(\/|\.\/|https?:\/\/)/.test(e))return!1;const t=/^https?:\/\//.test(e)?void 0:location.origin;try{new URL(e,t)}catch{return!1}return!0}async function K_(e){const t=await fetch(e);if(t.status!==200)throw new Error(`Failed to load resource: the server responded with a status of ${t.status}`);return t.text()}f.customElements.get("media-theme")||f.customElements.define("media-theme",Do);function q_({anchor:e,floating:t,placement:a}){const i=Y_({anchor:e,floating:t}),{x:r,y:n}=j_(i,a);return{x:r,y:n}}function Y_({anchor:e,floating:t}){return{anchor:G_(e,t.offsetParent),floating:{x:0,y:0,width:t.offsetWidth,height:t.offsetHeight}}}function G_(e,t){var a;const i=e.getBoundingClientRect(),r=(a=t==null?void 0:t.getBoundingClientRect())!=null?a:{x:0,y:0};return{x:i.x-r.x,y:i.y-r.y,width:i.width,height:i.height}}function j_({anchor:e,floating:t},a){const i=Q_(a)==="x"?"y":"x",r=i==="y"?"height":"width",n=Xp(a),s=e.x+e.width/2-t.width/2,o=e.y+e.height/2-t.height/2,l=e[r]/2-t[r]/2;let d;switch(n){case"top":d={x:s,y:e.y-t.height};break;case"bottom":d={x:s,y:e.y+e.height};break;case"right":d={x:e.x+e.width,y:o};break;case"left":d={x:e.x-t.width,y:o};break;default:d={x:e.x,y:e.y}}switch(a.split("-")[1]){case"start":d[i]-=l;break;case"end":d[i]+=l;break}return d}function Xp(e){return e.split("-")[0]}function Q_(e){return["top","bottom"].includes(Xp(e))?"y":"x"}class yu extends Event{constructor({action:t="auto",relatedTarget:a,...i}){super("invoke",i),this.action=t,this.relatedTarget=a}}class Z_ extends Event{constructor({newState:t,oldState:a,...i}){super("toggle",i),this.newState=t,this.oldState=a}}var Tu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},q=(e,t,a)=>(Tu(e,t,"read from private field"),a?a.call(e):t.get(e)),J=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Ut=(e,t,a,i)=>(Tu(e,t,"write to private field"),t.set(e,a),a),ae=(e,t,a)=>(Tu(e,t,"access private method"),a),Bt,ti,Ra,Ts,As,ai,cn,Ql,Jp,so,ks,Zl,zl,ev,Xl,tv,Jl,av,$i,Ki,qi,hn,oo,Au,ed,iv,ku,rv,td,nv,wu,sv,ad,ov,id,lv,Gr,lo,rd,dv,jr,uo,ws,nd;function Xi({type:e,text:t,value:a,checked:i}){const r=Ae.createElement("media-chrome-menu-item");r.type=e,r.part.add("menu-item"),r.part.add(e),r.value=a,r.checked=i;const n=Ae.createElement("span");return n.textContent=t,r.append(n),r}function ii(e,t){let a=e.querySelector(`:scope > [slot="${t}"]`);if((a==null?void 0:a.nodeName)=="SLOT"&&(a=a.assignedElements({flatten:!0})[0]),a)return a=a.cloneNode(!0),a;const i=e.shadowRoot.querySelector(`[name="${t}"] > svg`);return i?i.cloneNode(!0):""}function z_(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
        border-radius: var(--media-menu-border-radius);
        border: var(--media-menu-border, none);
        display: var(--media-menu-display, inline-flex);
        transition: var(--media-menu-transition-in,
          visibility 0s,
          opacity .2s ease-out,
          transform .15s ease-out,
          left .2s ease-in-out,
          min-width .2s ease-in-out,
          min-height .2s ease-in-out
        ) !important;
        
        visibility: var(--media-menu-visibility, visible);
        opacity: var(--media-menu-opacity, 1);
        max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
        transform: var(--media-menu-transform-in, translateY(0) scale(1));
        flex-direction: column;
        
        min-height: 0;
        position: relative;
        bottom: var(--_menu-bottom);
        box-sizing: border-box;
      } 

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([hidden]) {
        transition: var(--media-menu-transition-out,
          visibility .15s ease-in,
          opacity .15s ease-in,
          transform .15s ease-in
        ) !important;
        visibility: var(--media-menu-hidden-visibility, hidden);
        opacity: var(--media-menu-hidden-opacity, 0);
        max-height: var(--media-menu-hidden-max-height,
          var(--media-menu-max-height, var(--_menu-max-height, 300px)));
        transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
        pointer-events: none;
      }

      :host([slot="submenu"]) {
        background: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        bottom: 0;
        right: -100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform .2s ease-out;
        transform: translate(0, 0);
      }

      #container.has-expanded {
        transition: transform .2s ease-in;
        transform: translate(-100%, 0);
      }

      button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
        display: inline-flex;
        align-items: center;
      }

      slot[name="header"][hidden] {
        display: none;
      }

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .7em;
        border-bottom: 1px solid rgb(255 255 255 / .25);
        cursor: var(--media-cursor, default);
      }

      slot[name="header"] > button[part~="back"],
      slot[name="header"]::slotted(button[part~="back"]) {
        cursor: var(--media-cursor, pointer);
      }

      svg[part~="back"] {
        height: var(--media-menu-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
        margin-right: .5ch;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap);
        flex-direction: var(--media-menu-flex-direction, column);
        overflow: var(--media-menu-overflow, hidden auto);
        display: flex;
        min-height: 0;
      }

      :host([role="menu"]) slot:not([name]) {
        padding-block: .4em;
      }

      slot:not([name])::slotted([role="menu"]) {
        background: none;
      }

      media-chrome-menu-item > span {
        margin-right: .5ch;
        max-width: var(--media-menu-item-max-width);
        text-overflow: ellipsis;
        overflow: hidden;
      }
    </style>
    <style id="layout-row" media="width:0">

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .5em;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap, .25em);
        flex-direction: var(--media-menu-flex-direction, row);
        padding-inline: .5em;
      }

      media-chrome-menu-item {
        padding: .3em .5em;
      }

      media-chrome-menu-item[aria-checked="true"] {
        background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
      }

      
      media-chrome-menu-item::part(checked-indicator) {
        display: var(--media-menu-item-checked-indicator-display, none);
      }
    </style>
    <div id="container">
      <slot name="header" hidden>
        <button part="back button" aria-label="Back to previous menu">
          <slot name="back-icon">
            <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
              <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
            </svg>
          </slot>
          <slot name="title"></slot>
        </button>
      </slot>
      <slot></slot>
    </div>
    <slot name="checked-indicator" hidden></slot>
  `}const Ma={STYLE:"style",HIDDEN:"hidden",DISABLED:"disabled",ANCHOR:"anchor"};class jt extends f.HTMLElement{constructor(){if(super(),J(this,Ql),J(this,ks),J(this,zl),J(this,Xl),J(this,Jl),J(this,qi),J(this,oo),J(this,ed),J(this,ku),J(this,td),J(this,wu),J(this,ad),J(this,id),J(this,Gr),J(this,rd),J(this,jr),J(this,ws),J(this,Bt,null),J(this,ti,null),J(this,Ra,null),J(this,Ts,new Set),J(this,As,void 0),J(this,ai,!1),J(this,cn,null),J(this,so,()=>{const t=q(this,Ts),a=new Set(this.items);for(const i of t)a.has(i)||this.dispatchEvent(new CustomEvent("removemenuitem",{detail:i}));for(const i of a)t.has(i)||this.dispatchEvent(new CustomEvent("addmenuitem",{detail:i}));Ut(this,Ts,a)}),J(this,$i,()=>{ae(this,qi,hn).call(this),ae(this,oo,Au).call(this,!1)}),J(this,Ki,()=>{ae(this,qi,hn).call(this)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.container=this.shadowRoot.querySelector("#container"),this.defaultSlot=this.shadowRoot.querySelector("slot:not([name])"),this.shadowRoot.addEventListener("slotchange",this),Ut(this,As,new MutationObserver(q(this,so))),q(this,As).observe(this.defaultSlot,{childList:!0})}static get observedAttributes(){return[Ma.DISABLED,Ma.HIDDEN,Ma.STYLE,Ma.ANCHOR,Y.MEDIA_CONTROLLER]}static formatMenuItemText(t,a){return t}enable(){this.addEventListener("click",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this),this.addEventListener("invoke",this),this.addEventListener("toggle",this)}disable(){this.removeEventListener("click",this),this.removeEventListener("focusout",this),this.removeEventListener("keyup",this),this.removeEventListener("invoke",this),this.removeEventListener("toggle",this)}handleEvent(t){switch(t.type){case"slotchange":ae(this,Ql,Jp).call(this,t);break;case"invoke":ae(this,zl,ev).call(this,t);break;case"click":ae(this,ed,iv).call(this,t);break;case"toggle":ae(this,td,nv).call(this,t);break;case"focusout":ae(this,ad,ov).call(this,t);break;case"keydown":ae(this,id,lv).call(this,t);break}}connectedCallback(){var t,a;Ut(this,cn,Ym(this.shadowRoot,":host")),ae(this,ks,Zl).call(this),this.hasAttribute("disabled")||this.enable(),this.role||(this.role="menu"),Ut(this,Bt,_l(this)),(a=(t=q(this,Bt))==null?void 0:t.associateElement)==null||a.call(t,this),this.hidden||(ji(mn(this),q(this,$i)),ji(this,q(this,Ki)))}disconnectedCallback(){var t,a;Qi(mn(this),q(this,$i)),Qi(this,q(this,Ki)),this.disable(),(a=(t=q(this,Bt))==null?void 0:t.unassociateElement)==null||a.call(t,this),Ut(this,Bt,null)}attributeChangedCallback(t,a,i){var r,n,s,o;t===Ma.HIDDEN&&i!==a?(q(this,ai)||Ut(this,ai,!0),this.hidden?ae(this,Jl,av).call(this):ae(this,Xl,tv).call(this),this.dispatchEvent(new Z_({oldState:this.hidden?"open":"closed",newState:this.hidden?"closed":"open",bubbles:!0}))):t===Y.MEDIA_CONTROLLER?(a&&((n=(r=q(this,Bt))==null?void 0:r.unassociateElement)==null||n.call(r,this),Ut(this,Bt,null)),i&&this.isConnected&&(Ut(this,Bt,_l(this)),(o=(s=q(this,Bt))==null?void 0:s.associateElement)==null||o.call(s,this))):t===Ma.DISABLED&&i!==a?i==null?this.enable():this.disable():t===Ma.STYLE&&i!==a&&ae(this,ks,Zl).call(this)}formatMenuItemText(t,a){return this.constructor.formatMenuItemText(t,a)}get anchor(){return this.getAttribute("anchor")}set anchor(t){this.setAttribute("anchor",`${t}`)}get anchorElement(){var t;return this.anchor?(t=fo(this))==null?void 0:t.querySelector(`#${this.anchor}`):null}get items(){return this.defaultSlot.assignedElements({flatten:!0}).filter(X_)}get radioGroupItems(){return this.items.filter(t=>t.role==="menuitemradio")}get checkedItems(){return this.items.filter(t=>t.checked)}get value(){var t,a;return(a=(t=this.checkedItems[0])==null?void 0:t.value)!=null?a:""}set value(t){const a=this.items.find(i=>i.value===t);a&&ae(this,ws,nd).call(this,a)}focus(){if(Ut(this,ti,Vd()),this.items.length){ae(this,jr,uo).call(this,this.items[0]),this.items[0].focus();return}const t=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');t==null||t.focus()}handleSelect(t){var a;const i=ae(this,Gr,lo).call(this,t);i&&(ae(this,ws,nd).call(this,i,i.type==="checkbox"),q(this,Ra)&&!this.hidden&&((a=q(this,ti))==null||a.focus(),this.hidden=!0))}get keysUsed(){return["Enter","Escape","Tab"," ","ArrowDown","ArrowUp","Home","End"]}handleMove(t){var a,i;const{key:r}=t,n=this.items,s=(i=(a=ae(this,Gr,lo).call(this,t))!=null?a:ae(this,rd,dv).call(this))!=null?i:n[0],o=n.indexOf(s);let l=Math.max(0,o);r==="ArrowDown"?l++:r==="ArrowUp"?l--:t.key==="Home"?l=0:t.key==="End"&&(l=n.length-1),l<0&&(l=n.length-1),l>n.length-1&&(l=0),ae(this,jr,uo).call(this,n[l]),n[l].focus()}}Bt=new WeakMap;ti=new WeakMap;Ra=new WeakMap;Ts=new WeakMap;As=new WeakMap;ai=new WeakMap;cn=new WeakMap;Ql=new WeakSet;Jp=function(e){const t=e.target;for(const a of t.assignedNodes({flatten:!0}))a.nodeType===3&&a.textContent.trim()===""&&a.remove();if(["header","title"].includes(t.name)){const a=this.shadowRoot.querySelector('slot[name="header"]');a.hidden=t.assignedNodes().length===0}t.name||q(this,so).call(this)};so=new WeakMap;ks=new WeakSet;Zl=function(){var e;const t=this.shadowRoot.querySelector("#layout-row"),a=(e=getComputedStyle(this).getPropertyValue("--media-menu-layout"))==null?void 0:e.trim();t.setAttribute("media",a==="row"?"":"width:0")};zl=new WeakSet;ev=function(e){Ut(this,Ra,e.relatedTarget),la(this,e.relatedTarget)||(this.hidden=!this.hidden)};Xl=new WeakSet;tv=function(){var e;(e=q(this,Ra))==null||e.setAttribute("aria-expanded","true"),this.addEventListener("transitionend",()=>this.focus(),{once:!0}),ji(mn(this),q(this,$i)),ji(this,q(this,Ki))};Jl=new WeakSet;av=function(){var e;(e=q(this,Ra))==null||e.setAttribute("aria-expanded","false"),Qi(mn(this),q(this,$i)),Qi(this,q(this,Ki))};$i=new WeakMap;Ki=new WeakMap;qi=new WeakSet;hn=function(e){if(this.hasAttribute("mediacontroller")&&!this.anchor||this.hidden||!this.anchorElement)return;const{x:t,y:a}=q_({anchor:this.anchorElement,floating:this,placement:"top-start"});e??(e=this.offsetWidth);const i=mn(this).getBoundingClientRect(),r=i.width-t-e,n=i.height-a-this.offsetHeight,{style:s}=q(this,cn);s.setProperty("position","absolute"),s.setProperty("right",`${Math.max(0,r)}px`),s.setProperty("--_menu-bottom",`${n}px`);const o=getComputedStyle(this),l=s.getPropertyValue("--_menu-bottom")===o.bottom?n:parseFloat(o.bottom),d=i.height-l-parseFloat(o.marginBottom);this.style.setProperty("--_menu-max-height",`${d}px`)};oo=new WeakSet;Au=function(e){const t=this.querySelector('[role="menuitem"][aria-haspopup][aria-expanded="true"]'),a=t==null?void 0:t.querySelector('[role="menu"]'),{style:i}=q(this,cn);if(e||i.setProperty("--media-menu-transition-in","none"),a){const r=a.offsetHeight,n=Math.max(a.offsetWidth,t.offsetWidth);this.style.setProperty("min-width",`${n}px`),this.style.setProperty("min-height",`${r}px`),ae(this,qi,hn).call(this,n)}else this.style.removeProperty("min-width"),this.style.removeProperty("min-height"),ae(this,qi,hn).call(this);i.removeProperty("--media-menu-transition-in")};ed=new WeakSet;iv=function(e){var t;if(e.stopPropagation(),e.composedPath().includes(q(this,ku,rv))){(t=q(this,ti))==null||t.focus(),this.hidden=!0;return}const a=ae(this,Gr,lo).call(this,e);!a||a.hasAttribute("disabled")||(ae(this,jr,uo).call(this,a),this.handleSelect(e))};ku=new WeakSet;rv=function(){var e;return(e=this.shadowRoot.querySelector('slot[name="header"]').assignedElements({flatten:!0}))==null?void 0:e.find(t=>t.matches('button[part~="back"]'))};td=new WeakSet;nv=function(e){if(e.target===this)return;ae(this,wu,sv).call(this);const t=Array.from(this.querySelectorAll('[role="menuitem"][aria-haspopup]'));for(const a of t)a.invokeTargetElement!=e.target&&e.newState=="open"&&a.getAttribute("aria-expanded")=="true"&&!a.invokeTargetElement.hidden&&a.invokeTargetElement.dispatchEvent(new yu({relatedTarget:a}));for(const a of t)a.setAttribute("aria-expanded",`${!a.submenuElement.hidden}`);ae(this,oo,Au).call(this,!0)};wu=new WeakSet;sv=function(){const e=this.querySelector('[role="menuitem"] > [role="menu"]:not([hidden])');this.container.classList.toggle("has-expanded",!!e)};ad=new WeakSet;ov=function(e){var t;la(this,e.relatedTarget)||(q(this,ai)&&((t=q(this,ti))==null||t.focus()),q(this,Ra)&&q(this,Ra)!==e.relatedTarget&&!this.hidden&&(this.hidden=!0))};id=new WeakSet;lv=function(e){var t,a,i,r,n;const{key:s,ctrlKey:o,altKey:l,metaKey:d}=e;if(!(o||l||d)&&this.keysUsed.includes(s))if(e.preventDefault(),e.stopPropagation(),s==="Tab"){if(q(this,ai)){this.hidden=!0;return}e.shiftKey?(a=(t=this.previousElementSibling)==null?void 0:t.focus)==null||a.call(t):(r=(i=this.nextElementSibling)==null?void 0:i.focus)==null||r.call(i),this.blur()}else s==="Escape"?((n=q(this,ti))==null||n.focus(),q(this,ai)&&(this.hidden=!0)):s==="Enter"||s===" "?this.handleSelect(e):this.handleMove(e)};Gr=new WeakSet;lo=function(e){return e.composedPath().find(t=>["menuitemradio","menuitemcheckbox"].includes(t.role))};rd=new WeakSet;dv=function(){return this.items.find(e=>e.tabIndex===0)};jr=new WeakSet;uo=function(e){for(const t of this.items)t.tabIndex=t===e?0:-1};ws=new WeakSet;nd=function(e,t){const a=[...this.checkedItems];e.type==="radio"&&this.radioGroupItems.forEach(i=>i.checked=!1),t?e.checked=!e.checked:e.checked=!0,this.checkedItems.some((i,r)=>i!=a[r])&&this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};jt.shadowRootOptions={mode:"open"};jt.getTemplateHTML=z_;function X_(e){return["menuitem","menuitemradio","menuitemcheckbox"].includes(e==null?void 0:e.role)}function mn(e){var t;return(t=e.getAttribute("bounds")?er(e,`#${e.getAttribute("bounds")}`):lt(e)||e.parentElement)!=null?t:e}f.customElements.get("media-chrome-menu")||f.customElements.define("media-chrome-menu",jt);var Su=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},$t=(e,t,a)=>(Su(e,t,"read from private field"),a?a.call(e):t.get(e)),zt=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Xo=(e,t,a,i)=>(Su(e,t,"write to private field"),t.set(e,a),a),Wt=(e,t,a)=>(Su(e,t,"access private method"),a),Ss,Qr,sd,uv,Iu,cv,Ru,hv,Kt,Ji,pn,od,mv,Is,ld;function J_(e){return`
    <style>
      :host {
        transition: var(--media-menu-item-transition,
          background .15s linear,
          opacity .2s ease-in-out
        );
        outline: var(--media-menu-item-outline, 0);
        outline-offset: var(--media-menu-item-outline-offset, -1px);
        cursor: var(--media-cursor, pointer);
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        white-space: nowrap;
        white-space-collapse: collapse;
        text-wrap: nowrap;
        padding: .4em .8em .4em 1em;
      }

      :host(:focus-visible) {
        box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: var(--media-menu-item-hover-outline, 0);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host(:hover) {
        cursor: var(--media-cursor, pointer);
        background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
        outline: var(--media-menu-item-hover-outline);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host([aria-checked="true"]) {
        background: var(--media-menu-item-checked-background);
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
        pointer-events: none;
        color: rgba(255, 255, 255, .3);
      }

      slot:not([name]) {
        width: 100%;
      }

      slot:not([name="submenu"]) {
        display: inline-flex;
        align-items: center;
        transition: inherit;
        opacity: var(--media-menu-item-opacity, 1);
      }

      slot[name="description"] {
        justify-content: end;
      }

      slot[name="description"] > span {
        display: inline-block;
        margin-inline: 1em .2em;
        max-width: var(--media-menu-item-description-max-width, 100px);
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .8em;
        font-weight: 400;
        text-align: right;
        position: relative;
        top: .04em;
      }

      slot[name="checked-indicator"] {
        display: none;
      }

      :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
        display: var(--media-menu-item-checked-indicator-display, inline-block);
      }

      
      svg, img, ::slotted(svg), ::slotted(img) {
        height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
      }

      
      [part~="indicator"],
      ::slotted([part~="indicator"]) {
        fill: var(--media-menu-item-indicator-fill,
          var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
        height: var(--media-menu-item-indicator-height, 1.25em);
        margin-right: .5ch;
      }

      [part~="checked-indicator"] {
        visibility: hidden;
      }

      :host([aria-checked="true"]) [part~="checked-indicator"] {
        visibility: visible;
      }
    </style>
    <slot name="checked-indicator">
      <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
        <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
      </svg>
    </slot>
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="description"></slot>
    <slot name="suffix">
      ${this.getSuffixSlotInnerHTML(e)}
    </slot>
    <slot name="submenu"></slot>
  `}function ey(e){return""}const at={TYPE:"type",VALUE:"value",CHECKED:"checked",DISABLED:"disabled"};class ir extends f.HTMLElement{constructor(){if(super(),zt(this,sd),zt(this,Iu),zt(this,Ru),zt(this,Ji),zt(this,od),zt(this,Is),zt(this,Ss,!1),zt(this,Qr,void 0),zt(this,Kt,()=>{var t,a;this.setAttribute("submenusize",`${this.submenuElement.items.length}`);const i=this.shadowRoot.querySelector('slot[name="description"]'),r=(t=this.submenuElement.checkedItems)==null?void 0:t[0],n=(a=r==null?void 0:r.dataset.description)!=null?a:r==null?void 0:r.text,s=Ae.createElement("span");s.textContent=n??"",i.replaceChildren(s)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=Je(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.shadowRoot.addEventListener("slotchange",this)}static get observedAttributes(){return[at.TYPE,at.DISABLED,at.CHECKED,at.VALUE]}enable(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","-1"),vr(this)&&!this.hasAttribute("aria-checked")&&this.setAttribute("aria-checked","false"),this.addEventListener("click",this),this.addEventListener("keydown",this)}disable(){this.removeAttribute("tabindex"),this.removeEventListener("click",this),this.removeEventListener("keydown",this),this.removeEventListener("keyup",this)}handleEvent(t){switch(t.type){case"slotchange":Wt(this,sd,uv).call(this,t);break;case"click":this.handleClick(t);break;case"keydown":Wt(this,od,mv).call(this,t);break;case"keyup":Wt(this,Ji,pn).call(this,t);break}}attributeChangedCallback(t,a,i){t===at.CHECKED&&vr(this)&&!$t(this,Ss)?this.setAttribute("aria-checked",i!=null?"true":"false"):t===at.TYPE&&i!==a?this.role="menuitem"+i:t===at.DISABLED&&i!==a&&(i==null?this.enable():this.disable())}connectedCallback(){this.hasAttribute(at.DISABLED)||this.enable(),this.role="menuitem"+this.type,Xo(this,Qr,dd(this,this.parentNode)),Wt(this,Is,ld).call(this)}disconnectedCallback(){this.disable(),Wt(this,Is,ld).call(this),Xo(this,Qr,null)}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(t){this.setAttribute("invoketarget",`${t}`)}get invokeTargetElement(){var t;return this.invokeTarget?(t=fo(this))==null?void 0:t.querySelector(`#${this.invokeTarget}`):this.submenuElement}get submenuElement(){return this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements({flatten:!0})[0]}get type(){var t;return(t=this.getAttribute(at.TYPE))!=null?t:""}set type(t){this.setAttribute(at.TYPE,`${t}`)}get value(){var t;return(t=this.getAttribute(at.VALUE))!=null?t:this.text}set value(t){this.setAttribute(at.VALUE,t)}get text(){var t;return((t=this.textContent)!=null?t:"").trim()}get checked(){if(vr(this))return this.getAttribute("aria-checked")==="true"}set checked(t){vr(this)&&(Xo(this,Ss,!0),this.setAttribute("aria-checked",t?"true":"false"),t?this.part.add("checked"):this.part.remove("checked"))}handleClick(t){vr(this)||this.invokeTargetElement&&la(this,t.target)&&this.invokeTargetElement.dispatchEvent(new yu({relatedTarget:this}))}get keysUsed(){return["Enter"," "]}}Ss=new WeakMap;Qr=new WeakMap;sd=new WeakSet;uv=function(e){const t=e.target;if(!(t!=null&&t.name))for(const a of t.assignedNodes({flatten:!0}))a instanceof Text&&a.textContent.trim()===""&&a.remove();t.name==="submenu"&&(this.submenuElement?Wt(this,Iu,cv).call(this):Wt(this,Ru,hv).call(this))};Iu=new WeakSet;cv=async function(){this.setAttribute("aria-haspopup","menu"),this.setAttribute("aria-expanded",`${!this.submenuElement.hidden}`),this.submenuElement.addEventListener("change",$t(this,Kt)),this.submenuElement.addEventListener("addmenuitem",$t(this,Kt)),this.submenuElement.addEventListener("removemenuitem",$t(this,Kt)),$t(this,Kt).call(this)};Ru=new WeakSet;hv=function(){this.removeAttribute("aria-haspopup"),this.removeAttribute("aria-expanded"),this.submenuElement.removeEventListener("change",$t(this,Kt)),this.submenuElement.removeEventListener("addmenuitem",$t(this,Kt)),this.submenuElement.removeEventListener("removemenuitem",$t(this,Kt)),$t(this,Kt).call(this)};Kt=new WeakMap;Ji=new WeakSet;pn=function(e){const{key:t}=e;if(!this.keysUsed.includes(t)){this.removeEventListener("keyup",Wt(this,Ji,pn));return}this.handleClick(e)};od=new WeakSet;mv=function(e){const{metaKey:t,altKey:a,key:i}=e;if(t||a||!this.keysUsed.includes(i)){this.removeEventListener("keyup",Wt(this,Ji,pn));return}this.addEventListener("keyup",Wt(this,Ji,pn),{once:!0})};Is=new WeakSet;ld=function(){var e;const t=(e=$t(this,Qr))==null?void 0:e.radioGroupItems;if(!t)return;let a=t.filter(i=>i.getAttribute("aria-checked")==="true").pop();a||(a=t[0]);for(const i of t)i.setAttribute("aria-checked","false");a==null||a.setAttribute("aria-checked","true")};ir.shadowRootOptions={mode:"open"};ir.getTemplateHTML=J_;ir.getSuffixSlotInnerHTML=ey;function vr(e){return e.type==="radio"||e.type==="checkbox"}function dd(e,t){if(!e)return null;const{host:a}=e.getRootNode();return!t&&a?dd(e,a):t!=null&&t.items?t:dd(t,t==null?void 0:t.parentNode)}f.customElements.get("media-chrome-menu-item")||f.customElements.define("media-chrome-menu-item",ir);function ty(e){return`
    ${jt.getTemplateHTML(e)}
    <style>
      :host {
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
        min-width: var(--media-settings-menu-min-width, 170px);
        border-radius: 2px 2px 0 0;
        overflow: hidden;
      }

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([role="menu"]) {
        
        justify-content: end;
      }

      slot:not([name]) {
        justify-content: var(--media-settings-menu-justify-content);
        flex-direction: var(--media-settings-menu-flex-direction, column);
        overflow: visible;
      }

      #container.has-expanded {
        --media-settings-menu-item-opacity: 0;
      }
    </style>
  `}class pv extends jt{get anchorElement(){return this.anchor!=="auto"?super.anchorElement:lt(this).querySelector("media-settings-menu-button")}}pv.getTemplateHTML=ty;f.customElements.get("media-settings-menu")||f.customElements.define("media-settings-menu",pv);function ay(e){return`
    ${ir.getTemplateHTML.call(this,e)}
    <style>
      slot:not([name="submenu"]) {
        opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
      }

      :host([aria-expanded="true"]:hover) {
        background: transparent;
      }
    </style>
  `}function iy(e){return`
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `}class Co extends ir{}Co.shadowRootOptions={mode:"open"};Co.getTemplateHTML=ay;Co.getSuffixSlotInnerHTML=iy;f.customElements.get("media-settings-menu-item")||f.customElements.define("media-settings-menu-item",Co);class rr extends Me{connectedCallback(){super.connectedCallback(),this.invokeTargetElement&&this.setAttribute("aria-haspopup","menu")}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(t){this.setAttribute("invoketarget",`${t}`)}get invokeTargetElement(){var t;return this.invokeTarget?(t=fo(this))==null?void 0:t.querySelector(`#${this.invokeTarget}`):null}handleClick(){var t;(t=this.invokeTargetElement)==null||t.dispatchEvent(new yu({relatedTarget:this}))}}f.customElements.get("media-chrome-menu-button")||f.customElements.define("media-chrome-menu-button",rr);function ry(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
      </svg>
    </slot>
  `}function ny(){return C("Settings")}class Du extends rr{static get observedAttributes(){return[...super.observedAttributes,"target"]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",C("settings"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:lt(this).querySelector("media-settings-menu")}}Du.getSlotTemplateHTML=ry;Du.getTooltipContentHTML=ny;f.customElements.get("media-settings-menu-button")||f.customElements.define("media-settings-menu-button",Du);var Cu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},vv=(e,t,a)=>(Cu(e,t,"read from private field"),a?a.call(e):t.get(e)),Mn=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},ud=(e,t,a,i)=>(Cu(e,t,"write to private field"),t.set(e,a),a),On=(e,t,a)=>(Cu(e,t,"access private method"),a),xr,co,Rs,cd,Ds,hd;class sy extends jt{constructor(){super(...arguments),Mn(this,Rs),Mn(this,Ds),Mn(this,xr,[]),Mn(this,co,void 0)}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_AUDIO_TRACK_LIST,c.MEDIA_AUDIO_TRACK_ENABLED,c.MEDIA_AUDIO_TRACK_UNAVAILABLE]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_AUDIO_TRACK_ENABLED&&a!==i?this.value=i:t===c.MEDIA_AUDIO_TRACK_LIST&&a!==i&&(ud(this,xr,J0(i??"")),On(this,Rs,cd).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",On(this,Ds,hd))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",On(this,Ds,hd))}get anchorElement(){var t;return this.anchor!=="auto"?super.anchorElement:(t=lt(this))==null?void 0:t.querySelector("media-audio-track-menu-button")}get mediaAudioTrackList(){return vv(this,xr)}set mediaAudioTrackList(t){ud(this,xr,t),On(this,Rs,cd).call(this)}get mediaAudioTrackEnabled(){var t;return(t=ne(this,c.MEDIA_AUDIO_TRACK_ENABLED))!=null?t:""}set mediaAudioTrackEnabled(t){se(this,c.MEDIA_AUDIO_TRACK_ENABLED,t)}}xr=new WeakMap;co=new WeakMap;Rs=new WeakSet;cd=function(){if(vv(this,co)===JSON.stringify(this.mediaAudioTrackList))return;ud(this,co,JSON.stringify(this.mediaAudioTrackList));const e=this.mediaAudioTrackList;this.defaultSlot.textContent="";for(const t of e){const a=this.formatMenuItemText(t.label,t),i=Xi({type:"radio",text:a,value:`${t.id}`,checked:t.enabled});i.prepend(ii(this,"checked-indicator")),this.defaultSlot.append(i)}};Ds=new WeakSet;hd=function(){if(this.value==null)return;const e=new f.CustomEvent(D.MEDIA_AUDIO_TRACK_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)};f.customElements.get("media-audio-track-menu")||f.customElements.define("media-audio-track-menu",sy);const oy=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`;function ly(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${oy}</slot>
  `}function dy(){return C("Audio")}class Lu extends rr{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_AUDIO_TRACK_ENABLED,c.MEDIA_AUDIO_TRACK_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",C("Audio"))}get invokeTargetElement(){var t;return this.invokeTarget!=null?super.invokeTargetElement:(t=lt(this))==null?void 0:t.querySelector("media-audio-track-menu")}get mediaAudioTrackEnabled(){var t;return(t=ne(this,c.MEDIA_AUDIO_TRACK_ENABLED))!=null?t:""}set mediaAudioTrackEnabled(t){se(this,c.MEDIA_AUDIO_TRACK_ENABLED,t)}}Lu.getSlotTemplateHTML=ly;Lu.getTooltipContentHTML=dy;f.customElements.get("media-audio-track-menu-button")||f.customElements.define("media-audio-track-menu-button",Lu);var Mu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},uy=(e,t,a)=>(Mu(e,t,"read from private field"),t.get(e)),Jo=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},cy=(e,t,a,i)=>(Mu(e,t,"write to private field"),t.set(e,a),a),el=(e,t,a)=>(Mu(e,t,"access private method"),a),ho,md,Ev,Cs,pd;const hy=`
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`;function my(e){return`
    ${jt.getTemplateHTML(e)}
    <slot name="captions-indicator" hidden>${hy}</slot>
  `}class fv extends jt{constructor(){super(...arguments),Jo(this,md),Jo(this,Cs),Jo(this,ho,void 0)}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_SUBTITLES_LIST,c.MEDIA_SUBTITLES_SHOWING]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_SUBTITLES_LIST&&a!==i?el(this,md,Ev).call(this):t===c.MEDIA_SUBTITLES_SHOWING&&a!==i&&(this.value=i)}connectedCallback(){super.connectedCallback(),this.addEventListener("change",el(this,Cs,pd))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",el(this,Cs,pd))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:lt(this).querySelector("media-captions-menu-button")}get mediaSubtitlesList(){return lh(this,c.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){dh(this,c.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return lh(this,c.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){dh(this,c.MEDIA_SUBTITLES_SHOWING,t)}}ho=new WeakMap;md=new WeakSet;Ev=function(){var e;if(uy(this,ho)===JSON.stringify(this.mediaSubtitlesList))return;cy(this,ho,JSON.stringify(this.mediaSubtitlesList)),this.defaultSlot.textContent="";const t=!this.value,a=Xi({type:"radio",text:this.formatMenuItemText(C("Off")),value:"off",checked:t});a.prepend(ii(this,"checked-indicator")),this.defaultSlot.append(a);const i=this.mediaSubtitlesList;for(const r of i){const n=Xi({type:"radio",text:this.formatMenuItemText(r.label,r),value:kl(r),checked:this.value==kl(r)});n.prepend(ii(this,"checked-indicator")),((e=r.kind)!=null?e:"subs")==="captions"&&n.append(ii(this,"captions-indicator")),this.defaultSlot.append(n)}};Cs=new WeakSet;pd=function(){const e=this.mediaSubtitlesShowing,t=this.getAttribute(c.MEDIA_SUBTITLES_SHOWING),a=this.value!==t;if(e!=null&&e.length&&a&&this.dispatchEvent(new f.CustomEvent(D.MEDIA_DISABLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:e})),!this.value||!a)return;const i=new f.CustomEvent(D.MEDIA_SHOW_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(i)};fv.getTemplateHTML=my;const lh=(e,t)=>{const a=e.getAttribute(t);return a?To(a):[]},dh=(e,t,a)=>{if(!(a!=null&&a.length)){e.removeAttribute(t);return}const i=nn(a);e.getAttribute(t)!==i&&e.setAttribute(t,i)};f.customElements.get("media-captions-menu")||f.customElements.define("media-captions-menu",fv);const py=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,vy=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function Ey(){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${py}</slot>
      <slot name="off">${vy}</slot>
    </slot>
  `}function fy(){return C("Captions")}const uh=e=>{e.setAttribute("aria-checked",ap(e).toString())};class Ou extends rr{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_SUBTITLES_LIST,c.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",C("closed captions")),uh(this)}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_SUBTITLES_SHOWING&&uh(this)}get invokeTargetElement(){var t;return this.invokeTarget!=null?super.invokeTargetElement:(t=lt(this))==null?void 0:t.querySelector("media-captions-menu")}get mediaSubtitlesList(){return ch(this,c.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){hh(this,c.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return ch(this,c.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){hh(this,c.MEDIA_SUBTITLES_SHOWING,t)}}Ou.getSlotTemplateHTML=Ey;Ou.getTooltipContentHTML=fy;const ch=(e,t)=>{const a=e.getAttribute(t);return a?To(a):[]},hh=(e,t,a)=>{if(!(a!=null&&a.length)){e.removeAttribute(t);return}const i=nn(a);e.getAttribute(t)!==i&&e.setAttribute(t,i)};f.customElements.get("media-captions-menu-button")||f.customElements.define("media-captions-menu-button",Ou);var bv=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Ci=(e,t,a)=>(bv(e,t,"read from private field"),a?a.call(e):t.get(e)),tl=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},Er=(e,t,a)=>(bv(e,t,"access private method"),a),ya,Pr,Ls,Ms,vd;const al={RATES:"rates"};class by extends jt{constructor(){super(),tl(this,Pr),tl(this,Ms),tl(this,ya,new Kd(this,al.RATES,{defaultValue:Mp})),Er(this,Pr,Ls).call(this)}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PLAYBACK_RATE,al.RATES]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_PLAYBACK_RATE&&a!=i?this.value=i:t===al.RATES&&a!=i&&(Ci(this,ya).value=i,Er(this,Pr,Ls).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",Er(this,Ms,vd))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",Er(this,Ms,vd))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:lt(this).querySelector("media-playback-rate-menu-button")}get rates(){return Ci(this,ya)}set rates(t){t?Array.isArray(t)?Ci(this,ya).value=t.join(" "):typeof t=="string"&&(Ci(this,ya).value=t):Ci(this,ya).value="",Er(this,Pr,Ls).call(this)}get mediaPlaybackRate(){return re(this,c.MEDIA_PLAYBACK_RATE,Ui)}set mediaPlaybackRate(t){ce(this,c.MEDIA_PLAYBACK_RATE,t)}}ya=new WeakMap;Pr=new WeakSet;Ls=function(){this.defaultSlot.textContent="";for(const e of Ci(this,ya)){const t=Xi({type:"radio",text:this.formatMenuItemText(`${e}x`,e),value:e,checked:this.mediaPlaybackRate===Number(e)});t.prepend(ii(this,"checked-indicator")),this.defaultSlot.append(t)}};Ms=new WeakSet;vd=function(){if(!this.value)return;const e=new f.CustomEvent(D.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)};f.customElements.get("media-playback-rate-menu")||f.customElements.define("media-playback-rate-menu",by);const Os=1;function gy(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
      
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate||Os}x</slot>
  `}function _y(){return C("Playback rate")}class Nu extends rr{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_PLAYBACK_RATE]}constructor(){var t;super(),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${(t=this.mediaPlaybackRate)!=null?t:Os}x`}attributeChangedCallback(t,a,i){if(super.attributeChangedCallback(t,a,i),t===c.MEDIA_PLAYBACK_RATE){const r=i?+i:Number.NaN,n=Number.isNaN(r)?Os:r;this.container.innerHTML=`${n}x`,this.setAttribute("aria-label",C("Playback rate {playbackRate}",{playbackRate:n}))}}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:lt(this).querySelector("media-playback-rate-menu")}get mediaPlaybackRate(){return re(this,c.MEDIA_PLAYBACK_RATE,Os)}set mediaPlaybackRate(t){ce(this,c.MEDIA_PLAYBACK_RATE,t)}}Nu.getSlotTemplateHTML=gy;Nu.getTooltipContentHTML=_y;f.customElements.get("media-playback-rate-menu-button")||f.customElements.define("media-playback-rate-menu-button",Nu);var xu=(e,t,a)=>{if(!t.has(e))throw TypeError("Cannot "+a)},Ur=(e,t,a)=>(xu(e,t,"read from private field"),a?a.call(e):t.get(e)),Nn=(e,t,a)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,a)},mh=(e,t,a,i)=>(xu(e,t,"write to private field"),t.set(e,a),a),pi=(e,t,a)=>(xu(e,t,"access private method"),a),Br,Bi,Li,Hr,Ns,Ed;class yy extends jt{constructor(){super(...arguments),Nn(this,Li),Nn(this,Ns),Nn(this,Br,[]),Nn(this,Bi,{})}static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_RENDITION_LIST,c.MEDIA_RENDITION_SELECTED,c.MEDIA_RENDITION_UNAVAILABLE,c.MEDIA_HEIGHT]}attributeChangedCallback(t,a,i){super.attributeChangedCallback(t,a,i),t===c.MEDIA_RENDITION_SELECTED&&a!==i?(this.value=i??"auto",pi(this,Li,Hr).call(this)):t===c.MEDIA_RENDITION_LIST&&a!==i?(mh(this,Br,Q0(i)),pi(this,Li,Hr).call(this)):t===c.MEDIA_HEIGHT&&a!==i&&pi(this,Li,Hr).call(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("change",pi(this,Ns,Ed))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",pi(this,Ns,Ed))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:lt(this).querySelector("media-rendition-menu-button")}get mediaRenditionList(){return Ur(this,Br)}set mediaRenditionList(t){mh(this,Br,t),pi(this,Li,Hr).call(this)}get mediaRenditionSelected(){return ne(this,c.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(t){se(this,c.MEDIA_RENDITION_SELECTED,t)}get mediaHeight(){return re(this,c.MEDIA_HEIGHT)}set mediaHeight(t){ce(this,c.MEDIA_HEIGHT,t)}}Br=new WeakMap;Bi=new WeakMap;Li=new WeakSet;Hr=function(){if(Ur(this,Bi).mediaRenditionList===JSON.stringify(this.mediaRenditionList)&&Ur(this,Bi).mediaHeight===this.mediaHeight)return;Ur(this,Bi).mediaRenditionList=JSON.stringify(this.mediaRenditionList),Ur(this,Bi).mediaHeight=this.mediaHeight;const e=this.mediaRenditionList.sort((n,s)=>s.height-n.height);for(const n of e)n.selected=n.id===this.mediaRenditionSelected;this.defaultSlot.textContent="";const t=!this.mediaRenditionSelected;for(const n of e){const s=this.formatMenuItemText(`${Math.min(n.width,n.height)}p`,n),o=Xi({type:"radio",text:s,value:`${n.id}`,checked:n.selected&&!t});o.prepend(ii(this,"checked-indicator")),this.defaultSlot.append(o)}const a=t?this.formatMenuItemText(`${C("Auto")} (${this.mediaHeight}p)`):this.formatMenuItemText(C("Auto")),i=Xi({type:"radio",text:a,value:"auto",checked:t}),r=this.mediaHeight>0?`${C("Auto")} (${this.mediaHeight}p)`:C("Auto");i.dataset.description=r,i.prepend(ii(this,"checked-indicator")),this.defaultSlot.append(i)};Ns=new WeakSet;Ed=function(){if(this.value==null)return;const e=new f.CustomEvent(D.MEDIA_RENDITION_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)};f.customElements.get("media-rendition-menu")||f.customElements.define("media-rendition-menu",yy);const Ty=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`;function Ay(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${Ty}</slot>
  `}function ky(){return C("Quality")}class Pu extends rr{static get observedAttributes(){return[...super.observedAttributes,c.MEDIA_RENDITION_SELECTED,c.MEDIA_RENDITION_UNAVAILABLE,c.MEDIA_HEIGHT]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",C("quality"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:lt(this).querySelector("media-rendition-menu")}get mediaRenditionSelected(){return ne(this,c.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(t){se(this,c.MEDIA_RENDITION_SELECTED,t)}get mediaHeight(){return re(this,c.MEDIA_HEIGHT)}set mediaHeight(t){ce(this,c.MEDIA_HEIGHT,t)}}Pu.getSlotTemplateHTML=Ay;Pu.getTooltipContentHTML=ky;f.customElements.get("media-rendition-menu-button")||f.customElements.define("media-rendition-menu-button",Pu);var gv=e=>{throw TypeError(e)},Uu=(e,t,a)=>t.has(e)||gv("Cannot "+a),Z=(e,t,a)=>(Uu(e,t,"read from private field"),a?a.call(e):t.get(e)),bt=(e,t,a)=>t.has(e)?gv("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),Yt=(e,t,a,i)=>(Uu(e,t,"write to private field"),t.set(e,a),a),fe=(e,t,a)=>(Uu(e,t,"access private method"),a),Lo=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment>"u"){class e extends Lo{}globalThis.DocumentFragment=e}var Bu=class extends Lo{},wy=class extends Lo{},Sy={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(Bu)}},xs,Iy=class{constructor(e,t={}){bt(this,xs),Yt(this,xs,t==null?void 0:t.detail)}get detail(){return Z(this,xs)}initCustomEvent(){}};xs=new WeakMap;function Ry(e,t){return new Bu}var _v={document:{createElement:Ry},DocumentFragment,customElements:Sy,CustomEvent:Iy,EventTarget:Lo,HTMLElement:Bu,HTMLVideoElement:wy},yv=typeof window>"u"||typeof globalThis.customElements>"u",Vt=yv?_v:globalThis,Hu=yv?_v.document:globalThis.document;function Dy(e){let t="";return Object.entries(e).forEach(([a,i])=>{i!=null&&(t+=`${fd(a)}: ${i}; `)}),t?t.trim():void 0}function fd(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function Tv(e){return e.replace(/[-_]([a-z])/g,(t,a)=>a.toUpperCase())}function Ze(e){if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}function Av(e){let t=Cy(e).toString();return t?"?"+t:""}function Cy(e){let t={};for(let a in e)e[a]!=null&&(t[a]=e[a]);return new URLSearchParams(t)}var kv=(e,t)=>!e||!t?!1:e.contains(t)?!0:kv(e,t.getRootNode().host),wv="mux.com",Ly=()=>{try{return"3.5.1"}catch{}return"UNKNOWN"},My=Ly(),Sv=()=>My,Oy=(e,{token:t,customDomain:a=wv,thumbnailTime:i,programTime:r}={})=>{var n;let s=t==null?i:void 0,{aud:o}=(n=Hi(t))!=null?n:{};if(!(t&&o!=="t"))return`https://image.${a}/${e}/thumbnail.webp${Av({token:t,time:s,program_time:r})}`},Ny=(e,{token:t,customDomain:a=wv,programStartTime:i,programEndTime:r}={})=>{var n;let{aud:s}=(n=Hi(t))!=null?n:{};if(!(t&&s!=="s"))return`https://image.${a}/${e}/storyboard.vtt${Av({token:t,format:"webp",program_start_time:i,program_end_time:r})}`},Wu=e=>{if(e){if([Q.LIVE,Q.ON_DEMAND].includes(e))return e;if(e!=null&&e.includes("live"))return Q.LIVE}},xy={crossorigin:"crossOrigin",playsinline:"playsInline"};function Py(e){var t;return(t=xy[e])!=null?t:Tv(e)}var Mi,Oi,We,Uy=class{constructor(e,t){bt(this,Mi),bt(this,Oi),bt(this,We,[]),Yt(this,Mi,e),Yt(this,Oi,t)}[Symbol.iterator](){return Z(this,We).values()}get length(){return Z(this,We).length}get value(){var e;return(e=Z(this,We).join(" "))!=null?e:""}set value(e){var t;e!==this.value&&(Yt(this,We,[]),this.add(...(t=e==null?void 0:e.split(" "))!=null?t:[]))}toString(){return this.value}item(e){return Z(this,We)[e]}values(){return Z(this,We).values()}keys(){return Z(this,We).keys()}forEach(e){Z(this,We).forEach(e)}add(...e){var t,a;e.forEach(i=>{this.contains(i)||Z(this,We).push(i)}),!(this.value===""&&!((t=Z(this,Mi))!=null&&t.hasAttribute(`${Z(this,Oi)}`)))&&((a=Z(this,Mi))==null||a.setAttribute(`${Z(this,Oi)}`,`${this.value}`))}remove(...e){var t;e.forEach(a=>{Z(this,We).splice(Z(this,We).indexOf(a),1)}),(t=Z(this,Mi))==null||t.setAttribute(`${Z(this,Oi)}`,`${this.value}`)}contains(e){return Z(this,We).includes(e)}toggle(e,t){return typeof t<"u"?t?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){this.remove(e),this.add(t)}};Mi=new WeakMap,Oi=new WeakMap,We=new WeakMap;var Iv=`[mux-player ${Sv()}]`;function ta(...e){console.warn(Iv,...e)}function nt(...e){console.error(Iv,...e)}function Rv(e){var t;let a=(t=e.message)!=null?t:"";e.context&&(a+=` ${e.context}`),e.file&&(a+=` ${M("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${e.file}`),ta(a)}var Ne={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},Va={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},ph=Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),By=Object.values(Ne).filter(e=>Ne.PLAYSINLINE!==e),Hy=Object.values(Va),Wy=[...By,...Hy],Vy=class extends Vt.HTMLElement{static get observedAttributes(){return Wy}constructor(){super()}attributeChangedCallback(e,t,a){var i,r;switch(e){case Va.MUTED:{this.media&&(this.media.muted=a!=null,this.media.defaultMuted=a!=null);return}case Va.VOLUME:{let n=(i=Ze(a))!=null?i:1;this.media&&(this.media.volume=n);return}case Va.PLAYBACKRATE:{let n=(r=Ze(a))!=null?r:1;this.media&&(this.media.playbackRate=n,this.media.defaultPlaybackRate=n);return}}}play(){var e,t;return(t=(e=this.media)==null?void 0:e.play())!=null?t:Promise.reject()}pause(){var e;(e=this.media)==null||e.pause()}load(){var e;(e=this.media)==null||e.load()}get media(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var e,t;return(t=(e=this.media)==null?void 0:e.paused)!=null?t:!0}get duration(){var e,t;return(t=(e=this.media)==null?void 0:e.duration)!=null?t:NaN}get ended(){var e,t;return(t=(e=this.media)==null?void 0:e.ended)!=null?t:!1}get buffered(){var e,t;return(t=(e=this.media)==null?void 0:e.buffered)!=null?t:ph}get seekable(){var e,t;return(t=(e=this.media)==null?void 0:e.seekable)!=null?t:ph}get readyState(){var e,t;return(t=(e=this.media)==null?void 0:e.readyState)!=null?t:0}get videoWidth(){var e,t;return(t=(e=this.media)==null?void 0:e.videoWidth)!=null?t:0}get videoHeight(){var e,t;return(t=(e=this.media)==null?void 0:e.videoHeight)!=null?t:0}get currentSrc(){var e,t;return(t=(e=this.media)==null?void 0:e.currentSrc)!=null?t:""}get currentTime(){var e,t;return(t=(e=this.media)==null?void 0:e.currentTime)!=null?t:0}set currentTime(e){this.media&&(this.media.currentTime=Number(e))}get volume(){var e,t;return(t=(e=this.media)==null?void 0:e.volume)!=null?t:1}set volume(e){this.media&&(this.media.volume=Number(e))}get playbackRate(){var e,t;return(t=(e=this.media)==null?void 0:e.playbackRate)!=null?t:1}set playbackRate(e){this.media&&(this.media.playbackRate=Number(e))}get defaultPlaybackRate(){var e;return(e=Ze(this.getAttribute(Va.PLAYBACKRATE)))!=null?e:1}set defaultPlaybackRate(e){e!=null?this.setAttribute(Va.PLAYBACKRATE,`${e}`):this.removeAttribute(Va.PLAYBACKRATE)}get crossOrigin(){return fr(this,Ne.CROSSORIGIN)}set crossOrigin(e){this.setAttribute(Ne.CROSSORIGIN,`${e}`)}get autoplay(){return fr(this,Ne.AUTOPLAY)!=null}set autoplay(e){e?this.setAttribute(Ne.AUTOPLAY,typeof e=="string"?e:""):this.removeAttribute(Ne.AUTOPLAY)}get loop(){return fr(this,Ne.LOOP)!=null}set loop(e){e?this.setAttribute(Ne.LOOP,""):this.removeAttribute(Ne.LOOP)}get muted(){var e,t;return(t=(e=this.media)==null?void 0:e.muted)!=null?t:!1}set muted(e){this.media&&(this.media.muted=!!e)}get defaultMuted(){return fr(this,Ne.MUTED)!=null}set defaultMuted(e){e?this.setAttribute(Ne.MUTED,""):this.removeAttribute(Ne.MUTED)}get playsInline(){return fr(this,Ne.PLAYSINLINE)!=null}set playsInline(e){nt("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(e){["","none","metadata","auto"].includes(e)?this.setAttribute(Ne.PRELOAD,e):this.removeAttribute(Ne.PRELOAD)}};function fr(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var vh=Vy,Fy=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`,br=new WeakMap,$y=class Dv{constructor(t,a){this.element=t,this.type=a,this.element.addEventListener(this.type,this);let i=br.get(this.element);i&&i.set(this.type,this)}set(t){if(typeof t=="function")this.handleEvent=t.bind(this.element);else if(typeof t=="object"&&typeof t.handleEvent=="function")this.handleEvent=t.handleEvent.bind(t);else{this.element.removeEventListener(this.type,this);let a=br.get(this.element);a&&a.delete(this.type)}}static for(t){br.has(t.element)||br.set(t.element,new Map);let a=t.attributeName.slice(2),i=br.get(t.element);return i&&i.has(a)?i.get(a):new Dv(t.element,a)}};function Ky(e,t){return e instanceof yt&&e.attributeName.startsWith("on")?($y.for(e).set(t),e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),!0):!1}function qy(e,t){return t instanceof Cv&&e instanceof ar?(t.renderInto(e),!0):!1}function Yy(e,t){return t instanceof DocumentFragment&&e instanceof ar?(t.childNodes.length&&e.replace(...t.childNodes),!0):!1}function Gy(e,t){if(e instanceof yt){let a=e.attributeNamespace,i=e.element.getAttributeNS(a,e.attributeName);return String(t)!==i&&(e.value=String(t)),!0}return e.value=String(t),!0}function jy(e,t){if(e instanceof yt&&t instanceof Element){let a=e.element;return a[e.attributeName]!==t&&(e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),a[e.attributeName]=t),!0}return!1}function Qy(e,t){if(typeof t=="boolean"&&e instanceof yt){let a=e.attributeNamespace,i=e.element.hasAttributeNS(a,e.attributeName);return t!==i&&(e.booleanValue=t),!0}return!1}function Zy(e,t){return t===!1&&e instanceof ar?(e.replace(""),!0):!1}function zy(e,t){jy(e,t)||Qy(e,t)||Ky(e,t)||Zy(e,t)||qy(e,t)||Yy(e,t)||Gy(e,t)}var il=new Map,Eh=new WeakMap,fh=new WeakMap,Cv=class{constructor(e,t,a){this.strings=e,this.values=t,this.processor=a,this.stringsKey=this.strings.join("")}get template(){if(il.has(this.stringsKey))return il.get(this.stringsKey);{let e=Hu.createElement("template"),t=this.strings.length-1;return e.innerHTML=this.strings.reduce((a,i,r)=>a+i+(r<t?`{{ ${r} }}`:""),""),il.set(this.stringsKey,e),e}}renderInto(e){var t;let a=this.template;if(Eh.get(e)!==a){Eh.set(e,a);let r=new Ro(a,this.values,this.processor);fh.set(e,r),e instanceof ar?e.replace(...r.children):e.appendChild(r);return}let i=fh.get(e);(t=i==null?void 0:i.update)==null||t.call(i,this.values)}},Xy={processCallback(e,t,a){var i;if(a){for(let[r,n]of t)if(r in a){let s=(i=a[r])!=null?i:"";zy(n,s)}}}};function Ps(e,...t){return new Cv(e,t,Xy)}function Jy(e,t){e.renderInto(t)}var eT=e=>{let{tokens:t}=e;return t.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""},tT=e=>Ps`
  <style>
    ${eT(e)}
    ${Fy}
  </style>
  ${nT(e)}
`,aT=e=>{let t=e.hotKeys?`${e.hotKeys}`:"";return Wu(e.streamType)==="live"&&(t+=" noarrowleft noarrowright"),t},iT={TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"},rT=Object.values(iT).join(", "),nT=e=>{var t,a,i,r,n,s,o,l,d,u,p,m,h,v,_,b,y,T,E,S,L,x,W,G,z,F,U,Oe,$e,Ke,me,Pe,At,Ue,dt;return Ps`
  <media-theme
    template="${e.themeTemplate||!1}"
    defaultstreamtype="${(t=e.defaultStreamType)!=null?t:!1}"
    hotkeys="${aT(e)||!1}"
    nohotkeys="${e.noHotKeys||!e.hasSrc||!1}"
    noautoseektolive="${!!((a=e.streamType)!=null&&a.includes(Q.LIVE))&&e.targetLiveWindow!==0}"
    novolumepref="${e.novolumepref||!1}"
    disabled="${!e.hasSrc||e.isDialogOpen}"
    audio="${(i=e.audio)!=null?i:!1}"
    style="${(r=Dy({"--media-primary-color":e.primaryColor,"--media-secondary-color":e.secondaryColor,"--media-accent-color":e.accentColor}))!=null?r:!1}"
    defaultsubtitles="${!e.defaultHiddenCaptions}"
    forwardseekoffset="${(n=e.forwardSeekOffset)!=null?n:!1}"
    backwardseekoffset="${(s=e.backwardSeekOffset)!=null?s:!1}"
    playbackrates="${(o=e.playbackRates)!=null?o:!1}"
    defaultshowremainingtime="${(l=e.defaultShowRemainingTime)!=null?l:!1}"
    defaultduration="${(d=e.defaultDuration)!=null?d:!1}"
    hideduration="${(u=e.hideDuration)!=null?u:!1}"
    title="${(p=e.title)!=null?p:!1}"
    videotitle="${(m=e.videoTitle)!=null?m:!1}"
    proudlydisplaymuxbadge="${(h=e.proudlyDisplayMuxBadge)!=null?h:!1}"
    exportparts="${rT}"
    onclose="${e.onCloseErrorDialog}"
    onfocusin="${e.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      target-live-window="${(v=e.targetLiveWindow)!=null?v:!1}"
      stream-type="${(_=Wu(e.streamType))!=null?_:!1}"
      crossorigin="${(b=e.crossOrigin)!=null?b:""}"
      playsinline
      autoplay="${(y=e.autoplay)!=null?y:!1}"
      muted="${(T=e.muted)!=null?T:!1}"
      loop="${(E=e.loop)!=null?E:!1}"
      preload="${(S=e.preload)!=null?S:!1}"
      debug="${(L=e.debug)!=null?L:!1}"
      prefer-cmcd="${(x=e.preferCmcd)!=null?x:!1}"
      disable-tracking="${(W=e.disableTracking)!=null?W:!1}"
      disable-cookies="${(G=e.disableCookies)!=null?G:!1}"
      prefer-playback="${(z=e.preferPlayback)!=null?z:!1}"
      start-time="${e.startTime!=null?e.startTime:!1}"
      beacon-collection-domain="${(F=e.beaconCollectionDomain)!=null?F:!1}"
      player-init-time="${(U=e.playerInitTime)!=null?U:!1}"
      player-software-name="${(Oe=e.playerSoftwareName)!=null?Oe:!1}"
      player-software-version="${($e=e.playerSoftwareVersion)!=null?$e:!1}"
      env-key="${(Ke=e.envKey)!=null?Ke:!1}"
      custom-domain="${(me=e.customDomain)!=null?me:!1}"
      src="${e.src?e.src:e.playbackId?ml(e):!1}"
      cast-src="${e.src?e.src:e.playbackId?ml(e):!1}"
      cast-receiver="${(Pe=e.castReceiver)!=null?Pe:!1}"
      drm-token="${(Ue=(At=e.tokens)==null?void 0:At.drm)!=null?Ue:!1}"
      exportparts="video"
    >
      ${e.storyboard?Ps`<track label="thumbnails" default kind="metadata" src="${e.storyboard}" />`:Ps``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${e.poster?e.poster:!1}"
        placeholdersrc="${(dt=e.placeholder)!=null?dt:!1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`},Lv=e=>e.charAt(0).toUpperCase()+e.slice(1),sT=(e,t=!1)=>{var a,i;if(e.muxCode){let r=Lv((a=e.errorCategory)!=null?a:"video"),n=po((i=e.errorCategory)!=null?i:ie.VIDEO);if(e.muxCode===N.NETWORK_OFFLINE)return M("Your device appears to be offline",t);if(e.muxCode===N.NETWORK_TOKEN_EXPIRED)return M("{category} URL has expired",t).format({category:r});if([N.NETWORK_TOKEN_SUB_MISMATCH,N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING,N.NETWORK_TOKEN_MALFORMED].includes(e.muxCode))return M("{category} URL is formatted incorrectly",t).format({category:r});if(e.muxCode===N.NETWORK_TOKEN_MISSING)return M("Invalid {categoryName} URL",t).format({categoryName:n});if(e.muxCode===N.NETWORK_NOT_FOUND)return M("{category} does not exist",t).format({category:r});if(e.muxCode===N.NETWORK_NOT_READY){let s=e.streamType==="live"?"Live stream":"Video";return M("{mediaType} is not currently available",t).format({mediaType:s})}}if(e.code){if(e.code===I.MEDIA_ERR_NETWORK)return M("Network Error",t);if(e.code===I.MEDIA_ERR_DECODE)return M("Media Error",t);if(e.code===I.MEDIA_ERR_SRC_NOT_SUPPORTED)return M("Source Not Supported",t)}return M("Error",t)},oT=(e,t=!1)=>{var a,i;if(e.muxCode){let r=Lv((a=e.errorCategory)!=null?a:"video"),n=po((i=e.errorCategory)!=null?i:ie.VIDEO);return e.muxCode===N.NETWORK_OFFLINE?M("Check your internet connection and try reloading this video.",t):e.muxCode===N.NETWORK_TOKEN_EXPIRED?M("The video’s secured {tokenNamePrefix}-token has expired.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_TOKEN_SUB_MISMATCH?M("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_TOKEN_MALFORMED?M("{category} URL is formatted incorrectly",t).format({category:r}):[N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode)?M("The {tokenNamePrefix}-token is formatted with incorrect information.",t).format({tokenNamePrefix:n}):[N.NETWORK_TOKEN_MISSING,N.NETWORK_INVALID_URL].includes(e.muxCode)?M("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_NOT_FOUND?"":e.message}return e.code&&(e.code===I.MEDIA_ERR_NETWORK||e.code===I.MEDIA_ERR_DECODE||(e.code,I.MEDIA_ERR_SRC_NOT_SUPPORTED)),e.message},lT=(e,t=!1)=>{let a=sT(e,t).toString(),i=oT(e,t).toString();return{title:a,message:i}},dT=e=>{if(e.muxCode){if(e.muxCode===N.NETWORK_TOKEN_EXPIRED)return"403-expired-token.md";if(e.muxCode===N.NETWORK_TOKEN_MALFORMED)return"403-malformatted-token.md";if([N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode))return"403-incorrect-aud-value.md";if(e.muxCode===N.NETWORK_TOKEN_SUB_MISMATCH)return"403-playback-id-mismatch.md";if(e.muxCode===N.NETWORK_TOKEN_MISSING)return"missing-signed-tokens.md";if(e.muxCode===N.NETWORK_NOT_FOUND)return"404-not-found.md";if(e.muxCode===N.NETWORK_NOT_READY)return"412-not-playable.md"}if(e.code){if(e.code===I.MEDIA_ERR_NETWORK)return"";if(e.code===I.MEDIA_ERR_DECODE)return"media-decode-error.md";if(e.code===I.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""},bh=(e,t)=>{let a=dT(e);return{message:e.message,context:e.context,file:a}},uT=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]:not([audio])) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>
    <media-error-dialog slot="dialog" noautohide></media-error-dialog>

    <template if="!audio">
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`,bd=Hu.createElement("template");"innerHTML"in bd&&(bd.innerHTML=uT);var gh,_h,Mv=class extends Do{};Mv.template=(_h=(gh=bd.content)==null?void 0:gh.children)==null?void 0:_h[0];Vt.customElements.get("media-theme-gerwig")||Vt.customElements.define("media-theme-gerwig",Mv);var cT="gerwig",Jt={SRC:"src",POSTER:"poster"},A={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge"},gd=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","proudlydisplaymuxbadge"];function hT(e,t){var a,i;return{src:!e.playbackId&&e.src,playbackId:e.playbackId,hasSrc:!!e.playbackId||!!e.src||!!e.currentSrc,poster:e.poster,storyboard:e.storyboard,storyboardSrc:e.getAttribute(A.STORYBOARD_SRC),placeholder:e.getAttribute("placeholder"),themeTemplate:pT(e),thumbnailTime:!e.tokens.thumbnail&&e.thumbnailTime,autoplay:e.autoplay,crossOrigin:e.crossOrigin,loop:e.loop,noHotKeys:e.hasAttribute(A.NOHOTKEYS),hotKeys:e.getAttribute(A.HOTKEYS),muted:e.muted,paused:e.paused,preload:e.preload,envKey:e.envKey,preferCmcd:e.preferCmcd,debug:e.debug,disableTracking:e.disableTracking,disableCookies:e.disableCookies,tokens:e.tokens,beaconCollectionDomain:e.beaconCollectionDomain,maxResolution:e.maxResolution,minResolution:e.minResolution,programStartTime:e.programStartTime,programEndTime:e.programEndTime,assetStartTime:e.assetStartTime,assetEndTime:e.assetEndTime,renditionOrder:e.renditionOrder,metadata:e.metadata,playerInitTime:e.playerInitTime,playerSoftwareName:e.playerSoftwareName,playerSoftwareVersion:e.playerSoftwareVersion,startTime:e.startTime,preferPlayback:e.preferPlayback,audio:e.audio,defaultStreamType:e.defaultStreamType,targetLiveWindow:e.getAttribute(g.TARGET_LIVE_WINDOW),streamType:Wu(e.getAttribute(g.STREAM_TYPE)),primaryColor:e.getAttribute(A.PRIMARY_COLOR),secondaryColor:e.getAttribute(A.SECONDARY_COLOR),accentColor:e.getAttribute(A.ACCENT_COLOR),forwardSeekOffset:e.forwardSeekOffset,backwardSeekOffset:e.backwardSeekOffset,defaultHiddenCaptions:e.defaultHiddenCaptions,defaultDuration:e.defaultDuration,defaultShowRemainingTime:e.defaultShowRemainingTime,hideDuration:vT(e),playbackRates:e.getAttribute(A.PLAYBACK_RATES),customDomain:(a=e.getAttribute(g.CUSTOM_DOMAIN))!=null?a:void 0,title:e.getAttribute(A.TITLE),videoTitle:(i=e.getAttribute(A.VIDEO_TITLE))!=null?i:e.getAttribute(A.TITLE),novolumepref:e.hasAttribute(A.NO_VOLUME_PREF),proudlyDisplayMuxBadge:e.hasAttribute(A.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:e.castReceiver,...t,extraSourceParams:e.extraSourceParams}}var mT=Rp.formatErrorMessage;Rp.formatErrorMessage=e=>{var t,a;if(e instanceof I){let i=lT(e,!1);return`
      ${i!=null&&i.title?`<h3>${i.title}</h3>`:""}
      ${i!=null&&i.message||i!=null&&i.linkUrl?`<p>
        ${i==null?void 0:i.message}
        ${i!=null&&i.linkUrl?`<a
              href="${i.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(t=i.linkText)!=null?t:""} ${M("(opens in a new window)")}"
              >${(a=i.linkText)!=null?a:i.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return mT(e)};function pT(e){var t,a;let i=e.theme;if(i){let r=(a=(t=e.getRootNode())==null?void 0:t.getElementById)==null?void 0:a.call(t,i);if(r&&r instanceof HTMLTemplateElement)return r;i.startsWith("media-theme-")||(i=`media-theme-${i}`);let n=Vt.customElements.get(i);if(n!=null&&n.template)return n.template}}function vT(e){var t;let a=(t=e.mediaController)==null?void 0:t.querySelector("media-time-display");return a&&getComputedStyle(a).getPropertyValue("--media-duration-display-display").trim()==="none"}function yh(e){let t=e.videoTitle?{video_title:e.videoTitle}:{};return e.getAttributeNames().filter(a=>a.startsWith("metadata-")).reduce((a,i)=>{let r=e.getAttribute(i);return r!==null&&(a[i.replace(/^metadata-/,"").replace(/-/g,"_")]=r),a},t)}var ET=Object.values(g),fT=Object.values(Jt),bT=Object.values(A),Th=Sv(),Ah="mux-player",kh={isDialogOpen:!1},gT={redundant_streams:!0},Us,Bs,Hs,Fa,Ws,Yi,de,ga,Ov,_d,$a,wh,Sh,Ih,Rh,_T=class extends vh{constructor(){super(),bt(this,de),bt(this,Us),bt(this,Bs,!1),bt(this,Hs,{}),bt(this,Fa,!0),bt(this,Ws,new Uy(this,"hotkeys")),bt(this,Yi,{...kh,onCloseErrorDialog:e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&fe(this,de,_d).call(this,{isDialogOpen:!1})},onFocusInErrorDialog:e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&(kv(this,Hu.activeElement)||e.preventDefault())}}),Yt(this,Us,Md()),this.attachShadow({mode:"open"}),fe(this,de,Ov).call(this),this.isConnected&&fe(this,de,ga).call(this)}static get NAME(){return Ah}static get VERSION(){return Th}static get observedAttributes(){var e;return[...(e=vh.observedAttributes)!=null?e:[],...fT,...ET,...bT]}get mediaTheme(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("media-theme")}get mediaController(){var e,t;return(t=(e=this.mediaTheme)==null?void 0:e.shadowRoot)==null?void 0:t.querySelector("media-controller")}connectedCallback(){let e=this.media;e&&(e.metadata=yh(this))}attributeChangedCallback(e,t,a){switch(fe(this,de,ga).call(this),super.attributeChangedCallback(e,t,a),e){case A.HOTKEYS:Z(this,Ws).value=a;break;case A.THUMBNAIL_TIME:{a!=null&&this.tokens.thumbnail&&ta(M("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break}case A.THUMBNAIL_TOKEN:{if(a){let i=Hi(a);if(i){let{aud:r}=i,n=Fr.THUMBNAIL;r!==n&&ta(M("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"thumbnail"}))}}break}case A.STORYBOARD_TOKEN:{if(a){let i=Hi(a);if(i){let{aud:r}=i,n=Fr.STORYBOARD;r!==n&&ta(M("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"storyboard"}))}}break}case A.DRM_TOKEN:{if(a){let i=Hi(a);if(i){let{aud:r}=i,n=Fr.DRM;r!==n&&ta(M("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"drm"}))}}break}case g.PLAYBACK_ID:{a!=null&&a.includes("?token")&&nt(M("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:a}));break}case g.STREAM_TYPE:a&&![Q.LIVE,Q.ON_DEMAND,Q.UNKNOWN].includes(a)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=a.includes("dvr")?Number.POSITIVE_INFINITY:0:Rv({file:"invalid-stream-type.md",message:M("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):a===Q.LIVE?this.getAttribute(A.TARGET_LIVE_WINDOW)==null&&(this.targetLiveWindow=0):this.targetLiveWindow=Number.NaN}[g.PLAYBACK_ID,Jt.SRC,A.PLAYBACK_TOKEN].includes(e)&&t!==a&&Yt(this,Yi,{...Z(this,Yi),...kh}),fe(this,de,$a).call(this,{[Py(e)]:a})}async requestFullscreen(e){var t;if(!(!this.mediaController||this.mediaController.hasAttribute(c.MEDIA_IS_FULLSCREEN)))return(t=this.mediaController)==null||t.dispatchEvent(new Vt.CustomEvent(D.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((a,i)=>{var r;(r=this.mediaController)==null||r.addEventListener(sa.MEDIA_IS_FULLSCREEN,()=>a(),{once:!0})})}async exitFullscreen(){var e;if(!(!this.mediaController||!this.mediaController.hasAttribute(c.MEDIA_IS_FULLSCREEN)))return(e=this.mediaController)==null||e.dispatchEvent(new Vt.CustomEvent(D.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((t,a)=>{var i;(i=this.mediaController)==null||i.addEventListener(sa.MEDIA_IS_FULLSCREEN,()=>t(),{once:!0})})}get preferCmcd(){var e;return(e=this.getAttribute(g.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?qs.includes(e)?this.setAttribute(g.PREFER_CMCD,e):ta(`Invalid value for preferCmcd. Must be one of ${qs.join()}`):this.removeAttribute(g.PREFER_CMCD))}get hasPlayed(){var e,t;return(t=(e=this.mediaController)==null?void 0:e.hasAttribute(c.MEDIA_HAS_PLAYED))!=null?t:!1}get inLiveWindow(){var e;return(e=this.mediaController)==null?void 0:e.hasAttribute(c.MEDIA_TIME_IS_LIVE)}get _hls(){var e;return(e=this.media)==null?void 0:e._hls}get mux(){var e;return(e=this.media)==null?void 0:e.mux}get theme(){var e;return(e=this.getAttribute(A.THEME))!=null?e:cT}set theme(e){this.setAttribute(A.THEME,`${e}`)}get themeProps(){let e=this.mediaTheme;if(!e)return;let t={};for(let a of e.getAttributeNames()){if(gd.includes(a))continue;let i=e.getAttribute(a);t[Tv(a)]=i===""?!0:i}return t}set themeProps(e){var t,a;fe(this,de,ga).call(this);let i={...this.themeProps,...e};for(let r in i){if(gd.includes(r))continue;let n=e==null?void 0:e[r];typeof n=="boolean"||n==null?(t=this.mediaTheme)==null||t.toggleAttribute(fd(r),!!n):(a=this.mediaTheme)==null||a.setAttribute(fd(r),n)}}get playbackId(){var e;return(e=this.getAttribute(g.PLAYBACK_ID))!=null?e:void 0}set playbackId(e){e?this.setAttribute(g.PLAYBACK_ID,e):this.removeAttribute(g.PLAYBACK_ID)}get src(){var e,t;return this.playbackId?(e=Oa(this,Jt.SRC))!=null?e:void 0:(t=this.getAttribute(Jt.SRC))!=null?t:void 0}set src(e){e?this.setAttribute(Jt.SRC,e):this.removeAttribute(Jt.SRC)}get poster(){var e;let t=this.getAttribute(Jt.POSTER);if(t!=null)return t;let{tokens:a}=this;if(a.playback&&!a.thumbnail){ta("Missing expected thumbnail token. No poster image will be shown");return}if(this.playbackId&&!this.audio)return Oy(this.playbackId,{customDomain:this.customDomain,thumbnailTime:(e=this.thumbnailTime)!=null?e:this.startTime,programTime:this.programStartTime,token:a.thumbnail})}set poster(e){e||e===""?this.setAttribute(Jt.POSTER,e):this.removeAttribute(Jt.POSTER)}get storyboardSrc(){var e;return(e=this.getAttribute(A.STORYBOARD_SRC))!=null?e:void 0}set storyboardSrc(e){e?this.setAttribute(A.STORYBOARD_SRC,e):this.removeAttribute(A.STORYBOARD_SRC)}get storyboard(){let{tokens:e}=this;if(this.storyboardSrc&&!e.storyboard)return this.storyboardSrc;if(!(this.audio||!this.playbackId||!this.streamType||[Q.LIVE,Q.UNKNOWN].includes(this.streamType)||e.playback&&!e.storyboard))return Ny(this.playbackId,{customDomain:this.customDomain,token:e.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(A.AUDIO)}set audio(e){if(!e){this.removeAttribute(A.AUDIO);return}this.setAttribute(A.AUDIO,"")}get hotkeys(){return Z(this,Ws)}get nohotkeys(){return this.hasAttribute(A.NOHOTKEYS)}set nohotkeys(e){if(!e){this.removeAttribute(A.NOHOTKEYS);return}this.setAttribute(A.NOHOTKEYS,"")}get thumbnailTime(){return Ze(this.getAttribute(A.THUMBNAIL_TIME))}set thumbnailTime(e){this.setAttribute(A.THUMBNAIL_TIME,`${e}`)}get videoTitle(){var e,t;return(t=(e=this.getAttribute(A.VIDEO_TITLE))!=null?e:this.getAttribute(A.TITLE))!=null?t:""}set videoTitle(e){e!==this.videoTitle&&(e?this.setAttribute(A.VIDEO_TITLE,e):this.removeAttribute(A.VIDEO_TITLE))}get placeholder(){var e;return(e=Oa(this,A.PLACEHOLDER))!=null?e:""}set placeholder(e){this.setAttribute(A.PLACEHOLDER,`${e}`)}get primaryColor(){var e,t;let a=this.getAttribute(A.PRIMARY_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=Vt.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_primary-color"))==null?void 0:t.trim(),a))return a}set primaryColor(e){this.setAttribute(A.PRIMARY_COLOR,`${e}`)}get secondaryColor(){var e,t;let a=this.getAttribute(A.SECONDARY_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=Vt.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_secondary-color"))==null?void 0:t.trim(),a))return a}set secondaryColor(e){this.setAttribute(A.SECONDARY_COLOR,`${e}`)}get accentColor(){var e,t;let a=this.getAttribute(A.ACCENT_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=Vt.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_accent-color"))==null?void 0:t.trim(),a))return a}set accentColor(e){this.setAttribute(A.ACCENT_COLOR,`${e}`)}get defaultShowRemainingTime(){return this.hasAttribute(A.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(e){e?this.setAttribute(A.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(A.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(A.PLAYBACK_RATES))return this.getAttribute(A.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(e=>Number(e)).filter(e=>!Number.isNaN(e)).sort((e,t)=>e-t)}set playbackRates(e){if(!e){this.removeAttribute(A.PLAYBACK_RATES);return}this.setAttribute(A.PLAYBACK_RATES,e.join(" "))}get forwardSeekOffset(){var e;return(e=Ze(this.getAttribute(A.FORWARD_SEEK_OFFSET)))!=null?e:10}set forwardSeekOffset(e){this.setAttribute(A.FORWARD_SEEK_OFFSET,`${e}`)}get backwardSeekOffset(){var e;return(e=Ze(this.getAttribute(A.BACKWARD_SEEK_OFFSET)))!=null?e:10}set backwardSeekOffset(e){this.setAttribute(A.BACKWARD_SEEK_OFFSET,`${e}`)}get defaultHiddenCaptions(){return this.hasAttribute(A.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(e){e?this.setAttribute(A.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(A.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return Ze(this.getAttribute(A.DEFAULT_DURATION))}set defaultDuration(e){e==null?this.removeAttribute(A.DEFAULT_DURATION):this.setAttribute(A.DEFAULT_DURATION,`${e}`)}get playerInitTime(){return this.hasAttribute(g.PLAYER_INIT_TIME)?Ze(this.getAttribute(g.PLAYER_INIT_TIME)):Z(this,Us)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(g.PLAYER_INIT_TIME):this.setAttribute(g.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=this.getAttribute(g.PLAYER_SOFTWARE_NAME))!=null?e:Ah}get playerSoftwareVersion(){var e;return(e=this.getAttribute(g.PLAYER_SOFTWARE_VERSION))!=null?e:Th}get beaconCollectionDomain(){var e;return(e=this.getAttribute(g.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(g.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(g.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var e;return(e=this.getAttribute(g.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(g.MAX_RESOLUTION,e):this.removeAttribute(g.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(g.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(g.MIN_RESOLUTION,e):this.removeAttribute(g.MIN_RESOLUTION))}get renditionOrder(){var e;return(e=this.getAttribute(g.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(g.RENDITION_ORDER,e):this.removeAttribute(g.RENDITION_ORDER))}get programStartTime(){return Ze(this.getAttribute(g.PROGRAM_START_TIME))}set programStartTime(e){e==null?this.removeAttribute(g.PROGRAM_START_TIME):this.setAttribute(g.PROGRAM_START_TIME,`${e}`)}get programEndTime(){return Ze(this.getAttribute(g.PROGRAM_END_TIME))}set programEndTime(e){e==null?this.removeAttribute(g.PROGRAM_END_TIME):this.setAttribute(g.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){return Ze(this.getAttribute(g.ASSET_START_TIME))}set assetStartTime(e){e==null?this.removeAttribute(g.ASSET_START_TIME):this.setAttribute(g.ASSET_START_TIME,`${e}`)}get assetEndTime(){return Ze(this.getAttribute(g.ASSET_END_TIME))}set assetEndTime(e){e==null?this.removeAttribute(g.ASSET_END_TIME):this.setAttribute(g.ASSET_END_TIME,`${e}`)}get extraSourceParams(){return this.hasAttribute(A.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(A.EXTRA_SOURCE_PARAMS)).entries()].reduce((e,[t,a])=>(e[t]=a,e),{}):gT}set extraSourceParams(e){e==null?this.removeAttribute(A.EXTRA_SOURCE_PARAMS):this.setAttribute(A.EXTRA_SOURCE_PARAMS,new URLSearchParams(e).toString())}get customDomain(){var e;return(e=this.getAttribute(g.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(g.CUSTOM_DOMAIN,e):this.removeAttribute(g.CUSTOM_DOMAIN))}get envKey(){var e;return(e=Oa(this,g.ENV_KEY))!=null?e:void 0}set envKey(e){this.setAttribute(g.ENV_KEY,`${e}`)}get noVolumePref(){return this.hasAttribute(A.NO_VOLUME_PREF)}set noVolumePref(e){e?this.setAttribute(A.NO_VOLUME_PREF,""):this.removeAttribute(A.NO_VOLUME_PREF)}get debug(){return Oa(this,g.DEBUG)!=null}set debug(e){e?this.setAttribute(g.DEBUG,""):this.removeAttribute(g.DEBUG)}get disableTracking(){return Oa(this,g.DISABLE_TRACKING)!=null}set disableTracking(e){this.toggleAttribute(g.DISABLE_TRACKING,!!e)}get disableCookies(){return Oa(this,g.DISABLE_COOKIES)!=null}set disableCookies(e){e?this.setAttribute(g.DISABLE_COOKIES,""):this.removeAttribute(g.DISABLE_COOKIES)}get streamType(){var e,t,a;return(a=(t=this.getAttribute(g.STREAM_TYPE))!=null?t:(e=this.media)==null?void 0:e.streamType)!=null?a:Q.UNKNOWN}set streamType(e){this.setAttribute(g.STREAM_TYPE,`${e}`)}get defaultStreamType(){var e,t,a;return(a=(t=this.getAttribute(A.DEFAULT_STREAM_TYPE))!=null?t:(e=this.mediaController)==null?void 0:e.getAttribute(A.DEFAULT_STREAM_TYPE))!=null?a:Q.ON_DEMAND}set defaultStreamType(e){e?this.setAttribute(A.DEFAULT_STREAM_TYPE,e):this.removeAttribute(A.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var e,t;return this.hasAttribute(A.TARGET_LIVE_WINDOW)?+this.getAttribute(A.TARGET_LIVE_WINDOW):(t=(e=this.media)==null?void 0:e.targetLiveWindow)!=null?t:Number.NaN}set targetLiveWindow(e){e==this.targetLiveWindow||Number.isNaN(e)&&Number.isNaN(this.targetLiveWindow)||(e==null?this.removeAttribute(A.TARGET_LIVE_WINDOW):this.setAttribute(A.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e;return(e=this.media)==null?void 0:e.liveEdgeStart}get startTime(){return Ze(Oa(this,g.START_TIME))}set startTime(e){this.setAttribute(g.START_TIME,`${e}`)}get preferPlayback(){let e=this.getAttribute(g.PREFER_PLAYBACK);if(e===Ft.MSE||e===Ft.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===Ft.MSE||e===Ft.NATIVE?this.setAttribute(g.PREFER_PLAYBACK,e):this.removeAttribute(g.PREFER_PLAYBACK))}get metadata(){var e;return(e=this.media)==null?void 0:e.metadata}set metadata(e){if(fe(this,de,ga).call(this),!this.media){nt("underlying media element missing when trying to set metadata. metadata will not be set.");return}this.media.metadata={...yh(this),...e}}get _hlsConfig(){var e;return(e=this.media)==null?void 0:e._hlsConfig}set _hlsConfig(e){if(fe(this,de,ga).call(this),!this.media){nt("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");return}this.media._hlsConfig=e}async addCuePoints(e){var t;if(fe(this,de,ga).call(this),!this.media){nt("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");return}return(t=this.media)==null?void 0:t.addCuePoints(e)}get activeCuePoint(){var e;return(e=this.media)==null?void 0:e.activeCuePoint}get cuePoints(){var e,t;return(t=(e=this.media)==null?void 0:e.cuePoints)!=null?t:[]}addChapters(e){var t;if(fe(this,de,ga).call(this),!this.media){nt("underlying media element missing when trying to addChapters. chapters will not be added.");return}return(t=this.media)==null?void 0:t.addChapters(e)}get activeChapter(){var e;return(e=this.media)==null?void 0:e.activeChapter}get chapters(){var e,t;return(t=(e=this.media)==null?void 0:e.chapters)!=null?t:[]}getStartDate(){var e;return(e=this.media)==null?void 0:e.getStartDate()}get currentPdt(){var e;return(e=this.media)==null?void 0:e.currentPdt}get tokens(){let e=this.getAttribute(A.PLAYBACK_TOKEN),t=this.getAttribute(A.DRM_TOKEN),a=this.getAttribute(A.THUMBNAIL_TOKEN),i=this.getAttribute(A.STORYBOARD_TOKEN);return{...Z(this,Hs),...e!=null?{playback:e}:{},...t!=null?{drm:t}:{},...a!=null?{thumbnail:a}:{},...i!=null?{storyboard:i}:{}}}set tokens(e){Yt(this,Hs,e??{})}get playbackToken(){var e;return(e=this.getAttribute(A.PLAYBACK_TOKEN))!=null?e:void 0}set playbackToken(e){this.setAttribute(A.PLAYBACK_TOKEN,`${e}`)}get drmToken(){var e;return(e=this.getAttribute(A.DRM_TOKEN))!=null?e:void 0}set drmToken(e){this.setAttribute(A.DRM_TOKEN,`${e}`)}get thumbnailToken(){var e;return(e=this.getAttribute(A.THUMBNAIL_TOKEN))!=null?e:void 0}set thumbnailToken(e){this.setAttribute(A.THUMBNAIL_TOKEN,`${e}`)}get storyboardToken(){var e;return(e=this.getAttribute(A.STORYBOARD_TOKEN))!=null?e:void 0}set storyboardToken(e){this.setAttribute(A.STORYBOARD_TOKEN,`${e}`)}addTextTrack(e,t,a,i){var r;let n=(r=this.media)==null?void 0:r.nativeEl;if(n)return Rd(n,e,t,a,i)}removeTextTrack(e){var t;let a=(t=this.media)==null?void 0:t.nativeEl;if(a)return Db(a,e)}get textTracks(){var e;return(e=this.media)==null?void 0:e.textTracks}get castReceiver(){var e;return(e=this.getAttribute(A.CAST_RECEIVER))!=null?e:void 0}set castReceiver(e){e!==this.castReceiver&&(e?this.setAttribute(A.CAST_RECEIVER,e):this.removeAttribute(A.CAST_RECEIVER))}get castCustomData(){var e;return(e=this.media)==null?void 0:e.castCustomData}set castCustomData(e){if(!this.media){nt("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");return}this.media.castCustomData=e}get noTooltips(){return this.hasAttribute(A.NO_TOOLTIPS)}set noTooltips(e){if(!e){this.removeAttribute(A.NO_TOOLTIPS);return}this.setAttribute(A.NO_TOOLTIPS,"")}get proudlyDisplayMuxBadge(){return this.hasAttribute(A.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(e){e?this.setAttribute(A.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(A.PROUDLY_DISPLAY_MUX_BADGE)}};Us=new WeakMap,Bs=new WeakMap,Hs=new WeakMap,Fa=new WeakMap,Ws=new WeakMap,Yi=new WeakMap,de=new WeakSet,ga=function(){var e,t,a,i;if(!Z(this,Bs)){Yt(this,Bs,!0),fe(this,de,$a).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof Vt.HTMLElement))throw""}catch{nt("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch{nt("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof Zg))throw""}catch{nt("<media-controller> failed to upgrade!")}fe(this,de,wh).call(this),fe(this,de,Sh).call(this),fe(this,de,Ih).call(this),Yt(this,Fa,(t=(e=this.mediaController)==null?void 0:e.hasAttribute(O.USER_INACTIVE))!=null?t:!0),fe(this,de,Rh).call(this),(a=this.media)==null||a.addEventListener("streamtypechange",()=>fe(this,de,$a).call(this)),(i=this.media)==null||i.addEventListener("loadstart",()=>fe(this,de,$a).call(this))}},Ov=function(){var e,t;try{(e=window==null?void 0:window.CSS)==null||e.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),(t=window==null?void 0:window.CSS)==null||t.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch{}},_d=function(e){Object.assign(Z(this,Yi),e),fe(this,de,$a).call(this)},$a=function(e={}){Jy(tT(hT(this,{...Z(this,Yi),...e})),this.shadowRoot)},wh=function(){let e=t=>{var a,i;if(!(t!=null&&t.startsWith("theme-")))return;let r=t.replace(/^theme-/,"");if(gd.includes(r))return;let n=this.getAttribute(t);n!=null?(a=this.mediaTheme)==null||a.setAttribute(r,n):(i=this.mediaTheme)==null||i.removeAttribute(r)};new MutationObserver(t=>{for(let{attributeName:a}of t)e(a)}).observe(this,{attributes:!0}),this.getAttributeNames().forEach(e)},Sh=function(){let e=t=>{var a;let i=(a=this.media)==null?void 0:a.error;if(!(i instanceof I)){let{message:n,code:s}=i??{};i=new I(n,s)}if(!(i!=null&&i.fatal)){ta(i),i.data&&ta(`${i.name} data:`,i.data);return}let r=bh(i);r.message&&Rv(r),nt(i),i.data&&nt(`${i.name} data:`,i.data),fe(this,de,_d).call(this,{isDialogOpen:!0})};this.addEventListener("error",e),this.media&&(this.media.errorTranslator=(t={})=>{var a,i,r;if(!(((a=this.media)==null?void 0:a.error)instanceof I))return t;let n=bh((i=this.media)==null?void 0:i.error);return{player_error_code:(r=this.media)==null?void 0:r.error.code,player_error_message:n.message?String(n.message):t.player_error_message,player_error_context:n.context?String(n.context):t.player_error_context}})},Ih=function(){var e,t,a,i;let r=()=>fe(this,de,$a).call(this);(t=(e=this.media)==null?void 0:e.textTracks)==null||t.addEventListener("addtrack",r),(i=(a=this.media)==null?void 0:a.textTracks)==null||i.addEventListener("removetrack",r)},Rh=function(){var e,t;if(!/Firefox/i.test(navigator.userAgent))return;let a,i=new WeakMap,r=()=>this.streamType===Q.LIVE&&!this.secondaryColor&&this.offsetWidth>=800,n=(l,d,u=!1)=>{r()||Array.from(l&&l.activeCues||[]).forEach(p=>{if(!(!p.snapToLines||p.line<-5||p.line>=0&&p.line<10))if(!d||this.paused){let m=p.text.split(`
`).length,h=-3;this.streamType===Q.LIVE&&(h=-2);let v=h-m;if(p.line===v&&!u)return;i.has(p)||i.set(p,p.line),p.line=v}else setTimeout(()=>{p.line=i.get(p)||"auto"},500)})},s=()=>{var l,d;n(a,(d=(l=this.mediaController)==null?void 0:l.hasAttribute(O.USER_INACTIVE))!=null?d:!1)},o=()=>{var l,d;let u=Array.from(((d=(l=this.mediaController)==null?void 0:l.media)==null?void 0:d.textTracks)||[]).filter(p=>["subtitles","captions"].includes(p.kind)&&p.mode==="showing")[0];u!==a&&(a==null||a.removeEventListener("cuechange",s)),a=u,a==null||a.addEventListener("cuechange",s),n(a,Z(this,Fa))};o(),(e=this.textTracks)==null||e.addEventListener("change",o),(t=this.textTracks)==null||t.addEventListener("addtrack",o),this.addEventListener("userinactivechange",()=>{var l,d;let u=(d=(l=this.mediaController)==null?void 0:l.hasAttribute(O.USER_INACTIVE))!=null?d:!0;Z(this,Fa)!==u&&(Yt(this,Fa,u),n(a,Z(this,Fa)))})};function Oa(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var Dh=_T,Nv=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment>"u"){class e extends Nv{}globalThis.DocumentFragment=e}var yT=class extends Nv{},TT={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(yT)}},AT={customElements:TT},kT=typeof window>"u"||typeof globalThis.customElements>"u",rl=kT?AT:globalThis;rl.customElements.get("mux-player")||(rl.customElements.define("mux-player",Dh),rl.MuxPlayerElement=Dh);var xv=parseInt(Zr.version)>=19,Ch={className:"class",classname:"class",htmlFor:"for",crossOrigin:"crossorigin",viewBox:"viewBox",playsInline:"playsinline",autoPlay:"autoplay",playbackRate:"playbackrate"},wT=e=>e==null,ST=(e,t)=>wT(t)?!1:e in t,IT=e=>e.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`),RT=(e,t)=>{if(!(!xv&&typeof t=="boolean"&&!t)){if(ST(e,Ch))return Ch[e];if(typeof t<"u")return/[A-Z]/.test(e)?IT(e):e}},DT=(e,t)=>!xv&&typeof e=="boolean"?"":e,CT=(e={})=>{let{ref:t,...a}=e;return Object.entries(a).reduce((i,[r,n])=>{let s=RT(r,n);if(!s)return i;let o=DT(n);return i[s]=o,i},{})};function Lh(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function LT(...e){return t=>{let a=!1,i=e.map(r=>{let n=Lh(r,t);return!a&&typeof n=="function"&&(a=!0),n});if(a)return()=>{for(let r=0;r<i.length;r++){let n=i[r];typeof n=="function"?n():Lh(e[r],null)}}}}function MT(...e){return zr.useCallback(LT(...e),e)}var OT=Object.prototype.hasOwnProperty,NT=(e,t)=>{if(Object.is(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;if(Array.isArray(e))return!Array.isArray(t)||e.length!==t.length?!1:e.some((r,n)=>t[n]===r);let a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(let r=0;r<a.length;r++)if(!OT.call(t,a[r])||!Object.is(e[a[r]],t[a[r]]))return!1;return!0},Pv=(e,t,a)=>!NT(t,e[a]),xT=(e,t,a)=>{e[a]=t},PT=(e,t,a,i=xT,r=Pv)=>zr.useEffect(()=>{let n=a==null?void 0:a.current;n&&r(n,t,e)&&i(n,t,e)},[a==null?void 0:a.current,t]),It=PT,UT=()=>{try{return"3.5.1"}catch{}return"UNKNOWN"},BT=UT(),HT=()=>BT,oe=(e,t,a)=>zr.useEffect(()=>{let i=t==null?void 0:t.current;if(!i||!a)return;let r=e,n=a;return i.addEventListener(r,n),()=>{i.removeEventListener(r,n)}},[t==null?void 0:t.current,a,e]),WT=Zr.forwardRef(({children:e,...t},a)=>Zr.createElement("mux-player",{suppressHydrationWarning:!0,...CT(t),ref:a},e)),VT=(e,t)=>{let{onAbort:a,onCanPlay:i,onCanPlayThrough:r,onEmptied:n,onLoadStart:s,onLoadedData:o,onLoadedMetadata:l,onProgress:d,onDurationChange:u,onVolumeChange:p,onRateChange:m,onResize:h,onWaiting:v,onPlay:_,onPlaying:b,onTimeUpdate:y,onPause:T,onSeeking:E,onSeeked:S,onStalled:L,onSuspend:x,onEnded:W,onError:G,onCuePointChange:z,onChapterChange:F,metadata:U,tokens:Oe,paused:$e,playbackId:Ke,playbackRates:me,currentTime:Pe,themeProps:At,extraSourceParams:Ue,castCustomData:dt,_hlsConfig:kt,...Be}=t;return It("playbackRates",me,e),It("metadata",U,e),It("extraSourceParams",Ue,e),It("_hlsConfig",kt,e),It("themeProps",At,e),It("tokens",Oe,e),It("playbackId",Ke,e),It("castCustomData",dt,e),It("paused",$e,e,(qe,et)=>{et!=null&&(et?qe.pause():qe.play())},(qe,et,oi)=>qe.hasAttribute("autoplay")&&!qe.hasPlayed?!1:Pv(qe,et,oi)),It("currentTime",Pe,e,(qe,et)=>{et!=null&&(qe.currentTime=et)}),oe("abort",e,a),oe("canplay",e,i),oe("canplaythrough",e,r),oe("emptied",e,n),oe("loadstart",e,s),oe("loadeddata",e,o),oe("loadedmetadata",e,l),oe("progress",e,d),oe("durationchange",e,u),oe("volumechange",e,p),oe("ratechange",e,m),oe("resize",e,h),oe("waiting",e,v),oe("play",e,_),oe("playing",e,b),oe("timeupdate",e,y),oe("pause",e,T),oe("seeking",e,E),oe("seeked",e,S),oe("stalled",e,L),oe("suspend",e,x),oe("ended",e,W),oe("error",e,G),oe("cuepointchange",e,z),oe("chapterchange",e,F),[Be]},FT=HT(),$T="mux-player-react",KT=Zr.forwardRef((e,t)=>{var a;let i=zr.useRef(null),r=MT(i,t),[n]=VT(i,e),[s]=zr.useState((a=e.playerInitTime)!=null?a:Md());return Zr.createElement(WT,{ref:r,defaultHiddenCaptions:e.defaultHiddenCaptions,playerSoftwareName:$T,playerSoftwareVersion:FT,playerInitTime:s,...n})}),zT=KT;export{jT as MaxResolution,I as MediaError,QT as MinResolution,ZT as RenditionOrder,zT as default,Md as generatePlayerInitTime,$T as playerSoftwareName,FT as playerSoftwareVersion};
