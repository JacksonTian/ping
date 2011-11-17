exports.parse = function (cookies) {
    var map = {};
    var pairs = cookies.split(";");
    pairs.forEach(function (pair) {
        var kv = pair.split("=");
        map[kv[0].trim()] = kv[1] || "";
    });
    return map;
};
exports.stringify = function (cookie) {
    var buffer = [cookie.key, "=", cookie.value];
    if (cookie.expires) {
        buffer.push("; expires=", (new Date(cookie.expires)).toUTCString());
    }
    if (cookie.path) {
        buffer.push("; path=", cookie.path);
    }
    if (cookie.domain) {
        buffer.push("; domain=", cookie.domain);
    }
    if (cookie.secure) {
        buffer.push("; secure");
    }
    if (cookie.httpOnly) {
        buffer.push("; httponly");
    }

    return buffer.join("");
};
