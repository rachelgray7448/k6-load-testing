import http from "k6/http";
import { check } from "k6";
import { GRAPHQL_URL, AUTH_COOKIES } from "../config.js";

function safeJson(res) {
    const ct = res.headers["Content-Type"] || "";
    if (!ct.includes("application/json")) return null;
    try {
        return res.json();
    } catch {
        return null;
    }
}

export function graphqlRequest({ operationName, query, variables = {} }) {
    const payload = JSON.stringify({ operationName, query, variables });

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: AUTH_COOKIES,
    };

    const res = http.post(GRAPHQL_URL, payload, {
        headers,
        tags: { endpoint: operationName },
    });

    if (res.status !== 200) {
        console.log(`[${operationName}] Non-200 status:`, res.status);
        console.log(`[${operationName}] Body snippet:`, res.body.substring(0, 200));
    }

    check(res, {
        [`[${operationName}] status is 200`]: (r) => r.status === 200,
    });

    return { res, json: safeJson(res) };
}
