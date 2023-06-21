class XbGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="xb-game-menu">
    <div class="xb-game-menu-field">
        <div class="xb-game-menu-field-item xb-game-menu-field-item-single">
            单人模式
        </div>
        <br>
        <div class="xb-game-menu-field-item xb-game-menu-field-item-multi">
            多人模式
        </div>
        <br>
        <div class="xb-game-menu-field-item xb-game-menu-field-item-settings">
            设置
        </div>
        <br>
    </div>
</div>
`);
    this.root.$xb_game.append(this.$menu);
    this.$single = this.$menu.find('.xb-game-menu-field-item-single');
    this.$multi = this.$menu.find('.xb-game-menu-field-item-multi');
    this.$settings = this.$menu.find('.xb-game-menu-field-item-settings');
    this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function(){
            console.log("click multi mode");
        })
        this.$settings.click(function(){
            console.log("click setting mode");
        })
    }

    show(){//显示menu界面
      this.$menu.show();  

    }
    hide(){//关闭menu界面
      this.$menu.hide();
    }
}
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
class GameMap extends XbGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }

    start(){

    }
    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
    
    update(){
        this.render();
    }
}
class Particle extends XbGameObject{
    constructor(playground,x,y,radius,vx,vy,color,speed,move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.eps = 3;
        this.move_length = move_length;
    }

    start(){
    
    }

    update(){
        if((this.move_length < this.eps) || (this.speed < this.eps)) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends XbGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playerground = playground;
        this.ctx = this.playerground.game_map.ctx;
        this.x = x;
        this.vx = 0;
        this.vy = 0;
        this.damagex = 0;
        this.damagey = 0;
        this.damage_speed = 0;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.move_length = 0;
        this.spent_time = 0;
        this.cur_skill = null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playerground.width;
            let ty = Math.random() * this.playerground.height;
            this.move_to(tx,ty);

        }

    }

    add_listening_events(){
        let outer = this;
        this.playerground.game_map.$canvas.on("contextmenu",function(){return false;});
        this.playerground.game_map.$canvas.mousedown(function(e){
            if(e.which === 3){
                outer.move_to(e.clientX,e.clientY);
            }
            else if(e.which === 1){
                if(outer.curr_skill === "fireball"){
                    outer.shoot_fireball(e.clientX,e.clientY);
                }
                outer.curr_skill = null;
            }
        });

        $(window).keydown(function(e){
            if(e.which === 81){
                outer.curr_skill = "fireball";
                return false;
            }
        })
    }

    shoot_fireball(tx,ty){
        let x = this.x, y = this.y;
        let radius = this.playerground.height * 0.01;
        let angle = Math.atan2(ty - y,tx - x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playerground.height * 0.5;
        let move_length = this.playerground.height * 1.5;
        new FireBall(this.playerground,this,x,y,radius,vx,vy,color,speed,move_length,this.playerground.height*0.01);

    }
    get_dist(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx*dx+dy*dy);
    }


    move_to(tx,ty){
        this.move_length = this.get_dist(this.x,this.y,tx,ty);
        let angle = Math.atan2(ty-this.y, tx-this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    is_attacked(angle,damage){

        for(let i = 0; i < 10 + Math.random() * 5; i++ ){
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playerground,x,y,radius,vx,vy,color,speed,move_length);
        }
        this.radius -= damage;
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damagex = Math.cos(angle);
        this.damagey = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;

    }
    update(){
        this.spent_time += this.timedelta/1000;
        if(!this.is_me && this.spent_time > 4 && Math.random()<1/300.0){
            let player = this.playerground.players[Math.floor(Math.random()*this.playerground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta/1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta/1000 * 0.3;
            this.shoot_fireball(tx,ty);
        }
        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damagex * this.damage_speed * this.timedelta/1000;
            this.y += this.damagey * this.damage_speed * this.timedelta/1000;
            this.damage_speed *= this.friction;
        }
        else{
            if(this.move_length < this.eps)
            {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random()* this.playerground.width;
                    let ty = Math.random() * this.playerground.height;
                    this.move_to(tx,ty);
                }
            }else{
                let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000) ;
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        for(let i = 0; i < this.playerground.players.length; i++)
        {
            if(this.playerground.players[i] === this){
                this.playerground.players.splice(i,1);
            }
        }
    }
}
class FireBall extends XbGameObject{
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
    super();
    this.playerground = playground;
    this.player = player;
    this.ctx = this.playerground.game_map.ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.move_length = move_length;
    this.eps = 0.1;
    this.damage = damage;
 }

    start(){
    
    }

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i = 0; i < this.playerground.players.length; i++)
        {
            let player = this.playerground.players[i];
            if(this.player != player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
    }
	get_dist(x1,y1,x2,y2){
            let dx = x1 - x2;
            let dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        }
	is_collision(player){
            let distance = this.get_dist(this.x,this.y,player.x,player.y);
            if(distance < this.radius + player.radius)
                return true;
            return false;
        }
	attack(player){
            let angle = Math.atan2(player.y - this.y, player.x - this.x);
            player.is_attacked(angle,this.damage);
            this.destroy();
        }
	render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class XbGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="xb-game-playground"></div>`);
        //this.hide();
        this.root.$xb_game.append(this.$playground);
        this.start();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this,this.width / 2, this.height / 2,this.height*0.05,"white",this.height * 0.15,true));
    
        for(let i = 0; i < 5; ++i){
            this.players.push(new Player(this,this.width/2,this.height/2, this.height * 0.05, this.get_random_color(),this.height * 0.15, false));
        }

    }
    get_random_color(){
        let colors = ["blue","red","pink","grey","green"];
        return colors[Math.floor(Math.random()*5)];

    }
    start(){
        
    }

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
export class xbGame{
    constructor(id){
        this.id = id;
        this.$xb_game = $('#'+id);
        this.menu = new XbGameMenu(this);
        this.playground = new XbGamePlayground(this);
    }
}
