(function (window) {
    //below is Building Code
    let InBuild = false;
    let renderer, camera, scene, light;
    let width_3d_use = document.getElementById('canvas-frame').clientWidth;
    let height_3d_use = document.getElementById('canvas-frame').clientHeight;
    let TotalHeight = 0, MaxCombo = 0, TotalPeople = 0;
    let mode, isGod;
    let planeFloor, planeWall;
    let isGolden = false, hasGolden = false;

    let life_c = window.document.getElementById("LifeCanvas");
    let life_ctx = life_c.getContext('2d');
    let combo_c = window.document.getElementById("ComboCanvas");
    let combo_ctx = combo_c.getContext('2d');
    let height_c = window.document.getElementById("HeightCanvas");
    let height_ctx = height_c.getContext('2d');
    let people_c = window.document.getElementById("PeopleCanvas");
    let people_ctx = people_c.getContext('2d');

    const CubeColor = ["#EEAD0E", "#00BFFF", "#FF3030", "#00EE00", "#EEEE00"];

    function BuildTower(mode_var, hasGolden_var, isGod_var) {
        mode = mode_var === undefined ? 1 : mode_var;
        isGod = (isGod_var === true);
        hasGolden = hasGolden_var;
        InBuild = true;
        GenerateManager.initCube();
        LifeManager.initLife();
        LifeManager.Paint();
        HeightManager.Paint();
        document.getElementById("canvas-frame").style.visibility = "visible";
        GenerateManager.GenerateCube();
    }

    function EndBuildTower() {
        document.getElementById("canvas-frame").style.visibility = "hidden";
        InBuild = false;
        let [TotalHeight_var, TotalPeople_var, MaxCombo_var, isGolden_var]
            = [TotalHeight, TotalPeople, MaxCombo, isGolden && hasGolden];
        [TotalHeight, TotalPeople, MaxCombo, isGolden] = [0, 0, 0, false];
        TowerManager.Reset();
        LifeManager.Paint();
        HeightManager.Paint();
        PeopleManager.Paint();
        camera.position.z = 30;
        planeWall.position.z = 500;
        hasGolden = false;
        yitao(TotalHeight_var, TotalPeople_var, MaxCombo_var, isGolden_var);
    }

    let EnvironmentManager = {
        initThree : function() {
            renderer = new THREE.WebGLRenderer({
                alpha : true,
            });
            renderer.setSize(width_3d_use, height_3d_use);
            document.getElementById('canvas-frame').appendChild(renderer.domElement);
            renderer.domElement.style.zIndex = 0;
        },
        initCamera : function() {
            camera = new THREE.PerspectiveCamera(45, width_3d_use / height_3d_use, 1, 10000);
            camera.position.x = 0;
            camera.position.y = 150;
            camera.position.z = 30;
            camera.up.x = 0;
            camera.up.y = 0;
            camera.up.z = 1;
            camera.lookAt({
                x : 0,
                y : 0,
                z : 30,
            });
        },
        initScene : function() {
            scene = new THREE.Scene();
        },
        initLight : function() {
            light = new THREE.AmbientLight(0xFFFFFF);
            scene.add(light);
        },
        initObject : function() {
            let planeGeometryFloor = new THREE.PlaneGeometry(1600, 1000);
            let planeMaterialFloor = new THREE.MeshBasicMaterial({color: 0xcccccc});
            planeFloor = new THREE.Mesh(planeGeometryFloor, planeMaterialFloor);
            scene.add(planeFloor);

            let planeGeometryWall = new THREE.PlaneGeometry(1600, 1600);
            let planeMaterialWall = new THREE.MeshBasicMaterial({color: 0x87CEFF});
            planeWall = new THREE.Mesh(planeGeometryWall, planeMaterialWall);
            planeWall.rotation.x = -0.5 * Math.PI;
            planeWall.position.y = -500;
            planeWall.position.z = 500;
            scene.add(planeWall);
        },
        threeStart : function() {
            this.initThree();
            this.initCamera();
            this.initScene();
            this.initLight();
            this.initObject();

            animate();
        },
    };

    let GenerateManager = {
        myCube : undefined,
        geometry : undefined,
        meshFaceMaterial : undefined,
        arg : 0,
        point : true,
        line : undefined,
        initCube : function () {
            this.geometry = new THREE.CubeGeometry(10, 10, 10);
            let texture_main = new THREE.Texture(generateTexture(CubeColor[mode]));
            texture_main.needsUpdate = true;
            let texture_side = new THREE.Texture(generateTexture("#000000"));
            texture_side.needsUpdate = true;
            let texture_button = new THREE.Texture(generateTexture("#FFFFFF"));
            texture_button.needsUpdate = true;
            let materials = [];
            materials.push(new THREE.MeshBasicMaterial({map:texture_side}));
            materials.push(new THREE.MeshBasicMaterial({map:texture_side}));
            materials.push(new THREE.MeshBasicMaterial({map:texture_main}));
            materials.push(new THREE.MeshBasicMaterial({map:texture_main}));
            materials.push(new THREE.MeshBasicMaterial({map:texture_button}));
            materials.push(new THREE.MeshBasicMaterial({map:texture_button}));
            this.meshFaceMaterial = new THREE.MeshFaceMaterial( materials );
        },
        GenerateCube : function() {
            if(TotalHeight === mode * 10 - 1){
                let roof_geometry  = new THREE.CylinderGeometry(0, 5 * Math.sqrt(2), 10, 4);
                let roof_materials = [];
                const line = [70, 300, 650, 1100];
                if(TotalPeople >= line[mode - 1]){
                    isGolden = true;
                }
                if(hasGolden && isGolden){
                    roof_materials.push(new THREE.MeshBasicMaterial({color: '#FFD700'}));
                } else {
                    roof_materials.push(new THREE.MeshBasicMaterial({color: CubeColor[mode]}));
                }
                roof_materials.push(new THREE.MeshBasicMaterial({color: "#000000"}));
                roof_materials.push(new THREE.MeshBasicMaterial({color: "#000000"}));
                let roof_meshFaceMaterial = new THREE.MeshFaceMaterial( roof_materials );
                this.myCube = new THREE.Mesh(roof_geometry, roof_meshFaceMaterial);
                this.myCube.position.z = TotalHeight * 10 + 35;
                this.myCube.rotation.x = Math.PI / 2;
                this.myCube.rotation.y = Math.PI / 4;
            } else {
                this.myCube = new THREE.Mesh(this.geometry, this.meshFaceMaterial );
                this.myCube.position.z = TotalHeight * 10 + 35;
            }
            scene.add(this.myCube);

            let geometry_line = new THREE.Geometry();
            let material_line = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors} );
            let color1 = new THREE.Color( 0x000000 ), color2 = new THREE.Color( 0x000000 );
            let p1 = new THREE.Vector3(0, 0, TotalHeight * 10 + 85);
            let p2 = new THREE.Vector3(0, 0, TotalHeight * 10 + 40);
            geometry_line.vertices.push(p1);
            geometry_line.vertices.push(p2);
            geometry_line.colors.push( color1, color2 );
            this.line = new THREE.Line( geometry_line, material_line, THREE.LineSegments );
            scene.add(this.line);
        },
        Reset : function () {
            if(this.line !== undefined)
                scene.remove(this.line);
            this.line = undefined;
            this.myCube = undefined;
            this.arg = 0;
            this.point = true;
        },
        move : function () {
            if(typeof this.myCube !== 'undefined') {
                this.arg += this.point ? 1 : -1;
                if (this.arg === 30 || this.arg === -30)
                    this.point = !this.point;
                if(TotalHeight === mode * 10 - 1){
                    this.myCube.rotation.z = this.arg * Math.PI / 360;
                } else {
                    this.myCube.rotation.y = -this.arg * Math.PI / 360;
                }
                this.myCube.position.x = 50 * Math.sin(this.arg * Math.PI / 360);
                this.myCube.position.z = TotalHeight * 10 + 85 - 50 * Math.cos(this.arg * Math.PI / 360);

                scene.remove(this.line);
                let geometry_line = new THREE.Geometry();
                let material_line = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors} );
                let color1 = new THREE.Color( 0x000000 ), color2 = new THREE.Color( 0x000000 );
                let p1 = new THREE.Vector3(0, 0, TotalHeight * 10 + 85);
                let p2 = new THREE.Vector3(45 * Math.sin(this.arg * Math.PI / 360), 0,
                    TotalHeight * 10 + 85 - 45 * Math.cos(this.arg * Math.PI / 360));
                geometry_line.vertices.push(p1);
                geometry_line.vertices.push(p2);
                geometry_line.colors.push( color1, color2 );
                this.line = new THREE.Line( geometry_line, material_line, THREE.LineSegments );
                scene.add(this.line);
            }
        }
    };

    let FallManager = {
        myCube : undefined,
        arg : 0,
        speed : 0,
        h_speed : 0,
        canUse : true,
        move : function () {
            if(typeof this.myCube !== 'undefined'){
                this.myCube.position.z -= this.h_speed;
                this.h_speed += 0.05;
                this.myCube.position.x += this.speed;
                if(this.arg !== 0){
                    this.arg += (this.arg > 0) ? -1 : 1;
                    if(TotalHeight === mode * 10 - 1){
                        this.myCube.rotation.z = this.arg * Math.PI / 360;
                    } else {
                        this.myCube.rotation.y = -this.arg * Math.PI / 360;
                    }
                }
                TowerManager.CheckFall(this.myCube);
                if(this.myCube !== undefined)
                    this.CheckSite();
            }
        },
        Reset : function () {
            this.myCube = undefined;
            this.arg = 0;
            this.speed = 0;
            this.h_speed = 0;
            this.canUse = true;
        },
        CheckSite : function () {
            if(this.myCube.position.z < 10 * TotalHeight - 35){
                scene.remove(this.myCube);
                if(ComboManager.comboTime > 0)
                    ComboManager.EndCombo();
                isGolden = false;
                this.Reset();
                if (!LifeManager.loseLife()){
                    GenerateManager.GenerateCube();
                }
            }
        }
    };

    let TowerManager = {
        Building : [],
        score : [],
        CheckFall : function (fallingCube) {
            if(FallManager.canUse){
                if(fallingCube.position.z < 10 * TotalHeight + 5){
                    if(this.Building.length === 0){
                        this.Building[0] = fallingCube;
                        fallingCube.position.z = 5;
                        TotalHeight += 1;
                        HeightManager.Paint();
                        this.CalculateScore(5);
                        FallManager.Reset();
                        let total_dis = 10;
                        let temp_interval = setInterval(() => {
                            camera.position.z += 0.25;
                            planeWall.position.z += 0.25;
                            total_dis -= 0.5;
                            if(total_dis === 0){
                                clearInterval(temp_interval);
                                GenerateManager.GenerateCube();
                            }
                        }, 25);
                    } else {
                        if(Math.abs(fallingCube.position.x
                                - this.Building[this.Building.length - 1].position.x) >= 10){
                            FallManager.canUse = false;
                        } else if (Math.abs(fallingCube.position.x
                                - this.Building[this.Building.length - 1].position.x) < 5) {
                            let distance = Math.floor(fallingCube.position.x
                                - this.Building[this.Building.length - 1].position.x);
                            distance += distance < 0 ? 1 : 0;
                            fallingCube.position.x = this.Building[this.Building.length - 1].position.x
                                + distance;
                            this.Building[this.Building.length] = fallingCube;
                            fallingCube.position.z = 10 * TotalHeight + 5;
                            ComboManager.CheckCombo(distance === 0);
                            TotalHeight += 1;
                            HeightManager.Paint();
                            this.CalculateScore(distance);
                            FallManager.Reset();
                            let total_dis = 10;
                            let temp_interval = setInterval(() => {
                                camera.position.z += 0.25;
                                planeWall.position.z += 0.25;
                                total_dis -= 0.25;
                                if(total_dis === 0){
                                    clearInterval(temp_interval);
                                    if(TotalHeight === mode * 10){
                                        if(ComboManager.comboTime > 0)
                                            ComboManager.EndCombo();
                                        InBuild = false;
                                        setTimeout(() => {
                                            EndBuildTower();
                                        }, 2000);
                                    } else {
                                        GenerateManager.GenerateCube();
                                    }
                                }
                            }, 25);
                        } else {
                            if(ComboManager.comboTime > 0)
                                ComboManager.EndCombo();
                            isGolden = false;
                            this.Damage(this.Building.length - 1);
                            if (!LifeManager.loseLife()){
                                GenerateManager.GenerateCube();
                            }
                        }
                    }
                }
            } else {
                let floor = Math.floor((fallingCube.position.z - 5) / 10);
                if(floor < this.Building.length && floor >= 0
                    && Math.abs(this.Building[floor].position.x - fallingCube.position.x) < 10
                    && Math.abs(this.Building[floor].position.z - fallingCube.position.z) < 10){
                    if(ComboManager.comboTime > 0)
                        ComboManager.EndCombo();
                    isGolden = false;
                    this.Damage(floor);
                    if (!LifeManager.loseLife()){
                        GenerateManager.GenerateCube();
                    }
                } else if (floor + 1 < this.Building.length && floor >= -1
                    && Math.abs(this.Building[floor + 1].position.x - fallingCube.position.x) < 10
                    && Math.abs(this.Building[floor + 1].position.z - fallingCube.position.z) < 10){
                    if(ComboManager.comboTime > 0)
                        ComboManager.EndCombo();
                    isGolden = false;
                    this.Damage(floor + 1);
                    if (!LifeManager.loseLife()){
                        GenerateManager.GenerateCube();
                    }
                }
            }
        },
        Damage : function (index) {
            if(index === 0)
                index = 1;
            while(index < this.Building.length && this.Building[index].position.x ===
            this.Building[index - 1].position.x){
                index += 1;
            }
            TotalHeight -= this.Building.length - index;
            HeightManager.Paint();
            camera.position.z -= 10 * (this.Building.length - index);
            planeWall.position.z -= 10 * (this.Building.length - index);
            for(let i = index; i < this.Building.length; ++i){
                scene.remove(this.Building[i]);
                TotalPeople -= this.score[i];
                PeopleManager.Paint();
            }
            this.Building.splice(index, this.Building.length - index);
            this.score.splice(index, this.Building.length - index);
            scene.remove(FallManager.myCube);
            FallManager.Reset();
        },
        CalculateScore : function (distance) {
            if(TotalHeight === 10 * mode){
                const RoofPeople = [34, 46, 68, 136];
                const GoldenPeople = [68, 132, 196, 260];
                TotalPeople += Math.floor(((isGolden && hasGolden) ? GoldenPeople[mode - 1] : RoofPeople[mode - 1]) *
                    (1 - Math.abs(distance) / 5));
                PeopleManager.Paint();
            } else {
                let type = 4 - Math.abs(distance);
                if(type === 2 || type === 1)
                    type = 2;
                else if (type === 0)
                    type = 1;
                else if(type === -1)
                    type = 0;
                let score = type + Math.floor(TotalHeight / 10);
                this.score.push(score);
                TotalPeople += score;
                PeopleManager.Paint();
            }
        },
        Reset : function () {
            for(let i = 0; i < this.Building.length; ++i)
                scene.remove(this.Building[i]);
            this.Building = [];
            this.score = [];
        }
    };

    let LifeManager = {
        life : 0,
        initLife : function () {
            if(isGod)
                this.life = -1;
            else
                this.life = 3;
        },
        Reset : function () {
            this.life = 0;
        },
        Paint : function () {
            if(!isGod){
                life_ctx.clearRect(0, 0, life_c.width, life_c.height);
                let RectLength = life_c.height / 30;
                life_ctx.fillStyle = CubeColor[mode];
                life_ctx.strokeStyle = "#000000";
                life_ctx.lineWidth = 1;
                PaintRect(life_ctx, 3 * RectLength, life_c.height - 5 * RectLength
                    , RectLength, RectLength, this.life >= 3);
                PaintRect(life_ctx, 3 * RectLength, life_c.height - 4 * RectLength
                    , RectLength, RectLength, this.life >= 2);
                PaintRect(life_ctx, 3 * RectLength, life_c.height - 3 * RectLength
                    , RectLength, RectLength, this.life >= 1);
            }
        },
        loseLife : function () {
            if(this.life !== -1){
                this.life -= 1;
                this.Paint();
                if(this.life === 0)
                {
                    InBuild = false;
                    setTimeout(() => {
                        EndBuildTower();
                    }, 2000);
                    return true;
                }
            }
            return false;
        }
    };

    let ComboManager = {
        comboTime : 0,
        comboScore : 0,
        comboNumber : 0,
        comboInterval : undefined,
        Reset : function () {
            this.comboTime = 0;
            this.comboScore = 0;
            this.comboNumber = 0;
            this.comboInterval = undefined;
        },
        BeginCombo : function () {
            this.comboTime = 7000;
            if(this.comboInterval !== undefined)
                clearInterval(this.comboInterval);
            this.comboInterval = setInterval(() => {
                this.comboTime -= 50 * Math.min(5, (this.comboNumber + 1) / 2);
                this.Paint();
                if(this.comboTime <= 0){
                    this.EndCombo();
                }
            }, 50)
        },
        Paint : function (clear) {
            combo_ctx.clearRect(0, 0, combo_c.width, combo_c.height);
            if(clear === true || this.comboTime <= 0)
                return;
            let width = combo_c.height / 3;
            width = width > (combo_c.width / 2) ? combo_c.width / 2 : width;
            let height = width / 10;
            let real_width = width * (this.comboTime > 0 ? this.comboTime : 0) / 7000;
            combo_ctx.fillStyle = "#FFFF00";
            combo_ctx.strokeStyle = "#000000";
            combo_ctx.lineWidth = 1;
            combo_ctx.fillRect(combo_c.width / 2 - width / 2, combo_c.height / 6, real_width, height);
            combo_ctx.beginPath();
            combo_ctx.moveTo(combo_c.width / 2 - width / 2, combo_c.height / 6);
            combo_ctx.lineTo(combo_c.width / 2 + width / 2, combo_c.height / 6);
            combo_ctx.lineTo(combo_c.width / 2 + width / 2, combo_c.height / 6 + height);
            combo_ctx.lineTo(combo_c.width / 2 - width / 2, combo_c.height / 6 + height);
            combo_ctx.lineTo(combo_c.width / 2 - width / 2, combo_c.height / 6);
            combo_ctx.stroke();
            combo_ctx.closePath();
            combo_ctx.font = String(height) + "px Arial";
            combo_ctx.fillText("Combo " + this.comboNumber.toString(),
                combo_c.width / 2 + width / 2 + height, combo_c.height / 6 + height)
        },
        CheckCombo : function (isPerfect) {
            if(isPerfect === true){
                this.comboNumber += 1;
                this.comboScore += (Math.floor(TotalHeight / 10) * 2 + 2) * this.comboNumber;
                this.BeginCombo();
            } else if(this.comboTime > 0) {
                this.comboNumber += 1;
                this.comboScore += (Math.floor(TotalHeight / 10) * 2 + 2) * this.comboNumber;
            }
        },
        EndCombo : function () {
            clearInterval(this.comboInterval);
            TotalPeople += this.comboScore;
            PeopleManager.Paint();
            MaxCombo = Math.max(MaxCombo, this.comboNumber);
            this.Paint(true);
            this.Reset();
        }
    };

    let HeightManager = {
        Paint : function () {
            height_ctx.clearRect(0, 0, height_c.width, height_c.height);
            let RectLength = height_c.height / 30;
            height_ctx.fillStyle = CubeColor[mode];
            height_ctx.strokeStyle = "#000000";
            height_ctx.lineWidth = 1;
            if(mode === 0){
                height_ctx.fillRect(RectLength, height_c.height - 7 * RectLength
                    , RectLength, 5 * RectLength);
            }else{
                height_ctx.fillRect(RectLength
                    , height_c.height - 7 * RectLength + (1 - TotalHeight / (mode * 10)) * 5 * RectLength
                    , RectLength, TotalHeight / (mode * 10) * 5 * RectLength);
            }
            height_ctx.beginPath();
            height_ctx.moveTo(RectLength, height_c.height - 7 * RectLength);
            height_ctx.lineTo(2 * RectLength, height_c.height - 7 * RectLength);
            height_ctx.lineTo(2 * RectLength, height_c.height - 2 * RectLength);
            height_ctx.lineTo(RectLength, height_c.height - 2 * RectLength);
            height_ctx.lineTo(RectLength, height_c.height - 7 * RectLength);
            height_ctx.stroke();
            height_ctx.closePath();
            height_ctx.fillStyle = "#000000";
            height_ctx.font = String(RectLength) + "px Arial";
            height_ctx.fillText(TotalHeight.toString(), RectLength,
                height_c.height - 7.5 * RectLength)
        }
    };

    let PeopleManager = {
        Paint : function () {
            people_ctx.clearRect(0, 0, people_c.width, people_c.height);
            let RectLength = height_c.height / 30;
            people_ctx.fillStyle = "#000000";
            people_ctx.font = String(RectLength) + "px Arial";
            people_ctx.fillText("People  " + TotalPeople.toString(), people_c.width - 7 * RectLength,
                people_c.height - 2 * RectLength)
        }
    };


    function ResizeScreen() {
        let width = document.getElementById("canvas-frame").getBoundingClientRect().width;
        let height = document.getElementById("canvas-frame").getBoundingClientRect().height;
        life_c.width = width;
        life_c.height = height;
        combo_c.width = width;
        combo_c.height = height;
        height_c.width = width;
        height_c.height = height;
        people_c.width = width;
        people_c.height = height;
    }

    function PaintRect(ctx, x, y, width, height, fill) {
        if(fill === true)
            ctx.fillRect(x, y, width, height);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
    }


    function animate() {
        GenerateManager.move();
        FallManager.move();
        render();
        requestAnimationFrame( animate );
    }

    function render() {
        renderer.render( scene, camera );
    }

    EnvironmentManager.threeStart();
    ResizeScreen();
    LifeManager.Paint();
    HeightManager.Paint();
    PeopleManager.Paint();

    function generateTexture(color) {
        let canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 8;
        let context = canvas.getContext( '2d' );
        context.fillStyle = color;
        context.fillRect(0, 0, 8, 8);
        return canvas;
    }


//当前的游戏状态？0表示开始界面，1表示等待建造，2表示建造完成后进行的结算，3表示正在建造中，



	let gameStatus = 0;

	let width = 0;
	let height = 0;

	let colors=['blue', 'red', 'green', 'yellow'];
    let houses=['商业摩天楼','办公摩天楼','豪华摩天楼','住宅摩天楼'];
	//画布定义
	let mainCv = document.getElementById("mainCanvas").getContext('2d');
	let leftCv = document.getElementById("leftCanvas").getContext('2d');
	let levelCv = document.getElementById("levelCanvas").getContext('2d');
	let populationCv = document.getElementById("populationCanvas").getContext('2d');
	let compareCv = document.getElementById("compareCanvas").getContext('2d');
	let groundCv = document.getElementById("groundCanvas").getContext('2d');
	let houseCv = document.getElementById("houseCanvas").getContext('2d');
	let prepareCv = document.getElementById("prepareCanvas").getContext('2d');

    let formerPos = 0;//(0表示是从city建造，1表示是从quickgame建造)
	//开始页面设置的类，绑定基础的视图
	function gameStart(canv){
		this.currStatus = 0;//0表示正在首页，1表示正在查看帮助,2表示正在查看高分榜
		this.currPos = 0;//当前如果处于开始界面的光标位置
		this.canvas = canv;//可能存在的画布
		this.minPos = 0;
		this.change();
	}

	gameStart.prototype={
		constructor:gameStart,
        reNew:function(TotalHeight, TotalPeople,MaxCombo){
            //TODO展示结果
            document.getElementById("frame").removeAttribute("hidden");
            document.getElementById("text").removeAttribute("hidden");
            document.getElementById("foot").removeAttribute("hidden");
            document.getElementById("open").setAttribute("hidden", "true");
            document.getElementById("text").innerHTML = "人口总数："+TotalPeople+"<br />楼房高度："+TotalHeight+"<br />最大连击数："+MaxCombo;
            //从建造处获取本次快速建造的成绩
            gameStatus = 0;
             //更新高分榜
            let qStr = localStorage.getItem("quickScores");
            let qS = JSON.parse(qStr);
            if(qS == undefined){
                qS = [[0,0],[0,0],[0,0]];
            }
            qS.push([TotalPeople,TotalHeight]);
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
            //结束快速模式之后返回"帮助界面"
            this.currStatus = 1;
        },
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
					let cScore = JSON.parse(localStorage.getItem("cityScore"));
                    if(cScore == null){
                        cScore = 0;
                    }
					document.getElementById("citymax").innerHTML = "最高分："+cScore;
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
					document.getElementById("frame").setAttribute("hidden", "true");
					document.getElementById("p1").setAttribute("class", "start");
					document.getElementById("p"+this.minPos).setAttribute("class", "selected");
					gameStatus = 3;
                    formerPos = 1;
					let result = BuildTower(0, false);
					
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

        alert:function(str){
            this.alerting = true;
            document.getElementById("text").innerHTML = str+"<br />按下空格键继续";
        },

        levelChange:function(){
            let isLvUp = false;
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
                isLvUp = true;
                //this.alert("恭喜您！城市升级到了"+i+"级城市！距离超大城市的梦想又近了一步！");
            }
            this.cityLevel = i;
            return isLvUp;
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
            if(this.alerting === false){
                document.getElementById("text").innerHTML = this.currentInfo();
            }
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
            this.levelChange();//
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
            let strArr=[houses[0]+"：可建造在任何位置",houses[1]+"：必须与"+houses[0]+"相邻",houses[2]+"：必须与"+houses[0]+"和"+houses[1]+"相邻",houses[3]+"：必须与上述三种楼相邻"];
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
                    let str = "";
                    house.people = this.currPeople;
                    house.type = this.currHouse;
                    house.isGood = this.isGood;
                    house.isGold = this.isGold;
                    let formerAble = this.currentAble();
                    let formerChallenge = this.challengeAble();
                    if(this.arr[this.currX][this.currY]== null){
                        this.total += this.currPeople;
                        str += "城市的总人口增加了"+this.currPeople;
                    }
                    else{
                        let formerPeople = this.arr[this.currX][this.currY].people;
                        if(this.currPeople >= formerPeople){
                            str += "城市的总人口增加了"+(this.currPeople-formerPeople);
                        }else{
                            str += "城市的总人口减少了"+(formerPeople-this.currPeople);
                        }
                        this.total = this.total + this.currPeople - formerPeople;
                    }
                    //更新历史高分记录
                    let formerScore = JSON.parse(localStorage.getItem("cityScore"));
                    if(formerScore == null || this.total > formerScore){
                        let totalStr = JSON.stringify(this.total);
                        localStorage.setItem("cityScore",totalStr);
                    }

                    this.arr[this.currX][this.currY] = house;
                    this.currX = 0;
                    this.currY = 0;
                    this.currHouse = 0;
                    this.currPeople = 0;
                    gameStatus = 1;
                    if(this.levelChange() === true){
                        str += "<br /> 恭喜您！城市升级到了第"+this.cityLevel+"级城市！";
                        if(this.cityLevel === 20){
                            str += "您已成功实现超大城市的梦想！！！祝贺您！";
                        }else{
                            str += "您离超大城市的梦想更近了一步！";
                        }
                    }
                    if(this.currentAble() > formerAble){
                        str += "<br />恭喜您！您已解锁"+houses[this.currentAble()]+"的建造";
                    }
                    if(this.challengeAble() > formerChallenge){
                        str += "<br />恭喜您！您已解锁"+houses[this.challengeAble()]+"的高分挑战！";
                    }
                    this.alert(str);
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
                    this.infoRepaint();
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
                                gameStatus = 3;
                                document.getElementById("frame").setAttribute("hidden", "true");
                                document.getElementById("canvs").setAttribute("hidden", "true");
                                formerPos = 0;
                                let result = BuildTower(this.currHouse + 1, false);
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
        },
        setValue:function(TotalHeight, TotalPeople, MaxCombo,isGolden){
            //建造好之后的处理
            gameStatus = 2;
            document.getElementById("frame").removeAttribute("hidden");
            document.getElementById("canvs").removeAttribute("hidden");
            this.currPeople = TotalPeople;
            if(TotalHeight < (this.currHouse+1)*10){
                this.isGood = false;
            }
            else{
                this.isGood = true;
            }
            this.isGold = isGolden;
            this.alert("总人口："+TotalPeople+"<br />楼房高度:"+TotalHeight+"<br />最大连击数："+MaxCombo);
            this.initPaint();
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

    function yitao(TotalHeight, TotalPeople, MaxCombo, isGolden) {
        if(formerPos === 0){
            gS.city.setValue(TotalHeight, TotalPeople, MaxCombo,isGolden);
        }else if(formerPos === 1){
            gS.reNew(TotalHeight, TotalPeople,MaxCombo);
        }
    }

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

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        ResizeScreen();
        LifeManager.Paint();
        ComboManager.Paint();
        HeightManager.Paint();
        PeopleManager.Paint();
        render();
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
        if(InBuild){
            if(event.keyCode === 32) {
                if(GenerateManager.myCube !== undefined){
                    FallManager.myCube = GenerateManager.myCube;
                    FallManager.arg = GenerateManager.arg;
                    FallManager.speed = (0.2 - Math.abs(GenerateManager.arg / 150))
                        * (GenerateManager.point ? 1 : -1);
                    GenerateManager.Reset();
                }
            }
        }
        else{
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
        }
	}
})(window);