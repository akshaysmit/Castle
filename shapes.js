//create tangents for normal mapping, call this only after positions,
//indices and texture_coords have been assigned
compute_tangents = function(positions, indices, texture_coords) {
    let tangents_i = [];
    let tangents = [];

    for (let i = 0; i<indices.length; i+=3) {
        let p0 = positions[indices[i]];
        let p1 = positions[indices[i+1]];
        let p2 = positions[indices[i+2]];
    
        //edges of the triangle
        let e1 = p1.minus(p0);
        let e2 = p2.minus(p0);

        //extract texture coordinates
        let u0 = texture_coords[indices[i]][0];
        let v0 = texture_coords[indices[i]][1];
        let u1 = texture_coords[indices[i+1]][0];
        let v1 = texture_coords[indices[i+1]][1];
        let u2 = texture_coords[indices[i+2]][0];
        let v2 = texture_coords[indices[i+2]][1];

        let delta_u1 = u1-u0;
        let delta_v1 = v1-v0;
        let delta_u2 = u2-u0;
        let delta_v2 = v2-v0;

        let det = 1 / (delta_u1 * delta_v2 - delta_u2 * delta_v1);

        let tangent_x = det * (delta_v2 * e1[0] - delta_v1 * e2[0]);
        let tangent_y = det * (delta_v2 * e1[1] - delta_v1 * e2[1]);
        let tangent_z = det * (delta_v2 * e1[2] - delta_v1 * e2[2]);

        //let bitangent_x = det * (-delta_u2 * e1[0] - delta_u1 * e2[0]);
        //let bitangent_y = det * (-delta_u2 * e1[1] - delta_u1 * e2[1]);
        //let bitangent_z = det * (-delta_u2 * e1[2] - delta_u1 * e2[2]);

        let curr_tangent = Vec.of(tangent_x, tangent_y, tangent_z);
        tangents_i.push(curr_tangent, curr_tangent, curr_tangent);
    }

    //average tangents for vertex shared among triangles
    for (let i = 0; i < positions.length; i++) {
        let sum_t = Vec.of(0,0,0);
        let count = 0;

        for (let j = 0; j < indices.length; j++) {
            if (indices[j] == i) {
                sum_t = sum_t.plus(tangents_i[j]);
                count++;
            }
        }

        for (let j = 0; j < 3; j++) 
            sum_t[j] = sum_t[j]/count;

        tangents.push(sum_t);
    }

    return tangents;
}

window.Square = window.classes.Square = class Square extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords", "tangents");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}


window.Trapezoid = window.classes.Trapezoid = class Trapezoid extends Shape {
    constructor(j) {

        super("positions", "normals", "texture_coords", "tangents");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -j, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}




window.Circle = window.classes.Circle = class Circle extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords", "tangents");

        this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0.5, 0.5], [1, 0.5]));

        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 0]));
            this.normals.push(...Vec.cast(  [0,    0,    1]));
            this.texture_coords.push(...Vec.cast([(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                0, id - 1, id);
        }

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}

window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords", "tangents");

        this.positions.push(...Vec.cast(
            [-1,  1, -1], [-1, -1, -1], [ 1,  1, -1], [ 1, -1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [-1,  1,  1], [ 1,  1,  1], [-1,  1, -1], [ 1,  1, -1],
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1, -1], [ 1, -1,  1], [ 1,  1, -1], [ 1,  1,  1] 
        ));

        this.texture_coords.push(...Vec.cast(
            [0,    2/3], [0.25, 2/3], [0,    1/3], [0.25, 1/3],
            [0.5,  2/3], [0.5,  1/3], [0.75, 2/3], [0.75, 1/3],
            [0.75, 2/3], [0.75, 1/3], [1,    2/3], [1,    1/3],
            [0.25, 2/3], [0.25, 1/3], [0.5,  2/3], [0.5,  1/3],
            [0.25, 2/3], [0.5,  2/3], [0.25, 1  ], [0.5,  1  ],
            [0.25, 1/3], [0.5,  1/3], [0.25, 0  ], [0.5,  0  ]
        )); 

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  0, -1]),
            ...Array(4).fill([ 0,  0,  1]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-1,  0,  0]),
            ...Array(4).fill([ 1,  0,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,    
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}


window.SimpleCube = window.classes.SimpleCube = class SimpleCube extends Shape {
    constructor() {
      super( "positions", "normals", "texture_coords", "tangents");
      for( var i = 0; i < 3; i++ )                    
        for( var j = 0; j < 2; j++ ) {
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
      }
    }
}

window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords", "tangents");
        const s3 = Math.sqrt(3) / 4,
            v1 = Vec.of(Math.sqrt(8/9), -1/3, 0),
            v2 = Vec.of(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)),
            v3 = Vec.of(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)),
            v4 = Vec.of(0, 1, 0);

        this.positions.push(...Vec.cast(
            v1, v2, v3,
            v1, v3, v4,
            v1, v2, v4,
            v2, v3, v4));

        this.normals.push(...Vec.cast(
            ...Array(3).fill(v1.plus(v2).plus(v3).normalized()),
            ...Array(3).fill(v1.plus(v3).plus(v4).normalized()),
            ...Array(3).fill(v1.plus(v2).plus(v4).normalized()),
            ...Array(3).fill(v2.plus(v3).plus(v4).normalized())));

        this.texture_coords.push(...Vec.cast(
            [0.25, s3], [0.75, s3], [0.5, 0], 
            [0.25, s3], [0.5,  0 ], [0,   0],
            [0.25, s3], [0.75, s3], [0.5, 2 * s3], 
            [0.75, s3], [0.5,  0 ], [1,   0]));

        this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}

window.Cylinder = window.classes.Cylinder = class Cylinder extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords", "tangents");

        this.positions.push(...Vec.cast([1, 0, 1], [1, 0, -1]));
        this.normals.push(...Vec.cast(  [1, 0, 0], [1, 0,  0]));
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for (let i = 0; i < sections; ++i) {
            const ratio = (i + 1) / sections,
                angle = 2 * Math.PI * ratio,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = 2 * i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 1], [v[0], v[1], -1]));
            this.normals.push(...Vec.cast(  [v[0], v[1], 0], [v[0], v[1],  0]));
            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);
        }

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}


//curve_sections determines how many points on the curve (t^2, t) we want to draw
//rot_sections determines how many intermediate angles we have between 0 and 2pi
//t_init and t_fin are the min and max values for the curve parameter t

//A dome is an ellipse rotated around the y-axis
window.Ellipsoid = window.classes.Ellipsoid = class Ellipsoid extends Shape {
    constructor(curve_sections, rot_sections, base_radius, height) {
        super("positions", "normals", "texture_coords");

        let begin = 0;
        let end = Math.PI/2;
        let increment = (end - begin)/curve_sections;

        for(let j = 0; j <= curve_sections; ++j){  
            let t = begin + j*increment;

            this.positions.push(Vec.of(base_radius*Math.cos(t), height*Math.sin(t), 0));
            this.normals.push(Vec.of(height*Math.cos(t), base_radius*Math.sin(t),0));   
            this.texture_coords.push(...Vec.cast([0, j/curve_sections]));   
        }

        for (let i = 0; i < rot_sections; ++i) {

            const ratio = (i + 1) / rot_sections,
                angle = 2 * Math.PI * ratio;
                
                for (let j = 0; j <= curve_sections; j++) {
                    let v = this.positions[j];
                    let n = this.normals[j];
                    let v2 = Vec.of(v[0]*Math.cos(angle),v[1],v[0]*Math.sin(angle));
                    let n2 = Vec.of(n[0]*Math.cos(angle),n[1],n[0]*Math.sin(angle));
                    this.positions.push(v2);
                    this.normals.push(n2);
                    this.texture_coords.push(...Vec.cast([ratio, j/curve_sections]));
                }                          
        }
                
        for(let k = 0; k< rot_sections; ++k){   
                let s = k * (curve_sections + 1);

                for (let l = s; l < s + curve_sections; ++l)
                    this.indices.push(l,l+curve_sections+2,l+1,l,l+curve_sections+1,l+curve_sections+2)
        }
    }
}

window.Torus = window.classes.Torus = class Torus extends Shape {
    constructor(curve_sections, rot_sections, mean_radius, ring_radius) {
        super("positions", "normals", "texture_coords", "tangents");

        let begin = 0;
        let end = 2*Math.PI;
        let increment = (end - begin)/curve_sections;

        for(let j = 0; j <= curve_sections; ++j){  
            let t = begin + j*increment;

            this.positions.push(Vec.of(mean_radius+ring_radius*Math.cos(t), ring_radius*Math.sin(t), 0));
            this.normals.push(Vec.of(Math.cos(t), Math.sin(t), 0));  
            this.texture_coords.push(...Vec.cast([0, j/curve_sections]));    
        }

        for (let i = 0; i < rot_sections; ++i) {

            const ratio = (i + 1) / rot_sections,
                angle = 2 * Math.PI * ratio;
                
                for (let j = 0; j <= curve_sections; j++) {
                    let v = this.positions[j];
                    let n = this.normals[j];
                    let v2 = Vec.of(v[0]*Math.cos(angle),v[1],v[0]*Math.sin(angle));
                    let n2 = Vec.of(n[0]*Math.cos(angle),n[1],n[0]*Math.sin(angle));
                    this.positions.push(v2);
                    this.normals.push(n2);
                    this.texture_coords.push(...Vec.cast([ratio, j/curve_sections]));
                }                          
        }

        for(let k = 0; k< rot_sections; ++k){   
                let s = k * (curve_sections + 1);

                for (let l = s; l < s + curve_sections; ++l)
                    this.indices.push(l,l+curve_sections+2,l+1,l,l+curve_sections+1,l+curve_sections+2)
        }

        this.tangents = compute_tangents(this.positions, this.indices, this.texture_coords);
    }
}

//constructed as a bilinear patch, each point p on the strip is computed using 
//the formula p(u,v) = alpha(u) + v/2 * gamma(u) where alpha and gamma are specified
//below
window.mobius_strip = window.classes.mobius_strip = class mobius_strip extends Shape {
    constructor(line_sections, rot_sections) {
        super("positions", "normals");

        let v_begin = -1;
        let v_end = 1;
        let v_increment = (v_end - v_begin)/line_sections;

        for (let i = 0; i <= rot_sections; i++) {
            const ratio = i / rot_sections,
                u = 2 * Math.PI * ratio;
                let alpha = Vec.of(Math.cos(u), Math.sin(u), 0);
                let gamma = Vec.of(Math.cos(u)*Math.cos(u/2), Math.sin(u)*Math.cos(u/2),
                    Math.sin(u/2));
    
            for (let j = 0; j <= line_sections; j++) {
                let v = v_begin + j*v_increment;
                let p = alpha.plus(gamma.times(v/2));
                this.positions.push(p);
                this.normals.push(p);
            }
        }

         for(let k = 0; k< rot_sections; ++k){   
                let s = k * (line_sections + 1);

                for (let l = s; l < s + line_sections; ++l)
                    this.indices.push(l,l+line_sections+2,l+1,l,l+line_sections+1,l+line_sections+2)
        }
    }
}

window.Cone = window.classes.Cone = class Cone extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([1, 0.5]));

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            this.positions.push(...Vec.cast(t, v));
            this.normals.push(...Vec.cast(
                v.mix(this.positions[id - 1], 0.5).plus(t).normalized(),
                v.plus(t).normalized()));
            this.texture_coords.push(...Vec.cast([0.5, 0.5], [(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                id - 1, id, id + 1);
        }
    }
}

// The curve r = (1+sin(theta*f)/d) in polar coordinates is used to construct a 
//generalized cylinder
window.jagged_pillar = window.classes.jagged_pillar = class jagged_pillar extends Shape {
    constructor(rot_sections, f, d) {
        super("positions", "normals", "texture_coords");   

        this.positions.push(...Vec.cast([1, 1, 0], [1, -1, 0]));
        let n = Vec.of(0,1,0).cross(Vec.of(f/d,0,1));
        this.normals.push(n);
        this.normals.push(n);
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for(let j = 0; j < rot_sections; ++j){  
            const ratio = (j + 1) / rot_sections;
            let theta = ratio*2*Math.PI;

            let r = 1 + Math.sin(f*theta)/d;
            let x = Math.cos(theta) * r;
            let z = Math.sin(theta) * r;

            this.positions.push(Vec.of(x, 1, z));
            this.positions.push(Vec.of(x, -1, z));

            let dr = f*Math.cos(f*theta)/d;
            let dx = -r*Math.sin(theta)+Math.cos(theta)*dr;
            let dz = r*Math.cos(theta)+Math.sin(theta)*dr;

            n = Vec.of(0,1,0).cross(Vec.of(dx, 0, dz));
            this.normals.push(n); 
            this.normals.push(n); 

            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));

            let id = 2 * j + 2;
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);  
        }
    }
}

//Bezier curve with 4 control points, rotated
window.Bezier4_rot = window.classes.Bezier4_rot = class Bezier4_rot extends Shape {
    constructor(curve_sections, rot_sections, p0, p1, p2, p3) {
        super("positions", "normals", "texture_coords");

        let begin = 0;
        let end = 1;
        let increment = (end - begin)/curve_sections;

        for(let j = 0; j <= curve_sections; ++j){  
            let t = begin + j*increment;

            //P(t) = (1-t)^3 P0 + 3t(1-t)^2 P1 + 3(1-t)t^2 P2 + t^3 P3
            let P_t = p0.times((1-t)*(1-t)*(1-t));
            P_t = P_t.plus(p1.times(3*t*(1-t)*(1-t)));
            P_t = P_t.plus(p2.times(3*(1-t)*t*t));
            P_t = P_t.plus(p3.times(t*t*t));
            this.positions.push(P_t);

            //Differentiate P(t) and compute tangent vector. Rotate it by 90 degrees to get normal
            let N_t = p0.times(-3*(1-t)*(1-t));
            N_t = N_t.plus(p1.times(3*(1-t)*(1-t) - 6*(1-t)*t));
            N_t = N_t.plus(p2.times(6*t*(1-t) - 3*t*t));
            N_t = N_t.plus(p3.times(3*t*t));
            N_t = Vec.of(0,0,1).cross(N_t);
            N_t = N_t.times(-1);
            this.normals.push(N_t);

            //this.positions.push(Vec.of(mean_radius+ring_radius*Math.cos(t), ring_radius*Math.sin(t), 0));
            //this.normals.push(Vec.of(Math.cos(t), Math.sin(t), 0));  
            this.texture_coords.push(...Vec.cast([0, j/curve_sections]));    
        }
        
        for (let i = 0; i < rot_sections; ++i) {
            const ratio = (i + 1) / rot_sections,
            angle = 2 * Math.PI * ratio;
                
            for (let j = 0; j <= curve_sections; j++) {
                let v = this.positions[j];
                let n = this.normals[j];
                let v2 = Vec.of(v[0]*Math.cos(angle),v[1],v[0]*Math.sin(angle));
                let n2 = Vec.of(n[0]*Math.cos(angle),n[1],n[0]*Math.sin(angle));
                this.positions.push(v2);
        ;        this.normals.push(n2);
                this.texture_coords.push(...Vec.cast([ratio, j/curve_sections]));
            }                          
        }

        for(let k = 0; k< rot_sections; ++k){   
                let s = k * (curve_sections + 1);

                for (let l = s; l < s + curve_sections; ++l)
                    this.indices.push(l,l+curve_sections+2,l+1,l,l+curve_sections+1,l+curve_sections+2)
        }
    }
}

// This Shape defines a Sphere surface, with nice (mostly) uniform triangles.  A subdivision surface
// (see) Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
window.Subdivision_Sphere = window.classes.Subdivision_Sphere = class Subdivision_Sphere extends Shape {
    constructor(max_subdivisions, normal_flip) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }

        //flip the normals
        if (normal_flip) {  
            for (let i = 0; i < this.normals.length; i++) 
                this.normals[i] = this.normals[i].times(-1);
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}

// Osman Shapes

window.Trapezoid3D = window.classes.Trapezoid3D = class Trapezoid3D extends Shape {
    constructor(a, b, l) {
        super("positions", "normals", "texture_coords");
        
        let d = Math.sqrt(4*l**2 + (b-a)**2);
        let r1 = (b-a) / d;
        let r2 = 2*l/d;

        this.positions.push(...Vec.cast(
            [-a,  l, -a], [-b, -l, -b], [ a,  l, -a], [ b, -l, -b],
            [-b, -l,  b], [ b, -l,  b], [-a,  l,  a], [ a,  l,  a],
            [-a,  l,  a], [ a,  l,  a], [-a,  l, -a], [ a,  l, -a],
            [-b, -l, -b], [ b, -l, -b], [-b, -l,  b], [ b, -l,  b],
            [-b, -l, -b], [-b, -l,  b], [-a,  l, -a], [-a,  l,  a],
            [ b, -l, -b], [ b, -l,  b], [ a,  l, -a], [ a,  l,  a] 
        ));

        

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  r1, -r2]),
            ...Array(4).fill([ 0,  r1,  r2]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-r2,  r1,  0]),
            ...Array(4).fill([ r2,  r1,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,    
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );
    }
}

window.TriangleGeneral = window.classes.TriangleGeneral = class TriangleGeneral extends Shape {
    constructor(x1,y1,x2,y2,x3,y3) { 
        // Name the values we'll define per each vertex.
        super("positions", "normals", "texture_coords");
        
        this.positions.push(...Vec.cast(
            [x1, y1,  0], [ x2, y2,  0], [x3, y3,  0],
            [x1, y1,  0], [ x2, y2,  0], [x3, y3,  0]));

        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        this.normals.push(...Vec.cast(
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1]));

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(
            0, 1, 2,
            3, 5, 4);
    }
}
//curve_sections determines how many points on the curve (t^2, t) we want to draw
//rot_sections determines how many intermediate angles we have between 0 and 2pi
//t_init and t_fin are the min and max values for the curve parameter t

window.BearBody = window.classes.BearBody = class BearBody extends Shape {
    constructor(curve_sections, rot_sections, t_init, t_fin) {
        super("positions", "normals", "texture_coords");

        let begin = t_init;
        let end = t_fin;
        let increment = (end - begin)/curve_sections;

        //the curve will be rotated around y axis
        //function declaration to be rotated
        let a0 = 5
        let a1 = 2.9277
        let a2 = -0.7594
        let a3 = 0.0663
        let a4 = -0.0020

        //let f(t) = a0 + a1*t + a2*t**2 + a3*t**3 + a4*t**4 + a5*t**5
        //df(t) = a1 + 2*a2*t + 3*a3*t**2 + 4*a4*t**3 + 5*a5*t**4

        

        for(let j = 0; j <= curve_sections; ++j){  
            let t = begin + j*increment;

            this.positions.push(Vec.of((a0 + a1*t + a2*t**2 + a3*t**3 + a4*t**4), t, 0));
            this.normals.push(Vec.of(-1,(a1 + 2*a2*t + 3*a3*t**2 + 4*a4*t**3),0));     
            this.texture_coords.push(...Vec.cast([0, j/curve_sections]))
        }
       

        for (let i = 0; i < rot_sections; ++i) {

            const ratio = (i + 1) / rot_sections,
                angle = 2 * Math.PI * ratio;
                
                for (let j = 0; j <= curve_sections; j++) {
                    let v = this.positions[j];
                    let n = this.normals[j];
                    let v2 = Vec.of(v[0]*Math.cos(angle),v[1],v[0]*Math.sin(angle));
                    let n2 = Vec.of(n[0]*Math.cos(angle),n[1],n[0]*Math.sin(angle));
                    this.positions.push(v2);
                    this.normals.push(n2);
                    this.texture_coords.push(...Vec.cast([ratio, j/curve_sections]));
                }                          
        }

        for(let k = 0; k< rot_sections; ++k){   
                let s = k * (curve_sections + 1);

                for (let l = s; l < s + curve_sections; ++l)
                    this.indices.push(l,l+curve_sections+2,l+1,l,l+curve_sections+1,l+curve_sections+2)
        }
    }
   
}


//curve_sections determines how many points on the curve (t^2, t) we want to draw
//rot_sections determines how many intermediate angles we have between 0 and 2pi
//t_init and t_fin are the min and max values for the curve parameter t

window.BearLeg = window.classes.BearLeg = class BearLeg extends Shape {
    constructor(curve_sections, rot_sections, t_init, t_fin) {
        super("positions", "normals", "texture_coords");

        let begin = t_init;
        let end = t_fin;
        let increment = (end - begin)/curve_sections;

        //the curve will be rotated around y axis
        //function declaration to be rotated
        let a0 = 50
        let a1 = 1.5017
        let a2 = -0.6957
        let a3 = 0.1247
        let a4 = -0.0108
        let a5 = 0.0004713
        let a6 = -0.000007067

        //let f(t) = a0 + a1*t + a2*t**2 + a3*t**3 + a4*t**4 + a5*t**5 + a6*t**6
        //df(t) = a1 + 2*a2*t + 3*a3*t**2 + 4*a4*t**3 + 5*a5*t**4 + 6*a6*t**5

        

        for(let j = 0; j <= curve_sections; ++j){  
            let t = begin + j*increment;

            this.positions.push(Vec.of((a0 + a1*t + a2*t**2 + a3*t**3 + a4*t**4+a5*t**5+a6*t**6), 10*t, 0));
            this.normals.push(Vec.of(-10,(a1 + 2*a2*t + 3*a3*t**2 + 4*a4*t**3+5*a5*t**4+6*a6*t**5),0));     
            this.texture_coords.push(...Vec.cast([0, j/curve_sections]))
        }
       
        for (let i = 0; i < rot_sections; ++i) {
            const ratio = (i + 1) / rot_sections,
                angle = 2 * Math.PI * ratio;
                
                for (let j = 0; j <= curve_sections; j++) {
                    let v = this.positions[j];
                    let n = this.normals[j];
                    let v2 = Vec.of(v[0]*Math.cos(angle),v[1],v[0]*Math.sin(angle));
                    let n2 = Vec.of(n[0]*Math.cos(angle),n[1],n[0]*Math.sin(angle));
                    this.positions.push(v2);
                    this.normals.push(n2);
                    this.texture_coords.push(...Vec.cast([ratio, j/curve_sections]));
                }                          
        }
        for(let k = 0; k< rot_sections; ++k){   
                let s = k * (curve_sections + 1);

                for (let l = s; l < s + curve_sections; ++l)
                    this.indices.push(l,l+curve_sections+2,l+1,l,l+curve_sections+1,l+curve_sections+2)
        }
    }
   
}


