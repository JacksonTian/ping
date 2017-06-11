exports.parseRange = function (str, size) {
    if (str.indexOf(",") != -1) {
        return;
    }

    var range = str.split("-"),
        start = parseInt(range[0].match(/\d+/)[0], 10),
        end = parseInt(range[1], 10);

    // Case: 100-
    if (isNaN(end)) {
        end = size - 1;
    }

    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }

    return {start: start, end: end};
};
