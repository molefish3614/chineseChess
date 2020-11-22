// 该JS主要执行棋子选择
// 棋子闪烁
function twinkle(target) {
    target.style.opacity = '0';
    // 记录闪烁定时器以便关闭用
    clickChessTimer = setInterval(() => {
        if (target.style.opacity === '1') {
            target.style.opacity = '0'
        } else {
            target.style.opacity = '1'
        }
    }, 500)
}

function clickChess(e) {
    // 棋子与玩家匹配性验证
    // 点击棋子的归属必须要和当前玩家一致才能触发闪烁效果
    let clickChessBelong = e.target.className.substr(6);
    if (clickChessBelong !== currentPlayer) return;
    step = 1;
    // 记录移动前棋子的坐标
    beforeMoveX = e.pageX;
    beforeMoveY = e.pageY;
    // 如果在没有闪烁棋子情况下点击棋子，则需要初始化点击的棋子
    if (twinklingChess === null) {
        twinklingChess = e.target;
        twinklingName = e.target.id;
        twinkle(e.target);
        return
    }
    twinklingChess.style.opacity = '1'; // 强制显示上一枚闪烁中的棋子
    // 如果当前有棋子在闪烁而点击了棋子本身
    if (twinklingName === e.target.id) { // 点击本身则step = 0并关掉闪烁
        twinklingChess = null;
        step = 0;
        clearInterval(clickChessTimer);
        return
    }
    // 如果是另外一枚棋子
    if (twinklingChess !== e.target) {
        clearInterval(clickChessTimer); // 关掉旧闪烁器
        twinklingChess = e.target; // 更新当前闪烁棋子
        twinklingName = e.target.id;
        twinkle(e.target); // 给当前棋子开启闪烁定时器  
    } else {
        twinklingChess = null; // 清空闪烁棋子DOM记录
    }
}
// 点击空白处则要判断棋子是否是棋子移动
function clickBoard(e) {
    console.log("触发了棋盘点击事件,此时step为" + step);
    clickX = e.pageX;
    clickY = e.pageY;
    if ((Math.abs(clickX - beforeMoveX) > 40 || Math.abs(clickY - beforeMoveY) > 40) && step === 1) { // 根据点击距离差以及必须要有闪烁棋子判断是否触发移动动作
        move();
    }
}

let beforeMoveX = 0; // 棋子移动前的像素坐标
let beforeMoveY = 0;
let clickX = 0; // 鼠标点击位置的像素坐标
let clickY = 0;
let step = 0; // step用于记录场上是否有正在闪烁（被选中的棋子），0表示没有，1表示有
let twinklingChess = null; // 当前正在闪烁(被玩家选中)的棋子DOM缓存
let twinklingName = ''; // 选中棋子的Id
let clickChessTimer = null; // 闪烁棋子的定时器
// 点击触发操作
document.querySelector('.chessContent').addEventListener('click', clickChess);
document.querySelector('.container').addEventListener('click', clickBoard);