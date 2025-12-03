
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const res = http.post(
    "https://your-api/graphql",
    JSON.stringify({ query: "{ __typename }" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}

export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data),
  };
}
