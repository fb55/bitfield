var Container = typeof Buffer !== "undefined" ? Buffer //in node, use buffers
                : typeof Int8Array !== "undefined" ? Int8Array //in newer browsers, use webgl int8arrays
                : function(l){ var a=new Array(l); for(var i=0;i<l;i++)a[i]=0; }; //else, do something similar

function BitField(data){
        this.buffer = typeof data === "number" ? new Container(1 + (data >> 3)) : data;
}

BitField.prototype.get = function(i){
        return !!(this.buffer[i >> 3] & (1 << (i % 8)));
};

BitField.prototype.set = function(i, b){
        if(b || arguments.length === 1){
                this.buffer[i >> 3] |= 1 << (i % 8);
        } else {
                this.buffer[i >> 3] &= ~(1 << (i % 8));
        }
};

if(typeof module !== "undefined") module.exports = BitField;