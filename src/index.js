window.onload = () => {
    // 开局自动开启红方计时器并隐藏黑色行动板
    document.querySelector('#red-act').style.opacity = '1';
    document.querySelector('#black-act').style.opacity = '0';
    redTimer = setInterval(() => {
        redUsedSeconds++;
        document.querySelector('.used-time-red').innerText = handleTime(redUsedSeconds);
    }, 1000)
}
// 创建一个坐标key和DOM id的Map对象
var domIdMap = new Map();
domIdMap.set('redCheA', '#red-che-A');
domIdMap.set('redCheB', '#red-che-B');
domIdMap.set('redMaA', '#red-ma-A');
domIdMap.set('redMaB', '#red-ma-B');
domIdMap.set('redXiangA', '#red-xiang-A');
domIdMap.set('redXiangB', '#red-xiang-B');
domIdMap.set('redShiA', '#red-shi-A');
domIdMap.set('redShiB', '#red-shi-B');
domIdMap.set('redPaoA', '#red-pao-A');
domIdMap.set('redPaoB', '#red-pao-B');
domIdMap.set('redBingA', '#red-bing-A');
domIdMap.set('redBingB', '#red-bing-B');
domIdMap.set('redBingC', '#red-bing-C');
domIdMap.set('redBingD', '#red-bing-D');
domIdMap.set('redBingE', '#red-bing-E');
domIdMap.set('redShuai', '#red-shuai');
domIdMap.set('blackCheA', '#black-che-A');
domIdMap.set('blackCheB', '#black-che-B');
domIdMap.set('blackMaA', '#black-ma-A');
domIdMap.set('blackMaB', '#black-ma-B');
domIdMap.set('blackXiangA', '#black-xiang-A');
domIdMap.set('blackXiangB', '#black-xiang-B');
domIdMap.set('blackShiA', '#black-shi-A');
domIdMap.set('blackShiB', '#black-shi-B');
domIdMap.set('blackPaoA', '#black-pao-A');
domIdMap.set('blackPaoB', '#black-pao-B');
domIdMap.set('blackBingA', '#black-bing-A');
domIdMap.set('blackBingB', '#black-bing-B');
domIdMap.set('blackBingC', '#black-bing-C');
domIdMap.set('blackBingD', '#black-bing-D');
domIdMap.set('blackBingE', '#black-bing-E');
domIdMap.set('blackShuai', '#black-shuai');

function handleTime(seconds) {
    let h = parseInt(seconds / 3600);
    let m = parseInt(seconds % 3600 / 60); // seconds % 3600得到不足1小时的秒数，除以60取整后就是分钟数
    let s = seconds % 3600 % 60; // seconds % 3600 % 60得到的就是不足1分钟的秒数，可以直接使用
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s
}

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

function stoptwinkle() {
    clearInterval(clickChessTimer);
}

function clickBoard(e) {
    console.log("触发了棋盘点击事件,此时step为" + step);
    clickX = e.pageX;
    clickY = e.pageY;
    if ((Math.abs(clickX - beforeMoveX) > 40 || Math.abs(clickY - beforeMoveY) > 40) && step === 1) { // 根据点击距离差以及必须要有闪烁棋子判断是否触发移动动作
        move();
    }
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
        stoptwinkle();
        return
    }
    // 如果是另外一枚棋子
    if (twinklingChess !== e.target) {
        stoptwinkle(); // 关掉旧闪烁器
        twinklingChess = e.target; // 更新当前闪烁棋子
        twinklingName = e.target.id;
        twinkle(e.target); // 给当前棋子开启闪烁定时器  
    } else {
        twinklingChess = null; // 清空闪烁棋子DOM记录
    }
}

// 棋盘像素坐标字符串转换为数字型X，Y格子坐标
function boardToPosition(num) {
    let reverseNum = num.split('').reverse();
    reverseNum.splice(0, 2);
    return (parseInt(reverseNum.reverse().join('')) + 25) / 60
}

function paoIsToEnemy(landX, landY) { // 这个函数主要判断在间隔了一个子的情况下，炮的落点是否为敌方棋子，是就返回true表示可以移动，其他情况返回false
    console.log('炮计划落点坐标是:' + landX + ',' + landY);
    if (currentPlayer === 'red') {
        try {
            Object.values(currentPosition).forEach((item, index) => {
                if (item[0] === landX && item[1] === landY) { // 检查落子点是否有其他棋子，如果有则获取到它的index
                    const key = Object.keys(currentPosition)[index]; // 利用value的index获取到对应的key
                    if (key.substr(0, 5) === 'black') {
                        throw new Error(true);
                    } else {
                        throw new Error(false);
                    }
                }
            })
        } catch (error) {
            if (error.message === 'false') {
                return false
            } else {
                return true
            }
        }
        // 遍历结束，则表示落点为空无棋子 返回false
        return false
    } else {
        try {
            Object.values(currentPosition).forEach((item, index) => {
                if (item[0] === landX && item[1] === landY) { // 检查落子点是否有其他棋子，如果有则获取到它的index
                    const key = Object.keys(currentPosition)[index]; // 利用value的index获取到对应的key
                    if (key.substr(0, 3) === 'red') {
                        throw new Error(true);
                    } else {
                        throw new Error(false);
                    }
                }
            })
        } catch (error) {
            if (error.message === 'false') {
                return false
            } else {
                return true
            }
        }
        // 遍历结束，则表示落点为空无棋子 返回false
        return false
    }
}
// 吃子判定逻辑： 每次移动棋子之前先备份棋子坐标对象，取移动后的棋子坐标与备份对象进行对比，如有重合（棋子坐标唯一，只有在移动后才会发生重叠，且只会叠在一枚————被吃子的身上），则表示发生了吃子行为
// 需要找到被吃子的index，并从坐标对象中删除该键值对，同时移除（不是隐藏）被吃棋子的DOM
function eat(backup) { // 吃子行为位于棋子移动后、清空选中棋子之前
    let x = boardToPosition(twinklingChess.style.left);
    let y = boardToPosition(twinklingChess.style.top);
    let id = '';
    let key = '';
    try {
        Object.values(backup).forEach((item, index) => {
            if (item[0] === x && item[1] === y) {
                console.log('找到了被吃的棋子，它的index是：' + index);
                // 获取被吃子的键名
                key = Object.keys(backup)[index];
                // 将被吃子的键值改成undefined
                Object.defineProperty(currentPosition, key, {
                    value: [undefined, undefined]
                });
                // 通过键名在Map对象中查到对应的DOM id并且移除该DOM 通过throw跳出遍历
                id = domIdMap.get(key);
                document.querySelector(id).style.display = 'none';
                throw new Error('');
            }
        })
    } catch (error) {}
    // 如果被吃子的键名是redShuai或者blackShuai，则可以判定胜负结束游戏(关闭闪烁及双方定时器、移除鼠标点击事件)
    if (key === 'redShuai') {
        clearInterval(blackTimer);
        twinklingChess.style.opacity = '1';
        stoptwinkle();
        document.querySelector('.chessContent').removeEventListener('click', clickChess);
        document.querySelector('.container').removeEventListener('click', clickBoard);
        document.querySelector('#red-act').style.display = 'none';
        document.querySelector('#black-act').style.display = 'none';
        alert('黑方胜利，游戏结束');
        return true
    }
    if (key === 'blackShuai') {
        clearInterval(redTimer);
        twinklingChess.style.opacity = '1';
        stoptwinkle();
        document.querySelector('.chessContent').removeEventListener('click', clickChess);
        document.querySelector('.container').removeEventListener('click', clickBoard);
        document.querySelector('#red-act').style.display = 'none';
        document.querySelector('#black-act').style.display = 'none';
        alert('红方胜利，游戏结束')
        return true
    }
    // eat函数返回的布尔值代表是否发生了老将被吃情况,以决定是否结束游戏
    return false
}

function move() {
    const backupPosition = JSON.parse(JSON.stringify(currentPosition)); // 每次移动前深拷贝坐标对象
    let target = twinklingChess.innerText;
    console.log('点击棋子ID是' + twinklingChess.id);
    switch (target) {
        case '車':
            if (Math.abs(clickY - beforeMoveY) > 40 && Math.abs(clickX - beforeMoveX) > 40) {
                console.log('车移动规则错误，不予移动');
                return false
            }
            // 关于车移动的拦截方案： 在刷新DOM前，遍历所有棋子坐标，如果发现计算落点与棋子原坐标之间存在任何一个棋子则拦截本次移动操作
            if (twinklingChess.id === 'red-che-A') {
                const tempPositionSave = [...currentPosition.redCheA]; // 由于对象内的数组坐标是1层简单数据，所以这里可以用浅拷贝临时存储
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.redCheA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheA[1] = currentPosition.redCheA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    } else { // 下移
                        let tmpY = currentPosition.redCheA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheA[1] = currentPosition.redCheA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.redCheA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheA[0] = currentPosition.redCheA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    } else { //  右移
                        let tmpX = currentPosition.redCheA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        currentPosition.redCheA[0] = currentPosition.redCheA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    }
                }
                // 选中的车新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.redCheA[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                twinklingChess.style.top = currentPosition.redCheA[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
            }
            if (twinklingChess.id === 'red-che-B') {
                const tempPositionSave = [...currentPosition.redCheB];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.redCheB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheB[1] = currentPosition.redCheB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    } else { // 下移
                        let tmpY = currentPosition.redCheB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheB[1] = currentPosition.redCheB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.redCheB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.redCheB[0] = currentPosition.redCheB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    } else { //  右移
                        let tmpX = currentPosition.redCheB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        currentPosition.redCheB[0] = currentPosition.redCheB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    }
                }
                // 选中的车新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.redCheB[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                twinklingChess.style.top = currentPosition.redCheB[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
            }
            if (twinklingChess.id === 'black-che-A') {
                const tempPositionSave = [...currentPosition.blackCheA];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.blackCheA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheA[1] = currentPosition.blackCheA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    } else { // 下移
                        let tmpY = currentPosition.blackCheA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheA[1] = currentPosition.blackCheA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.blackCheA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheA[0] = currentPosition.blackCheA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    } else { //  右移
                        let tmpX = currentPosition.blackCheA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        currentPosition.blackCheA[0] = currentPosition.blackCheA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    }
                }
                // 选中的车新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.blackCheA[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                twinklingChess.style.top = currentPosition.blackCheA[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
            }
            if (twinklingChess.id === 'black-che-B') {
                const tempPositionSave = [...currentPosition.blackCheB];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.blackCheB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheB[1] = currentPosition.blackCheB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    } else { // 下移
                        let tmpY = currentPosition.blackCheB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheB[1] = currentPosition.blackCheB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.blackCheB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        // 遍历结束未发现中间有棋子则执行计算新坐标操作
                        currentPosition.blackCheB[0] = currentPosition.blackCheB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    } else { //  右移
                        let tmpX = currentPosition.blackCheB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        try {
                            Object.values(currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                }
                            })
                        } catch (e) {
                            console.log(e.message);
                            return false
                        }
                        currentPosition.blackCheB[0] = currentPosition.blackCheB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                    }
                }
                // 选中的车新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.blackCheB[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                twinklingChess.style.top = currentPosition.blackCheB[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
            }
            break;
        case '傌':
        case '馬':
            // 马走日的距离判断规则:马水平移动一格 垂直走2格或者水平移动2格垂直移动1格
            // 马的移动拦截方案：在刷新DOM前，遍历所有棋子坐标，如果发现移动方向上有棋子产生“撇脚”效果，则拦截移动操作
            if ((Math.abs(clickX - beforeMoveX) < 80 && Math.abs(clickY - beforeMoveY) < 140 && Math.abs(clickY - beforeMoveY) > 100) || (Math.abs(clickY - beforeMoveY) < 80 && Math.abs(clickX - beforeMoveX) < 140 && Math.abs(clickX - beforeMoveX) > 100)) {
                if (clickX - beforeMoveX < 0) { // 水平左移
                    if (clickY - beforeMoveY < 0) { // 上移+左移——左上日
                        if (twinklingChess.id === 'red-ma-A') {
                            const tempPosition = [...currentPosition.redMaA];
                            let tmpX = currentPosition.redMaA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaA[0] = tmpX;
                            currentPosition.redMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'red-ma-B') {
                            const tempPosition = [...currentPosition.redMaB];
                            let tmpX = currentPosition.redMaB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaB[0] = tmpX;
                            currentPosition.redMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-A') {
                            const tempPosition = [...currentPosition.blackMaA];
                            let tmpX = currentPosition.blackMaA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaA[0] = tmpX;
                            currentPosition.blackMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-B') {
                            const tempPosition = [...currentPosition.blackMaB];
                            let tmpX = currentPosition.blackMaB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaB[0] = tmpX;
                            currentPosition.blackMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }

                    } else { // 下移+左移——左下日
                        if (twinklingChess.id === 'red-ma-A') {
                            const tempPosition = [...currentPosition.redMaA];
                            let tmpX = currentPosition.redMaA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaA[0] = tmpX;
                            currentPosition.redMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'red-ma-B') {
                            const tempPosition = [...currentPosition.redMaB];
                            let tmpX = currentPosition.redMaB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaB[0] = tmpX;
                            currentPosition.redMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-A') {
                            const tempPosition = [...currentPosition.blackMaA];
                            let tmpX = currentPosition.blackMaA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaA[0] = tmpX;
                            currentPosition.blackMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-B') {
                            const tempPosition = [...currentPosition.blackMaB];
                            let tmpX = currentPosition.blackMaB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === 2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] - 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马左侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaB[0] = tmpX;
                            currentPosition.blackMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                    }
                } else { // 水平右移动
                    if (clickY - beforeMoveY < 0) { //右上
                        if (twinklingChess.id === 'red-ma-A') {
                            const tempPosition = [...currentPosition.redMaA];
                            let tmpX = currentPosition.redMaA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaA[0] = tmpX;
                            currentPosition.redMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'red-ma-B') {
                            const tempPosition = [...currentPosition.redMaB];
                            let tmpX = currentPosition.redMaB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaB[0] = tmpX;
                            currentPosition.redMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-A') {
                            const tempPosition = [...currentPosition.blackMaA];
                            let tmpX = currentPosition.blackMaA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaA[0] = tmpX;
                            currentPosition.blackMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-B') {
                            const tempPosition = [...currentPosition.blackMaB];
                            let tmpX = currentPosition.blackMaB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === 2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马头部有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaB[0] = tmpX;
                            currentPosition.blackMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                    } else { // 右下
                        if (twinklingChess.id === 'red-ma-A') {
                            const tempPosition = [...currentPosition.redMaA];
                            let tmpX = currentPosition.redMaA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaA[0] = tmpX;
                            currentPosition.redMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'red-ma-B') {
                            const tempPosition = [...currentPosition.redMaB];
                            let tmpX = currentPosition.redMaB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redMaB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.redMaB[0] = tmpX;
                            currentPosition.redMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-A') {
                            const tempPosition = [...currentPosition.blackMaA];
                            let tmpX = currentPosition.blackMaA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaA[0] = tmpX;
                            currentPosition.blackMaA[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                        if (twinklingChess.id === 'black-ma-B') {
                            const tempPosition = [...currentPosition.blackMaB];
                            let tmpX = currentPosition.blackMaB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackMaB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            if (tempPosition[0] - tmpX === -2) { // 横日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[0] === tempPosition[0] + 1 && item[1] === tempPosition[1]) {
                                            throw new Error('马右侧有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            if (tempPosition[1] - tmpY === -2) { // 竖日
                                try {
                                    Object.values(currentPosition).forEach(item => {
                                        if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                            throw new Error('马下面有棋子，无法移动');
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                            }
                            currentPosition.blackMaB[0] = tmpX;
                            currentPosition.blackMaB[1] = tmpY;
                            twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                            twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                        }
                    }

                }
            } else {
                console.log('马移动规则错误，不予移动');
                return false
            }
            break;
        case '相':
        case '象':
            // 象的移动拦截方案:象的移动是根据方向分组的，那么我只需要找移动方向象眼位置是否有棋子即可判定
            // 象的移动规则
            if (Math.abs(clickX - beforeMoveX) > 100 && Math.abs(clickX - beforeMoveX) < 140 && Math.abs(clickY - beforeMoveY) > 100 && Math.abs(clickY - beforeMoveY) < 140) {
                if (clickX - beforeMoveX < 0) { // 左
                    if (clickY - beforeMoveY < 0) { //左上
                        if (twinklingChess.id === 'red-xiang-A') {
                            let tmpX = currentPosition.redXiangA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try { // 象眼拦截器
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangA[0] = tmpX;
                                currentPosition.redXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'red-xiang-B') {
                            let tmpX = currentPosition.redXiangB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangB[0] = tmpX;
                                currentPosition.redXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-A') {
                            let tmpX = currentPosition.blackXiangA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangA[0] = tmpX;
                                currentPosition.blackXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-B') {
                            let tmpX = currentPosition.blackXiangB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangB[0] = tmpX;
                                currentPosition.blackXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                    } else { // 左下
                        if (twinklingChess.id === 'red-xiang-A') {
                            let tmpX = currentPosition.redXiangA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangA[0] = tmpX;
                                currentPosition.redXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'red-xiang-B') {
                            let tmpX = currentPosition.redXiangB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangB[0] = tmpX;
                                currentPosition.redXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-A') {
                            let tmpX = currentPosition.blackXiangA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangA[0] = tmpX;
                                currentPosition.blackXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-B') {
                            let tmpX = currentPosition.blackXiangB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangB[0] = tmpX;
                                currentPosition.blackXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                    }
                } else { // 右
                    if (clickY - beforeMoveY < 0) { //右上
                        if (twinklingChess.id === 'red-xiang-A') {
                            let tmpX = currentPosition.redXiangA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangA[0] = tmpX;
                                currentPosition.redXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'red-xiang-B') {
                            let tmpX = currentPosition.redXiangB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangB[0] = tmpX;
                                currentPosition.redXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-A') {
                            let tmpX = currentPosition.blackXiangA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangA[0] = tmpX;
                                currentPosition.blackXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-B') {
                            let tmpX = currentPosition.blackXiangB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangB[0] = tmpX;
                                currentPosition.blackXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                    } else { // 右下
                        if (twinklingChess.id === 'red-xiang-A') {
                            let tmpX = currentPosition.redXiangA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangA[0] = tmpX;
                                currentPosition.redXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'red-xiang-B') {
                            let tmpX = currentPosition.redXiangB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.redXiangB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY >= 5 && tmpY <= 9) {
                                currentPosition.redXiangB[0] = tmpX;
                                currentPosition.redXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-A') {
                            let tmpX = currentPosition.blackXiangA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangA[0] = tmpX;
                                currentPosition.blackXiangA[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                        if (twinklingChess.id === 'black-xiang-B') {
                            let tmpX = currentPosition.blackXiangB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                            let tmpY = currentPosition.blackXiangB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                        throw new Error('象眼被堵，不可移动到此处！')
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            if (tmpY <= 4 && tmpY >= 0) {
                                currentPosition.blackXiangB[0] = tmpX;
                                currentPosition.blackXiangB[1] = tmpY;
                                twinklingChess.style.left = currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('象不可过河，不予移动');
                                return false
                            }
                        }
                    }
                }
            } else {
                console.log('象移动规则错误，不予移动');
                return false
            }
            break;
        case '仕':
            if (Math.abs(clickX - beforeMoveX) < 80 && Math.abs(clickY - beforeMoveY) < 80 && Math.abs(clickX - beforeMoveX) > 40 && Math.abs(clickY - beforeMoveY) > 40) { // 限制士只能斜线移动
                if (clickX - beforeMoveX < 0) { // 左
                    if (clickY - beforeMoveY < 0) { // 左上
                        if (twinklingChess.id === 'red-shi-B') {
                            if ((currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiB[0] = currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiB[1] = currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'red-shi-A') {
                            if ((currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiA[0] = currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiA[1] = currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                    } else { // 左下
                        if (twinklingChess.id === 'red-shi-B') {
                            if ((currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiB[0] = currentPosition.redShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiB[1] = currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'red-shi-A') {
                            if ((currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiA[0] = currentPosition.redShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiA[1] = currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                    }
                } else { // 右
                    if (clickY - beforeMoveY < 0) { // 右上
                        if (twinklingChess.id === 'red-shi-B') {
                            if ((currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiB[0] = currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiB[1] = currentPosition.redShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'red-shi-A') {
                            if ((currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiA[0] = currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiA[1] = currentPosition.redShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                    } else { // 右下
                        if (twinklingChess.id === 'red-shi-B') {
                            if ((currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiB[0] = currentPosition.redShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiB[1] = currentPosition.redShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'red-shi-A') {
                            if ((currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 7 && (currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 9) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.redShiA[0] = currentPosition.redShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                                currentPosition.redShiA[1] = currentPosition.redShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                                twinklingChess.style.left = currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                    }

                }
            } else {
                console.log('不符合士的行动规则，不予移动');
                return false;
            }
            break;
        case '士':
            if (Math.abs(clickX - beforeMoveX) < 80 && Math.abs(clickY - beforeMoveY) < 80 && Math.abs(clickX - beforeMoveX) > 40 && Math.abs(clickY - beforeMoveY) > 40) { // 限制士只能斜线移动
                if (clickX - beforeMoveX < 0) { // 左
                    if (clickY - beforeMoveY < 0) { // 左上
                        if (twinklingChess.id === 'black-shi-B') {
                            if ((currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiB[0] = currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiB[1] = currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'black-shi-A') {
                            if ((currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiA[0] = currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiA[1] = currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                    } else { // 左下
                        if (twinklingChess.id === 'black-shi-B') {
                            if ((currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiB[0] = currentPosition.blackShiB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiB[1] = currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'black-shi-A') {
                            if ((currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiA[0] = currentPosition.blackShiA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiA[1] = currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('红士越位，不予移动');
                                return false;
                            }
                        }
                    }
                } else { // 右
                    if (clickY - beforeMoveY < 0) { // 右上
                        if (twinklingChess.id === 'black-shi-B') {
                            if ((currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiB[0] = currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiB[1] = currentPosition.blackShiB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'black-shi-A') {
                            if ((currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiA[0] = currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiA[1] = currentPosition.blackShiA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                    } else { // 右下
                        if (twinklingChess.id === 'black-shi-B') {
                            if ((currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiB[0] = currentPosition.blackShiB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiB[1] = currentPosition.blackShiB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                        if (twinklingChess.id === 'black-shi-A') {
                            if ((currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) >= 3 && (currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)) <= 5 && (currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) >= 0 && (currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)) <= 2) {
                                // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                currentPosition.blackShiA[0] = currentPosition.blackShiA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60)
                                currentPosition.blackShiA[1] = currentPosition.blackShiA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60)
                                twinklingChess.style.left = currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                twinklingChess.style.top = currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                            } else {
                                console.log('黑士越位，不予移动');
                                return false;
                            }
                        }
                    }

                }
            } else {
                console.log('不符合士的行动规则，不予移动');
                return false;
            }
            break;
        case '帅':
            if ((Math.abs(clickX - beforeMoveX) < 80) && (Math.abs(clickY - beforeMoveY) < 20) || (Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80)) { // 规定将的移动方式只能横向或者纵向单格
                // 临时存放更新前的坐标,这里数组不能直接赋值（因为数组是复杂数据类型，而计算新坐标是操作原数组，这样会导致这个临时变量的值也变化，因此这里必须用深拷贝的新数组）
                const tempPosition = [...currentPosition.redShuai];
                if (Math.abs(clickX - beforeMoveX) < 20) { //上下移动
                    // 负上正下
                    currentPosition.redShuai[1] = clickY - beforeMoveY < 0 ? currentPosition.redShuai[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60) : currentPosition.redShuai[1] = currentPosition.redShuai[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                } else { // 左右
                    // 负左正右
                    currentPosition.redShuai[0] = clickX - beforeMoveX < 0 ? currentPosition.redShuai[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redShuai[0] = currentPosition.redShuai[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                }
                // 帅的越界验证采用特殊方法，先更新坐标但不刷新DOM位置，确认更新后的坐标确实在范围内再更新DOM ，否则还原为变更前的坐标
                if (currentPosition.redShuai[0] >= 3 && currentPosition.redShuai[0] <= 5 && currentPosition.redShuai[1] >= 7 && currentPosition.redShuai[1] <= 9) {
                    twinklingChess.style.left = currentPosition.redShuai[0] * 60 - 25 + 'px';
                    twinklingChess.style.top = currentPosition.redShuai[1] * 60 - 25 + 'px';
                } else {
                    currentPosition.redShuai = tempPosition; //还原坐标
                    console.log('红帅越界，不予移动');
                    return false
                }
            } else if (currentPosition.redShuai[0] === currentPosition.blackShuai[0]) {
                // 如果出现两将X值相同，则需要判断他们之间是否有其他棋子，如果没有则可以越界吃子
                try {
                    Object.values(currentPosition).forEach(item => {
                        if (item[0] === currentPosition.redShuai[0] && item[1] > currentPosition.blackShuai[1] && item[1] < currentPosition.redShuai[1]) {
                            throw new Error('');
                        }
                    })
                } catch (error) {
                    return false
                }
                // 遍历结束自然跳出则表示两将之间无子，允许飞杀
                if (currentPosition.redShuai[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60) === currentPosition.blackShuai[1]) { // 如果落点Y坐标与另外一个帅的Y坐标相同，则可以执行飞杀
                    currentPosition.redShuai[1] = currentPosition.blackShuai[1];
                    twinklingChess.style.left = currentPosition.redShuai[0] * 60 - 25 + 'px';
                    twinklingChess.style.top = currentPosition.redShuai[1] * 60 - 25 + 'px';
                }
            } else {
                console.log('不符合将的移动规则，不予移动');
                return false
            }
            break;
        case '将':
            if ((Math.abs(clickX - beforeMoveX) < 80) && (Math.abs(clickY - beforeMoveY) < 20) || (Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80)) { // 规定将的移动方式只能横向或者纵向单格
                // 临时存放更新前的坐标,这里数组不能直接赋值（因为数组是复杂数据类型，而计算新坐标是操作原数组，这样会导致这个临时变量的值也变化，因此这里必须用深拷贝的新数组）
                const tempPosition = [...currentPosition.blackShuai];
                if (Math.abs(clickX - beforeMoveX) < 20) { //上下移动
                    // 负上正下
                    currentPosition.blackShuai[1] = clickY - beforeMoveY < 0 ? currentPosition.blackShuai[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60) : currentPosition.blackShuai[1] = currentPosition.blackShuai[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                } else { // 左右
                    // 负左正右
                    currentPosition.blackShuai[0] = clickX - beforeMoveX < 0 ? currentPosition.blackShuai[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackShuai[0] = currentPosition.blackShuai[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                }
                // 帅的越界验证采用特殊方法，先更新坐标但不刷新DOM位置，确认更新后的坐标确实在范围内再更新DOM ，否则还原为变更前的坐标
                if (currentPosition.blackShuai[0] >= 3 && currentPosition.blackShuai[0] <= 5 && currentPosition.blackShuai[1] >= 0 && currentPosition.blackShuai[1] <= 2) {
                    twinklingChess.style.left = currentPosition.blackShuai[0] * 60 - 25 + 'px';
                    twinklingChess.style.top = currentPosition.blackShuai[1] * 60 - 25 + 'px';
                } else {
                    currentPosition.blackShuai = tempPosition; //还原坐标
                    console.log('黑帅越界，不予移动');
                    return false
                }
            } else if (currentPosition.redShuai[0] === currentPosition.blackShuai[0]) {
                // 如果出现两将X值相同，则需要判断他们之间是否有其他棋子，如果没有则可以越界吃子
                try {
                    Object.values(currentPosition).forEach(item => {
                        if (item[0] === currentPosition.redShuai[0] && item[1] > currentPosition.blackShuai[1] && item[1] < currentPosition.redShuai[1]) {
                            throw new Error('');
                        }
                    })
                } catch (error) {
                    return false
                }
                // 遍历结束自然跳出则表示两将之间无子，允许飞杀
                if (currentPosition.blackShuai[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60) === currentPosition.redShuai[1]) { // 如果落点Y坐标与另外一个帅的Y坐标相同，则可以执行飞杀
                    currentPosition.blackShuai[1] = currentPosition.redShuai[1];
                    twinklingChess.style.left = currentPosition.blackShuai[0] * 60 - 25 + 'px';
                    twinklingChess.style.top = currentPosition.blackShuai[1] * 60 - 25 + 'px';
                }
            } else {
                console.log('不符合将的移动规则，不予移动');
                return false
            }
            break;
        case '炮':
        case '砲':
            // 炮的移动拦截和车略有区别：车只要中间有拦截则不可移动至点击落点，而炮在发现有拦截的情况下还需要验证落点处是否有敌方棋子，如果有则可以移动，没有才拦截移动操作
            if (Math.abs(clickY - beforeMoveY) > 40 && Math.abs(clickX - beforeMoveX) > 40) {
                console.log('炮移动规则错误，不予移动');
                return false
            }
            // 炮在2种情况下可以移动： 1、无子拦截且落点无子 2、仅有1个子拦截且落点是敌方棋子 
            if (twinklingChess.id === 'red-pao-A') {
                const tempPositionSave = [...currentPosition.redPaoA];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.redPaoA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoA[1] = tmpY;
                    } else { // 下移
                        let tmpY = currentPosition.redPaoA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoA[1] = tmpY;
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.redPaoA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoA[0] = tmpX;
                    } else { //  右移
                        let tmpX = currentPosition.redPaoA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoA[0] = tmpX;
                    }
                }
                // 新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.redPaoA[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                twinklingChess.style.top = currentPosition.redPaoA[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
            }
            if (twinklingChess.id === 'red-pao-B') {
                const tempPositionSave = [...currentPosition.redPaoB];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.redPaoB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoB[1] = tmpY;
                    } else { // 下移
                        let tmpY = currentPosition.redPaoB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoB[1] = tmpY;
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.redPaoB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoB[0] = tmpX;
                    } else { //  右移
                        let tmpX = currentPosition.redPaoB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.redPaoB[0] = tmpX;
                    }
                }
                // 新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.redPaoB[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                twinklingChess.style.top = currentPosition.redPaoB[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
            }
            if (twinklingChess.id === 'black-pao-A') {
                const tempPositionSave = [...currentPosition.blackPaoA];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.blackPaoA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoA[1] = tmpY;
                    } else { // 下移
                        let tmpY = currentPosition.blackPaoA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoA[1] = tmpY;
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.blackPaoA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoA[0] = tmpX;
                    } else { //  右移
                        let tmpX = currentPosition.blackPaoA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoA[0] = tmpX;
                    }
                }
                // 新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.blackPaoA[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                twinklingChess.style.top = currentPosition.blackPaoA[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
            }
            if (twinklingChess.id === 'black-pao-B') {
                const tempPositionSave = [...currentPosition.blackPaoB];
                if (Math.abs(clickX - beforeMoveX) < 20) { // 判断是上下还是左右
                    if (clickY - beforeMoveY < 0) { // 上移
                        let tmpY = currentPosition.blackPaoB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoB[1] = tmpY;
                    } else { // 下移
                        let tmpY = currentPosition.blackPaoB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[1] === tmpY && item[0] === tempPositionSave[0]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tempPositionSave[0], tmpY)) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoB[1] = tmpY;
                    }
                } else { // 左移
                    if (clickX - beforeMoveX < 0) {
                        let tmpX = currentPosition.blackPaoB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoB[0] = tmpX;
                    } else { //  右移
                        let tmpX = currentPosition.blackPaoB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        let count = 0;
                        // 先确认炮和落点之间有几枚棋子
                        Object.values(currentPosition).forEach(item => {
                            if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                count++;
                            }
                        })
                        if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                        // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                        if (count === 0) {
                            try {
                                Object.values(currentPosition).forEach(item => {
                                    if (item[0] === tmpX && item[1] === tempPositionSave[1]) {
                                        throw new Error('落点有子，炮不可移动')
                                    }
                                })
                            } catch (error) {
                                console.log(error.message);
                                return false
                            }
                        }
                        // 当确认炮和落点之间仅有一枚棋子时，则需要判断落点是否为敌方棋子
                        if (count === 1) {
                            if (paoIsToEnemy(tmpX, tempPositionSave[1])) {
                                console.log('炮落点和出发点之间仅有1枚棋子，且落点是敌方棋子，可以移动');
                            } else {
                                // 拦截器2、炮的落点没有敌方棋子（我方或空点）不允许移动
                                console.log('炮落点和出发点之间仅有1枚棋子，落点不是敌方棋子（我方或空点）情况下不允许移动');
                                return false
                            }
                        }
                        // 如果前面的拦截器没有发生return代码运行至此，则表示炮可以移动
                        currentPosition.blackPaoB[0] = tmpX;
                    }
                }
                // 新位置计算完毕后更新DOM的位置
                twinklingChess.style.left = currentPosition.blackPaoB[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                twinklingChess.style.top = currentPosition.blackPaoB[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
            }
            break;
        case '兵':
            // 兵的规则有点特殊，一方面是只进不退，另一个是过河后可以左右移动
            if (twinklingChess.id === 'red-bing-A') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.redBingA[1] >= 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY < 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.redBingA[1] = currentPosition.redBingA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则红兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY < 0) { // 只准上不准下
                                currentPosition.redBingA[1] = currentPosition.redBingA[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.redBingA[0] = clickX - beforeMoveX < 0 ? currentPosition.redBingA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redBingA[0] = currentPosition.redBingA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.redBingA[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.redBingA[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'red-bing-B') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.redBingB[1] >= 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY < 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.redBingB[1] = currentPosition.redBingB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则红兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY < 0) { // 只准上不准下
                                currentPosition.redBingB[1] = currentPosition.redBingB[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.redBingB[0] = clickX - beforeMoveX < 0 ? currentPosition.redBingB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redBingB[0] = currentPosition.redBingB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.redBingB[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.redBingB[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'red-bing-C') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.redBingC[1] >= 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY < 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.redBingC[1] = currentPosition.redBingC[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则红兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY < 0) { // 只准上不准下
                                currentPosition.redBingC[1] = currentPosition.redBingC[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.redBingC[0] = clickX - beforeMoveX < 0 ? currentPosition.redBingC[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redBingC[0] = currentPosition.redBingC[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.redBingC[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.redBingC[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'red-bing-D') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.redBingD[1] >= 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY < 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.redBingD[1] = currentPosition.redBingD[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则红兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY < 0) { // 只准上不准下
                                currentPosition.redBingD[1] = currentPosition.redBingD[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.redBingD[0] = clickX - beforeMoveX < 0 ? currentPosition.redBingD[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redBingD[0] = currentPosition.redBingD[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.redBingD[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.redBingD[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'red-bing-E') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.redBingE[1] >= 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY < 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.redBingE[1] = currentPosition.redBingE[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则红兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY < 0) { // 只准上不准下
                                currentPosition.redBingE[1] = currentPosition.redBingE[1] - Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.redBingE[0] = clickX - beforeMoveX < 0 ? currentPosition.redBingE[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.redBingE[0] = currentPosition.redBingE[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.redBingE[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.redBingE[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            break;
        case '卒':
            if (twinklingChess.id === 'black-bing-A') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.blackBingA[1] < 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY > 0 && clickX - beforeMoveX < 20) { // 黑兵前移操作
                            currentPosition.blackBingA[1] = currentPosition.blackBingA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则黑兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY > 0) { // 只准下不准上
                                currentPosition.blackBingA[1] = currentPosition.blackBingA[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.blackBingA[0] = clickX - beforeMoveX < 0 ? currentPosition.blackBingA[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackBingA[0] = currentPosition.blackBingA[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.blackBingA[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.blackBingA[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'black-bing-B') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.blackBingB[1] < 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY > 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.blackBingB[1] = currentPosition.blackBingB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则黑兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY > 0) { // 只准上不准下
                                currentPosition.blackBingB[1] = currentPosition.blackBingB[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.blackBingB[0] = clickX - beforeMoveX < 0 ? currentPosition.blackBingB[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackBingB[0] = currentPosition.blackBingB[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.blackBingB[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.blackBingB[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'black-bing-C') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.blackBingC[1] < 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY > 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.blackBingC[1] = currentPosition.blackBingC[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则黑兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY > 0) { // 只准上不准下
                                currentPosition.blackBingC[1] = currentPosition.blackBingC[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.blackBingC[0] = clickX - beforeMoveX < 0 ? currentPosition.blackBingC[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackBingC[0] = currentPosition.blackBingC[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.blackBingC[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.blackBingC[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'black-bing-D') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.blackBingD[1] < 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY > 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.blackBingD[1] = currentPosition.blackBingD[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则黑兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY > 0) { // 只准上不准下
                                currentPosition.blackBingD[1] = currentPosition.blackBingD[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.blackBingD[0] = clickX - beforeMoveX < 0 ? currentPosition.blackBingD[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackBingD[0] = currentPosition.blackBingD[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.blackBingD[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.blackBingD[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            if (twinklingChess.id === 'black-bing-E') {
                if ((Math.abs(clickX - beforeMoveX) < 20) && (Math.abs(clickY - beforeMoveY) < 80) || (Math.abs(clickY - beforeMoveY) < 20) && (Math.abs(clickX - beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                    if (currentPosition.blackBingE[1] < 5) { // 先判断是否已经过河
                        if (clickY - beforeMoveY > 0 && clickX - beforeMoveX < 20) { // 前移操作
                            currentPosition.blackBingE[1] = currentPosition.blackBingE[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                        } else {
                            console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                            return false
                        }
                    } else { // 已经过河，则黑兵除了不可后移其他都OK 
                        if (Math.abs(clickX - beforeMoveX) < 20) { // 上下移动
                            if (clickY - beforeMoveY > 0) { // 只准上不准下
                                currentPosition.blackBingE[1] = currentPosition.blackBingE[1] + Math.round(Math.abs(clickY - beforeMoveY) / 60);
                            } else {
                                console.log('兵就算过河了也不能后移！本次不予移动！');
                                return false
                            }
                        } else { // 左右移动
                            // 负左正右
                            currentPosition.blackBingE[0] = clickX - beforeMoveX < 0 ? currentPosition.blackBingE[0] - Math.round(Math.abs(clickX - beforeMoveX) / 60) : currentPosition.blackBingE[0] = currentPosition.blackBingE[0] + Math.round(Math.abs(clickX - beforeMoveX) / 60);
                        }
                    }
                    twinklingChess.style.top = currentPosition.blackBingE[1] * 60 - 25 + 'px'; // 刷新DOM
                    twinklingChess.style.left = currentPosition.blackBingE[0] * 60 - 25 + 'px';
                } else {
                    console.log('违反兵移动规则！本次不予移动');
                    return false
                }
            }
            break;
    }
    console.log('棋子移动完毕');
    // 每一次移动棋子结束后都要判断是否有吃子行为及游戏是否已经分出胜负
    if (eat(backupPosition)) return
    stoptwinkle();
    twinklingChess.style.opacity = '1';
    twinklingChess = null;
    step = 0;
    changePlayer(); // 棋子行动完之后必须交换行动人
}

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
let twinklingChess = null; // 当前正在闪烁(被玩家选中)的棋子DOM
let twinklingName = ''; // 选中棋子的Id
let clickChessTimer = 0; // 闪烁棋子的定时器
let beforeMoveX = 0;
let beforeMoveY = 0;
let clickX = 0;
let clickY = 0;
let step = 0; // step用于记录场上是否有正在闪烁（被选中的棋子），0表示没有，1表示有
// 存储场上所有棋子当前位置
const currentPosition = {
    redCheA: [0, 9],
    redCheB: [8, 9],
    blackCheA: [0, 0],
    blackCheB: [8, 0],
    redMaA: [1, 9],
    redMaB: [7, 9],
    blackMaA: [1, 0],
    blackMaB: [7, 0],
    redXiangA: [2, 9],
    redXiangB: [6, 9],
    blackXiangA: [2, 0],
    blackXiangB: [6, 0],
    redShiA: [3, 9],
    redShiB: [5, 9],
    blackShiA: [3, 0],
    blackShiB: [5, 0],
    redShuai: [4, 9],
    blackShuai: [4, 0],
    redPaoA: [1, 7],
    redPaoB: [7, 7],
    blackPaoA: [1, 2],
    blackPaoB: [7, 2],
    redBingA: [0, 6],
    redBingB: [2, 6],
    redBingC: [4, 6],
    redBingD: [6, 6],
    redBingE: [8, 6],
    blackBingA: [0, 3],
    blackBingB: [2, 3],
    blackBingC: [4, 3],
    blackBingD: [6, 3],
    blackBingE: [8, 3],
}
// 时间计算与玩家切换
let currentPlayer = 'red'; // 当前行动的玩家
let redUsedSeconds = 0;
let blackUsedSeconds = 0;
let redTimer = 0;
let blackTimer = 0;
// 点击触发操作
document.querySelector('.chessContent').addEventListener('click', clickChess);
document.querySelector('.container').addEventListener('click', clickBoard);