import { sleep } from "k6";
import http from "k6/http";
import { check } from "k6";
import { runUsersQuery } from "./graphql/operations/users.js";
import { runUpdateHierarchyMutation } from "./graphql/operations/updateHierarchy.js";

export const options = {
  stages: [
    { duration: "30s", target: 3 },
    { duration: "1m", target: 3 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export function setup() {
  const res = http.post(
    `${__ENV.AUTH_URL}/api/login`,
    JSON.stringify({
      loginId: __ENV.LOGIN_ID || "pw.admin",
      password: __ENV.USER_PASSWORD,
      applicationId: __ENV.UI_MARKETING_APPLICATION,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-FusionAuth-TenantId": __ENV.UI_MARKETING_TENANT,
        Authorization: __ENV.UI_MARKETING_AUTHORIZATION,
      },
    }
  );

  check(res, { "[Login] status is 200": (r) => r.status === 200 });

  const body = res.json();

  if (!body?.token || !body?.refreshToken) {
    console.log("[Login] response snippet:", res.body?.substring(0, 300));
    throw new Error("Login succeeded but did not return token/refreshToken");
  }

  return {
    access_token: body.token,
    refresh_token: body.refreshToken,
  };
}

export default function (auth) {
  runUsersQuery(auth);
  runUpdateHierarchyMutation(auth);
  sleep(1);
}

export function handleSummary(data) {
  return { "summary.json": JSON.stringify(data, null, 2) };
}