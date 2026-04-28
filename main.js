import { default as seagulls } from './gulls/gulls.js'

const NUM_AGENTS       = 4096*1000,
      GRID_SIZE        = 1,
      W                = Math.round( window.innerWidth  / GRID_SIZE ),
      H                = Math.round( window.innerHeight / GRID_SIZE ),
      WORKGROUP_SIZE   = 8,
      dc               = Math.sqrt(Math.ceil( NUM_AGENTS/64 )),
      DISPATCH_COUNT   = [ dc,dc, 1 ],
      DISPATCH_COUNT_2 = [ Math.ceil(W/8), Math.ceil(H/8), 1 ],
      LEFT = .0, RIGHT = 1.,
      FADE = .0125,
      NUM_PHEROMONE_CHANNELS = 3;

const render_shader = seagulls.constants.vertex + `
@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<storage> vants: array<f32>;
@group(0) @binding(2) var<storage> pheromones: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let grid_pos = floor( pos.xy / ${GRID_SIZE}.);
  
  let pidx = (grid_pos.y  * ${W}. + grid_pos.x) * ${NUM_PHEROMONE_CHANNELS};
  let p0 = pheromones[ u32(pidx)];
  let p1 = pheromones[ u32(pidx)  +1];
  let p2 = pheromones[ u32(pidx ) +2 ];
  //let p3 = pheromones[ u32(pidx)  +3];

  let slime_0 = clamp(p0*10.0, 0.0,1.0); //p* value effects how much you see in the render
  let slime_1 = clamp(p1*10.0, 0.0,1.0);
  let slime_2 = clamp(p2*10.0, 0.0,1.0);

  return vec4f(slime_0, slime_1, slime_2, 1.);  
}`


/*The compute shader is running through the agents (Vants)
Position is a float 32 in grid units. (value between 0 and W, 0 and H)
*/
const compute_shader =`
struct Vant {
  pos: vec2f,
  dir: f32,
  mode: f32 
}

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<storage, read_write> vants: array<Vant>;
@group(0) @binding(2) var<storage> pheromones_r: array<f32>;
@group(0) @binding(3) var<storage, read_write> pheromones_w: array<f32>;

fn vantIndex( cell:vec3u, size:vec3u ) -> u32 {
  return cell.x + (cell.y * size.x); 
}

fn pheromoneIndex( vant_pos: vec2f , vant_mode : f32) -> u32 {
  return u32(round(vant_pos.y)* ${W}. + round(vant_pos.x)) * ${NUM_PHEROMONE_CHANNELS} + u32(vant_mode);
}

fn readSensor( pos:vec2f, dir:f32, angle:f32, distance:vec2f , vant_mode :f32) -> f32 {
  let read_dir = vec2f( sin( (dir+angle) * ${Math.PI*2} ), cos( (dir+angle) * ${Math.PI*2} ) );
  let offset = read_dir * distance;

  let index = pheromoneIndex( round(pos+offset) , 0); //zero since were going to go through all of them

  var pheromoneScore : f32 = 0;
  for( var i : u32 = 0; i <  ${NUM_PHEROMONE_CHANNELS} ; i++){
    if (u32(vant_mode) == i){
      pheromoneScore += pheromones_r[index+i];
    }else{
      pheromoneScore -= pheromones_r[index+i];
      
      /*//options to experiment with
      if(vant_mode == 1){
        //do nothing
      }else if(vant_mode == 3){
        pheromoneScore -= pheromones_r[index+i]*10.0;
      }else{
        pheromoneScore -= pheromones_r[index+i];
      }
      */
    }
  }
  return pheromoneScore;
}

@compute
@workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE},1)

fn cs(@builtin(global_invocation_id) cell:vec3u, @builtin(num_workgroups) size:vec3u)  {
  let turn = .0625 *1.5;
  let index = vantIndex( cell, size );
  var vant:Vant = vants[ index ];

  var pIndex:u32 = pheromoneIndex( round(vant.pos) , vant.mode);

  let sensorDistance = vec2f(7.,7.);

  //sense nearby pheromones
  let left     = readSensor( vant.pos, vant.dir, -turn, sensorDistance , vant.mode);
  let forward  = readSensor( vant.pos, vant.dir, 0.,    sensorDistance , vant.mode);
  let right    = readSensor( vant.pos, vant.dir, turn,  sensorDistance , vant.mode);
  
  if( left > forward && left > right ) {
    vant.dir -= turn; 
  }else if( right > left && right > forward ) { 
    vant.dir += turn;
  }else if ( right == left ) { 
    let rand = fract( sin( vant.pos.x + vant.pos.y ) * 100000.0 );
    if( rand > .5 ) {
      vant.dir += turn; 
    }else{
      vant.dir -= turn;
    }
  }
  
  let advance_dir = vec2f( sin( vant.dir * ${Math.PI*2} ), cos( vant.dir * ${Math.PI*2}) )/ vec2f(2.0);
  vant.pos = vant.pos + advance_dir; 

  //write to value
  pIndex = pheromoneIndex( round(vant.pos), vant.mode);
  pheromones_w[ pIndex ] = min(1.0, pheromones_w[pIndex]+0.1);

  vants[ index ] = vant;
}`

const diffuse_shader = `
@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<storage> pheromones: array<f32>;
@group(0) @binding(2) var<storage, read_write> pheromones_write: array<f32>;


fn getP( x:u32,y:u32, vant_mode : f32 ) -> f32 {
  let idx = u32( y * ${W}u + x )* ${NUM_PHEROMONE_CHANNELS} + u32(vant_mode);
  return pheromones[ idx ];
}

@compute
@workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE},1)

fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let x = cell.x;
  let y = cell.y;

  for(var m :f32 = 0.0; m <${NUM_PHEROMONE_CHANNELS}; m+= 1.0){
    var state:f32 = getP( x,y,m) * -1.; // this mult should equal the total of the others
    state += getP(x - 1u,   y         ,m) * 0.2;
    state += getP(x - 1u,   y - 1u    ,m) * 0.05;
    state += getP(x,        y - 1u    ,m) * 0.2;
    state += getP(x + 1u,   y - 1u    ,m) * 0.05;
    state += getP(x + 1u,   y         ,m) * 0.2;
    state += getP(x + 1u,   y + 1u    ,m) * 0.05;
    state += getP(x,        y + 1u    ,m) * 0.2;
    state += getP(x - 1u,   y + 1u    ,m) * 0.05;

    let pIndex =(y * ${W}u + x)* ${NUM_PHEROMONE_CHANNELS} + u32(m);
    pheromones_write[ pIndex ] = max(0.,state*.99);
  }
}
`

const sg = await seagulls.init()

//make buffer float array
const testArray = new Float32Array( W*H * NUM_PHEROMONE_CHANNELS);
for( let i = 0; i < NUM_PHEROMONE_CHANNELS * W* H; i++) {
  testArray[i] = 0;
  testArray[i] = 0;
}

const NUM_PROPERTIES = 4 // must be evenly divisble by 4!
const pheromones_b   = sg.buffer( testArray) // pheromones data
const pheromonesPP_b = sg.buffer( testArray)  // pingpong buffer
const vants          = new Float32Array( NUM_AGENTS * NUM_PROPERTIES ) // hold vant info
const pingpong       = sg.pingpong( pheromones_b, pheromonesPP_b )
const pingpong_swap  = sg.pingpong( pheromonesPP_b, pheromones_b) //an attempt to fix the pixelation

for( let i = 0; i < NUM_AGENTS * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
  vants[ i ]   = W/2 //positon x
  vants[ i+1 ] = H/2 //piosition y 
  vants[ i+2 ] = Math.random() //direction
  vants[i + 3] = Math.floor(Math.random()*NUM_PHEROMONE_CHANNELS); //vant_mode
}



const vants_b = sg.buffer( vants )
const frame = sg.uniform( 0 )

const render = await sg.render({
  shader: render_shader,
  data: [ frame, vants_b, pheromones_b ],
  onframe() { frame.value++ },
})

const compute = sg.compute({ 
  shader:compute_shader,
  data:[
    frame,
    vants_b,
    pingpong
  ],
  dispatchCount: DISPATCH_COUNT 
})

const diffuse = sg.compute({ 
  shader:diffuse_shader,
  data:[
    frame,
    pingpong
  ],
  dispatchCount: DISPATCH_COUNT_2 
})

sg.run(diffuse, compute, render )
