import http from "k6/http";
import { check } from "k6";

export function fusionAuthLogin() {
    const AUTH_URL = __ENV.AUTH_URL; // e.g. https://qa.ui.marketing (or wherever /api/login lives)
    const USER_PASSWORD = __ENV.USER_PASSWORD;

    const LOGIN_ID = __ENV.LOGIN_ID || "pw.admin";
    const UI_MARKETING_APPLICATION = __ENV.UI_MARKETING_APPLICATION;
    const UI_MARKETING_TENANT = __ENV.UI_MARKETING_TENANT;
    const UI_MARKETING_AUTHORIZATION = __ENV.UI_MARKETING_AUTHORIZATION;

    if (!AUTH_URL || !USER_PASSWORD || !UI_MARKETING_APPLICATION || !UI_MARKETING_TENANT || !UI_MARKETING_AUTHORIZATION) {
        throw new Error(
        "Missing required env vars for FusionAuth login: AUTH_URL, USER_PASSWORD, UI_MARKETING_APPLICATION, UI_MARKETING_TENANT, UI_MARKETING_AUTHORIZATION"
        );
    }

    const res = http.post(
        `${AUTH_URL}/api/login`,
        JSON.stringify({
        loginId: LOGIN_ID,
        password: USER_PASSWORD,
        applicationId: UI_MARKETING_APPLICATION,
        }),
        {
        headers: {
            "Content-Type": "application/json",
            "X-FusionAuth-TenantId": UI_MARKETING_TENANT,
            Authorization: UI_MARKETING_AUTHORIZATION, // whatever Artillery used here
        },
        }
    );

    check(res, {
        "[FusionAuth] login status 200": (r) => r.status === 200,
    });

    const json = res.json();

    const access_token = json.token;
    const refresh_token = json.refreshToken;

    if (!access_token) {
        console.log("[FusionAuth] login response snippet:", res.body?.substring(0, 300));
        throw new Error("FusionAuth login did not return a token");
    }

    return { access_token, refresh_token };
}
