#bitfield

a very simple bitfield, compliant with the Bittorrent spec

    npm install bitfield

####Example

```js
var Bitfield = require("bitfield");

var field = new Bitfield(256); //create a bitfield with 256 bits

field.set(128); //set the 128th bit
field.set(128, true); //same as above

field.get(128); //true
field.get(200); //false (all values are initialised to `false`)
field.get(1e3); //false (out-of-bounds is also false)

field.set(128, false); //set the 128th bit to 0 again

field.buffer; //the buffer used by bitfield
```

####Methods
`Bitfield(data)`: Data can be either a node.js buffer, WebGL Int8Array or numeric array, or a number representing the maximum number of supported bytes.

`Bitfield#get(index)`: Returns a boolean indicating whether the bit is set.

`Bitfield#set(index[, value])`: Values defaults to true. Sets the bit to the boolean value of the value (true = 1, false = 0).

####Properties
`Bitfield#buffer`: The contents of the bitfield.

##License

MIT
