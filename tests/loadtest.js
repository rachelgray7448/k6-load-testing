import { sleep } from "k6";
import { runUsersQuery } from "./graphql/operations/users.js";

export const options = {
  stages: [
    { duration: "30s", target: 3 },
    { duration: "1m", target: 3 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // CI-safe
    // "http_req_duration{endpoint:Users}": ["p(95)<800"],
    // "http_req_duration{endpoint:EnableProductForOrganizationOnly}": ["p(95)<1200"],
  },
};

export default function () {
  // 1) “Read” path (query)
  runUsersQuery();

  // 2) “Write” path (mutation)
  // runEnableProductMutation();

  sleep(1);
}

export function handleSummary(data) {
  return { "summary.json": JSON.stringify(data, null, 2) };
}
