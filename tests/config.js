export const GRAPHQL_URL =
    __ENV.GRAPHQL_URL || "https://qa.ui.marketing/api/graphql";

// Your auth mechanism: access token carried in cookies
export const AUTH_COOKIES = __ENV.AUTH_COOKIES;

// Mutation inputs (avoid hardcoding in code)
export const ORG_ID = __ENV.ORG_ID;
export const PRODUCT_ID = __ENV.PRODUCT_ID;

// Default variables for Users query
export const USERS_VARS = {
    filter: null,
    limit: Number(__ENV.USERS_LIMIT || 50),
    offset: Number(__ENV.USERS_OFFSET || 0),
    scope: null,
    searchTerm: null,
    sort: null,
    types: null,
};
