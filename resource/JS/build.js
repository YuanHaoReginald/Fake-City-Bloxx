// import * as THREE from "three";

// (function (window) {
    let InBuild = true;
    let renderer, camera, scene, light;
    let width = document.getElementById('canvas-frame').clientWidth;
    let height = document.getElementById('canvas-frame').clientHeight;
    let TotalHeight = 0, MaxCombo = 0, TotalPeople = 0;
    let mode, isGod;
    let planeFloor, planeWall;
    let isGolden = false;

    let life_c = window.document.getElementById("LifeCanvas");
    let life_ctx = life_c.getContext('2d');
    let combo_c = window.document.getElementById("ComboCanvas");
    let combo_ctx = combo_c.getContext('2d');
    let height_c = window.document.getElementById("HeightCanvas");
    let height_ctx = height_c.getContext('2d');

    const CubeColor = ["#EEAD0E", "#00BFFF", "#FF3030", "#00EE00", "#EEEE00"];

    function BuildTower(mode_var, isGod_var) {
        mode = mode_var || 1;
        isGod = (isGod_var === true);
        InBuild = true;
        GenerateManager.initCube();
        LifeManager.initLife();
        LifeManager.Paint();
        document.getElementById("canvas-frame").style.visibility = "visible";
    }

    function EndBuildTower() {
        // document.getElementById("canvas-frame").style.visibility = "hidden";
        console.log("Finish Building");
        InBuild = false;
    }

    let EnvironmentManager = {
        initThree : function() {
            renderer = new THREE.WebGLRenderer({
                alpha : true,
            });
            renderer.setSize(width, height);
            document.getElementById('canvas-frame').appendChild(renderer.domElement);
            renderer.domElement.style.zIndex = 0;
        },
        initCamera : function() {
            camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
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
                const line = [70, 450, 1300, 3000];
                if(TotalPeople >= line[mode - 1]){
                    isGolden = true;
                }
                if(isGolden){
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
        },
        Reset : function () {
            // scene.remove(this.myCube);
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
                        camera.position.z += 10;
                        planeWall.position.z += 10;
                        FallManager.Reset();
                        GenerateManager.GenerateCube();
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
                            camera.position.z += 10;
                            planeWall.position.z += 10;
                            FallManager.Reset();
                            GenerateManager.GenerateCube();
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
            console.log(index, this.Building.length);
            TotalHeight -= this.Building.length - index;
            HeightManager.Paint();
            camera.position.z -= 10 * (this.Building.length - index);
            planeWall.position.z -= 10 * (this.Building.length - index);
            for(let i = index; i < this.Building.length; ++i){
                scene.remove(this.Building[i]);
                TotalPeople -= this.score[i];
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
                TotalPeople += Math.floor((isGolden ? GoldenPeople[mode - 1] : RoofPeople[mode - 1]) *
                    (1 - distance / 5));
            } else {
                let type = 4 - Math.abs(distance);
                if(type === 2 || type === 1)
                    type = 2;
                else if (type === 0)
                    type = 1;
                else if(type === -1)
                    type = 0;
                let score = type + Math.floor(TotalHeight / 10);
                console.log(score, type, Math.floor(TotalHeight / 10));
                this.score.push(score);
                TotalPeople += score;
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
                    EndBuildTower();
                    return true;
                }
                return false;
            }
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
            // console.log(real_width);
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
                height_c.height - 8 * RectLength)
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

    window.onkeydown = function (event) {
        if(InBuild){
            if(37 <= event.keyCode && event.keyCode <= 40){
                // planeWall.position.z += 100;
                switch (event.keyCode){
                    case 37:
                        camera.position.x += 10;
                        break;
                    case 38:
                        camera.position.z += 10;
                        break;
                    case 39:
                        camera.position.x -= 10;
                        break;
                    case 40:
                        camera.position.z -= 10;
                        break;
                }
            } else if(event.keyCode === 32) {
                if(GenerateManager.myCube !== undefined){
                    FallManager.myCube = GenerateManager.myCube;
                    FallManager.arg = GenerateManager.arg;
                    FallManager.speed = (0.2 - Math.abs(GenerateManager.arg / 150))
                        * (GenerateManager.point ? 1 : -1);
                    GenerateManager.Reset();
                }
            }
        }
    };


    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        ResizeScreen();
        LifeManager.Paint();
        ComboManager.Paint();
        HeightManager.Paint();
        render();
    }
    EnvironmentManager.threeStart();
    ResizeScreen();
    LifeManager.Paint();
    HeightManager.Paint();

    function generateTexture(color) {
        let canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 8;
        let context = canvas.getContext( '2d' );
        context.fillStyle = color;
        context.fillRect(0, 0, 8, 8);
        return canvas;
    }

// })(window);