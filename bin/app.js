"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const user_router_js_1 = __importDefault(require("./routes/user_router.js"));
const game_router_js_1 = __importDefault(require("./routes/game_router.js"));
const mods_router_js_1 = __importDefault(require("./routes/mods_router.js"));
let app = (0, express_1.default)();
mongoose.connect(process.env.mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('returnOriginal', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use((0, cors_1.default)());
app.use(logger('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use(passport_1.default.initialize());
// app.get('/test', (req, res) => res.json({ "status": "OK" }));
app.use('/users', user_router_js_1.default);
app.use('/games', game_router_js_1.default);
app.use('/mods', mods_router_js_1.default);
let defaultHandler = function (err, req, res, next) {
    // set locals, only providing error in development
    if (err.message) {
        console.log(err.message);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500).send(err.message);
        res.send(req.app.get('env'));
    }
};
app.use(defaultHandler);
// module.exports = app;
exports.default = app;
//# sourceMappingURL=app.js.map