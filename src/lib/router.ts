import { createRouter } from "@nanostores/router";

const BASE_URL = "/religion/";

export const $router = createRouter({
    home: `${BASE_URL}`,
    characters: `${BASE_URL}chars`,
    algebra: `${BASE_URL}algebra`,
    analysis: `${BASE_URL}analysis`,
    holyText: `${BASE_URL}text/:id`,
});
