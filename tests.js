var assert = require("assert"),
    BitField = require("./");

var data = "011011100110111".split("").map(Number).map(Boolean),
    field = new BitField(data.length);

for(var i = 0; i < data.length; i++){
	assert.strictEqual(field.get(i), false, "bitfield should be empty when initialized");
}

//Write data

for(var i = 0; i < data.length; i++){
	field.set(i, data[i]);
}

for(var i = 0; i < data.length; i++){
	assert.strictEqual(field.get(i), data[i], "should reproduce written data");
}

for(var i = data.length; i < 1e3; i++){
	assert.strictEqual(field.get(i), false, "out-of-bounds should simply be false");
}

var index = 25;
for(var i = 0; i < 100; i++) {
    index += 8 + Math.floor(32 * Math.random());

    var oldLength = field.buffer.length;
    assert.strictEqual(field.get(index), false);
    assert.equal(field.buffer.length, oldLength, "should not have grown for get()");
    field.set(index, true);
    var newLength = Math.ceil((index + 1) / 8);
    assert.equal(field.buffer.length, newLength, "should have grown for set()");
    assert.strictEqual(field.get(index), true);
}

console.log("passed");
