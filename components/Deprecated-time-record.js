export class DeprecatedTimeRecord {
    #observer;
    #inputs = new WeakMap();
    #history = [];
    #currentIndex = -1;

    connectedCallback() {
        // 初始化全量快照
        this.#captureSnapshot();

        // 监听 DOM 变化
        this.#observer = new MutationObserver(records => {
            this.#recordMutations(records);
        });
        this.#observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        // 劫持表单输入
        this.#hijackInputs();
    }

    // 捕获完整快照
    async #captureSnapshot() {
        const state = {
            timestamp: Date.now(),
            snapshot: document.documentElement.outerHTML,
            mutations: [],
            inputs: [],
            scroll: { x: window.scrollX, y: window.scrollY }
        };
        await this.#saveState(state);
    }

    // 记录增量变化
    #recordMutations(records) {
        const state = {
            timestamp: Date.now(),
            mutations: records,
            inputs: [],
            scroll: null
        };
        this.#saveState(state);
    }

    // 劫持表单元素输入
    #hijackInputs() {
        const hijack = (element) => {
            if (this.#inputs.has(element)) return;

            const record = {
                selector: this.#getSelector(element),
                property: element instanceof HTMLInputElement ?
                    (element.type === 'checkbox' ? 'checked' : 'value') : 'value'
            };

            const handler = () => {
                const value = element[record.property];
                this.#recordInput(record.selector, record.property, value);
            };

            element.addEventListener('input', handler);
            this.#inputs.set(element, handler);
        };

        // 劫持现有元素
        document.querySelectorAll('input, textarea, select').forEach(hijack);

        // 劫持新增元素
        new MutationObserver((records) => {
            records.forEach(({ addedNodes }) => {
                addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('input, textarea, select')) {
                            hijack(node);
                        }
                        node.querySelectorAll('input, textarea, select').forEach(hijack);
                    }
                });
            });
        }).observe(document.body, { subtree: true, childList: true });
    }

    // 保存到 IndexedDB
    async #saveState(state) {
        const db = await idb.openDB('time-machine', 1);
        await db.put('states', state, state.timestamp);
        this.#history = await db.getAll('states');
        this.#currentIndex = this.#history.length - 1;
    }

    // 恢复状态
    async #restoreState(index) {
        const state = this.#history[index];

        // 恢复全量快照
        if (state.snapshot) {
            document.documentElement.innerHTML = state.snapshot;
            window.scrollTo(state.scroll.x, state.scroll.y);
        }

        // 重放增量变化
        state.mutations.forEach(record => {
            // 重构 MutationRecord 应用逻辑
            this.#applyMutation(record);
        });

        // 恢复输入状态
        state.inputs.forEach(({ selector, property, value }) => {
            const el = document.querySelector(selector);
            if (el) el[property] = value;
        });
    }
}
customElements.define('time-record', DeprecatedTimeRecord);