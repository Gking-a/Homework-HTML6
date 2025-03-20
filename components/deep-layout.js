
class ParallaxContainer extends HTMLElement {
    #layers = [];
    #rafId = null;
    #scrollY = 0;

    connectedCallback() {
        this.#initLayers();
        this.#startTracking();
    }

    disconnectedCallback() {
        this.#stopTracking();
    }

    // 启动滚动监听
    #startTracking() {
        const updateScroll = () => {
            this.#scrollY = window.scrollY;
            this.#rafId = requestAnimationFrame(updateScroll);
            this.#applyParallax();
        };
        updateScroll();

        // 优化：当元素不可见时暂停计算
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.#rafId = requestAnimationFrame(updateScroll);
                } else {
                    cancelAnimationFrame(this.#rafId);
                }
            });
        });
        observer.observe(this);
    }

    // 停止追踪
    #stopTracking() {
        cancelAnimationFrame(this.#rafId);
    }

    // 观察直接属性而非 data-* 属性
    static get observedAttributes() {
        return ['disabled', 'depth', 'axis', 'offset','yvh','xvh'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#layers.vh=150
        this.#initStyles();
    }

    connectedCallback() {
        this.#initLayers();
        this.#startTracking();
    }

    disconnectedCallback() {
        this.#stopTracking();
    }

    // 增强样式：强制子元素绝对定位
    #initStyles() {
        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        height: ${this.#layers.yvh}vh;
        width: ${this.#layers.xvh}vh;
      }
      ::slotted(*) {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        transform: translate3d(0, 0, 0);
        will-change: transform;
      }
    `;
        if(this.shadowRoot.firstChild!==null) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild)
            this.shadowRoot.removeChild(this.shadowRoot.firstChild)
        }
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(document.createElement('slot'));
    }

    // 收集直接属性配置
    #initLayers() {
        this.#layers = [...this.children].map(el => ({
            element: el,
            depth: parseFloat(el.getAttribute('depth')) || 0.5,
            axis: (el.getAttribute('axis') || 'y').toLowerCase(),
            offset: {
                x: parseInt(el.getAttribute('offset-x')) || 0,
                y: parseInt(el.getAttribute('offset-y')) ||
                    parseInt(el.getAttribute('offset')) || 0
            },
            baseX: 0, // 初始基准位置 X
            baseY: 0  // 初始基准位置 Y
        }));

        // 捕获初始位置
        const rect = this.getBoundingClientRect();
        this.#layers.forEach(layer => {
            const elRect = layer.element.getBoundingClientRect();
            layer.baseX = elRect.left - rect.left;
            layer.baseY = elRect.top - rect.top;
        });
    }

    // 应用变换逻辑优化
    #applyParallax() {
        const containerRect = this.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollTop = this.#scrollY - containerRect.top;

        this.#layers.forEach(layer => {
            const { element, depth, axis, offset, baseX, baseY } = layer;
            const progress = scrollTop / viewportHeight;
            let x = baseX + offset.x;
            let y = baseY + offset.y;
            // 根据轴向应用滚动变换
            if (axis.includes('x')) x += progress * depth * viewportHeight;
            if (axis.includes('y')) y += progress * depth * viewportHeight;

            element.style.transform = `translate3d(
        ${x.toFixed(2)}px, 
        ${y.toFixed(2)}px, 
        0
      )`;
        });
    }

    // 属性变化回调
    attributeChangedCallback(name, oldVal, newVal) {
        if(name==='yvh') {
            this.#layers.yvh = parseInt(newVal) || 100
            this.#initStyles()
        }
        if(name==='xvh') {
            this.#layers.xvh = parseInt(newVal) || 100
            this.#initStyles()
        }

    }

}

customElements.define('parallax-container', ParallaxContainer);