import http from "k6/http";
import { check, sleep } from "k6";

// ---------------------------
// Load profile & thresholds
// ---------------------------
export const options = {
  stages: [
    { duration: "20s", target: 10 }, // ramp up to 10 VUs
    { duration: "40s", target: 10 }, // stay at 10 VUs
    { duration: "20s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],                // 95% of requests < 800ms
    http_req_failed: ["rate<0.01"],                  // < 1% requests fail
    "checks{endpoint:Users}": ["rate>0.98"],         // at least 98% checks pass
  },
};

const GRAPHQL_URL = "https://qa.ui.marketing/api";


// The Users query – operation name is Users, field is users
const USERS_QUERY = `
  query Users(
  $filter: UsersFilter
  $includeAdminFields: Boolean = false
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
    ...User
    __typename
  }
}
`;

// Main VU function – this is your "real" load test
export default function () {
  const payload = JSON.stringify({
    query: USERS_QUERY,
    variables: {}, // none needed for "all users"
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

  const json = res.json();

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
