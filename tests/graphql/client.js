import http from "k6/http";
import { check } from "k6";
import { GRAPHQL_URL } from "../config.js";

function safeJson(res) {
    const ct = res.headers["Content-Type"] || "";
    if (!ct.includes("application/json")) return null;
    try {
        return res.json();
    } catch {
        return null;
    }
}

export function graphqlRequest({ operationName, query, variables = {}, auth }) {
    if (!auth?.access_token || !auth?.refresh_token) {
        throw new Error(`[${operationName}] missing auth tokens`);
    }
    
    const payload = JSON.stringify({ query, variables });

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    // Artillery style: send tokens as cookies
    const cookieHeader = `access_token=${auth.access_token}; refresh_token=${auth.refresh_token}`;

    const res = http.post(GRAPHQL_URL, payload, {
        headers: { ...headers, Cookie: cookieHeader },
        tags: { endpoint: operationName },
    });

    check(res, { [`[${operationName}] status is 200`]: (r) => r.status === 200 });

    const json = safeJson(res);
    if (json?.errors) {
        console.log(`[${operationName}] GraphQL errors:`, JSON.stringify(json.errors).substring(0, 500));
    }

    return { res, json };
}
