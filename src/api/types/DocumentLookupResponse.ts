/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as GroundX from "../index";

export interface DocumentLookupResponse {
    /** The number of results returned in the current response */
    count?: number;
    documents?: GroundX.DocumentDetail[];
    nextToken?: string;
    /** The total number of results found */
    total?: number;
}