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
