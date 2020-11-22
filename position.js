// 该JS主要放置棋子坐标以及建立棋子ID与坐标的对应关系
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