export let urlProvider = function url_provider() {
  let nexusBase = () => 'https://api.nexusmods.com/v1';
  let gameByDomain = (domain: string) => nexusBase() + `/games/${domain}.json`;
  let modByID = (id: number, game_domain: string) => nexusBase() + `/games/${game_domain}/mods/${id}.json`;
  let modFiles = (id: number, game_domain: string, category?: string) =>
    nexusBase() + `/games/${game_domain}/mods/${id}/files.json`
    + (category ? `?category=${category}` : '');

  return {
    nexusBase,
    gameByDomain,
    modByID,
    modFiles
  };
}