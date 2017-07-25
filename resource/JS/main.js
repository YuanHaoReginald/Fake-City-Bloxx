(function (window) {

//当前的游戏状态？0表示开始界面，1表示等待建造，2表示建造完成后进行的结算，3表示正在建造中，
let gameStatus = 0;



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
				document.getElementById("info").setAttribute("hidden", "true");
				document.getElementById("foot").setAttribute("hidden", "true");
				document.getElementById("open").removeAttribute("hidden");
				document.getElementById("info").innerHTML = "";
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
				document.getElementById("info").removeAttribute("hidden");
				document.getElementById("foot").removeAttribute("hidden");
				document.getElementById("open").setAttribute("hidden", "true");
				document.getElementById("info").innerHTML = "快速游戏<br />您的目标是建造出尽可能高并且稳固的摩天大楼。您只有3次失败的机会，左下角有当前的楼层和机会提示，右下角\
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
				let result = game(-1);
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
		}
	},
	paint:function(){

	}
}


//返回一个二元数组，第一个元素存放人口总数，第二个元素存放楼层层数
function game(type){
	//TODO
	return [1500, 23];
}

//localStorage.removeItem("quickScores");
gS = new gameStart();

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
   	else if(gameStatus === 1){

   	}
   	else if(gameStatus === 2){

   	}
   	else{
   		if(key === 32){
   			//
   			//blockSet();
   		}
   	}

}


})(window);