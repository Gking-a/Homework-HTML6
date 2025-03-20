// 导出自定义元素类
export class AutoMediaAdapter extends HTMLElement {
    static get observedAttributes() { return ['src','type', 'alt', 'autoplay', 'controls', 'loop', 'muted']; }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mediaElement = null;
        this.src=''
    }

    connectedCallback() {
    }

    attributeChangedCallback(name, oldVal, newVal) {
        console.log(name,oldVal,newVal,this.mediaElement==null)
        if (name === 'src' && oldVal !== newVal) {
            this.renderMedia();
        }
        else if(name === 'type'){
            this.mediaElement.setAttribute(name,newVal)
        }
        else {
            if(this.mediaElement==null){
                this.renderMedia();
            }
            if(this.mediaElement!=null){
                if(newVal==='')
                {
                    this.mediaElement.setAttribute(name, '')
                }else{
                    this.mediaElement.setAttribute(name,newVal)
                }
            }
        }
    }

    // 智能识别媒体类型
    detectMediaType(src) {
        const extension = src.split('.').pop().toLowerCase();
        const mimeTypes = {
            // 图片类型
            png: 'image', jpg: 'image', jpeg: 'image',
            webp: 'image', gif: 'image', avif: 'image',

            // 视频类型
            mp4: 'video', webm: 'video', ogg: 'video',
            mov: 'video', mkv: 'video',

            // 音频类型
            mp3: 'audio', wav: 'audio', oga: 'audio',

            // 其他类型
            pdf: 'embed', swf: 'embed'
        };
        if(typeof mimeTypes[extension]!=='undefined'){
            if(!this.hasAttribute('type')){
                this.setAttribute('type',mimeTypes[extension]+"/"+extension)
            }
        }
        return mimeTypes[extension] || 'embed'
    }

    // 创建媒体元素
    createMediaElement(type) {
        if(!(this.hasAttribute('type')||this.hasAttribute('src')))return null;
        if(this.mediaElement!=null)return this.mediaElement
        const elements = {
            image: () => {
                const img = document.createElement('img');
                img.alt = this.getAttribute('alt') || '';
                return img;
            },
            video: () => document.createElement('video'),
            audio: () => document.createElement('audio'),
            embed: () => document.createElement('embed')
        };
        console.log(type)
        return (elements[type] || elements.embed)();
    }

    // 渲染核心逻辑
    renderMedia() {
        console.log("RENDER")
        const src = this.getAttribute('src');
        if (!src) return;

        const mediaType = this.detectMediaType(src);
        this.mediaElement = this.createMediaElement(mediaType);

        // 清空现有内容
        this.shadowRoot.innerHTML = '';

        // 添加样式隔离
        const style = document.createElement('style');
        style.textContent = `
      :host { display: block; }
      img, video, embed { 
        max-width: 100%;
        height: auto;
      }
      audio{
      max-width: 100%;
        height: 100px;
      }
    `;

        // 组装元素
        this.shadowRoot.append(style, this.mediaElement);
        this.mediaElement.setAttribute('type',this.getAttribute('type'))
        this.mediaElement.setAttribute('src',this.getAttribute('src'))
    }
}

// 注册自定义元素
customElements.define('my-automedia', AutoMediaAdapter);