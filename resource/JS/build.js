// import * as THREE from "three";

(function (window) {
    let InBuild = false;
    let renderer, camera, scene, light, controls;
    let width = document.getElementById('canvas-frame').clientWidth;
    let height = document.getElementById('canvas-frame').clientHeight;
    let TotalHeight = 0, MaxCombo = 0, TotalPeople = 0;

    function BuildTower() {
        InBuild = true;
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
            // renderer.setClearColor(0xFFFFFF, 1.0);
        },
        initCamera : function() {
            camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
            camera.position.x = 0;
            camera.position.y = 100;
            camera.position.z = 0;
            camera.up.x = 0;
            camera.up.y = 0;
            camera.up.z = 1;
            camera.lookAt({
                x : 0,
                y : 0,
                z : 0
            });
            camera.position.z = 30;
        },
        initScene : function() {
            scene = new THREE.Scene();
        },
        initLight : function() {
            light = new THREE.AmbientLight(0xFF0000);
            scene.add(light);
        },
        initObject : function() {
            let geometry = new THREE.Geometry();
            let material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors} );
            let color1 = new THREE.Color( 0x0000CD), color2 = new THREE.Color( 0xFF0000 );

            // 线的材质可以由2点的颜色决定
            let p1 = new THREE.Vector3( -10, 0, 10 );
            let p2 = new THREE.Vector3(  10, 0, 20 );
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.colors.push( color1, color2 );

            let line = new THREE.Line( geometry, material, THREE.LineSegments );
            scene.add(line);

            let planeGeometryFloor = new THREE.PlaneGeometry(400, 200);
            let planeMaterialFloor = new THREE.MeshBasicMaterial({color: 0xcccccc});
            let planeFloor = new THREE.Mesh(planeGeometryFloor, planeMaterialFloor);
            planeFloor.position.y = 50;
            scene.add(planeFloor);

            let planeGeometryWall = new THREE.PlaneGeometry(400, 1000);
            let planeMaterialWall = new THREE.MeshBasicMaterial({color: 0x87CEFF});
            let planeWall = new THREE.Mesh(planeGeometryWall, planeMaterialWall);
            planeWall.rotation.x = -0.5 * Math.PI;
            planeWall.position.y = -50;
            planeWall.position.z = 500;
            scene.add(planeWall);
        },
        threeStart : function() {
            this.initThree();
            this.initCamera();
            this.initScene();
            this.initLight();
            this.initObject();

            //测试代码
            controls = new THREE.TrackballControls( camera );
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            controls.keys = [ 65, 83, 68 ];
            controls.addEventListener( 'change', render );
            animate();
            //测试结束

            render();
        },
    };

    function render() {
        renderer.clear();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function animate() {
        requestAnimationFrame( animate );
        controls.update();
    }

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        controls.handleResize();
        render();
    }
    EnvironmentManager.threeStart();

    window.EndBuildTower = EndBuildTower;
    window.BuildTower = BuildTower;
})(window);