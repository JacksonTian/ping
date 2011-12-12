var Model = function () {
    this.keys = {};
};
Model.prototype.get = function (key, callback) {
    var val = this.keys[key];
    if (val) {
        
    } else {
        if (this.state[key] === "pending") {
            this.on(key, callback);
        } else {
            this.state[key] = "pending";
            // TODO get it.
            this.state[key] = "gotit";
        }
    }
};
Model.prototype.register = function (key, callback) {
    this.keys[key] = callback;
};
