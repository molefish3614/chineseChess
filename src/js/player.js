import data from './commonData'
// 时间格式化
function handleTime (seconds) {
    let h = parseInt(seconds / 3600);
    let m = parseInt(seconds % 3600 / 60); // seconds % 3600得到不足1小时的秒数，除以60取整后就是分钟数
    let s = seconds % 3600 % 60; // seconds % 3600 % 60得到的就是不足1分钟的秒数，可以直接使用
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s
}
// player模块提供玩家交换功能
export default {
    changePlayer: function () {
        data.currentPlayer = data.currentPlayer === 'red' ? 'black' : 'red';
        if (data.currentPlayer === 'red') {
            clearInterval(data.blackTimer);
            document.querySelector('#red-act').style.opacity = '1';
            document.querySelector('#black-act').style.opacity = '0';
            data.redUsedSeconds++;
            document.querySelector('.used-time-red').innerText = handleTime(data.redUsedSeconds);
            data.redTimer = setInterval(() => {
                data.redUsedSeconds++;
                document.querySelector('.used-time-red').innerText = handleTime(data.redUsedSeconds);
            }, 1000)
        } else {
            clearInterval(data.redTimer);
            document.querySelector('#red-act').style.opacity = '0';
            document.querySelector('#black-act').style.opacity = '1';
            data.blackUsedSeconds++;
            document.querySelector('.used-time-black').innerText = handleTime(data.blackUsedSeconds);
            data.blackTimer = setInterval(() => {
                data.blackUsedSeconds++;
                document.querySelector('.used-time-black').innerText = handleTime(data.blackUsedSeconds);
            }, 1000)
        }
        console.log('玩家交换完毕');
        return
    },
    init: function () {
        // 初始化计时器
        window.addEventListener('DOMContentLoaded', function () {
            // 开局自动开启红方计时器并隐藏黑色行动板
            document.querySelector('#red-act').style.opacity = '1';
            document.querySelector('#black-act').style.opacity = '0';
            data.redTimer = setInterval(() => {
                data.redUsedSeconds++;
                document.querySelector('.used-time-red').innerText = handleTime(data.redUsedSeconds);
            }, 1000)
        })
    }
}