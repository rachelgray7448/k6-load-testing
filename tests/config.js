// GraphQL endpoint (same as Artillery: BASE_URL + /api/graphql)
export const GRAPHQL_URL =
    __ENV.GRAPHQL_URL || "https://qa.ui.marketing/api/graphql";

// FusionAuth login endpoint base (must be set)
export const AUTH_URL = __ENV.AUTH_URL;

// FusionAuth / api/login inputs
export const LOGIN_ID = __ENV.LOGIN_ID || "pw.admin";
export const USER_PASSWORD = __ENV.USER_PASSWORD;
export const UI_MARKETING_APPLICATION = __ENV.UI_MARKETING_APPLICATION;

// Required headers for FusionAuth login (based on your Artillery file)
export const UI_MARKETING_TENANT = __ENV.UI_MARKETING_TENANT;
export const UI_MARKETING_AUTHORIZATION = __ENV.UI_MARKETING_AUTHORIZATION;

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
