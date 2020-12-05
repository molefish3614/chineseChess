// 该JS主要执行移动、吃子、胜负逻辑
import data from './commonData'
import select from './select'
// 棋盘像素坐标字符串转换为数字型X，Y格子坐标
function boardToPosition(num) {
    let reverseNum = num.split('').reverse();
    reverseNum.splice(0, 2);
    return (parseInt(reverseNum.reverse().join('')) + 25) / 60
}
// 判断在间隔了一个子的情况下，炮的落点是否为敌方棋子，返回true表示可以移动
function paoIsToEnemy(landX, landY) { 
    console.log('炮计划落点坐标是:' + landX + ',' + landY);
    if (data.currentPlayer === 'red') {
        try {
            Object.values(data.currentPosition).forEach((item, index) => {
                if (item[0] === landX && item[1] === landY) { // 检查落子点是否有其他棋子，如果有则获取到它的index
                    const key = Object.keys(data.currentPosition)[index]; // 利用value的index获取到对应的key
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
            Object.values(data.currentPosition).forEach((item, index) => {
                if (item[0] === landX && item[1] === landY) { // 检查落子点是否有其他棋子，如果有则获取到它的index
                    const key = Object.keys(data.currentPosition)[index]; // 利用value的index获取到对应的key
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
    let x = boardToPosition(data.twinklingChess.style.left);
    let y = boardToPosition(data.twinklingChess.style.top);
    let id = '';
    let key = '';
    try {
        Object.values(backup).forEach((item, index) => {
            if (item[0] === x && item[1] === y) {
                console.log('找到了被吃的棋子，它的index是：' + index);
                // 获取被吃子的键名
                key = Object.keys(backup)[index];
                // 将被吃子的键值改成undefined
                Object.defineProperty(data.currentPosition, key, {
                    value: [undefined, undefined]
                });
                // 通过键名在Map对象中查到对应的DOM id并且移除该DOM 通过throw跳出遍历
                id = data.domIdMap.get(key);
                document.querySelector(id).style.display = 'none';
                throw new Error('');
            }
        })
    } catch (error) {}
    // 如果被吃子的键名是redShuai或者blackShuai，则可以判定胜负结束游戏(关闭闪烁及双方定时器、移除鼠标点击事件)
    if (key === 'redShuai') {
        clearInterval(data.blackTimer);
        data.twinklingChess.style.opacity = '1';
        clearInterval(data.clickChessTimer);
        document.querySelector('.chessContent').removeEventListener('click',  select.clickChess);
        document.querySelector('.container').removeEventListener('click',  select.clickBoard);
        document.querySelector('#red-act').style.display = 'none';
        document.querySelector('#black-act').style.display = 'none';
        alert('黑方胜利，游戏结束');
        return true
    }
    if (key === 'blackShuai') {
        clearInterval(data.redTimer);
        data.twinklingChess.style.opacity = '1';
        clearInterval(data.clickChessTimer);
        document.querySelector('.chessContent').removeEventListener('click', select.clickChess);
        document.querySelector('.container').removeEventListener('click',  select.clickBoard);
        document.querySelector('#red-act').style.display = 'none';
        document.querySelector('#black-act').style.display = 'none';
        alert('红方胜利，游戏结束')
        return true
    }
    // eat函数返回的布尔值代表是否发生了老将被吃情况,以决定是否结束游戏
    return false
}
export default {
    move: function () {
        const backupPosition = JSON.parse(JSON.stringify(data.currentPosition)); // 每次移动前深拷贝坐标对象
        let target = data.twinklingChess.innerText;
        console.log('点击棋子ID是' + data.twinklingChess.id);
        switch (target) {
            case '車':
                if (Math.abs(data.clickY - data.beforeMoveY) > 40 && Math.abs(data.clickX - data.beforeMoveX) > 40) {
                    console.log('车移动规则错误，不予移动');
                    return false
                }
                // 关于车移动的拦截方案： 在刷新DOM前，遍历所有棋子坐标，如果发现计算落点与棋子原坐标之间存在任何一个棋子则拦截本次移动操作
                if (data.twinklingChess.id === 'red-che-A') {
                    const tempPositionSave = [...data.currentPosition.redCheA]; // 由于对象内的数组坐标是1层简单数据，所以这里可以用浅拷贝临时存储
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.redCheA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheA[1] = data.currentPosition.redCheA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        } else { // 下移
                            let tmpY = data.currentPosition.redCheA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheA[1] = data.currentPosition.redCheA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.redCheA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheA[0] = data.currentPosition.redCheA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        } else { //  右移
                            let tmpX = data.currentPosition.redCheA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            data.currentPosition.redCheA[0] = data.currentPosition.redCheA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        }
                    }
                    // 选中的车新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.redCheA[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.redCheA[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
                }
                if (data.twinklingChess.id === 'red-che-B') {
                    const tempPositionSave = [...data.currentPosition.redCheB];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.redCheB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheB[1] = data.currentPosition.redCheB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        } else { // 下移
                            let tmpY = data.currentPosition.redCheB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheB[1] = data.currentPosition.redCheB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.redCheB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.redCheB[0] = data.currentPosition.redCheB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        } else { //  右移
                            let tmpX = data.currentPosition.redCheB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            data.currentPosition.redCheB[0] = data.currentPosition.redCheB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        }
                    }
                    // 选中的车新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.redCheB[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.redCheB[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
                }
                if (data.twinklingChess.id === 'black-che-A') {
                    const tempPositionSave = [...data.currentPosition.blackCheA];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.blackCheA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheA[1] = data.currentPosition.blackCheA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        } else { // 下移
                            let tmpY = data.currentPosition.blackCheA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheA[1] = data.currentPosition.blackCheA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.blackCheA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheA[0] = data.currentPosition.blackCheA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        } else { //  右移
                            let tmpX = data.currentPosition.blackCheA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            data.currentPosition.blackCheA[0] = data.currentPosition.blackCheA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        }
                    }
                    // 选中的车新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.blackCheA[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.blackCheA[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
                }
                if (data.twinklingChess.id === 'black-che-B') {
                    const tempPositionSave = [...data.currentPosition.blackCheB];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.blackCheB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) { // 拦截判定条件是相同X值下，落点与原点Y坐标之间有其他的坐标存在
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheB[1] = data.currentPosition.blackCheB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        } else { // 下移
                            let tmpY = data.currentPosition.blackCheB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                        throw new Error('移动前Y坐标是：' + tempPositionSave[1] + '————落点Y坐标是：' + tmpY + '————本次被Y坐标为：' + item[1] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheB[1] = data.currentPosition.blackCheB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.blackCheB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            // 遍历结束未发现中间有棋子则执行计算新坐标操作
                            data.currentPosition.blackCheB[0] = data.currentPosition.blackCheB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        } else { //  右移
                            let tmpX = data.currentPosition.blackCheB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            try {
                                Object.values(data.currentPosition).forEach(item => { // 只是判断有没有棋子，所有只需要遍历对象的值而不需要遍历属性名
                                    if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                        throw new Error('移动前X坐标是：' + tempPositionSave[0] + '————落点X坐标是：' + tmpX + '————本次被X坐标为：' + item[0] + '的棋子拦截');
                                    }
                                })
                            } catch (e) {
                                console.log(e.message);
                                return false
                            }
                            data.currentPosition.blackCheB[0] = data.currentPosition.blackCheB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                        }
                    }
                    // 选中的车新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.blackCheB[0] * 60 - 25 + 'px'; // 更新车的横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.blackCheB[1] * 60 - 25 + 'px'; // 更新车的纵坐标新位置
                }
                break;
            case '傌':
            case '馬':
                // 马走日的距离判断规则:马水平移动一格 垂直走2格或者水平移动2格垂直移动1格
                // 马的移动拦截方案：在刷新DOM前，遍历所有棋子坐标，如果发现移动方向上有棋子产生“撇脚”效果，则拦截移动操作
                if ((Math.abs(data.clickX - data.beforeMoveX) < 80 && Math.abs(data.clickY - data.beforeMoveY) < 140 && Math.abs(data.clickY - data.beforeMoveY) > 100) || (Math.abs(data.clickY - data.beforeMoveY) < 80 && Math.abs(data.clickX - data.beforeMoveX) < 140 && Math.abs(data.clickX - data.beforeMoveX) > 100)) {
                    if (data.clickX - data.beforeMoveX < 0) { // 水平左移
                        if (data.clickY - data.beforeMoveY < 0) { // 上移+左移——左上日
                            if (data.twinklingChess.id === 'red-ma-A') {
                                const tempPosition = [...data.currentPosition.redMaA];
                                let tmpX = data.currentPosition.redMaA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaA[0] = tmpX;
                                data.currentPosition.redMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'red-ma-B') {
                                const tempPosition = [...data.currentPosition.redMaB];
                                let tmpX = data.currentPosition.redMaB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaB[0] = tmpX;
                                data.currentPosition.redMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-A') {
                                const tempPosition = [...data.currentPosition.blackMaA];
                                let tmpX = data.currentPosition.blackMaA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaA[0] = tmpX;
                                data.currentPosition.blackMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-B') {
                                const tempPosition = [...data.currentPosition.blackMaB];
                                let tmpX = data.currentPosition.blackMaB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaB[0] = tmpX;
                                data.currentPosition.blackMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }

                        } else { // 下移+左移——左下日
                            if (data.twinklingChess.id === 'red-ma-A') {
                                const tempPosition = [...data.currentPosition.redMaA];
                                let tmpX = data.currentPosition.redMaA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaA[0] = tmpX;
                                data.currentPosition.redMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'red-ma-B') {
                                const tempPosition = [...data.currentPosition.redMaB];
                                let tmpX = data.currentPosition.redMaB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaB[0] = tmpX;
                                data.currentPosition.redMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-A') {
                                const tempPosition = [...data.currentPosition.blackMaA];
                                let tmpX = data.currentPosition.blackMaA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaA[0] = tmpX;
                                data.currentPosition.blackMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-B') {
                                const tempPosition = [...data.currentPosition.blackMaB];
                                let tmpX = data.currentPosition.blackMaB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === 2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaB[0] = tmpX;
                                data.currentPosition.blackMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                        }
                    } else { // 水平右移动
                        if (data.clickY - data.beforeMoveY < 0) { //右上
                            if (data.twinklingChess.id === 'red-ma-A') {
                                const tempPosition = [...data.currentPosition.redMaA];
                                let tmpX = data.currentPosition.redMaA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaA[0] = tmpX;
                                data.currentPosition.redMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'red-ma-B') {
                                const tempPosition = [...data.currentPosition.redMaB];
                                let tmpX = data.currentPosition.redMaB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaB[0] = tmpX;
                                data.currentPosition.redMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-A') {
                                const tempPosition = [...data.currentPosition.blackMaA];
                                let tmpX = data.currentPosition.blackMaA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaA[0] = tmpX;
                                data.currentPosition.blackMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-B') {
                                const tempPosition = [...data.currentPosition.blackMaB];
                                let tmpX = data.currentPosition.blackMaB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] - 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马头部有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaB[0] = tmpX;
                                data.currentPosition.blackMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                        } else { // 右下
                            if (data.twinklingChess.id === 'red-ma-A') {
                                const tempPosition = [...data.currentPosition.redMaA];
                                let tmpX = data.currentPosition.redMaA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaA[0] = tmpX;
                                data.currentPosition.redMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'red-ma-B') {
                                const tempPosition = [...data.currentPosition.redMaB];
                                let tmpX = data.currentPosition.redMaB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redMaB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.redMaB[0] = tmpX;
                                data.currentPosition.redMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-A') {
                                const tempPosition = [...data.currentPosition.blackMaA];
                                let tmpX = data.currentPosition.blackMaA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaA[0] = tmpX;
                                data.currentPosition.blackMaA[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
                            }
                            if (data.twinklingChess.id === 'black-ma-B') {
                                const tempPosition = [...data.currentPosition.blackMaB];
                                let tmpX = data.currentPosition.blackMaB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackMaB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                if (tempPosition[0] - tmpX === -2) { // 横日
                                    try {
                                        Object.values(data.currentPosition).forEach(item => {
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
                                        Object.values(data.currentPosition).forEach(item => {
                                            if (item[1] === tempPosition[1] + 1 && item[0] === tempPosition[0]) {
                                                throw new Error('马下面有棋子，无法移动');
                                            }
                                        })
                                    } catch (e) {
                                        console.log(e.message);
                                        return false
                                    }
                                }
                                data.currentPosition.blackMaB[0] = tmpX;
                                data.currentPosition.blackMaB[1] = tmpY;
                                data.twinklingChess.style.left = tmpX * 60 - 25 + 'px'; // 更新横坐标位置
                                data.twinklingChess.style.top = tmpY * 60 - 25 + 'px'; // 更新纵坐标位置
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
                if (Math.abs(data.clickX - data.beforeMoveX) > 100 && Math.abs(data.clickX - data.beforeMoveX) < 140 && Math.abs(data.clickY - data.beforeMoveY) > 100 && Math.abs(data.clickY - data.beforeMoveY) < 140) {
                    if (data.clickX - data.beforeMoveX < 0) { // 左
                        if (data.clickY - data.beforeMoveY < 0) { //左上
                            if (data.twinklingChess.id === 'red-xiang-A') {
                                let tmpX = data.currentPosition.redXiangA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try { // 象眼拦截器
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangA[0] = tmpX;
                                    data.currentPosition.redXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'red-xiang-B') {
                                let tmpX = data.currentPosition.redXiangB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangB[0] = tmpX;
                                    data.currentPosition.redXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-A') {
                                let tmpX = data.currentPosition.blackXiangA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangA[0] = tmpX;
                                    data.currentPosition.blackXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-B') {
                                let tmpX = data.currentPosition.blackXiangB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangB[0] = tmpX;
                                    data.currentPosition.blackXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                        } else { // 左下
                            if (data.twinklingChess.id === 'red-xiang-A') {
                                let tmpX = data.currentPosition.redXiangA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangA[0] = tmpX;
                                    data.currentPosition.redXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'red-xiang-B') {
                                let tmpX = data.currentPosition.redXiangB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangB[0] = tmpX;
                                    data.currentPosition.redXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-A') {
                                let tmpX = data.currentPosition.blackXiangA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangA[0] = tmpX;
                                    data.currentPosition.blackXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-B') {
                                let tmpX = data.currentPosition.blackXiangB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX + 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangB[0] = tmpX;
                                    data.currentPosition.blackXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                        }
                    } else { // 右
                        if (data.clickY - data.beforeMoveY < 0) { //右上
                            if (data.twinklingChess.id === 'red-xiang-A') {
                                let tmpX = data.currentPosition.redXiangA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangA[0] = tmpX;
                                    data.currentPosition.redXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'red-xiang-B') {
                                let tmpX = data.currentPosition.redXiangB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangB[0] = tmpX;
                                    data.currentPosition.redXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-A') {
                                let tmpX = data.currentPosition.blackXiangA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangA[0] = tmpX;
                                    data.currentPosition.blackXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-B') {
                                let tmpX = data.currentPosition.blackXiangB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY + 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangB[0] = tmpX;
                                    data.currentPosition.blackXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                        } else { // 右下
                            if (data.twinklingChess.id === 'red-xiang-A') {
                                let tmpX = data.currentPosition.redXiangA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangA[0] = tmpX;
                                    data.currentPosition.redXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'red-xiang-B') {
                                let tmpX = data.currentPosition.redXiangB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.redXiangB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY >= 5 && tmpY <= 9) {
                                    data.currentPosition.redXiangB[0] = tmpX;
                                    data.currentPosition.redXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.redXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-A') {
                                let tmpX = data.currentPosition.blackXiangA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangA[0] = tmpX;
                                    data.currentPosition.blackXiangA[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('象不可过河，不予移动');
                                    return false
                                }
                            }
                            if (data.twinklingChess.id === 'black-xiang-B') {
                                let tmpX = data.currentPosition.blackXiangB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                let tmpY = data.currentPosition.blackXiangB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
                                        if (item[0] === tmpX - 1 && item[1] === tmpY - 1) {
                                            throw new Error('象眼被堵，不可移动到此处！')
                                        }
                                    })
                                } catch (e) {
                                    console.log(e.message);
                                    return false
                                }
                                if (tmpY <= 4 && tmpY >= 0) {
                                    data.currentPosition.blackXiangB[0] = tmpX;
                                    data.currentPosition.blackXiangB[1] = tmpY;
                                    data.twinklingChess.style.left = data.currentPosition.blackXiangB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackXiangB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
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
                if (Math.abs(data.clickX - data.beforeMoveX) < 80 && Math.abs(data.clickY - data.beforeMoveY) < 80 && Math.abs(data.clickX - data.beforeMoveX) > 40 && Math.abs(data.clickY - data.beforeMoveY) > 40) { // 限制士只能斜线移动
                    if (data.clickX - data.beforeMoveX < 0) { // 左
                        if (data.clickY - data.beforeMoveY < 0) { // 左上
                            if (data.twinklingChess.id === 'red-shi-B') {
                                if ((data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiB[0] = data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiB[1] = data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'red-shi-A') {
                                if ((data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiA[0] = data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiA[1] = data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                        } else { // 左下
                            if (data.twinklingChess.id === 'red-shi-B') {
                                if ((data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiB[0] = data.currentPosition.redShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiB[1] = data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'red-shi-A') {
                                if ((data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiA[0] = data.currentPosition.redShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiA[1] = data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                        }
                    } else { // 右
                        if (data.clickY - data.beforeMoveY < 0) { // 右上
                            if (data.twinklingChess.id === 'red-shi-B') {
                                if ((data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiB[0] = data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiB[1] = data.currentPosition.redShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'red-shi-A') {
                                if ((data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiA[0] = data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiA[1] = data.currentPosition.redShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                        } else { // 右下
                            if (data.twinklingChess.id === 'red-shi-B') {
                                if ((data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiB[0] = data.currentPosition.redShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiB[1] = data.currentPosition.redShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'red-shi-A') {
                                if ((data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 7 && (data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 9) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.redShiA[0] = data.currentPosition.redShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                                    data.currentPosition.redShiA[1] = data.currentPosition.redShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                    data.twinklingChess.style.left = data.currentPosition.redShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.redShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
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
                if (Math.abs(data.clickX - data.beforeMoveX) < 80 && Math.abs(data.clickY - data.beforeMoveY) < 80 && Math.abs(data.clickX - data.beforeMoveX) > 40 && Math.abs(data.clickY - data.beforeMoveY) > 40) { // 限制士只能斜线移动
                    if (data.clickX - data.beforeMoveX < 0) { // 左
                        if (data.clickY - data.beforeMoveY < 0) { // 左上
                            if (data.twinklingChess.id === 'black-shi-B') {
                                if ((data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiB[0] = data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiB[1] = data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'black-shi-A') {
                                if ((data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiA[0] = data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiA[1] = data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                        } else { // 左下
                            if (data.twinklingChess.id === 'black-shi-B') {
                                if ((data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiB[0] = data.currentPosition.blackShiB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiB[1] = data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'black-shi-A') {
                                if ((data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiA[0] = data.currentPosition.blackShiA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiA[1] = data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('红士越位，不予移动');
                                    return false;
                                }
                            }
                        }
                    } else { // 右
                        if (data.clickY - data.beforeMoveY < 0) { // 右上
                            if (data.twinklingChess.id === 'black-shi-B') {
                                if ((data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiB[0] = data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiB[1] = data.currentPosition.blackShiB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'black-shi-A') {
                                if ((data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiA[0] = data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiA[1] = data.currentPosition.blackShiA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                        } else { // 右下
                            if (data.twinklingChess.id === 'black-shi-B') {
                                if ((data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiB[0] = data.currentPosition.blackShiB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiB[1] = data.currentPosition.blackShiB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiB[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiB[1] * 60 - 25 + 'px'; // 更新纵坐标位置
                                } else {
                                    console.log('黑士越位，不予移动');
                                    return false;
                                }
                            }
                            if (data.twinklingChess.id === 'black-shi-A') {
                                if ((data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) >= 3 && (data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)) <= 5 && (data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) >= 0 && (data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)) <= 2) {
                                    // 如果新坐标在士的活动范围内，则允许移动，否则return false
                                    data.currentPosition.blackShiA[0] = data.currentPosition.blackShiA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60)
                                    data.currentPosition.blackShiA[1] = data.currentPosition.blackShiA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60)
                                    data.twinklingChess.style.left = data.currentPosition.blackShiA[0] * 60 - 25 + 'px'; // 更新横坐标位置
                                    data.twinklingChess.style.top = data.currentPosition.blackShiA[1] * 60 - 25 + 'px'; // 更新纵坐标位置
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
                if ((Math.abs(data.clickX - data.beforeMoveX) < 80) && (Math.abs(data.clickY - data.beforeMoveY) < 20) || (Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80)) { // 规定将的移动方式只能横向或者纵向单格
                    // 临时存放更新前的坐标,这里数组不能直接赋值（因为数组是复杂数据类型，而计算新坐标是操作原数组，这样会导致这个临时变量的值也变化，因此这里必须用深拷贝的新数组）
                    const tempPosition = [...data.currentPosition.redShuai];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { //上下移动
                        // 负上正下
                        data.currentPosition.redShuai[1] = data.clickY - data.beforeMoveY < 0 ? data.currentPosition.redShuai[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60) : data.currentPosition.redShuai[1] = data.currentPosition.redShuai[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                    } else { // 左右
                        // 负左正右
                        data.currentPosition.redShuai[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redShuai[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redShuai[0] = data.currentPosition.redShuai[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                    }
                    // 帅的越界验证采用特殊方法，先更新坐标但不刷新DOM位置，确认更新后的坐标确实在范围内再更新DOM ，否则还原为变更前的坐标
                    if (data.currentPosition.redShuai[0] >= 3 && data.currentPosition.redShuai[0] <= 5 && data.currentPosition.redShuai[1] >= 7 && data.currentPosition.redShuai[1] <= 9) {
                        data.twinklingChess.style.left = data.currentPosition.redShuai[0] * 60 - 25 + 'px';
                        data.twinklingChess.style.top = data.currentPosition.redShuai[1] * 60 - 25 + 'px';
                    } else {
                        data.currentPosition.redShuai = tempPosition; //还原坐标
                        console.log('红帅越界，不予移动');
                        return false
                    }
                } else if (data.currentPosition.redShuai[0] === data.currentPosition.blackShuai[0]) {
                    // 如果出现两将X值相同，则需要判断他们之间是否有其他棋子，如果没有则可以越界吃子
                    try {
                        Object.values(data.currentPosition).forEach(item => {
                            if (item[0] === data.currentPosition.redShuai[0] && item[1] > data.currentPosition.blackShuai[1] && item[1] < data.currentPosition.redShuai[1]) {
                                throw new Error('');
                            }
                        })
                    } catch (error) {
                        return false
                    }
                    // 遍历结束自然跳出则表示两将之间无子，允许飞杀
                    if (data.currentPosition.redShuai[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60) === data.currentPosition.blackShuai[1]) { // 如果落点Y坐标与另外一个帅的Y坐标相同，则可以执行飞杀
                        data.currentPosition.redShuai[1] = data.currentPosition.blackShuai[1];
                        data.twinklingChess.style.left = data.currentPosition.redShuai[0] * 60 - 25 + 'px';
                        data.twinklingChess.style.top = data.currentPosition.redShuai[1] * 60 - 25 + 'px';
                    }
                } else {
                    console.log('不符合将的移动规则，不予移动');
                    return false
                }
                break;
            case '将':
                if ((Math.abs(data.clickX - data.beforeMoveX) < 80) && (Math.abs(data.clickY - data.beforeMoveY) < 20) || (Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80)) { // 规定将的移动方式只能横向或者纵向单格
                    // 临时存放更新前的坐标,这里数组不能直接赋值（因为数组是复杂数据类型，而计算新坐标是操作原数组，这样会导致这个临时变量的值也变化，因此这里必须用深拷贝的新数组）
                    const tempPosition = [...data.currentPosition.blackShuai];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { //上下移动
                        // 负上正下
                        data.currentPosition.blackShuai[1] = data.clickY - data.beforeMoveY < 0 ? data.currentPosition.blackShuai[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60) : data.currentPosition.blackShuai[1] = data.currentPosition.blackShuai[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                    } else { // 左右
                        // 负左正右
                        data.currentPosition.blackShuai[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackShuai[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackShuai[0] = data.currentPosition.blackShuai[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                    }
                    // 帅的越界验证采用特殊方法，先更新坐标但不刷新DOM位置，确认更新后的坐标确实在范围内再更新DOM ，否则还原为变更前的坐标
                    if (data.currentPosition.blackShuai[0] >= 3 && data.currentPosition.blackShuai[0] <= 5 && data.currentPosition.blackShuai[1] >= 0 && data.currentPosition.blackShuai[1] <= 2) {
                        data.twinklingChess.style.left = data.currentPosition.blackShuai[0] * 60 - 25 + 'px';
                        data.twinklingChess.style.top = data.currentPosition.blackShuai[1] * 60 - 25 + 'px';
                    } else {
                        data.currentPosition.blackShuai = tempPosition; //还原坐标
                        console.log('黑帅越界，不予移动');
                        return false
                    }
                } else if (data.currentPosition.redShuai[0] === data.currentPosition.blackShuai[0]) {
                    // 如果出现两将X值相同，则需要判断他们之间是否有其他棋子，如果没有则可以越界吃子
                    try {
                        Object.values(data.currentPosition).forEach(item => {
                            if (item[0] === data.currentPosition.redShuai[0] && item[1] > data.currentPosition.blackShuai[1] && item[1] < data.currentPosition.redShuai[1]) {
                                throw new Error('');
                            }
                        })
                    } catch (error) {
                        return false
                    }
                    // 遍历结束自然跳出则表示两将之间无子，允许飞杀
                    if (data.currentPosition.blackShuai[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60) === data.currentPosition.redShuai[1]) { // 如果落点Y坐标与另外一个帅的Y坐标相同，则可以执行飞杀
                        data.currentPosition.blackShuai[1] = data.currentPosition.redShuai[1];
                        data.twinklingChess.style.left = data.currentPosition.blackShuai[0] * 60 - 25 + 'px';
                        data.twinklingChess.style.top = data.currentPosition.blackShuai[1] * 60 - 25 + 'px';
                    }
                } else {
                    console.log('不符合将的移动规则，不予移动');
                    return false
                }
                break;
            case '炮':
            case '砲':
                // 炮的移动拦截和车略有区别：车只要中间有拦截则不可移动至点击落点，而炮在发现有拦截的情况下还需要验证落点处是否有敌方棋子，如果有则可以移动，没有才拦截移动操作
                if (Math.abs(data.clickY - data.beforeMoveY) > 40 && Math.abs(data.clickX - data.beforeMoveX) > 40) {
                    console.log('炮移动规则错误，不予移动');
                    return false
                }
                // 炮在2种情况下可以移动： 1、无子拦截且落点无子 2、仅有1个子拦截且落点是敌方棋子 
                if (data.twinklingChess.id === 'red-pao-A') {
                    const tempPositionSave = [...data.currentPosition.redPaoA];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.redPaoA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoA[1] = tmpY;
                        } else { // 下移
                            let tmpY = data.currentPosition.redPaoA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoA[1] = tmpY;
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.redPaoA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoA[0] = tmpX;
                        } else { //  右移
                            let tmpX = data.currentPosition.redPaoA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoA[0] = tmpX;
                        }
                    }
                    // 新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.redPaoA[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.redPaoA[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
                }
                if (data.twinklingChess.id === 'red-pao-B') {
                    const tempPositionSave = [...data.currentPosition.redPaoB];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.redPaoB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoB[1] = tmpY;
                        } else { // 下移
                            let tmpY = data.currentPosition.redPaoB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoB[1] = tmpY;
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.redPaoB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoB[0] = tmpX;
                        } else { //  右移
                            let tmpX = data.currentPosition.redPaoB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.redPaoB[0] = tmpX;
                        }
                    }
                    // 新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.redPaoB[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.redPaoB[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
                }
                if (data.twinklingChess.id === 'black-pao-A') {
                    const tempPositionSave = [...data.currentPosition.blackPaoA];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.blackPaoA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoA[1] = tmpY;
                        } else { // 下移
                            let tmpY = data.currentPosition.blackPaoA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoA[1] = tmpY;
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.blackPaoA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoA[0] = tmpX;
                        } else { //  右移
                            let tmpX = data.currentPosition.blackPaoA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoA[0] = tmpX;
                        }
                    }
                    // 新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.blackPaoA[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.blackPaoA[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
                }
                if (data.twinklingChess.id === 'black-pao-B') {
                    const tempPositionSave = [...data.currentPosition.blackPaoB];
                    if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 判断是上下还是左右
                        if (data.clickY - data.beforeMoveY < 0) { // 上移
                            let tmpY = data.currentPosition.blackPaoB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] < tempPositionSave[1] && item[1] > tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoB[1] = tmpY;
                        } else { // 下移
                            let tmpY = data.currentPosition.blackPaoB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[0] === tempPositionSave[0] && item[1] > tempPositionSave[1] && item[1] < tmpY) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoB[1] = tmpY;
                        }
                    } else { // 左移
                        if (data.clickX - data.beforeMoveX < 0) {
                            let tmpX = data.currentPosition.blackPaoB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] < tempPositionSave[0] && item[0] > tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoB[0] = tmpX;
                        } else { //  右移
                            let tmpX = data.currentPosition.blackPaoB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            let count = 0;
                            // 先确认炮和落点之间有几枚棋子
                            Object.values(data.currentPosition).forEach(item => {
                                if (item[1] === tempPositionSave[1] && item[0] > tempPositionSave[0] && item[0] < tmpX) {
                                    count++;
                                }
                            })
                            if (count > 1) return console.log('炮和落点之间超过1枚棋子，不予移动')
                            // 拦截器1、当确认炮和落点之间没有棋子时，落点处有棋子不允许移动
                            if (count === 0) {
                                try {
                                    Object.values(data.currentPosition).forEach(item => {
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
                            data.currentPosition.blackPaoB[0] = tmpX;
                        }
                    }
                    // 新位置计算完毕后更新DOM的位置
                    data.twinklingChess.style.left = data.currentPosition.blackPaoB[0] * 60 - 25 + 'px'; // 更新横坐标新位置
                    data.twinklingChess.style.top = data.currentPosition.blackPaoB[1] * 60 - 25 + 'px'; // 更新纵坐标新位置
                }
                break;
            case '兵':
                // 兵的规则有点特殊，一方面是只进不退，另一个是过河后可以左右移动
                if (data.twinklingChess.id === 'red-bing-A') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.redBingA[1] >= 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY < 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.redBingA[1] = data.currentPosition.redBingA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则红兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY < 0) { // 只准上不准下
                                    data.currentPosition.redBingA[1] = data.currentPosition.redBingA[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.redBingA[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redBingA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redBingA[0] = data.currentPosition.redBingA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.redBingA[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.redBingA[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'red-bing-B') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.redBingB[1] >= 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY < 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.redBingB[1] = data.currentPosition.redBingB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则红兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY < 0) { // 只准上不准下
                                    data.currentPosition.redBingB[1] = data.currentPosition.redBingB[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.redBingB[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redBingB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redBingB[0] = data.currentPosition.redBingB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.redBingB[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.redBingB[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'red-bing-C') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.redBingC[1] >= 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY < 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.redBingC[1] = data.currentPosition.redBingC[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则红兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY < 0) { // 只准上不准下
                                    data.currentPosition.redBingC[1] = data.currentPosition.redBingC[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.redBingC[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redBingC[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redBingC[0] = data.currentPosition.redBingC[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.redBingC[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.redBingC[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'red-bing-D') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.redBingD[1] >= 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY < 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.redBingD[1] = data.currentPosition.redBingD[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则红兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY < 0) { // 只准上不准下
                                    data.currentPosition.redBingD[1] = data.currentPosition.redBingD[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.redBingD[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redBingD[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redBingD[0] = data.currentPosition.redBingD[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.redBingD[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.redBingD[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'red-bing-E') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.redBingE[1] >= 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY < 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.redBingE[1] = data.currentPosition.redBingE[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河红兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则红兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY < 0) { // 只准上不准下
                                    data.currentPosition.redBingE[1] = data.currentPosition.redBingE[1] - Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.redBingE[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.redBingE[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.redBingE[0] = data.currentPosition.redBingE[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.redBingE[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.redBingE[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                break;
            case '卒':
                if (data.twinklingChess.id === 'black-bing-A') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.blackBingA[1] < 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY > 0 && data.clickX - data.beforeMoveX < 20) { // 黑兵前移操作
                                data.currentPosition.blackBingA[1] = data.currentPosition.blackBingA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则黑兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY > 0) { // 只准下不准上
                                    data.currentPosition.blackBingA[1] = data.currentPosition.blackBingA[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.blackBingA[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackBingA[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackBingA[0] = data.currentPosition.blackBingA[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.blackBingA[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.blackBingA[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'black-bing-B') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.blackBingB[1] < 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY > 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.blackBingB[1] = data.currentPosition.blackBingB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则黑兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY > 0) { // 只准上不准下
                                    data.currentPosition.blackBingB[1] = data.currentPosition.blackBingB[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.blackBingB[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackBingB[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackBingB[0] = data.currentPosition.blackBingB[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.blackBingB[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.blackBingB[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'black-bing-C') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.blackBingC[1] < 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY > 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.blackBingC[1] = data.currentPosition.blackBingC[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则黑兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY > 0) { // 只准上不准下
                                    data.currentPosition.blackBingC[1] = data.currentPosition.blackBingC[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.blackBingC[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackBingC[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackBingC[0] = data.currentPosition.blackBingC[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.blackBingC[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.blackBingC[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'black-bing-D') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.blackBingD[1] < 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY > 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.blackBingD[1] = data.currentPosition.blackBingD[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则黑兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY > 0) { // 只准上不准下
                                    data.currentPosition.blackBingD[1] = data.currentPosition.blackBingD[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.blackBingD[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackBingD[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackBingD[0] = data.currentPosition.blackBingD[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.blackBingD[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.blackBingD[0] * 60 - 25 + 'px';
                    } else {
                        console.log('违反兵移动规则！本次不予移动');
                        return false
                    }
                }
                if (data.twinklingChess.id === 'black-bing-E') {
                    if ((Math.abs(data.clickX - data.beforeMoveX) < 20) && (Math.abs(data.clickY - data.beforeMoveY) < 80) || (Math.abs(data.clickY - data.beforeMoveY) < 20) && (Math.abs(data.clickX - data.beforeMoveX) < 80)) { // 首先确定兵只能单步移动
                        if (data.currentPosition.blackBingE[1] < 5) { // 先判断是否已经过河
                            if (data.clickY - data.beforeMoveY > 0 && data.clickX - data.beforeMoveX < 20) { // 前移操作
                                data.currentPosition.blackBingE[1] = data.currentPosition.blackBingE[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                            } else {
                                console.log('没有过河黑兵不可后退也不能左右移动!本次不予移动');
                                return false
                            }
                        } else { // 已经过河，则黑兵除了不可后移其他都OK 
                            if (Math.abs(data.clickX - data.beforeMoveX) < 20) { // 上下移动
                                if (data.clickY - data.beforeMoveY > 0) { // 只准上不准下
                                    data.currentPosition.blackBingE[1] = data.currentPosition.blackBingE[1] + Math.round(Math.abs(data.clickY - data.beforeMoveY) / 60);
                                } else {
                                    console.log('兵就算过河了也不能后移！本次不予移动！');
                                    return false
                                }
                            } else { // 左右移动
                                // 负左正右
                                data.currentPosition.blackBingE[0] = data.clickX - data.beforeMoveX < 0 ? data.currentPosition.blackBingE[0] - Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60) : data.currentPosition.blackBingE[0] = data.currentPosition.blackBingE[0] + Math.round(Math.abs(data.clickX - data.beforeMoveX) / 60);
                            }
                        }
                        data.twinklingChess.style.top = data.currentPosition.blackBingE[1] * 60 - 25 + 'px'; // 刷新DOM
                        data.twinklingChess.style.left = data.currentPosition.blackBingE[0] * 60 - 25 + 'px';
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
        clearInterval(data.clickChessTimer);
        data.twinklingChess.style.opacity = '1';
        data.twinklingChess = null;
        data.step = false;
        // 棋子移动完毕必须交换玩家
        return 'playerchange'
    }
}