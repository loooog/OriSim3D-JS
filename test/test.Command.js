// file 'test/test.Command.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html

// Dependencies : import them before Command in browser
if (typeof module !== 'undefined' && module.exports) {
  var Command = require('../js/Command.js');
  var Model = require('../js/Model.js');
  var Point = require('../js/Point.js');
}
//
function ok(expr, msg) {
  if (!expr) throw new Error(msg +' '+typeof module);
}

// Unit tests using Mocha
suite('Commands');
before(function() {
  // runs before all test in this block
});
test('tokenize', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  let text = 'a b t 2000 f 4 180 0) mo 2 0';
  cde.tokenize(text);
  ok(cde.toko.length === 12,"Got:"+cde.toko.length);
});
test('readfile', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  let file = 'models/cocotte.txt';
  let text  = cde.readfile(file);
  ok(text.length >= 10,"Got:"+text.length);
});
test('execute d define', function() {
  let model = new Model();
  let cde = new Command(model);
  cde.tokenize('d -200 -200 200 -200 200 200 -200 200');
  ok(cde.toko.length === 9,"got:"+cde.toko.length);
  let iTok = cde.execute();
  ok(iTok === 9,"got:"+iTok);
  ok(model.points.length === 4,"got:"+model.points.length);
});
test('execute b by', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  cde.tokenize('b 0 2');
  let iTok = cde.execute();
  ok(iTok === 3,"got:"+iTok);
  ok(model.segments.length === 5,"got:"+model.segments.length);
});
test('execute c cross', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  // Cross between 0 and 2 should produce a new segment 3 1
  cde.tokenize('cross 0 2');
  let iTok = cde.execute();
  ok(iTok === 3,"got:"+iTok);
  ok(model.segments.length === 5,"got:"+model.segments.length);
  ok(model.segments[4].p1 === model.points[3],"got:"+model.segments[4].p1);
  ok(model.segments[4].p2 === model.points[1],"got:"+model.segments[4].p2);

});
test('execute p perpendicular', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  // Split on edge, no change
  cde.tokenize('p 0 2');
  let iTok = cde.execute();
  ok(iTok === 3,"got:"+iTok);
  ok(model.segments.length === 4,"got:"+model.segments.length);
  // Add center point 4 and split perpendicular to seg 0 passing by 4
  model.points.push(new Point(0,0));
  cde.tokenize('p 0 4');
  iTok = cde.execute();
  ok(iTok === 3,"got:"+iTok);
  ok(model.segments.length === 7,"got:"+model.segments.length);
  ok(model.segments[6].p1 === model.points[5],"got:"+model.points.indexOf(model.segments[6].p1));
  ok(model.segments[6].p2 === model.points[6],"got:"+model.points.indexOf(model.segments[6].p2));
});
test('listPoints', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  cde.tokenize('1 0 2 a 3');
  let list = cde.listPoints(0);
  ok(list.length === 3,"got:"+list.length);
  // Second point (200,-200) should be at first place [0]
  ok(list[0].x === 200,"got:"+list[0].x);
  ok(list[0].y === -200,"got:"+list[0].y);
  ok(list[0].z === 0,"got:"+list[0].z);
});
test('listSegments', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  cde.tokenize('1 0 2');
  let list = cde.listSegments(0);
  ok(list.length === 3,"got:"+list.length);
  // Second segment '0' should be at [1]
  let s0 = model.segments[0];
  let s1 = model.segments[1];
  ok(list[1] === s0,"got:"+list[0]);
  ok(list[0] === s1,"got:"+list[0]);
});
test('execute rotate list', function() {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let cde = new Command(model);
  let pt = model.points[2];
  // before
  // console.log("before:"+model.points);
  ok(pt.x === 200, "got:"+pt.x);
  ok(pt.y === 200, "got:"+pt.y);
  ok(pt.z === 0,   "got:"+pt.z);

  // Rotate on bottom edge [0] by 90 points 0,2
  cde.tokenize('rotate 0 90 0 2');
  let iTok = cde.execute();

  // Check numbers
  ok(iTok === 5,"got:"+iTok);
  ok(model.segments.length === 4,"got:"+model.segments.length);

  // after
  // console.log("after :"+model.points);
  ok(Math.round(pt.x) === 200,"got:"+pt.x);
  ok(Math.round(pt.y) === -200,"got:"+pt.y);// on plane y = -200
  ok(Math.round(pt.z) === 400,"got:"+pt.z); // side length = 400
  // Should not move
  pt = model.points[0];
  ok(Math.round(pt.x) === -200,"got:"+pt.x);
  ok(Math.round(pt.y) === -200,"got:"+pt.y);
  ok(Math.round(pt.z) === 0,"got:"+pt.z);
});
// Commands
test('command', function() {
  let model = new Model();
  let cde = new Command(model);
  // Split on edge, no change
  cde.command('d -200 -200 200 -200 200 200 -200 200');
  ok(model.segments.length === 4,"got:"+model.segments.length);
  ok(model.points.length === 4,"got:"+model.points.length);
  cde.command('c 0 2 c 1 3');
  ok(model.segments.length === 8,"got:"+model.segments.length);
  ok(model.points.length === 5,"got:"+model.points.length);
  cde.command('d -200 -200 200 -200 200 200 -200 200 c 0 2 c 1 3');
  ok(model.segments.length === 8,"got:"+model.segments.length);
  ok(model.points.length === 5,"got:"+model.points.length);
});
test('command adjust points', function() {
  let model = new Model();
  let cde = new Command(model);
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  let p0 = model.points[0];
  let p1 = model.points[1];
  let s0 = model.segments[0];
  let s1 = model.segments[1];
  p0.x = -100; // instead of -200
  p1.x = 100;  // instead of 200
  cde.command('a');
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(Math.round(s1.length3d()) === 400,"Got:"+s1.length3d());
  p0.x = -100; // instead of -200
  p1.x = 100;  // instead of 200
  cde.command('a 0 1');
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(Math.round(s1.length3d()) === 400,"Got:"+s1.length3d());
});
test('command tx ty tz', function() {
  let model = new Model();
  let cde = new Command(model);
  cde.command('d -200 -200 200 -200 200 200 -200 200');
  cde.command('c 0 1 c 0 3 c 0 2 c 1 3');
  cde.command('c 0 8 c 8 3 c 0 4 c 4 1');
  cde.command('c 6 0 c 6 1 c 6 2 c 6 3');
  cde.command('t 1000 f 48 179 21 0 10)');
  cde.command('ty 90');
  ok(model.segments.length === 56,"got:"+model.segments.length);
  ok(model.points.length === 25,"got:"+model.points.length);
});
test('command ty One Point', function() {
  let model = new Model();
  let cde = new Command(model);
  cde.command('d -200 -200 200 -200 200 200 -200 200');
  cde.command('c 0 1 c 1 2');
  cde.command('ty 180');
  cde.command('c 0 4');
  // "d -200 -200 200 -200 200 200 -200 200 c 0 1 c 1 2 ty 180 c 0 4"
  // Problème corrigé
  console.log("P11 :"+model.points[11]+" xf:"+model.points[11].xf);
  ok(model.points[0].xf === -200,"got:"+model.points[0].xf);
  ok(model.points[11].xf === -100,"got:"+model.points[11].xf);
});
test('end', function() {
  let model = new Model();
  let cde = new Command(model);
  // Should no execute after end
  cde.command('d -200 -200 200 -200 200 200 -200 200 end c 0 2 c 1 3');
  ok(model.segments.length === 4,"got:"+model.segments.length);
  ok(model.points.length === 4,"got:"+model.points.length);
});