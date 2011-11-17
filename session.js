var Session = function (sessionId) {
    this.sessionId = sessionId;
    this._map = {};
};
Session.prototype.set = function (name, value) {
    this._map[name] = value;
};
Session.prototype.get = function (name) {
    return this._map[name];
};
Session.prototype.remove = function (key) {
    delete this._map[key];
};
Session.prototype.removeAll = function () {
    delete this._map;
    this._map = {};
};
Session.prototype.updateTime = function () {
    this._updateTime = new Date().getTime();
};

var SESSIONID_KEY = exports.SESSIONID_KEY = "session_id";

var SessionManager = function (timeout) {
    this.timeout = timeout;
    this._sessions = {};
};
SessionManager.prototype.renew = function (response) {
    var that = this;
    var sessionId = [new Date().getTime(), Math.round(Math.random() * 1000)].join("");
    var session = new Session(sessionId);
    session.updateTime();
    this._sessions[sessionId] = session;
    var clientTimeout = 30 * 24 * 60 * 60 * 1000;
    var cookie = {key: SESSIONID_KEY, value: sessionId, path: "/", expires: new Date().getTime() + clientTimeout};
    response.setCookie(cookie);
    return session;
};
SessionManager.prototype.get = function (sessionId) {
    return this._sessions[sessionId];
};
SessionManager.prototype.remove = function (sessionId) {
    delete this._sessions[sessionId];
};
SessionManager.prototype.isTimeout = function (session) {
    return (session._updateTime + this.timeout) < new Date().getTime();
};
exports.Session = Session;
exports.SessionManager = SessionManager;
