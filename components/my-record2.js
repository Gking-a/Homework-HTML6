export class MyRecord2 extends HTMLElement{
    constructor() {
        super();
        this.frametime=0
        this.mframes=[]
        this.starttime=0
        this.recording=true
        this.idnum=0
        this.speed=1;
        this.rpid=0
    }
    start(){
        this.recording=true
        this.starttime=Date.now()
        this.traversal(this)
        this.addEventListener("click",this.inputA)
        this.addEventListener("input",this.inputB)
    }
    inputA(event){
        console.log(event)
        this.mframes.push({
            bubbles:true,
            time:Date.now()-this.starttime,
            type:event.type,
            id:event.target.id
        })
    }
    inputB(event){
        console.log(event)
        this.mframes.push({
            bubbles:true,
            time:Date.now()-this.starttime,
            type:event.type,
            inputType:event.inputtype,
            data:event.data,
            id:event.target.id
        })
    }
    stop(){
        console.log(this.mframes)
    }
    callback(changes,obsever){
        console.log(changes)
    }
    clear(){
        this.mframes=[]
    }
    traversal(node){
        //对node的处理
        if(node && node.nodeType === 1){
            // this.mo.observe(node,this.options)
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
    generateJSON(){
        var j=JSON.stringify(this.mframes)
        return j
    }
    replay(jsonstr){
        this.traversal(this)
        var parse = JSON.parse(jsonstr);
        console.log(parse)
        this.mframes=[]
        parse.forEach((ele)=>{
            console.log(ele)
            this.mframes.push(ele)
        })
        this.starttime=Date.now()
        this.rpid=setInterval(this._render.bind(this),this.frametime)
    }
    _render(){
        console.log("AAAAAAAAAAAAA")
        console.log(this.mframes)
        for (let i = 0; i < this.mframes.length; i++) {
            if(this.mframes[i]===null)continue;
            if((this.mframes[i].time*this.speed+this.starttime)>=Date.now()){
                var eframe=this.mframes[i]
                this.mframes[i]=null
                var nevent=new CustomEvent(eframe.type,eframe)
                document.getElementById(eframe.id).dispatchEvent(nevent)
            }
            if(this.mframes[this.mframes.length-1]===null){
                this.starttime=0
                this.mframes=[]
                clearInterval(this.rpid)
            }
        }
    }
}
customElements.define('time-record', MyRecord2);