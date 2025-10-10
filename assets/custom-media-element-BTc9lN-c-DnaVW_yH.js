var z=Object.defineProperty,H=i=>{throw TypeError(i)},U=(i,e,s)=>e in i?z(i,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):i[e]=s,g=(i,e,s)=>U(i,typeof e!="symbol"?e+"":e,s),L=(i,e,s)=>e.has(i)||H("Cannot "+s),p=(i,e,s)=>(L(i,e,"read from private field"),s?s.call(i):e.get(i)),m=(i,e,s)=>e.has(i)?H("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,s),M=(i,e,s,u)=>(L(i,e,"write to private field"),e.set(i,s),s),c=(i,e,s)=>(L(i,e,"access private method"),s);const B=["abort","canplay","canplaythrough","durationchange","emptied","encrypted","ended","error","loadeddata","loadedmetadata","loadstart","pause","play","playing","progress","ratechange","seeked","seeking","stalled","suspend","timeupdate","volumechange","waiting","waitingforkey","resize","enterpictureinpicture","leavepictureinpicture","webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"],P=["autopictureinpicture","disablepictureinpicture","disableremoteplayback","autoplay","controls","controlslist","crossorigin","loop","muted","playsinline","poster","preload","src"];function D(i){return`
    <style>
      :host {
        display: inline-flex;
        line-height: 0;
        flex-direction: column;
        justify-content: end;
      }

      audio {
        width: 100%;
      }
    </style>
    <slot name="media">
      <audio${q(i)}></audio>
    </slot>
    <slot></slot>
  `}function G(i){return`
    <style>
      :host {
        display: inline-block;
        line-height: 0;
      }

      video {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, 50% 50%);
      }

      video::-webkit-media-text-track-container {
        transform: var(--media-webkit-text-track-transform);
        transition: var(--media-webkit-text-track-transition);
      }
    </style>
    <slot name="media">
      <video${q(i)}></video>
    </slot>
    <slot></slot>
  `}function N(i,{tag:e,is:s}){var u,x,h,y,O,C,k,E,f,A,l,b,T,S,j,W,R;const w=(x=(u=globalThis.document)==null?void 0:u.createElement)==null?void 0:x.call(u,e,{is:s}),$=w?I(w):[];return h=class extends i{constructor(){super(...arguments),m(this,l),m(this,k,!1),m(this,E,null),m(this,f,new Map),m(this,A),g(this,"get"),g(this,"set"),g(this,"call")}static get observedAttributes(){var t,o;return c(t=h,O,C).call(t),[...((o=w==null?void 0:w.constructor)==null?void 0:o.observedAttributes)??[],...P]}get nativeEl(){var t;return c(this,l,b).call(this),p(this,E)??this.querySelector(":scope > [slot=media]")??this.querySelector(e)??((t=this.shadowRoot)==null?void 0:t.querySelector(e))??null}set nativeEl(t){M(this,E,t)}get defaultMuted(){return this.hasAttribute("muted")}set defaultMuted(t){this.toggleAttribute("muted",t)}get src(){return this.getAttribute("src")}set src(t){this.setAttribute("src",`${t}`)}get preload(){var t;return this.getAttribute("preload")??((t=this.nativeEl)==null?void 0:t.preload)}set preload(t){this.setAttribute("preload",`${t}`)}init(){if(!this.shadowRoot){this.attachShadow({mode:"open"});const t=J(this.attributes);s&&(t.is=s),e&&(t.part=e),this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.nativeEl.muted=this.hasAttribute("muted");for(const t of $)c(this,l,W).call(this,t);M(this,A,new MutationObserver(c(this,l,S).bind(this))),this.shadowRoot.addEventListener("slotchange",()=>c(this,l,T).call(this)),c(this,l,T).call(this);for(const t of this.constructor.Events)this.shadowRoot.addEventListener(t,this,!0)}handleEvent(t){t.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(t.type,{detail:t.detail}))}attributeChangedCallback(t,o,r){c(this,l,b).call(this),c(this,l,R).call(this,t,o,r)}connectedCallback(){c(this,l,b).call(this)}},y=new WeakMap,O=new WeakSet,C=function(){if(p(this,y))return;M(this,y,!0);const t=new Set(this.observedAttributes);t.delete("muted");for(const o of $)if(!(o in this.prototype))if(typeof w[o]=="function")this.prototype[o]=function(...r){return c(this,l,b).call(this),(()=>{var n;if(this.call)return this.call(o,...r);const a=(n=this.nativeEl)==null?void 0:n[o];return a==null?void 0:a.apply(this.nativeEl,r)})()};else{const r={get(){var n,a;c(this,l,b).call(this);const v=o.toLowerCase();if(t.has(v)){const d=this.getAttribute(v);return d===null?!1:d===""?!0:d}return((n=this.get)==null?void 0:n.call(this,o))??((a=this.nativeEl)==null?void 0:a[o])}};o!==o.toUpperCase()&&(r.set=function(n){c(this,l,b).call(this);const a=o.toLowerCase();if(t.has(a)){n===!0||n===!1||n==null?this.toggleAttribute(a,!!n):this.setAttribute(a,n);return}if(this.set){this.set(o,n);return}this.nativeEl&&(this.nativeEl[o]=n)}),Object.defineProperty(this.prototype,o,r)}},k=new WeakMap,E=new WeakMap,f=new WeakMap,A=new WeakMap,l=new WeakSet,b=function(){p(this,k)||(M(this,k,!0),this.init())},T=function(){var t;const o=new Map(p(this,f)),r=(t=this.shadowRoot)==null?void 0:t.querySelector("slot:not([name])");(r==null?void 0:r.assignedElements({flatten:!0}).filter(n=>["track","source"].includes(n.localName))).forEach(n=>{var a,v;o.delete(n);let d=p(this,f).get(n);d||(d=n.cloneNode(),p(this,f).set(n,d),(a=p(this,A))==null||a.observe(n,{attributes:!0})),(v=this.nativeEl)==null||v.append(d),c(this,l,j).call(this,d)}),o.forEach((n,a)=>{n.remove(),p(this,f).delete(a)})},S=function(t){for(const o of t)if(o.type==="attributes"){const{target:r,attributeName:n}=o,a=p(this,f).get(r);a&&n&&(a.setAttribute(n,r.getAttribute(n)??""),c(this,l,j).call(this,a))}},j=function(t){t&&t.localName==="track"&&t.default&&(t.kind==="chapters"||t.kind==="metadata")&&t.track.mode==="disabled"&&(t.track.mode="hidden")},W=function(t){if(Object.prototype.hasOwnProperty.call(this,t)){const o=this[t];delete this[t],this[t]=o}},R=function(t,o,r){var n,a,v;["id","class"].includes(t)||!h.observedAttributes.includes(t)&&this.constructor.observedAttributes.includes(t)||(r===null?(n=this.nativeEl)==null||n.removeAttribute(t):((a=this.nativeEl)==null?void 0:a.getAttribute(t))!==r&&((v=this.nativeEl)==null||v.setAttribute(t,r)))},m(h,O),g(h,"getTemplateHTML",e.endsWith("audio")?D:G),g(h,"shadowRootOptions",{mode:"open"}),g(h,"Events",B),m(h,y,!1),h}function I(i){const e=[];for(let s=Object.getPrototypeOf(i);s&&s!==HTMLElement.prototype;s=Object.getPrototypeOf(s)){const u=Object.getOwnPropertyNames(s);e.push(...u)}return e}function q(i){let e="";for(const s in i){if(!P.includes(s))continue;const u=i[s];u===""?e+=` ${s}`:e+=` ${s}="${u}"`}return e}function J(i){const e={};for(const s of i)e[s.name]=s.value;return e}const V=N(globalThis.HTMLElement??class{},{tag:"video"});N(globalThis.HTMLElement??class{},{tag:"audio"});export{V as X};
