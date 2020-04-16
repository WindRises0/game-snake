var sw = 20, sh = 20,//方块的宽高
    tr = 25, td = 25;//行列数
var speed = 250;
var snake = null;//蛇的实例对象
var food = null;//食物实例对象
var game = null;//游戏实例对象

var select=document.querySelector(".select"),
    list=document.querySelector(".list"),
    li_list=document.querySelectorAll(".list li");
    var is_click=false;
        select.addEventListener("click",function(){
            if(!is_click){
                is_click=true;
                list.style.display="block";
            }else{
                is_click=false;
                list.style.display="none";
            }
        })
        li_list.forEach(function(val,obj){
            val.addEventListener("click",function(){
                select.innerHTML=val.innerHTML;
                is_click=false;
                list.style.display="none";
                if(obj==0){
                    speed=200;
                }else if(obj==1){
                    speed=100;
                }else if(obj==2){
                    speed=50;
                }
            })
        })


function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement("div");

    this.viewContent.classList.add( this.class);//this.viewContent.className=this.class
    this.parent = document.getElementById("snakeWarp");
}
Square.prototype.creat = function () {//创建方块DOM
    this.viewContent.style.position = "absolute";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";

    this.parent.appendChild(this.viewContent);
}
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}
function Snake() {
    this.head = null;//存蛇头信息
    this.tail = null;//蛇尾信息
    this.pos = [];//每一个方块的位置

    this.directionNum = { //蛇走的方向，用对象表示
        left: { x: -1, y: 0, rotate: 180 + "deg" },
        right: { x: 1, y: 0, rotate: 0 },
        up: { x: 0, y: -1, rotate: -90 + "deg" },
        down: { x: 0, y: 1, rotate: 90 + "deg" }
    };
}
Snake.prototype.init = function () {//初始化函数
    //创建蛇头
    var snakeHead = new Square(2, 0, "snakeHead");
    snakeHead.creat();
    this.head = snakeHead; //存储蛇头信息
    this.pos.push([2, 0]);//把蛇头位置存起来

    //创建蛇身体1
    var snakeBody1 = new Square(1, 0, "snakeBody");
    snakeBody1.creat();
    this.pos.push([1, 0]);//把蛇身体1存起来
    //创建蛇身体2
    var snakeBody2 = new Square(0, 0, "snakeBody");
    snakeBody2.creat();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);//把蛇身体2存起来

    // 形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇加一条属性,表示蛇的方向
    this.direction = this.directionNum.right;//默认右走
}
//获取蛇头下一个位置对应元素，做不同事情
Snake.prototype.getNextPos = function () {
    var nextPos = [ //蛇头要走的下一个坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    //下一个点是自己，代表撞到了自己，over
    var selfCollied = false;
    this.pos.forEach(function (val) {
        if (val[0] == nextPos[0] && val[1] == nextPos[1]) {
            selfCollied = true;
        }
    })
    if (selfCollied) {
        this.strategies.die.call(this);
        return;
    }
    //下个点是墙，over
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        this.strategies.die.call(this);
        return;//代码停止执行
    }
    //下个点是食物，吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        this.strategies.eat.call(this)
        return;
    }
    //下个点没有，走
    this.strategies.move.call(this);
}

//处理碰撞后要做的事情
Snake.prototype.strategies = {
    move: function (format) {//参数决定是否删除最后一个方块（蛇尾）
        //传入参数表示吃食物
        //创建新的身体
        var newBody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");
        //更新链表关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        newBody.creat();
        this.head.remove();//把旧蛇头从原来的位置删除

        //创建一个新蛇头（下一个要走的点）
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, "snakeHead")
        newHead.viewContent.style.transform = "rotate(" + this.direction.rotate + ")";
        newHead.creat();

        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;

        //蛇身上每一个方块的坐标更新
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
        this.head = newHead;

        if (!format) {
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
    eat: function () {
        this.strategies.move.call(this, true);
        creatFood();
        game.score++;
    },
    die: function () {
        game.over();
    }
}

snake = new Snake();

function creatFood() {
    var x = null, y = null;//食物随机坐标
    var include = true;//循环跳出条件，true表示食物在蛇身上，需要继续循环
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(function (val) {
            if (val[0] != x && val[1] != y) {
                include = false;
            }
        })
    }
    //生成食物
    food = new Square(x, y, "food");
    food.pos = [x, y];//食物坐标，与蛇头下一个坐标对比，是否碰到
    var foodDom = document.querySelector(".food");
    if (foodDom) {
        foodDom.style.left = x * sw + "px";
        foodDom.style.top = y * sw + "px";
    } else {
        food.creat();
    }
}

//创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.run = function () {
    snake.init();
    creatFood();
    //键盘事件
    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();

}
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, speed)
}
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert("你的得分为：" + this.score);

    var snakeWarp = document.getElementById("snakeWarp");
    snakeWarp.innerHTML = "";
    snake = new Snake();
    game = new Game();
    var startBtn = document.querySelector(".startBtn");
    startBtn.style.display = "block";
    select.innerHTML="选择难度 >";
    speed=250;
}
Game.prototype.pause = function () {
    clearInterval(this.timer);
}
//开启游戏
game = new Game();
var begin = document.querySelector(".startBtn button");
begin.addEventListener("click", function () {
    begin.parentNode.style.display = "none";
    game.run();
});
//暂停游戏
var snakeWarp = document.getElementById("snakeWarp");
var pauseBtn = document.querySelector(".pauseBtn button")
snakeWarp.onclick = function () {
    game.pause();
    pauseBtn.parentNode.style.display = "block";
}
pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = "none";
}


