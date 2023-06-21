let XB_GAME_OBJECT = [];

class XbGameObject{
    constructor(){
        XB_GAME_OBJECT.push(this);
        this.has_called_start = false;//是否执行过Start函数
        this.timedelta = 0; //当前帧距离上一帧时间间隔
    }
    start(){//只会在第一帧执行一次

    }
    update(){//每一帧会执行一次

    }
    on_destroy(){//在被销毁前执行一次
        
    }

    destroy(){ //删掉该物体
        this.on_destroy();
        for(let i in XB_GAME_OBJECT){
            if(XB_GAME_OBJECT[i]===this){
                XB_GAME_OBJECT.splice(i,1);
                break;
            }
        }
    }
}
let last_timestamp;
let XB_GAME_ANIMATION = function(timestamp){
    for(let i in XB_GAME_OBJECT){
        let obj = XB_GAME_OBJECT[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(XB_GAME_ANIMATION);
}


requestAnimationFrame(XB_GAME_ANIMATION);
