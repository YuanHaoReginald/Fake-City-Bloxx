(function (window) {

//当前的游戏状态？0表示开始界面，1表示等待建造，2表示建造完成后进行的结算，3表示正在建造中，
let gameStatus = 0;

let width = 0;
let height = 0;

let colors=['blue', 'red', 'green', 'yellow'];

//画布定义
let mainCv = document.getElementById("mainCanvas").getContext('2d');
let leftCv = document.getElementById("leftCanvas").getContext('2d');
let levelCv = document.getElementById("levelCanvas").getContext('2d');
let populationCv = document.getElementById("populationCanvas").getContext('2d');
let compareCv = document.getElementById("compareCanvas").getContext('2d');
let groundCv = document.getElementById("groundCanvas").getContext('2d');
let houseCv = document.getElementById("houseCanvas").getContext('2d');
let prepareCv = document.getElementById("prepareCanvas").getContext('2d');

//开始页面设置的类，绑定基础的试图
function gameStart(canv){
	this.currStatus = 0;//0表示正在首页，1表示正在查看帮助,2表示正在查看高分榜
	this.currPos = 0;//当前如果处于开始界面的光标位置
	this.canvas = canv;//可能存在的画布
	this.minPos = 0;
	this.change();
}

gameStart.prototype={
	constructor:gameStart,
	change:function(){
		//读取对应的数据，设置对应的起始点minPos,如果有初始数据，将minPos设置为-1
		if (localStorage.getItem("historyGame") != undefined){
			this.minPos = -1;
			this.currPos = -1;
			document.getElementById("p-1").removeAttribute("hidden");
		}
		else{
			this.minPos = 0;
			document.getElementById("p-1").setAttribute("hidden", "true");
		}
		document.getElementById("p"+this.minPos).setAttribute("class", "selected");
	},
	tryKey:function(key){
		if(key === 38 || key === 40){
			if(this.currStatus === 0){
				let newPos = key - 39 + this.currPos;
				if(newPos >= this.minPos && newPos <= 3){
					document.getElementById("p"+this.currPos).setAttribute("class", "start");
					document.getElementById("p"+newPos).setAttribute("class", "selected");
					this.currPos = newPos;
				}
			}
		}
		if(key === 32){
			if(this.currStatus === 1){
				//从帮助返回主页
				this.currStatus = 0;
				this.currPos = this.minPos;
				document.getElementById("p3").setAttribute("class", "start");
				document.getElementById("p"+this.minPos).setAttribute("class", "selected");
				document.getElementById("text").setAttribute("hidden", "true");
				document.getElementById("foot").setAttribute("hidden", "true");
				document.getElementById("open").removeAttribute("hidden");
				document.getElementById("text").innerHTML = "";
			}
			else if(this.currStatus === 2){
				//从得分返回主页
				this.currStatus = 0;
				this.currPos = this.minPos;
				document.getElementById("p2").setAttribute("class", "start");
				document.getElementById("p"+this.minPos).setAttribute("class", "selected");
				document.getElementById("score").setAttribute("hidden", "true");
				document.getElementById("foot").setAttribute("hidden", "true");
				document.getElementById("open").removeAttribute("hidden");
			}
			else if(this.currPos === 3){
				//从主页进入帮助
				this.currStatus = 1;
				document.getElementById("text").removeAttribute("hidden");
				document.getElementById("foot").removeAttribute("hidden");
				document.getElementById("open").setAttribute("hidden", "true");
				document.getElementById("text").innerHTML = "快速游戏<br />您的目标是建造出尽可能高并且稳固的摩天大楼。您只有3次失败的机会，左下角有当前的楼层和机会提示，右下角\
					显示分数。游戏中按空格键放置楼层。<br />层数越高或者与上一层契合越好，每一层增加的人口越多。与上一层完美契合可以达成combo，有大量的分数奖励。<br /><br />\
					建造城市<br />您的目标是建造一座人口众多的城市。为了达成这个目标，您必须尽可能建造出更好的楼房，同时尽量拥有合理的布局。<br />\
					在城市建造界面，可以看到当前的城市布局和人口总量。使用上下键选择楼房种类可以进行建造。建造完成后，可以\
					建造流程与快速游戏基本相同,不同的是，这里的楼层是有层数限制的。屋顶会让你得到更高的分数。";
			}else if(this.currPos === 2){
				//从主页进入得分榜
				this.currStatus = 2;
				document.getElementById("score").removeAttribute("hidden");
				document.getElementById("foot").removeAttribute("hidden");
				document.getElementById("open").setAttribute("hidden", "true");
				let cScore = localStorage.getItem("cityScore");
				if (cScore != undefined){
					document.getElementById("citymax").innerHTML = "最高分："+cScore;
				}
				let qScores = JSON.parse(localStorage.getItem("quickScores"));
				if(qScores != undefined){
					for(let i = 0; i < qScores.length;i++){
						let j = i + 1;
						document.getElementById("q"+i).innerHTML = "第"+j+"名：人口："+qScores[i][0]+" 层数："+qScores[i][1];
					}
				}
			}
			else if (this.currPos === 1){
				//从主页进入快速模式
				this.currStatus = 3;
				document.getElementById("open").setAttribute("hidden", "true");
				document.getElementById("p1").setAttribute("class", "start");
				document.getElementById("p"+this.minPos).setAttribute("class", "selected");
				gameStatus = 3;
				let result = game(-1).slice(0,2);
				gameStatus = 0;
				//更新高分榜
				let qStr = localStorage.getItem("quickScores");
				let qS = JSON.parse(qStr);
				if(qS == undefined){
					qS = [[0,0],[0,0],[0,0]];
				}
				qS.push(result);
				qS.sort(function(a,b){
					if(a[0] !== b[0]){
						return b[0] - a[0];
					}
					else{
						return b[1] - a[1];
					}
				});
				qS = qS.slice(0, 3);
				let str = JSON.stringify(qS);
				localStorage.setItem("quickScores", str);
				//结束快速模式之后返回主页
				document.getElementById("open").removeAttribute("hidden");
				this.currStatus = 0;
				this.currPos = this.minPos;
			}
			else {
				//TODO 界面隐藏、数据读取等部分
				document.getElementById("open").setAttribute("hidden", "true");
				document.getElementById("p"+this.currPos).setAttribute("class", "start");
				document.getElementById("p"+this.minPos).setAttribute("class", "selected");
				document.getElementById("text").removeAttribute("hidden");
				document.getElementById("text").setAttribute("class", "canvasInfo");
				document.getElementById("canvs").removeAttribute("hidden");
				gameStatus = 1;
				if(this.currPos === 0){
					this.city = new cityBuild(null);
				}else{
					let history = JSON.parse(localStorage.getItem("historyGame"));
					this.city = new cityBuild(history);
				}
			}
		}
	}
}


function cityBuild(city){
	if(city == null){
		this.total = 0;//人口总数
		this.arr = [];//对应的存储信息的数组
		for(let i = 0; i < 5; i++){
			let tmpArray=[];
			for(let j = 0; j < 5; j++){
				tmpArray.push(null);
			}
			this.arr.push(tmpArray);
		}
	}else{
		this.total = city.total;
		this.arr = city.arr;
		this.isGood = city.isGood;
		this.isGold= city.isGold;
	}
	this.alerting = false;//是否正在弹出提示框
	this.currHouse = 0;//建造之前当前键盘选中的位置（0：蓝色 1：红色 2：绿色 3：黄色）,同时也代表建造好之后的房屋类型
	this.currX = 0;//建造完毕将要放置的坐标
	this.currY = 0;
	this.currPeople = 0;//建造好之后房屋的人口数量
	this.isCancelled = false;//建造好之后是否处于删除位置
	this.cityLevel = 0;
	this.isGood = false;//是否拥有屋顶
	this.isGold = false;//是否拥有金屋顶；
	this.initPaint();//进行初始界面的绘制。之后的重绘只需要重绘部分内容
}

cityBuild.prototype ={
	constructor:cityBuild,
	levelChange:function(){
		let lv = [0, 75, 150, 250, 400, 600, 800, 1000, 1400, 1800, 2200, 3000, 4000, 5000, 6500, 8000, 9500, 11500, 14000, 17000, 19000];
		let i = -1;
		while(i < 20){
			if(this.total < lv[i + 1]){
				break;
			}
			else{
				i++;
			} 
		}
		if(i > this.cityLevel){
			//this.alert("恭喜您！城市升级到了"+i+"级城市！距离超大城市的梦想又近了一步！");
		}
		this.cityLevel = i;
	},
	getDrawPosition:function(posX, posY, type){
		let arr = [];
		if(type === 0){
			//表示是进行背景或者房屋绘制
			arr.push(width * 0.24 + width * 0.13 * (0.15 + posX));
			arr.push(height*0.22+width*0.13*(0.15+posY));
			arr.push(width * 0.13 * 0.7);
			arr.push(width * 0.13 * 0.7);
		}else{
			//表示进行放置位置绘制
			if(posX === -1 && posY === 4){
				arr.push(width*0.11);
				arr.push(height*0.62 - width * 0.04);
			}
			else{
				arr.push(width * 0.24 + width * 0.13 * (0.15 + posX) + width*0.04);
				arr.push(height*0.22+width*0.13*(0.15+posY) - width * 0.04);
			}
			arr.push(width * 0.13 * 0.7);
			arr.push(width * 0.13 * 0.7);
		}
		return arr;
	},
	initPaint:function(){
		//主要的方块
		mainCv.fillStyle = "RGB(204, 221, 14)"; 
		mainCv.fillRect(0, 0, width / 4, height * 0.15);
		mainCv.fillStyle = "RGB(173, 156, 131)";
		mainCv.fillRect(width / 4, 0, 3 * width / 4, height * 0.15);
		mainCv.fillStyle = "RGB(64, 64, 64)";
		mainCv.strokeStyle = "white";
		mainCv.lineWidth = 5;
		mainCv.strokeRect(width *0.24, height * 0.22, width * 0.65, width * 0.65);
		mainCv.fillRect(width *0.24, height * 0.22, width * 0.65, width * 0.65);
		mainCv.fillStyle = "RGB(138, 156, 116)";
		//放置楼房的块
		mainCv.lineWidth = width*0.13*0.05;
		for (let i = 0; i < 5; i++){
			for (let j = 0; j < 5; j++){
				let arr = this.getDrawPosition(i, j, 0); 
				mainCv.fillRect(arr[0], arr[1], arr[2], arr[3]);
				mainCv.strokeRect(arr[0], arr[1], arr[2], arr[3]);
			}
		}
		//虚线
		mainCv.lineWidth /= 2;
		mainCv.beginPath();
		for (let i = 0; i < 4; i++){
			for (let j = 0 ;j < 33; j++){
				mainCv.moveTo(width*(0.24 + 0.02*j), height*0.22 + width*0.13*(i+1));
				mainCv.lineTo(width*(0.24 + 0.02*(j+0.5)), height*0.22 + width*0.13*(i+1));
			}
		}
		for (let i = 0; i < 4; i++){
			for (let j = 0 ;j < 33; j++){
				mainCv.moveTo(width*(0.24 + 0.13*(i+1)), height*0.22 + width*0.02*j);
				mainCv.lineTo(width*(0.24 + 0.13*(i+1)), height*0.22 + width*0.02*(j + 0.5));
			}
		}
		mainCv.stroke();
		mainCv.closePath();
		//等级块
		mainCv.fillStyle="black";
		mainCv.fillRect(width *0.1, height*0.05 , width*0.125, height*0.04);
		let houseImg = new Image();
		houseImg.src = "resource/image/level.png";
		houseImg.onload = function(){
			mainCv.drawImage(houseImg, 0,height*0.04,width*0.08,width*0.08);
		}
		//得分块
		let pop = this.total;
		for(let i = 4;i >= 0; i--){
			mainCv.fillRect(width*0.4+i*width*0.07,height*0.03, width*0.06,height*0.08);
		}
		let peopImg = new Image();
		peopImg.src = "resource/image/people.png";
		peopImg.onload = function(){
			mainCv.drawImage(peopImg, width*0.3,height*0.04,width*0.08,width*0.08);
		}
		//比较块
		mainCv.strokeStyle="white";
		mainCv.strokeRect(width * 0.85, height*0.02, width*0.13, height*0.04);
		mainCv.strokeRect(width * 0.85, height*0.07, width*0.13, height*0.04);

		this.infoRepaint();
		this.groundRepaint();
		this.levelRepaint();
		this.populationRepaint();
		this.compareRepaint();
		this.houseRepaint();
		this.leftRepaint();
		this.prepareRepaint();
	},
	//当前可以建造的房屋种类
	currentAble:function(){
		let able = [0, 250, 800, 2200];
		let i = 0;
		while(i < 3){
			if(this.total < able[i + 1]){
				break;
			}
			else{
				i++;
			} 
		}
		return i;
	},

	infoRepaint:function(){
		document.getElementById("text").innerHTML = this.currentInfo();
	},
	leftRepaint:function(){
		leftCv.clearRect(0, 0, width, height);
		if(gameStatus === 1){
			leftCv.fillStyle = "white";
			leftCv.fillRect(width*0.06, height*0.22,width*0.13,width*0.50);
			leftCv.strokeStyle = "black";
			leftCv.lineWidth = width*0.13*0.02;
			leftCv.strokeRect(width*0.06, height*0.22,width*0.13,width*0.50);
			leftCv.fillStyle = "RGB(172,172,172)";
			for(let i = 0; i < 4; i++){
				leftCv.fillRect(width*0.07, height*0.23 + i * width * 0.12,width*0.11, width*0.11);
				if(i <= this.challengeAble()){
					let star = new Image();
					star.src = "resource/image/star.png";
					star.onload = function(){
						leftCv.drawImage(star, width*0.065, height*0.28 + i *width*0.12, width*0.04, width*0.04);
					}
				}
			}
			leftCv.fillStyle ="RGB(254,161,0)";
			leftCv.fillRect(width*0.07, height*0.23 + this.currHouse * width * 0.12,width*0.11, width*0.11);
			for(let i = 0; i < 4; i++){
				if(i <= this.currentAble()){
					let img = new Image();
					img.src = "resource/image/"+i+".png";
					img.onload = function(){
						leftCv.drawImage(img,width*0.09, height*0.22 + i * width * 0.12,width*0.10, width*0.10);
					}
				}
			}
		}
		if(gameStatus === 2){
			let desImg = new Image();
			desImg.src = "resource/image/destroy.png";
			desImg.onload = function(){
				leftCv.drawImage(desImg, width*0.07,height*0.62,width*0.09,width*0.09);
			}
			leftCv.strokeStyle = "white";
			leftCv.lineWidth = width*0.13*0.05;
			leftCv.strokeRect(width*0.07,height*0.62,width*0.09,width*0.09);
		}
	},
	levelRepaint:function(){
		this.levelChange();
		levelCv.clearRect(0, 0, width, height);
		levelCv.font = height * 0.03 +"px Arial";
		levelCv.fillStyle="white";
		levelCv.fillText(this.cityLevel+"/20",width*0.117, height*0.08);
	},
	populationRepaint:function(){
		populationCv.clearRect(0, 0, width, height);
		populationCv.font=height*0.06+"px Arial";
		populationCv.fillStyle="white";
		let pop = this.total;
		for(let i = 4;i >= 0; i--){
			populationCv.fillText(pop % 10,width*0.407+i*width*0.07,height*0.09);
			pop = Math.floor(pop / 10);
		}
	},
	compareRepaint:function(){
		compareCv.clearRect(0, 0, width, height);
		if(gameStatus === 2){
			compareCv.fillStyle="black";
			compareCv.fillRect(width * 0.85, height*0.02, width*0.13, height*0.04);
			compareCv.fillStyle=colors[this.currHouse];
			compareCv.fillRect(width*0.85, height*0.02, width*0.02,height*0.04);
			compareCv.fillStyle="white";
			compareCv.font=height*0.03+"px Arial";
			compareCv.fillText(this.currPeople,width*0.88, height*0.055);
			if(this.currX !== -1){
				if(this.arr[this.currX][this.currY] != null){
					compareCv.fillStyle = "black";
					compareCv.fillRect(width * 0.85, height*0.07, width*0.13, height*0.04);
					compareCv.fillStyle=colors[this.arr[this.currX][this.currY].type];
					compareCv.fillRect(width*0.85, height*0.07, width*0.02,height*0.04);
					compareCv.fillStyle="white";
					compareCv.fillText(this.arr[this.currX][this.currY].people,width*0.88, height*0.105);
				}
			}
		}
	},
	groundRepaint:function(){
		groundCv.clearRect(0, 0, width, height);
		if((gameStatus === 1 && this.currHouse <= this.currentAble()) || gameStatus === 2){
			for (let i = 0; i < 5; i++){
				for (let j = 0; j < 5; j++){
					if(this.setAble(i, j, this.currHouse)===true){
						groundCv.strokeStyle = colors[this.currHouse];
						groundCv.lineWidth = width *0.13 * 0.05;
						let currArr = this.getDrawPosition(i, j, 0);
						groundCv.strokeRect(currArr[0], currArr[1], currArr[2], currArr[3]);
					}
				}
			}
		}
	},
	houseRepaint:function(){
		houseCv.clearRect(0, 0, width, height);
		for(let i = 0; i < 5; i++){
			for(let j = 0; j < 5; j++){
				if(this.arr[i][j] != null){
					let img = new Image();
					let str = "";
					if(this.arr[i][j].isGold === true){
						str = "2";
					}else if(this.arr[i][j].isGood === false){
						str = "0";
					}else{
						str = "1";
					}
					img.src = "resource/image/"+this.arr[i][j].type+str+".png";
					let currArr = this.getDrawPosition(i,j,0);
					img.onload = function(){
						houseCv.drawImage(img,currArr[0], currArr[1], currArr[2], currArr[3]);
					}
				}
			}
		}
	},
	prepareRepaint:function(){
		prepareCv.clearRect(0, 0, width, height);
		if(gameStatus === 2){
			let img = new Image();
			let str = "";
			if(this.isGold === true){
				str = "2";
			}else if(this.isGood === false){
				str = "0";
			}else{
				str = "1";
			}
			img.src = "resource/image/"+this.currHouse+str+".png";
			let currArr = this.getDrawPosition(this.currX,this.currY,1);
			prepareCv.fillStyle = "white";
			prepareCv.fillRect(currArr[0], currArr[1], currArr[2], currArr[3]);
			prepareCv.strokeStyle = "red";
			prepareCv.lineWidth = width*0.13*0.02;
			prepareCv.strokeRect(currArr[0], currArr[1], currArr[2], currArr[3]);
			img.onload = function(){
				prepareCv.drawImage(img,currArr[0] + currArr[2]*0.1, currArr[1]+currArr[2]*0.1, currArr[2]*0.8, currArr[3]*0.8);
			}
		}
	},
	challengeAble:function(){
		let able = [1400, 4000, 6500, 9500];
		let i = -1;
		while(i < 3){
			if(this.total < able[i + 1]){
				break;
			}
			else{
				i++;
			} 
		}
		return i;
	},
	//判断对应的位置是否与某一个位置相连
	isAdj:function(posX, posY, type){
		let dx = [1, -1, 0, 0];
		let dy = [0, 0, 1, -1];
		for(let i = 0; i < 4; i++){
			if(0 <= posX + dx[i] && posX + dx[i]< 5 && 0 <= posY + dy[i] && posY + dy[i] < 5 && this.arr[posX+dx[i]][posY+dy[i]] != null && this.arr[posX+dx[i]][posY+dy[i]].type === type){
				return true;
			}
		}
		return false;
	},
	//判断对应的位置是否可以放置对应的颜色的块
	setAble:function(posX, posY, type){
		for (let i = 0; i < type; i++){
			if(this.isAdj(posX, posY, i) === false){
				return false;
			}
		}
		return true;
	},
	//判断当前下方文字
	currentInfo:function(){
		let strArr=["住宅楼：可建造在任何位置","商务楼：必须与住宅楼相邻","办公楼：必须与住宅楼和商务楼相邻","摩天大楼：必须与上述三种楼相邻"];
		let wrongArr=["","达到250人口后解锁建造","达到800人口后解锁建造","达到2200人口后解锁建造"];
		let addArr=["挑战：70人口","挑战：250人口","挑战：650人口","挑战：1000人口"];
		if(gameStatus === 1){
			if(this.currHouse > this.currentAble()){
				return wrongArr[this.currHouse];
			}
			else{
				let str = strArr[this.currHouse];
				if(this.currHouse <= this.challengeAble()){
					str = str + "<br />"+addArr[this.currHouse];
				}
				return str;
			}
		}
		else if(gameStatus === 2){
			if(this.isCancelled === true){
				return "按下空格键拆除该楼房";
			}
			else{
				if(this.setAble(this.currX, this.currY, this.currHouse) === true){
					return "按下空格键将楼房放置在此处";
				}
				else{
					return "您不能将楼房放置在此处";
				}
			}
		}
		else {
			return "error!";
		}
	},
	//尝试放下或者拆毁已经搭建好的楼房
	trySet:function(){
		if(this.isCancelled === true){
			this.currX = 0;
			this.currY = 0;
			this.currHouse = 0;
			this.currPeople = 0;
			this.isGood = false;
			this.isGold = false;
			this.isCancelled = false;
			gameStatus = 1;
			this.leftRepaint();
			this.infoRepaint();
			this.compareRepaint();
			this.prepareRepaint();
			this.groundRepaint();
		}
		else{
			if(this.setAble(this.currX, this.currY, this.currHouse) === true){
				let house = new Object();
				house.people = this.currPeople;
				house.type = this.currHouse;
				house.isGood = this.isGood;
				house.isGold = this.isGold;
				if(this.arr[this.currX][this.currY]== null){
					this.total += this.currPeople;
				}
				else{
					this.total = this.total + this.currPeople - this.arr[this.currX][this.currY].people;
				}
				this.arr[this.currX][this.currY] = house;
				this.currX = 0;
				this.currY = 0;
				this.currHouse = 0;
				this.currPeople = 0;
				gameStatus = 1;
				//如果有变化弹出窗口？
				this.leftRepaint();
				this.infoRepaint();
				this.compareRepaint();
				this.levelRepaint();
				this.populationRepaint();
				this.prepareRepaint();
				this.groundRepaint();
				this.houseRepaint();
				//数据存储
				let currCity = new Object();
				currCity.total = this.total;
				currCity.arr = this.arr;
				let cityStr = JSON.stringify(currCity);
				localStorage.setItem("historyGame", cityStr);
			}
		}

	},
	//尝试键位
	tryKey:function(key){
		if(this.alerting == true){
			if(key === 32){
				this.alerting = false;
				document.getElementById("extraInfo").setAttribute("hidden","true");
			}
		}
		else{
			if(key === 27){
				//ESC键，强制退出，返回首页
				document.getElementById("open").removeAttribute("hidden");
				document.getElementById("text").setAttribute("hidden", "true");
				document.getElementById("text").setAttribute("class", "info");
				document.getElementById("canvs").setAttribute("hidden", "true");
				gameStatus = 0;
			}
			if(gameStatus === 1){
				if(key === 38 || key === 40){
					let newPos = key - 39 + this.currHouse;
					if(newPos >= 0 && newPos <= 3){
						this.currHouse = newPos;
						this.leftRepaint();
						this.groundRepaint();
						this.infoRepaint();
					}
				}
				if(key === 32){
					//TODO 转入建造模式
					if(this.currHouse <= this.currentAble()){
						let isAble = false;
						for(let i = 0; i < 5; i++){
							for(let j = 0; j < 5; j++){
								if(this.setAble(i, j, this.currHouse)){
									isAble = true;
								}
							}
						}
						if(isAble === true){
							let result = game(this.currHouse);
							//建造好之后的处理
							gameStatus = 2;
							this.currPeople = result[0];
							if(result[1] < (this.currHouse+1)*10){
								this.isGood = false;
							}
							else{
								this.isGood = true;
							}
							if (result[3] === 1){
								this.isGold = true;
							}
							else{
								this.isGold = false;
							}
							this.initPaint();
						}
					}
				}
			}
			else if(gameStatus === 2){
				if(key === 32){
					this.trySet();
				}else{
					if(key <= 40 && key >= 37){
						let stepArr = [[-1, 0],[0, -1],[1, 0],[0, 1]];
						let newX = this.currX + stepArr[key-37][0];
						let newY = this.currY + stepArr[key-37][1];
						if(0 <= newX && newX <=4 && 0<=newY && newY<=4){
							if(this.currX === -1 && this.currY === 4){
								this.isCancelled = false;
							}
							this.currX = newX;
							this.currY = newY;
							this.compareRepaint();
							this.prepareRepaint();
							this.infoRepaint();
						}
						else if(this.currX === 0 && key === 37){
							this.currX = -1;
							this.currY = 4;
							this.isCancelled = true;
							this.compareRepaint();
							this.prepareRepaint();
							this.infoRepaint();
						}
					}
				}
			}
		}
	}
} 

//返回一个二元数组，第一个元素存放人口总数，第二个元素存放楼层层数
function game(type){
	//TODO
	if(type === 0){
		return [100, 10, 0, 0];
	}else if(type === 1){
		return [250,19, 0,0];
	}
	else if (type === 2){
		return [550,30,0,1];
	}
	else if(type === 3){
		return [1000,39, 0,0];
	}
}

gS = new gameStart();

//TODO:屏幕适配：页面宽度设置
function resize(){
	let screenWidth = document.body.offsetWidth;
	let screenHeight = document.body.offsetHeight;
	if(4*screenWidth < 3*screenHeight){
		width = screenWidth;
		height = 4*width / 3;   
	}
	else {
		height = screenHeight;
		width = 3*height/4;
	}
	document.getElementById("frame").style.width = width+"px";
	document.getElementById("frame").style.height = height+"px";
	document.getElementById("frame").style.marginTop = (-height / 2)+"px";
	document.getElementById("frame").style.marginLeft = (-width / 2)+"px";
	let canvArr = document.querySelectorAll(".canv");
	for(let i = 0; i < canvArr.length; i++){
		canvArr[i].style.width = width+"px";
		canvArr[i].style.height = height*0.8+"px";
		canvArr[i].width = width;
		canvArr[i].height = height*0.8;
		canvArr[i].style.marginTop = (-height / 2)+"px";
		canvArr[i].style.marginLeft = (-width / 2)+"px";
	}
	if(gameStatus === 1 || gameStatus === 2){
		gS.city.initPaint();
	}
}

window.onresize = resize;
resize();

document.onkeydown=function(event){
	let key = null;
   	//控制方向:上下左右键
   	if(window.event === true){
   		key = window.event.keyCode;
   	}
   	else{
   		key = event.keyCode;
   	}
   	if(gameStatus === 0){
   		gS.tryKey(key);
   	}
   	else if(gameStatus === 1 || gameStatus === 2){
   		gS.city.tryKey(key);
   		//特殊判断：刷新gS
   		if(key === 27){
   			gS.change();
   		}
   	}
   	else{
   		if(key === 32){
   			//
   			//blockSet();
   		}
   	}

}


})(window);