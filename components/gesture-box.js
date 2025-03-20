class GestureBox extends HTMLElement {
    static get observedAttributes() {
        return [
            'on-swipe-up', 'on-swipe-down', 'on-swipe-left', 'on-swipe-right',
            'on-swipe-up-left', 'on-swipe-up-right', 'on-swipe-down-left', 'on-swipe-down-right',
            'on-double-tap', 'on-long-press'
        ];
    }

    constructor() {
        super();
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.longPressTimer = null;
        this.initThresholds();
        this.attachEventListeners();
        // 创建内部容器
        const container = document.createElement('div');
        container.style.width = '100%';  // 继承父元素宽度
        container.style.height = '100%'; // 继承父元素高度
        this.appendChild(container);
    }

    initThresholds() {
        this.swipeThreshold = 50;    // 滑动识别阈值（像素）
        this.doubleTapDelay = 300;   // 双击时间阈值（毫秒）
        this.longPressDelay = 800;   // 长按时间阈值（毫秒）
    }

    attachEventListeners() {
        this.addEventListener('mouseup', this.handleTouchEnd);
        this.addEventListener('mousedown', this.handleTouchStart);
    }

    handleTouchStart (e){
        console.log("START")
        console.log(e)
        this.touchStartTime = Date.now();
        const touch = e;
        this.startX = touch.x;
        this.startY = touch.y;

        // 长按检测
        this.longPressTimer = setTimeout(() => {
            this.dispatchGestureEvent('long-press');
        }, this.longPressDelay);
    }

    handleTouchEnd = (e) => {
        console.log("END")
        console.log(e)
        clearTimeout(this.longPressTimer);
        const duration = Date.now() - this.touchStartTime;

        // 获取结束位置
        const touch = e;
        const deltaX = touch.x - this.startX;
        const deltaY = touch.y - this.startY;

        // 双击检测
        if (duration < this.doubleTapDelay) {
            const currentTime = Date.now();
            if (currentTime - this.lastTapTime < this.doubleTapDelay) {
                this.dispatchGestureEvent('double-tap');
                this.lastTapTime = 0;
                return;
            }
            this.lastTapTime = currentTime;
        }

        // 滑动检测
        if (Math.abs(deltaX) > this.swipeThreshold ||
            Math.abs(deltaY) > this.swipeThreshold) {
            this.detectSwipeDirection(deltaX, deltaY);
        }
    }

    handleTouchCancel = () => {
        clearTimeout(this.longPressTimer);
    }

    detectSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // 判断主要滑动方向
        if (absX > absY) {
            if (deltaX > 0) {
                this.dispatchGestureEvent('swipe-right');
            } else {
                this.dispatchGestureEvent('swipe-left');
            }
        } else {
            if (deltaY > 0) {
                this.dispatchGestureEvent('swipe-down');
            } else {
                this.dispatchGestureEvent('swipe-up');
            }
        }

        // 检测斜向滑动
        if (absX > this.swipeThreshold/2 && absY > this.swipeThreshold/2) {
            if (deltaX > 0) {
                deltaY > 0
                    ? this.dispatchGestureEvent('swipe-down-right')
                    : this.dispatchGestureEvent('swipe-up-right');
            } else {
                deltaY > 0
                    ? this.dispatchGestureEvent('swipe-down-left')
                    : this.dispatchGestureEvent('swipe-up-left');
            }
        }
    }

    dispatchGestureEvent(type) {
        const handlerName = this.getAttribute(`on-${type}`);
        if (handlerName && typeof window[handlerName] === 'function') {
            window[handlerName]({ type, element: this });
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // 验证函数是否存在
        if (newValue && !window[newValue]) {
            console.warn(`Handler function ${newValue} not found`);
        }
    }
}

// 注册自定义元素
customElements.define('gesture-box', GestureBox);
