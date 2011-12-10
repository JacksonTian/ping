module.exports = model = function () {};
model.before = function (callback) {
    setTimeout(function () {
        var data = {
            "title": "Ping Portal Implementation",
            "content": "Come from otakustay.",
            "author": "Jackson Tian",
            "time": "2011-12-12"
        };
        callback(data);
    }, 100);
};
