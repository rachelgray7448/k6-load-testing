import { check } from "k6";
import { graphqlRequest } from "../client.js";

/**
 * Test-scoped constants (only this test uses these)
 */
const HIERARCHY_IDS = [
    83466,
    83467,
    83468,
    83469,
    83470,
    83471,
    83472,
    83473,
    83474,
    83475,
];

const IS_LMC = false;
const IS_BILLING_ENABLED = true;
const BILLING_CODE = null;
const IS_BULK_DISCOUNT_ELIGIBLE = false;

const PARTNER_METADATA_BASE = {
    tier: null,
    type: null,
    partnerIndustry: null,
    exportTemplates: ["DEFAULT", "REMUS"],
    primaryColor: null,
    referralSource: null, 
    accentColor: null,
    lineOfBusinessId: 2,
};

const UPDATE_HIERARCHY_MUTATION = `
mutation UpdateHierarchy($input: UpdateHierarchyInput!) {
    updateHierarchy(input: $input) {
        id
        name
        shortName
        __typename
    }
}
`;

function pickHierarchyId() {
    const idx = (__VU + __ITER) % HIERARCHY_IDS.length;
    return HIERARCHY_IDS[idx];
}

function suffix() {
    return `${__VU}-${__ITER}-${Date.now()}`;
}

function toShortName(name) {
    return name.replace(/\s+/g, "");
}

export function runUpdateHierarchyMutation(auth) {
    const id = pickHierarchyId();
    const name = `k6-${suffix()}`;
    const shortName = toShortName(name);

    const { json } = graphqlRequest({
        operationName: "UpdateHierarchy",
        query: UPDATE_HIERARCHY_MUTATION,
        variables: {
        input: {
            id,
            name,
            shortName,
            isLMC: IS_LMC,
            isBillingEnabled: IS_BILLING_ENABLED,
            billingCode: BILLING_CODE,
            isBulkDiscountEligible: IS_BULK_DISCOUNT_ELIGIBLE,
            partnerMetadata: PARTNER_METADATA_BASE,
        },
        },
        auth,
    });

    if (!json) return;

    check(json, {
        "[UpdateHierarchy] no GraphQL errors": (j) => !j.errors,
        "[UpdateHierarchy] updated correct id": (j) =>
            j?.data?.updateHierarchy?.id === id,
        "[UpdateHierarchy] name matches": (j) => j?.data?.updateHierarchy?.name === name,
        "[UpdateHierarchy] shortName matches": (j) =>
        j?.data?.updateHierarchy?.shortName === shortName,
    });

    const updatedId = json?.data?.updateHierarchy?.id;
    if (updatedId) {
        console.log(`[UpdateHierarchy] id=${updatedId} name=${name}`);
    }
}
