// 导入样式
import './index.css'
// 导入模块
import select from './js/select'
import move from './js/move'
import player from './js/player'

// 初始化计时器
player.init();
// 点击触发操作
document.querySelector('.chessContent').addEventListener('click', select.clickChess);
// 点击移动判断并检查move是否正常完成（正常完成返回playerchange）
document.querySelector('.container').addEventListener('click', function (e) {
    let msg = undefined;
    if (select.clickBoard(e)) msg = move.move()
    if (msg === 'playerchange') player.changePlayer();
});