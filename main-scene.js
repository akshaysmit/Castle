class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, -500, -3000]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 15000);

        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
        // design.  Once you've told the GPU what the design of a cube is,
        // it would be redundant to tell it again.  You should just re-use
        // the one called "box" more than once in display() to draw
        // multiple cubes.  Don't define more than one blueprint for the
        // same thing here.
        const shapes = {
            'ground': new Square(),
            'sky': new Subdivision_Sphere(4, 1),
            'circle': new Circle(15),
            'pyramid': new Tetrahedron(false),
            'simplebox': new SimpleCube(),
            'box': new SimpleCube(),
            'cylinder': new Cylinder(15),
            'cone': new Cone(20),
            'ball': new Subdivision_Sphere(4, 0),
            //'ellipsoid': new Ellipsoid(20, 20, 10, 5),
            'torus': new Torus(20, 30, 10, 3),
            'dome1': new Bezier4_rot(10, 20, Vec.of(2,0,0), Vec.of(10.85,2.93,0), 
                Vec.of(5.83,6.84,0), Vec.of(0,15,0)),
            'wide_dome':new Bezier4_rot(10, 20, Vec.of(2,0,0), Vec.of(14.96,3.7,0), 
                Vec.of(15.25,11.2,0), Vec.of(0,15,0)),
            'square': new Square(),
            'jagged_pillar': new jagged_pillar(30, 10, 5),

            //FLAT SHADED CUSTOM POLYGON. Syntax to create it is funky
            'curved_main_sec': new (new Bezier4_rot(10, 20, Vec.of(10,0,0), Vec.of(10.4,6.34,0),
                 Vec.of(10.5,18.7,0), Vec.of(0,20,0)).make_flat_shaded_version()) (
                 10, 20, Vec.of(10,0,0), Vec.of(10.4,6.34,0),
                 Vec.of(10.5,18.7,0), Vec.of(0,20,0)),
                 
            'mobius': new mobius_strip(5, 25),
            'BearBodyType2': new Bezier4_rot(20, 30, Vec.of(4.6,0,0), Vec.of(7.45,3.45,0), 
                Vec.of(4,5,0), Vec.of(2.6,10,0)),
            'BearLegType2' : new Bezier4_rot(20, 30, Vec.of(1.84,12.05,0), Vec.of(4.5,10.4,0), 
                Vec.of(0.98,4.42,0), Vec.of(1.64,-0.1,0)),
            'BearLeg2Type2' : new Bezier4_rot(20, 30, Vec.of(2.83,12.6,0), Vec.of(5.64,9.33,0), 
                Vec.of(1.27,4.33,0), Vec.of(2.6,0.5,0)),
            'Wing1' : new TriangleGeneral(0,0,-2,0,0,5),
            'Wing2' : new TriangleGeneral(-2,0,0,5,-3,6),
            'Wing3' : new TriangleGeneral(-2,0,-3,6,-6,9),
            'Wing4' : new TriangleGeneral(-2,0,-5,2,-6,9),
            'Wing5' : new TriangleGeneral(-5,2,-6,9,-7,0),
            'Wing6' : new TriangleGeneral(-6,9,-7,0,-10,2),
            'Wing7' : new TriangleGeneral(-6,9,-10,2,-12,2),
            'Wing8' : new TriangleGeneral(-6,9,-12,2,-12,5)
        }
        this.submit_shapes(context, shapes);
        this.shape_count = Object.keys(shapes).length;

        

        // Make some Material objects available to you:
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        this.texture_base = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: 1,
            diffusivity: 0.4,
            specularity: 0.3
        });

        //create a material object that stores textures for brick normal map
        //texture is the original image, normal_texture is the corresponding normal map 
        //YOU MUST CREATE THIS TYPE OF MATERIAL FOR NORMAL MAPPING
        this.brick_normal_material = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: .4,
            diffusivity: .4,
            specularity: .8,
            normal_map: 1,
            texture: context.get_instance("assets/grey_bricks.jpg"),
            normal_texture: context.get_instance("assets/grey_bricks_NRM.png")
        });

        this.red_brick_normal_material = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: .7,
            diffusivity: .4,
            specularity: .8,
            normal_map: 1,
            texture: context.get_instance("assets/red_brick.jpg"),
            normal_texture: context.get_instance("assets/red_brick_NRM.png")
        });

        this.oolong_normal_material = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: .4,
            diffusivity: .4,
            specularity: .8,
            normal_map: 1,
            texture: context.get_instance("assets/oolong.jpg"),
            normal_texture: context.get_instance("assets/oolong_NRM.png")
        });

        this.ucla_material = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: .4,
            diffusivity: .4,
            specularity: .8,
            normal_map: 1,
            texture: context.get_instance("assets/ucla.png"),
            normal_texture: context.get_instance("assets/ucla_NRM.png")
        });

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            ground: "assets/sand.png",
            marble1: "assets/marble1.jpg",
            marble2: "assets/marble2.png",
            granite: "assets/granite.jpg",
            gravel: "assets/gravel.png",
            sky: "assets/sky.jpg",
            BearBodyType2: "assets/bear_brown.jpg"

        };
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });
        
        this.lights = [new Light(Vec.of(0, 1000, 1000, 1), Color.of(1, 1, 1, 1), 2000000)]; //originally (1,1,0.4,1)

        this.grey = Color.of(0.560, 0.541, 0.541,1);
        this.blue = Color.of(0, 0, 1, 1);
        this.yellow = Color.of(1, 1, 0, 1);
        this.red = Color.of(1, 0, 0, 1);
        this.white = Color.of(1, 1, 1, 1);
        this.black = Color.of(0, 0, 0, 1);
        this.t = 0;
        this.moustache = Color.of(0,0,0,1);
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
    }

    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        let m = Mat4.identity();

        //do the animation. UNCOMMENT LINE BELOW TO DISABLE ANIMATION
        this.animation(graphics_state, t);

        //draw ground
        this.draw_ground(graphics_state);

        //draw the buildings
        this.draw_large_castle_section(graphics_state, m);

        //torus in the front
        let S = Mat4.scale(Vec.of(8, 8, 8));
        let T = Mat4.translation(Vec.of(0, -15, 1000));
        this.draw_torus(graphics_state, m.times(T).times(S));
    }

    animation(graphics_state, t) {
         //Here we create the animation 
        //Do not delete these time values. They are required by bear_type2 function
        let speed = 150
        let T1 = 20 //wait for loading
        let T2 = 30 //follow flying bear
        let T3 = 35 //focus on the center
        let T4 = 83 //rotation 
        let T5 = 90 //zoom in
      
        let T_bear_Start = Mat4.translation(Vec.of(-2500,700,0));
        let R_bear_start = Mat4.rotation(1*Math.PI/2, Vec.of(0,1,0)).times(Mat4.rotation(-Math.PI*0.3,Vec.of(-1,0,0)));
 
        
        if (t<T2 && t>T1){
            T_bear_Start = Mat4.translation(Vec.of((t-T1)*speed-2500,700,0));
            R_bear_start = Mat4.rotation(1*Math.PI/2, Vec.of(0,1,0)).times(Mat4.rotation(-Math.PI*0.3,Vec.of(-1,0,0)));
        }

        else if (t>T2){
            T_bear_Start = Mat4.translation(Vec.of((t-T1)*speed-2500,700,speed*(t-T2)));
            R_bear_start = (Mat4.rotation(-Math.PI/4,Vec.of(0,1,0))).times(Mat4.rotation(1*Math.PI/2, Vec.of(0,1,0))).times(Mat4.rotation(-Math.PI*0.3,Vec.of(-1,0,0)));
        }

               
        let M_bear_start = T_bear_Start.times(R_bear_start);
        
        if (t<T1){                   //wait for load
            graphics_state.camera_transform = Mat4.look_at(Vec.of(-4000,1100,0), Vec.of(-2500,700,0), Vec.of(0,1,0));    
        }

        else if (t<T2){              //follow bear
            graphics_state.camera_transform = Mat4.look_at(Vec.of((t-T1)*speed-4000,1100,0), Vec.of((t-T1)*speed-2500,700,0), Vec.of(0,1,0));    
        }
        
        else if (t<T3){              //focus
            graphics_state.camera_transform = Mat4.look_at(Vec.of((T2-T1)*speed-4000,1100,0), 
                Vec.of(((T2-T1)*speed-2500)*(T3-t)/(T3-T2),700-500*(t-T2)/(T3-T2),0), Vec.of(0,1,0));    
        }

        else if(t<T4){               //rotate
            let center = Vec.of((T2-T1)*speed-4000,1100,0);
            let radius = 4000-(T2-T1)*speed;
            graphics_state.camera_transform = Mat4.look_at(Vec.of(radius*Math.cos((t-T3)/10+Math.PI),1100,radius*Math.sin((t-T3)/10+Math.PI)), Vec.of(0,0,200), Vec.of(0,1,0));
                      
        }
        else if (t<T5) {             //zoom in
            let up = Vec.of(0,1,0);
            let radius = 4000-(T2-T1)*speed;
            let ref = Vec.of(0,100,-200);
            let old_eye = Vec.of(radius*Math.cos((T4-T3)/10+Math.PI),1100,radius*Math.sin((T4-T3)/10+Math.PI));
            let new_eye = old_eye.plus(Vec.of(0,0,1.7*speed*(-(t-T4))));
            graphics_state.camera_transform = Mat4.look_at(new_eye, ref, up);
        }
       
        //draw bear
        let textureBear = 'BearBodyType2';
        this.bear_type2(graphics_state, M_bear_start, speed,this.t, textureBear,T1,T2,T3,T4);

    }

    //time steps
    leg_f1(graphics_state, t,speed){
        return Math.sin(t/2)/8;
                
    }
    leg_f2(graphics_state, t,speed){
        return 0;
    }

    //draws a large number of buildings in appropriate positions
    draw_large_castle_section(graphics_state, m) {
        let T = Mat4.translation(Vec.of(0, 0, 0));
        let S = Mat4.scale(Vec.of(1.5, 1.5, 1.5));

        //middle castle
        this.draw_house_with_barriers(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(0, 150, 0));
        this.draw_two_story_house_with_pillars(graphics_state, m.times(T).times(S));

        S = Mat4.scale(Vec.of(1.5, 1.5, 1.5));
        T = Mat4.translation(Vec.of(460, 0, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(-460, 0, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));

        //corner of map buildings
        S = Mat4.scale(Vec.of(2,2,2));
        T = Mat4.translation(Vec.of(-800, 22, 800));
        this.draw_level_building(graphics_state, m.times(T).times(S));

        T = Mat4.translation(Vec.of(800, 22, 800));
        this.draw_level_building(graphics_state, m.times(T).times(S));

        T = Mat4.translation(Vec.of(-800, 22, -800));
        this.draw_level_building(graphics_state, m.times(T).times(S));

        T = Mat4.translation(Vec.of(800, 22, -800));
        this.draw_level_building(graphics_state, m.times(T).times(S));


        
    
        //house with barriers next to middle castle
        T = Mat4.translation(Vec.of(600, 0, 500));
        S = Mat4.scale(Vec.of(1, 1, 1));
        let R = Mat4.rotation(Math.PI/2, Vec.of(0, -1, 0));
        this.draw_house_with_barriers(graphics_state, m.times(T).times(S).times(R));

        T = Mat4.translation(Vec.of(-600, 0, 500));
        R = Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0));
        S = Mat4.scale(Vec.of(1, 1, 1));
        this.draw_house_with_barriers(graphics_state, m.times(T).times(S).times(R));


        //two story houses behind castle
        let Tz = -200;
        for (let i = 0; i < 2; i++){
            
            T = Mat4.translation(Vec.of(-400, 0, Tz));
            S = Mat4.scale(Vec.of(1, 1, 1));
            R = Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0));
            this.draw_two_story_house_without_pillars(graphics_state, m.times(T).times(S).times(R));
            Tz = Tz - 500;
        }
        
        Tz = -200;
        for (let i = 0; i < 2; i++){
            
            T = Mat4.translation(Vec.of(400, 0, Tz));
            S = Mat4.scale(Vec.of(1, 1, 1));
            R = Mat4.rotation(Math.PI/2, Vec.of(0, -1, 0));
            this.draw_two_story_house_without_pillars(graphics_state, m.times(T).times(S).times(R));
            Tz = Tz - 500;
        }


        //single story houses behind castle
        T = Mat4.translation(Vec.of(400, 0, -450));
        S = Mat4.scale(Vec.of(1, 1, 1.5)); 
        R = Mat4.rotation(Math.PI/2, Vec.of(0, -1, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S).times(R));

        T = Mat4.translation(Vec.of(-400, 0, -450));
        S = Mat4.scale(Vec.of(1, 1, 1.5)); 
        R = Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S).times(R));

        //stacked pillars on middle of edges
        T = Mat4.translation(Vec.of(-800,10, 0));
        S = Mat4.scale(Vec.of(3,3,3));
        this.draw_stacked_pillar(graphics_state, m.times(T).times(S));
        T = Mat4.translation(Vec.of(0,10, -800));
        this.draw_stacked_pillar(graphics_state, m.times(T).times(S));
        T = Mat4.translation(Vec.of(800,10, 0));
        this.draw_stacked_pillar(graphics_state, m.times(T).times(S));

        //behind the castle in between marble fixtures
        T = Mat4.translation(Vec.of(-650, 0, -450));
        S = Mat4.scale(Vec.of(1,1,1));
        this.draw_house_with_barriers(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(-650, 150, -450));
        this.draw_two_story_house_without_pillars(graphics_state, m.times(T).times(S));

        T = Mat4.translation(Vec.of(650, 0, -450));
        S = Mat4.scale(Vec.of(1,1,1));
        this.draw_house_with_barriers(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(650, 150, -450));
        this.draw_two_story_house_without_pillars(graphics_state, m.times(T).times(S));

        //mobius strips on side
        T = Mat4.translation(Vec.of(-1200,0,0));
        S = Mat4.scale(Vec.of(12,12,12));
        this.draw_mobius_strip(graphics_state, m.times(T).times(S));

        T = Mat4.translation(Vec.of(1200,0,0));
        this.draw_mobius_strip(graphics_state, m.times(T).times(S));
    }

     //draws a normal mapped torus on top of a cubical pedestal
    draw_torus(graphics_state, m) {
        let S = Mat4.scale(Vec.of(15, 1, 15));
        this.shapes.simplebox.draw(graphics_state, m.times(S), this.plastic.override({color: this.grey}));

        let R = Mat4.rotation(Math.PI/2, Vec.of(1,0,0));
        S = Mat4.scale(Vec.of(1.5,1.5,1.5));
        let T = Mat4.translation(Vec.of(0,20,0));

        this.shapes.torus.draw(graphics_state, m.times(T).times(S).times(R), 
            this.brick_normal_material);
    }

    //draws a grey mobius strip (inner radius 1) on top of a cubical pedestal
    draw_mobius_strip(graphics_state, m) {
        let S = Mat4.scale(Vec.of(15, 1, 15));
        this.shapes.simplebox.draw(graphics_state, m.times(S), this.plastic.override({color: this.grey}));

        S = Mat4.scale(Vec.of(10,10,10));
        let T = Mat4.translation(Vec.of(0,14,0));
        this.shapes.mobius.draw(graphics_state, m.times(T).times(S), this.plastic.override({color: this.white}));
    }

    //elaborate stacked pillar 
    draw_stacked_pillar(graphics_state, m) {

        let S = Mat4.scale(Vec.of(20, 10, 20));
        this.draw_closed_cylinder(graphics_state, m.times(S), this.plastic.override({color: this.white}));
        let T = Mat4.identity();
        let R = T;

        for (let i = 0; i < 10; i++) {
            let theta = 2*Math.PI*i/10;
            T = Mat4.translation(Vec.of(15*Math.sin(theta), 25, 15*Math.cos(theta)));
            S = Mat4.scale(Vec.of(2, 15, 2));
            R = Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0));
            this.shapes.cylinder.draw(graphics_state, m.times(T).times(S).times(R), this.shape_materials["granite"]);
        }

        S = Mat4.scale(Vec.of(20, 10, 20));
        T = Mat4.translation(Vec.of(0, 50, 0));
        this.draw_closed_cylinder(graphics_state, m.times(T).times(S), this.plastic.override({color: this.white}));

        T = T.times(Mat4.translation(Vec.of(0, 35, 0)));
        S = Mat4.scale(Vec.of(8, 25, 8));
        this.draw_closed_cylinder(graphics_state, m.times(T).times(S), this.red_brick_normal_material);

         for (let i = 0; i < 6; i++) {
             let theta = 2*Math.PI*i/6;
             T = Mat4.translation(Vec.of(17*Math.sin(theta), 80, 17*Math.cos(theta)));
             this.draw_simple_pillar(graphics_state, m.times(T));
         }
        
        S = Mat4.scale(Vec.of(2,3,2));
        T = Mat4.translation(Vec.of(0, 110, 0));
        this.shapes.wide_dome.draw(graphics_state, m.times(T).times(S), this.shape_materials["granite"]);
    }

    //cylinder with ends closed
    draw_closed_cylinder(graphics_state, m, material) {
        let R = Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0));
        this.shapes.cylinder.draw(graphics_state, m.times(R), material);

        let T = Mat4.translation(Vec.of(0, 1, 0));
        this.shapes.circle.draw(graphics_state, m.times(T).times(R), material);

        T = Mat4.translation(Vec.of(0, -1, 0));
        this.shapes.circle.draw(graphics_state, m.times(T).times(R), material);   
    }

    //a building supported by jagged pillars, with minarets arranged on the top in a circle
    draw_level_building(graphics_state, m) {
        let T = Mat4.translation(Vec.of(40,50,40));
        let S = Mat4.scale(Vec.of(5, 50, 5));
        this.shapes.jagged_pillar.draw(graphics_state, m.times(T).times(S), this.shape_materials["granite"]);

        T = Mat4.translation(Vec.of(40,50,-40));
        this.shapes.jagged_pillar.draw(graphics_state, m.times(T).times(S), this.shape_materials["granite"]);

        T = Mat4.translation(Vec.of(-40,50,40));
        this.shapes.jagged_pillar.draw(graphics_state, m.times(T).times(S), this.shape_materials["granite"]);

        T = Mat4.translation(Vec.of(-40,50,-40));
        this.shapes.jagged_pillar.draw(graphics_state, m.times(T).times(S), this.shape_materials["granite"]);

        let R = Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0));
        S = Mat4.scale(Vec.of(50, 10, 50));
        T = Mat4.translation(Vec.of(0, -10, 0));
        this.shapes.box.draw(graphics_state, m.times(T).times(S), this.shape_materials["marble1"]);

        T = Mat4.translation(Vec.of(0, 110, 0));
        this.shapes.box.draw(graphics_state, m.times(T).times(S), this.shape_materials["marble1"]);

        for (let i = 0; i < 4; i++) {
            let t = 2*Math.PI*i/4;
            T = Mat4.translation(Vec.of(40*Math.cos(t), 140, 40*Math.sin(t)));
            this.draw_simple_pillar(graphics_state, m.times(T));
        }

        T = Mat4.translation(Vec.of(0, 120, 0));
        S = Mat4.scale(Vec.of(2.5, 3, 2.5));
        this.shapes.curved_main_sec.draw(graphics_state, m.times(T).times(S), this.plastic.override({color: this.yellow}));

        T = Mat4.translation(Vec.of(0, 60, 0));
        S = Mat4.scale(Vec.of(30, 60, 30));
        this.shapes.cylinder.draw(graphics_state, m.times(T).times(S).times(R), 
            this.red_brick_normal_material);
    }

    draw_ground(graphics_state) {
        let T = Mat4.translation(Vec.of(0, -20, 0));
        let M = Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0));
        M = M.times(Mat4.scale(8000, 8000, 8000));
        this.shapes.ground.draw(graphics_state, T.times(M), this.shape_materials["ground"]);

        let S = Mat4.scale(Vec.of(8000,8000,8000));
        this.shapes.sky.draw(graphics_state, S, this.shape_materials["sky"]);
    }

    draw_simple_pillar(graphics_state, m) {
        let T = Mat4.translation(Vec.of(0, 10, 0));
        this.shapes.dome1.draw(graphics_state, m.times(T), this.shape_materials["marble1"]);

        T = Mat4.translation(Vec.of(0, -2, 0));
        let S = Mat4.scale(Vec.of(2, 18, 2));
        let R = Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0));
        this.shapes.cylinder.draw(graphics_state, m.times(T.times(S.times(R))), this.shape_materials["marble2"]);

        T = Mat4.translation(Vec.of(0, 25.5, 0));
        this.shapes.ball.draw(graphics_state, m.times(T), this.shape_materials["marble1"]);

        S = Mat4.scale(0.5, 0.5, 0.5);
        T = T.times(Mat4.translation(Vec.of(0, 1.5, 0)));
        this.shapes.ball.draw(graphics_state, m.times(T.times(S)), this.shape_materials["marble1"]);

        S = Mat4.scale(Vec.of(0.3, 1, 0.3));
        R = Mat4.rotation(Math.PI/2, Vec.of(-1, 0, 0));
        T = T.times(Mat4.translation(Vec.of(0, 0.5, 0)));
        this.shapes.cone.draw(graphics_state, m.times(T.times(S.times(R))), this.shape_materials["marble1"]);
    }

    draw_cylindar_with_cone(graphics_state, m){

        let R2 = Mat4.rotation(Math.PI, Vec.of(0,0,1));
        let S = Mat4.scale(Vec.of(20, 50, 20));
        let T = Mat4.translation(Vec.of(0,32,0))
        this.draw_closed_cylinder(graphics_state, m.times(T).times(S).times(R2), this.ucla_material);
        
        S = Mat4.scale(Vec.of(25,20,23));
        T = Mat4.translation(Vec.of(0, 95.5, 0));
        this.draw_closed_cylinder(graphics_state,m.times(T.times(S)), this.brick_normal_material);
        
        let R = Mat4.rotation(Math.PI/2, Vec.of(-1, 0, 0));
        S = Mat4.scale(Vec.of(27,70,27))
        T = Mat4.translation(Vec.of(0,115.8,0));
        this.shapes.cone.draw(graphics_state,m.times(T.times(S.times(R))),this.plastic.override({color:this.grey}));
        
        T = Mat4.translation(Vec.of(-7, 95.1, 26));
        S = Mat4.scale(Vec.of(.5,.5,.5));
        this.draw_square_window(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.yellow}));

       
    }
    
 
    draw_cube_house(graphics_state, m){
        let S = Mat4.scale(Vec.of(100, 75, 50));
        let T = Mat4.translation(Vec.of(0,58, 0))
        this.shapes.box.draw(graphics_state, m.times(T.times(S)), this.brick_normal_material);
        
        T = Mat4.translation(Vec.of(60, 80, 53));
        S = Mat4.scale(Vec.of(1, 1, 1));
        this.draw_square_window(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(-60, 80, 53));
        S = Mat4.scale(Vec.of(1, 1, 1));
        this.draw_square_window(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(0,135.5,0));
        S = Mat4.scale(Vec.of(100, 1, 50));
        this.shapes.box.draw(graphics_state, m.times(T.times(S)), this.brick_normal_material);
    }

    draw_rectangle_with_cones(graphics_state, m){
        let S = Mat4.scale(Vec.of(30, 100, 25));
        let T = Mat4.translation(Vec.of(0,80,0));
        this.shapes.box.draw(graphics_state, m.times(T).times(S), this.brick_normal_material);
        
        S = Mat4.scale(Vec.of(.25, .25, .25));
        T = Mat4.translation(Vec.of(-20, 184.7, 20));
        this.draw_cylindar_with_cone(graphics_state, m.times(T).times(S));

        S = Mat4.scale(Vec.of(.25, .25, .25));
        T = Mat4.translation(Vec.of(20, 184.7, -20));
        this.draw_cylindar_with_cone(graphics_state, m.times(T).times(S));
        
        S = Mat4.scale(Vec.of(.25, .25, .25));
        T = Mat4.translation(Vec.of(-20, 184.7, -20));
        this.draw_cylindar_with_cone(graphics_state, m.times(T).times(S));
        
        S = Mat4.scale(Vec.of(.25, .25, .25));
        T = Mat4.translation(Vec.of(20, 184.7, 20));
        this.draw_cylindar_with_cone(graphics_state, m.times(T).times(S));
        
        }

    draw_house_with_barriers(graphics_state, m){
        let S = Mat4.scale(Vec.of(1,1,1));
        let T = Mat4.translation(Vec.of(0,0,0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(-160, 20, 0));
        S = Mat4.scale(Vec.of(2, 2, 2));
        this.draw_rectangle_with_cones(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(160, 20, 0));
        this.draw_rectangle_with_cones(graphics_state, m.times(T).times(S));  
        }

    draw_two_story_house_with_pillars(graphics_state, m){
        let S = Mat4.scale(Vec.of(1,1,1));
        let T = Mat4.translation(Vec.of(0,0,0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(0, 150, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
        
        let Tx = -100;
        for (let i = 0; i < 9; i++ ){
               T = Mat4.translation(Vec.of(Tx, 305, -25)); 
               this.draw_simple_pillar(graphics_state, m.times(T).times(S));
               Tx = Tx + 25;
        }
        Tx = -100;
 
        for (let i = 0; i < 9; i++ ){
               T = Mat4.translation(Vec.of(Tx, 305, 25)); 
               this.draw_simple_pillar(graphics_state, m.times(T).times(S));
               Tx = Tx + 25;
        }
    }


    draw_two_story_house_without_pillars(graphics_state, m){
        let S = Mat4.scale(Vec.of(1,1,1));
        let T = Mat4.translation(Vec.of(0,0,0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
        
        T = Mat4.translation(Vec.of(0, 150, 0));
        this.draw_cube_house(graphics_state, m.times(T).times(S));
       

     }
        
    draw_square_window(graphics_state, m){
            let S = Mat4.scale(Vec.of(20,20,0));
            let T = Mat4.translation(Vec.of(0,0,0));

            this.shapes.box.draw(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.yellow}));
        
            T = Mat4.translation(Vec.of(0, 0, 2));
            
            S = Mat4.scale(Vec.of(.5, 20, .5));
            this.draw_closed_cylinder(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.black}));
        
            S = Mat4.scale(Vec.of(20, .5, .5));
            this.draw_closed_cylinder(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.black}));
         
     }

     draw_rooftop(graphics_state, m){
            let S = Mat4.scale(Vec.of(20,20,0));
            let T = Mat4.translation(Vec.of(0,0,0));

            this.shapes.box.draw(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.yellow}));
        
            T = Mat4.translation(Vec.of(0, 0, 2));
            
            S = Mat4.scale(Vec.of(.5, 20, .5));
            this.draw_closed_cylinder(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.black}));
        
            S = Mat4.scale(Vec.of(20, .5, .5));
            this.draw_closed_cylinder(graphics_state, m.times(T.times(S)), this.plastic.override({color:this.black}));
         
     }


     //osman's part-- bear


    bear_type2(graphics_state, m, speed,t, textureBear,T1,T2,T3,T4){
        let T_body = Mat4.translation(Vec.of(-Math.PI*speed*t*1.4*0,0,0));
        let R_body = Mat4.rotation(0*Math.PI/2, Vec.of(0,1,0));
        let S_body = Mat4.scale(Vec.of(6, 9, 6));
        let M_body = m.times(T_body).times(S_body).times(R_body);
        this.shapes.BearBodyType2.draw(graphics_state, M_body, this.shape_materials[textureBear])

        let T_lower = Mat4.translation(Vec.of(0,0.5,0));
        let S_lower = Mat4.scale(Vec.of(5, 1, 5));
        let M_lower = M_body.times(T_lower).times(S_lower);
        this.shapes.ball.draw(graphics_state, M_lower,this.shape_materials[textureBear])

        
        // bear head
        let T_headball = Mat4.translation(Vec.of(0,13.5,0));
        let R_headball = Mat4.rotation(Math.PI/2*0, Vec.of(1,0,0));
        let S_headball = Mat4.scale(Vec.of(5, 4, 5));
        let M_headball = M_body.times(T_headball).times(S_headball).times(R_headball);
        this.shapes.ball.draw(graphics_state, M_headball,this.shape_materials[textureBear])
         
        //bear Eyes
        let T_eye1 = Mat4.translation(Vec.of(0.45,0.1,0.73));
        let R_eye1 = Mat4.rotation(Math.PI/2*0, Vec.of(1,0,0));
        let S_eye1 = Mat4.scale(Vec.of(0.2, 0.2, 0.2)); 
        let M_eye1 = M_headball.times(T_eye1).times(R_eye1).times(S_eye1);
        this.shapes.ball.draw(graphics_state, M_eye1, this.clay.override({color: this.blue}))
         
        let T_eye2 = Mat4.translation(Vec.of(-0.45,0.1,0.73)); 
        let M_eye2 = M_headball.times(T_eye2).times(R_eye1).times(S_eye1);
        this.shapes.ball.draw(graphics_state, M_eye2, this.clay.override({color: this.blue}))
         
        //drawing mouth 
        let T_mouth = Mat4.translation(Vec.of(0,-0.4,0.71));
        let R_mouth = Mat4.rotation(Math.PI/2*0, Vec.of(1,0,0));
        let S_mouth = Mat4.scale(Vec.of(0.6, 0.2, 0.2)); 
        let M_mouth = M_headball.times(T_mouth).times(R_mouth).times(S_mouth);
        this.shapes.ball.draw(graphics_state, M_mouth, this.clay.override({color: this.red})) 
          
        //draving moustache
        let T_moustache = Mat4.translation(Vec.of(0,-0.25,0.87));
        let R_moustache = Mat4.rotation(Math.PI/2*0, Vec.of(1,0,0));
        let S_moustache = Mat4.scale(Vec.of(1, 0.1, 0.1)); 
        let M_moustache = M_headball.times(T_moustache).times(R_moustache).times(S_moustache);
        this.shapes.ball.draw(graphics_state, M_moustache, this.clay.override({color: this.moustache})) 
            

        //drawing mouth 
        let T_ear = Mat4.translation(Vec.of(-0.9,0.5,0));
        let R_ear = Mat4.rotation(Math.PI/2*0, Vec.of(1,0,0));
        let S_ear = Mat4.scale(Vec.of(0.4, 0.4, 0.4)); 
        let M_ear = M_headball.times(T_ear).times(R_ear).times(S_ear);
        this.shapes.ball.draw(graphics_state, M_ear, this.shape_materials[textureBear]) 
        
        let T_ear2 = Mat4.translation(Vec.of(0.9,0.5,0));
        let M_ear2 = M_headball.times(T_ear2).times(R_ear).times(S_ear);
        this.shapes.ball.draw(graphics_state, M_ear2, this.shape_materials[textureBear]) 

            
        //draw_leg
        this.draw_leg_type2(graphics_state,  2.7, M_body, speed,t+Math.PI/speed,  1,T1,T2,T3,T4)
        this.draw_leg_type2(graphics_state, -2.7, M_body, speed,t, -1,T1,T2,T3,T4)
        
        //arms
        this.draw_arm_type2(graphics_state, 1, M_body, t*speed, 1)
        this.draw_arm_type2(graphics_state, 1, M_body, (t+Math.PI)*speed, -1)          

        //this.draw_wing(graphics_state, m, this.t, 1)
        //wings
        let w_speed = speed*4
        let T_wing1 = Mat4.translation(Vec.of(-3,3.8,-4));
        let R_wing1 = Mat4.rotation(-0.6*Math.PI/2, Vec.of(0,1,0)).times(Mat4.rotation(-0.5,Vec.of(0,0,1)));
        let S_wing = Mat4.scale(Vec.of(1, 1.3, 1));
        let M_wing1 = M_body.times(T_wing1).times(S_wing).times(R_wing1);

        this.draw_wing(graphics_state, M_wing1, t,w_speed, 1,T1,T2,T3,T4)

        let T_wing2 = Mat4.translation(Vec.of(3,3.8,-4));
        let R_wing2 = Mat4.rotation(0.6*Math.PI/2, Vec.of(0,1,0)).times(Mat4.rotation(0.5,Vec.of(0,0,1)));
        let M_wing2 = M_body.times(T_wing2).times(S_wing).times(R_wing2);

        this.draw_wing(graphics_state, M_wing2, t,w_speed, -1,T1,T2,T3,T4)

    }

    draw_arm_type2(graphics_state, x_coor, M_body, t, dir){
        let T_shoulder = Mat4.translation(Vec.of(-dir*3,8,1))
        let R_shoulder = Mat4.rotation((Math.sin(t)+1)/4, Vec.of(-1,0,0)).times(Mat4.rotation(-dir*Math.PI/4,Vec.of(0,0,1)))
        let S_shoulder = Mat4.scale(Vec.of(2.5,2,2.5))
        let M_shoulder = M_body.times(T_shoulder).times(S_shoulder).times(R_shoulder)
        this.shapes.ball.draw(graphics_state, M_shoulder,this.shape_materials['BearBodyType2']) 

        //arm part 1
        let T_arm_P1 = Mat4.translation(Vec.of(0,-3.1,0))
        let S_arm_P1 = Mat4.scale(Vec.of(0.23,0.23,0.23))
        let M_arm_P1 = M_shoulder.times(T_arm_P1).times(S_arm_P1)
        this.shapes.BearLeg2Type2.draw(graphics_state, M_arm_P1,this.shape_materials['BearBodyType2'])
        
        //elbow
        let T_elbow = Mat4.translation(Vec.of(0,0,0))
        let R_elbow = Mat4.rotation(-0.5*Math.PI/2,Vec.of(1,0,0)).times(Mat4.rotation(dir*Math.PI/4,Vec.of(0,0,1)))
        let S_elbow = Mat4.scale(Vec.of(2.6,3,3))
        let M_elbow = M_arm_P1.times(T_elbow).times(S_elbow).times(R_elbow)
        this.shapes.ball.draw(graphics_state, M_elbow,this.shape_materials['BearBodyType2'])
        
        //arm part 2
        let T_arm_P2 = Mat4.translation(Vec.of(0,-3.1,0))
        let S_arm_P2 = Mat4.scale(Vec.of(0.23,0.23,0.23))
        let M_arm_P2 = M_elbow.times(T_arm_P2).times(S_arm_P2)
        this.shapes.BearLeg2Type2.draw(graphics_state, M_arm_P2, this.shape_materials['BearBodyType2'])
        
        //hand
        let T_hand = Mat4.translation(Vec.of(0,0,0))
        //let R_leg_foot = Mat4.rotation(Math.PI*this.leg_f2(graphics_state,t),Vec.of(1,0,0)).times(Mat4.rotation(Math.PI*0.04,Vec.of(0,0,1)))
        let S_hand= Mat4.scale(Vec.of(3,4,3))
        let M_hand = M_arm_P2.times(T_hand).times(S_hand)
        this.shapes.ball.draw(graphics_state, M_hand,this.shape_materials['BearBodyType2'])
    }

    
    draw_leg_type2(graphics_state, x_coor, M_body, speed, t, dir,T1,T2,T3,T4){
        //drawing a leg  
        //leg--ball1
        let T_leg_ball1 = Mat4.translation(Vec.of(x_coor,1,0))
        let R_leg_ball1 = Mat4.rotation(Math.PI*this.leg_f1(graphics_state,t,speed),Vec.of(1,0,0)).times(Mat4.rotation(dir*Math.PI*0.05,Vec.of(0,0,1)))
        let S_leg_ball1 = Mat4.scale(Vec.of(2,1.2,3))
        let M_leg_ball1 = M_body.times(T_leg_ball1).times(S_leg_ball1).times(R_leg_ball1)
        this.shapes.ball.draw(graphics_state, M_leg_ball1, this.shape_materials['BearBodyType2']) 


        //leg part 1
        let T_leg_P1 = Mat4.translation(Vec.of(0,-3.1,0))
        let S_leg_P1 = Mat4.scale(Vec.of(0.47,0.27,0.47))
        let M_leg_P1 = M_leg_ball1.times(T_leg_P1).times(S_leg_P1)
        this.shapes.BearLegType2.draw(graphics_state, M_leg_P1, this.shape_materials['BearBodyType2'])

        //leg part 2--ball -like a knee
        let T_leg_knee = Mat4.translation(Vec.of(0,0,0))
        let R_leg_knee = Mat4.rotation(Math.PI*this.leg_f2(graphics_state,t,speed),Vec.of(1,0,0)).times(Mat4.rotation(-dir*Math.PI*0.04,Vec.of(0,0,1)))
        let S_leg_knee = Mat4.scale(Vec.of(1.7,2.3,1.7))
        let M_leg_knee = M_leg_P1.times(T_leg_knee).times(S_leg_knee).times(R_leg_knee)
        this.shapes.ball.draw(graphics_state, M_leg_knee,this.shape_materials['BearBodyType2'])
        
        //leg part 2
        let T_leg_P2 = Mat4.translation(Vec.of(0,-5.1,0))
        let S_leg_P2 = Mat4.scale(Vec.of(0.24,0.44,0.24))
        let M_leg_P2 = M_leg_knee.times(T_leg_P2).times(S_leg_P2)
        this.shapes.BearLeg2Type2.draw(graphics_state, M_leg_P2,this.shape_materials['BearBodyType2'])
        
        //leg foot
        let T_leg_foot = Mat4.translation(Vec.of(0,0,2))
        let S_leg_foot= Mat4.scale(Vec.of(3,2,5))
        let M_leg_foot = M_leg_P2.times(T_leg_foot).times(S_leg_foot)
        this.shapes.ball.draw(graphics_state, M_leg_foot,this.shape_materials['BearBodyType2'])
    }

    draw_wing(graphics_state, m, t,speed, dir,T1,T2,T3,T4){
        
        let wing_rotation = dir*(Math.sin(t*speed)/7+0.09)

        let T_wing1 = Mat4.translation(Vec.of(0,0,0));
        let R_wing1 = Mat4.rotation(wing_rotation*Math.PI*0.7+0.3*dir, Vec.of(0,1,0));
        let S_wing1 = Mat4.scale(Vec.of(dir*1.5,1,1.5))
        let M_wing1 = m.times(T_wing1).times(R_wing1).times(S_wing1);

        let R_wing2_hinge = Mat4.translation(Vec.of(-2,0,0)).times(Mat4.rotation(dir*wing_rotation,Vec.of(2,5,0))).times(Mat4.translation(Vec.of(2,0,0)))
        let M_wing2 = M_wing1.times(R_wing2_hinge);

        let R_wing3_hinge = Mat4.translation(Vec.of(-2,0,0)).times(Mat4.rotation(-dir*wing_rotation,Vec.of(-1,6,0))).times(Mat4.translation(Vec.of(2,0,0)))
        let M_wing3 = M_wing2.times(R_wing3_hinge);
        
        let R_wing4_hinge = Mat4.translation(Vec.of(-2,0,0)).times(Mat4.rotation(dir*wing_rotation,Vec.of(-4,9,0))).times(Mat4.translation(Vec.of(2,0,0)))
        let M_wing4 = M_wing3.times(R_wing4_hinge);
        
        let R_wing5_hinge = Mat4.translation(Vec.of(-5,2,0)).times(Mat4.rotation(dir*2*wing_rotation,Vec.of(-1,7,0))).times(Mat4.translation(Vec.of(5,-2,0)))
        let M_wing5 = M_wing4.times(R_wing5_hinge);
        
        let R_wing6_hinge = Mat4.translation(Vec.of(-7,0,0)).times(Mat4.rotation(dir*wing_rotation,Vec.of(1,9,0))).times(Mat4.translation(Vec.of(7,0,0)))
        let M_wing6 = M_wing5.times(R_wing6_hinge);

        let R_wing7_hinge = Mat4.translation(Vec.of(-10,2,0)).times(Mat4.rotation(1*dir*wing_rotation,Vec.of(4,7,0))).times(Mat4.translation(Vec.of(10,-2,0)))
        let M_wing7 = M_wing6.times(R_wing7_hinge);

        let R_wing8_hinge = Mat4.translation(Vec.of(-12,2,0)).times(Mat4.rotation(dir*wing_rotation,Vec.of(6,7,0))).times(Mat4.translation(Vec.of(12,-2,0)))
        let M_wing8 = M_wing7.times(R_wing8_hinge);

                
        this.shapes.Wing1.draw(graphics_state, M_wing1, this.clay.override({color: this.yellow}))
        this.shapes.Wing2.draw(graphics_state, M_wing2, this.clay.override({color: this.blue}))
        this.shapes.Wing3.draw(graphics_state, M_wing3, this.clay.override({color: this.yellow}))
        this.shapes.Wing4.draw(graphics_state, M_wing4, this.clay.override({color: this.blue}))
        this.shapes.Wing5.draw(graphics_state, M_wing5, this.clay.override({color: this.yellow}))
        this.shapes.Wing6.draw(graphics_state, M_wing6, this.clay.override({color: this.blue}))
        this.shapes.Wing7.draw(graphics_state, M_wing7, this.clay.override({color: this.yellow}))
        this.shapes.Wing8.draw(graphics_state, M_wing8, this.clay.override({color: this.blue}))
    }
        
}


window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;