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
            console.log("click single mode");
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
