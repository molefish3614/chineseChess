// 该JS主要处理玩家交换及计时功能
// 时间格式化
function handleTime(seconds) {
    let h = parseInt(seconds / 3600);
    let m = parseInt(seconds % 3600 / 60); // seconds % 3600得到不足1小时的秒数，除以60取整后就是分钟数
    let s = seconds % 3600 % 60; // seconds % 3600 % 60得到的就是不足1分钟的秒数，可以直接使用
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s
}
// 玩家交换
function changePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
    if (currentPlayer === 'red') {
        clearInterval(blackTimer);
        document.querySelector('#red-act').style.opacity = '1';
        document.querySelector('#black-act').style.opacity = '0';
        redUsedSeconds++;
        document.querySelector('.used-time-red').innerText = handleTime(redUsedSeconds);
        redTimer = setInterval(() => {
            redUsedSeconds++;
            document.querySelector('.used-time-red').innerText = handleTime(redUsedSeconds);
        }, 1000)
    } else {
        clearInterval(redTimer);
        document.querySelector('#red-act').style.opacity = '0';
        document.querySelector('#black-act').style.opacity = '1';
        blackUsedSeconds++;
        document.querySelector('.used-time-black').innerText = handleTime(blackUsedSeconds);
        blackTimer = setInterval(() => {
            blackUsedSeconds++;
            document.querySelector('.used-time-black').innerText = handleTime(blackUsedSeconds);
        }, 1000)
    }
    return
}
let currentPlayer = 'red'; // 当前行动的玩家
let redUsedSeconds = 0;
let blackUsedSeconds = 0;
let redTimer = null;
let blackTimer = null;
window.onload = () => {
    // 开局自动开启红方计时器并隐藏黑色行动板
    document.querySelector('#red-act').style.opacity = '1';
    document.querySelector('#black-act').style.opacity = '0';
    redTimer = setInterval(() => {
        redUsedSeconds++;
        document.querySelector('.used-time-red').innerText = handleTime(redUsedSeconds);
    }, 1000)
}