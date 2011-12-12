module.exports = model = function () {};
model.before = function (callback) {
    setTimeout(function () {
        var data = {
            "title": "用Nodejs打造你的静态文件服务器",
            "content": 'The concept is come from <a href="http://weibo.com/otakustay">otakustay</a>. You can find it <a href="http://weibo.com/2087024342/xADWZc3eX">here</a>.',
            "author": "Jackson Tian",
            "time": "2011-12-12"
        };
        callback(data);
    }, 100);
};
