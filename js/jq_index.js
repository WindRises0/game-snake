var sw=20,sh=20,
    tr=25,td=25;
var speed=250;
var snake=null,
    game=null,
    food=null;
$(".select").on("click",function(){
    $(".list").toggle();
})
$(".list li").each(function(index,val){
    $(val).on("click",function(){
        $(".select").text($(val).text());
        $(".list").hide();
        if(index==0){
            speed=200;
        }else if(index==1){
            speed=100;
        }else if(index==2){
            speed=50;
        }
    })
})

function Square(x,y,classname){
    this.x=x*sw;
    this.y=y*sh;
    this.viewContent=$("<div class="+classname+">");
    this.parent=$("#snakeWarp")
}

Square.prototype.creat=function(){
    this.viewContent.css({
        "position":"absolute",
        "left":this.x,
        "top":this.y
    });
    this.parent.append(this.viewContent);
}
Square.prototype.remove=function(){
    this.viewContent.remove();
}

function Snake(){
    this.head=null;
    this.tail=null;
    this.pos=[];

    this.directionNum={
        left:{x:-1,y:0,rotate:-180+"deg"},
        right:{x:1,y:0,rotate:0},
        up:{x:0,y:-1,rotate:-90+"deg"},
        down:{x:0,y:1,rotate:90+"deg"}
    }
}
Snake.prototype.init=function(){
    var snakeHead=new Square(2,0,"snakeHead");
    snakeHead.creat();
    this.pos.push([2,0]);
    this.head=snakeHead;

    var snakeBody1=new Square(1,0,"snakeBody");
    snakeBody1.creat();
    this.pos.push([1,0]);

    var snakeBody2=new Square(0,0,"snakeBody");
    snakeBody2.creat();
    this.tail=snakeBody2;
    this.pos.push([0,0]);

    this.direction=this.directionNum.right;

    snakeHead.last=null;
    snakeHead.next=snakeBody1;

    snakeBody1.last=snakeHead;
    snakeBody1.next=snakeBody2;

    snakeBody2.last=snakeBody1;
    snakeBody2.next=null;
}

Snake.prototype.getNextPos=function(){
    var nextPos=[
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y
    ]
    if(nextPos[0]<0 || nextPos[0]>td-1 || nextPos[1]<0 || nextPos[1]>tr-1){
        this.things.die.call(this)
        return;
    }
    this.pos.forEach(function(val){
        if(val[0]==nextPos[0] && val[1]==nextPos[1]){
            this.things.die.call(this);
            return;
        }
    })
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        this.things.eat.call(this);
        return;
    }
    this.things.move.call(this);
}
Snake.prototype.things={
    move:function(format){
        var newBody=new Square(this.head.x/sw, this.head.y/sh,"snakeBody")
        newBody.next=this.head.next;
        newBody.next.last=newBody;
        newBody.last=null;
        newBody.creat();
        this.head.remove();

        var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,"snakeHead");
        newHead.viewContent.css("transform","rotate("+this.direction.rotate+")");
        newHead.creat();

        newHead.next=newBody;
        newHead.last=null;
        newBody.last=newHead;
        
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        this.head=newHead;
        if(!format){
            this.tail.remove();
            this.tail=this.tail.last;
            this.pos.pop();
        }
    },
    eat:function(){
        this.things.move.call(this,true);
        creatFood();
        game.sorce++;
    },
    die:function(){
        game.over();
    }
}
snake=new Snake();

function creatFood(){
    var x=null,y=null;
    var include=true;
    while(include){
        x=Math.round(Math.random()*(td-1));
        y=Math.round(Math.random()*(tr-1));
        snake.pos.forEach(function(val){
            if(val[0]!=x && val[1]!=y){
                include=false;
            }
        })
    }
    food=new Square(x,y,"food");
    food.pos=[x,y];
    var foodDom=$(".food")[0];
    if(foodDom){
        $(foodDom).css({"left":x*sw,"top":y*sh})
    }else{
        food.creat();
    }
}
function Game(){
    this.timer=null;
    this.sorce=0;
}
Game.prototype.run=function(){
    snake.init();
    creatFood();
    document.onkeydown=function(ev){
        if(ev.which==37 && snake.direction!=snake.direction.right){
            snake.direction=snake.directionNum.left;
        }else if(ev.which==38 && snake.direction!=snake.direction.down){
            snake.direction=snake.directionNum.up;
        }else if(ev.which==39 && snake.direction!=snake.direction.left){
            snake.direction=snake.directionNum.right;
        }else if(ev.which==40 && snake.direction!=snake.direction.up){
            snake.direction=snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start=function(){
    this.timer=setInterval(function(){
        snake.getNextPos();
    },speed)
}
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert("你的得分为："+this.sorce);
    $("#snakeWarp").empty();
    snake=new Snake();
    game=new Game();
    $(".startBtn").css("display","block");
    $(".select").text("选择难度 >");
    $(".list").hide();
    speed=250;
}
Game.prototype.pause=function(){
    clearInterval(this.timer);
}
game=new Game();
$(".startBtn button").on("click",function(){
    game.run();
    $(".startBtn").css("display","none");
})
$("#snakeWarp").on("click",function(){
    game.pause();
    $(".pauseBtn").css("display","block");
})
$(".pauseBtn button").on("click",function(){
    game.start();
    $(".pauseBtn").css("display","none");
})



