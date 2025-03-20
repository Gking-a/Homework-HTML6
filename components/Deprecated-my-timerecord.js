export class MyTimerecord2 extends HTMLElement{
    static get observedAttributes() { return ['frametime','fps','started']; }
    constructor() {
        super();
        this.frametime=0
        this.frames=[]
        this.timeID=null
        this.idnum=0
        document.addEventListener('click',this.onclicka)
    }
    attributeChangedCallback(name, oldVal, newVal){
        if(name==='frametime'){
            this.frametime=Number(newVal)
        }
        if(name==='fps'){
            this.frametime=1000/newVal;
        }
    }
    startRecord(){
        this.traversal(this)
        this.timeID=setInterval(()=>{
            this.frames.push(this.innerHTML)},this.frametime)
    }
    stopRecord(){
        clearInterval(this.timeID)
        console.log(this.frames)
    }
    generateJSON(){
        var j=JSON.stringify(this.frames)
        return j
    }

    traversal(node){
        //对node的处理
        if(node && node.nodeType === 1){
            if(node.id===''||node.id===undefined){
                node.id='timerecorderchild'+this.idnum
                this.idnum++
            }
        }
        var i = 0, childNodes = node.childNodes,item;
        for(; i < childNodes.length ; i++){
            item = childNodes[i];
            if(item.nodeType === 1){
                //递归先序遍历子节点
                this.traversal(item);
            }
        }
    }
    onclicka(event){
        console.log(event)
    }
}
customElements.define('time-record', MyTimerecord);