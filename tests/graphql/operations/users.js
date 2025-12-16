import { check } from "k6";
import { graphqlRequest } from "../client.js";
import { USERS_VARS } from "../../config.js";

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

export function runUsersQuery() {
    const { json } = graphqlRequest({
        operationName: "Users",
        query: USERS_QUERY,
        variables: USERS_VARS,
    });

    if (!json) return;

    check(json, {
        "[Users] no GraphQL errors": (j) => !j.errors,
        "[Users] users array exists":
        (j) => j?.data?.users && Array.isArray(j.data.users),
    });
}
