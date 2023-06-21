export class xbGame{
    constructor(id){
        this.id = id;
        this.$xb_game = $('#'+id);
        this.menu = new XbGameMenu(this);
        this.playground = new XbGamePlayground(this);
    }
}
