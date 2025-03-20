export class DeprecatedTimeRecorder extends HTMLElement {
    static observedAttributes = ['mode', 'recording', 'framerate'];

    constructor() {
        super();
        this._records = [];
        this._initShadowDOM();
    }

    // 元素挂载时初始化
    connectedCallback() {
        this._initShadowDOM();
        this._renderUI();
    }

// 元素移除时清理
    disconnectedCallback() {
        this.stop();
        this.pauseReplay();
    }

// 属性变化响应
    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case 'mode':
                this._handleModeChange(newVal);
                break;
            case 'recording':
                this._toggleRecording(newVal !== null);
                break;
            case 'framerate':
                this._setFrameRate(Number(newVal));
                break;
        }
    }

    // 公共方法
    start() {
        this.setAttribute('recording', '');
        // 启动逻辑...
    }

    stop() {
        this.removeAttribute('recording');
        // 停止逻辑...
    }

    // 私有方法
    _initShadowDOM() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: inline-block;
        contain: content;
      }
      .controls {
        /* 控制面板样式 */
      }
    </style>
    <div class="controls">
      <button id="start">Start</button>
      <button id="stop">Stop</button>
    </div>
    <div id="timeline"></div>
  `;

        // 事件绑定
        this.shadowRoot.getElementById('start')
            .addEventListener('click', () => this.start());
    }
    _renderUI() { /* ... */ }
    _handleModeChange() { /* ... */ }

    // 新增数据属性
    get recordingData() {
        return this._records;
    }

    set recordingData(value) {
        if (!value) return;
        this._records = JSON.parse(value);
    }
}customElements.define('time-recorder', DeprecatedTimeRecorder);