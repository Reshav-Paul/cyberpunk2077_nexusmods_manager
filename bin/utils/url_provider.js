"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlProvider = void 0;
let urlProvider = function url_provider() {
    let nexusBase = () => 'https://api.nexusmods.com/v1';
    let gameByDomain = (domain) => nexusBase() + `/games/${domain}.json`;
    let modByID = (id, game_domain) => nexusBase() + `/games/${game_domain}/mods/${id}.json`;
    let modFiles = (id, game_domain, category) => nexusBase() + `/games/${game_domain}/mods/${id}/files.json`
        + (category ? `?category=${category}` : '');
    return {
        nexusBase,
        gameByDomain,
        modByID,
        modFiles
    };
};
exports.urlProvider = urlProvider;
//# sourceMappingURL=url_provider.js.map