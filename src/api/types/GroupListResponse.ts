/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as GroundX from "../index.js";

export interface GroupListResponse {
    groups?: GroundX.GroupDetail[];
    /** The number of groups returned in the current response */
    count?: number;
    /** The number of groups that have not been returned yet, will be null if there are no remaining groups */
    remaining?: number;
    /** The total number of groups found */
    total?: number;
}
