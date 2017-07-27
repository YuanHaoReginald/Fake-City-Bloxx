// import * as THREE from "three";

// (function (window) {
    let InBuild = true;
    let renderer, camera, scene, light;
    let width = document.getElementById('canvas-frame').clientWidth;
    let height = document.getElementById('canvas-frame').clientHeight;
    let TotalHeight = 0, MaxCombo = 0, TotalPeople = 0;
    let mode, isGod;
    let planeFloor, planeWall;
    const CubeColor = ["#EEAD0E", "#00BFFF", "#FF3030", "#00EE00", "#EEEE00"];

    function BuildTower(mode_var, isGod_var) {
        mode = mode_var || 1;
        isGod = (isGod_var === true);
        InBuild = true;
        GenerateManager.initCube();
        document.getElementById("canvas-frame").style.visibility = "visible";
    }

    function EndBuildTower() {
        document.getElementById("canvas-frame").style.visibility = "hidden";
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
        },
        initCamera : function() {
            camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
            camera.position.x = 0;
            camera.position.y = 100;
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
            this.myCube = new THREE.Mesh(this.geometry, this.meshFaceMaterial );
            this.myCube.position.z = TotalHeight * 10 + 35;
            scene.add(this.myCube);
        },
        Reset : function () {
            scene.remove(this.myCube);
            this.myCube = undefined;
            this.arg = 0;
            this.point = true;
        },
        move : function () {
            if(typeof this.myCube !== 'undefined') {
                this.arg += this.point ? 1 : -1;
                if (this.arg === 30 || this.arg === -30)
                    this.point = !this.point;
                this.myCube.rotation.y = -this.arg * Math.PI / 360;
                this.myCube.position.x = 50 * Math.sin(this.arg * Math.PI / 360);
                this.myCube.position.z = 85 - 50 * Math.cos(this.arg * Math.PI / 360);
            }
        }
    };

    function animate() {
        GenerateManager.move();

        render();
        requestAnimationFrame( animate );
    }

    function render() {
        renderer.render( scene, camera );
    }

    window.onkeydown = function (event) {
        if(InBuild){
            if(37 <= event.keyCode <= 40){
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
            }
        }
    };



    //以下非正式代码
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }
    EnvironmentManager.threeStart();

    function generateTexture(color) {
        let canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 8;
        let context = canvas.getContext( '2d' );
        context.fillStyle = color;
        context.fillRect(0, 0, 8, 8);
        return canvas;
    }

// })(window);