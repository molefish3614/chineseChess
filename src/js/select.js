import data from './commonData'
// 该模块提供执行棋子选择相关功能
// 棋子闪烁
function twinkle(target) {
    target.style.opacity = '0';
    // 记录闪烁定时器以便关闭用
    data.clickChessTimer = setInterval(() => {
        if (target.style.opacity === '1') {
            target.style.opacity = '0'
        } else {
            target.style.opacity = '1'
        }
    }, 500)
}
export default {
    clickChess: function (e) {
        // 棋子与玩家匹配性验证
        let clickChessBelong = e.target.className.substr(6);
        if (clickChessBelong !== data.currentPlayer) return;
        data.step = true;
        // 记录移动前棋子的坐标
        data.beforeMoveX = e.pageX;
        data.beforeMoveY = e.pageY;
        // 如果在没有闪烁棋子情况下点击棋子，则需要初始化点击的棋子
        if (data.twinklingChess == null) {
            data.twinklingChess = e.target;
            data.twinklingName = e.target.id;
            twinkle(e.target);
            return
        }
        data.twinklingChess.style.opacity = '1'; // 强制显示上一枚闪烁中的棋子
        // 如果当前有棋子在闪烁而点击了棋子本身
        if (data.twinklingName === e.target.id) { // 点击本身表示清除棋子选中
            data.twinklingChess = null;
            data.step = false;
            clearInterval(data.clickChessTimer);
            return
        }
        // 如果是另外一枚棋子
        if (data.twinklingChess !== e.target) {
            clearInterval(data.clickChessTimer); // 关掉旧闪烁器
            data.twinklingChess = e.target; // 更新当前闪烁棋子
            data.twinklingName = e.target.id;
            twinkle(e.target); // 给当前棋子开启闪烁定时器  
        } else {
            data.twinklingChess = null; // 清空闪烁棋子DOM记录
        }
    },
    clickBoard: function (e) {
        console.log("触发了棋盘点击事件,此时step为" + data.step);
        data.clickX = e.pageX;
        data.clickY = e.pageY;
        // 根据点击距离差以及必须要有闪烁棋子判断是否触发移动动作
        if ((Math.abs(data.clickX - data.beforeMoveX) > 40 || Math.abs(data.clickY - data.beforeMoveY) > 40) && data.step === true) {
            return true
        } else return false
    }
}