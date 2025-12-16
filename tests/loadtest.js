import http from "k6/http";
import { check, sleep } from "k6";

// ---------------------------
// Load profile & thresholds
// ---------------------------
export const options = {
  stages: [
    { duration: "30s", target: 3 }, // ramp up 
    { duration: "1m", target: 3 }, // stay 
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    // http_req_duration: ["p(95)<800"],                // 95% of requests < 800ms
    http_req_failed: ["rate<0.05"],                  // allow up to 5% failures for CI for now
    // "checks{endpoint:Users}": ["rate>0.98"],         // at least 98% checks pass
  },
};

const GRAPHQL_URL = "https://qa.ui.marketing/api/graphql";


// The Users query – operation name is Users, field is users
const USERS_QUERY = `
  query Users(
  $filter: UsersFilter
  $limit: Int
  $offset: Int
  $scope: UserScope
  $searchTerm: String
  $sort: [UserSort!]
  $types: [UserType!]
) {
  users(
    filter: $filter
    limit: $limit
    offset: $offset
    scope: $scope
    searchTerm: $searchTerm
    sort: $sort
    types: $types
  ) {
    __typename
  }
}
`;

function safeJson(res) {
  const ct = res.headers["Content-Type"] || "";
  if (!ct.includes("application/json")) {
    return null;
  }
  try {
    return res.json();
  } catch {
    return null;
  }
}

// Main VU function – this is your "real" load test
export default function () {
  const payload = JSON.stringify({
    query: USERS_QUERY,
    variables: {
      filter: null,
      limit: 50,
      offset: 0,
      scope: null,
      searchTerm: null,
      sort: null,
      types: null,
    },
  });

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    Cookie: __ENV.AUTH_COOKIES,
  };

  const res = http.post(GRAPHQL_URL, payload, {
    headers,
    tags: { endpoint: "Users" },
  });

  if (res.status !== 200) {
    console.log("Non-200 status:", res.status);
    console.log("Body snippet:", res.body.substring(0, 200));
  }

  const json = safeJson(res);

  // Basic correctness checks
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  check(json, {
    "no GraphQL errors": (j) => !j.errors,
    "users array exists": (j) => j.data && j.data.users && Array.isArray(j.data.users),
    "at least one user": (j) => j.data && j.data.users && j.data.users.length > 0,
  });

  // tiny think-time so it’s not a pure hammer
  sleep(1);
}

// 5) Optional: summary.json for later (CI, Tesults, etc.)
export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data),
  };
}
