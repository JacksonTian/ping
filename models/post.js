module.exports = model = function () {};
model.before = function (callback) {
    setTimeout(function () {
        var data = {
            "title": "用Nodejs打造你的静态文件服务器",
            "content": '<p>在《The Node Beginner Book》的中文版（<a href="http://nodebeginner.org/index-zh-cn.html">http://nodebeginner.org/index-zh-cn.html</a>）发布之后，获得国内的好评。也有同学觉得这本书略薄，没有包含进阶式的例子。<a href="http://www.weibo.com/n/otakustay">@otakustay</a>同学说：“确实，我的想法是在这之上补一个简单的MVC框架和一个StaticFile+Mimetype+CacheControl机制，可以成为一个更全面的教程”。正巧的是目前我手里的V5项目有一些特殊性：</p>',
            "author": "Jackson",
            "time": '<abbr title="星期五, 十一月 11th, 2011, 5:03 下午">2011 年 11 月 11 日</abbr>',
            "who": "Jackson Tian",
            "user": {"name": "Jackson Tian", "email": "shyvo1987@gmail.com"}
        };
        callback(data);
    }, 100);
};
model.pipe = function (data, callback) {
    setTimeout(function () {
        callback(data.viewName + "'s Pipe Content " + Math.random());
    }, Math.random() * 1000);
};
