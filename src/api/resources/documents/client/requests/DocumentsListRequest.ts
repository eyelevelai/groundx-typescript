/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as GroundX from "../../../../index.js";

/**
 * @example
 *     {}
 */
export interface DocumentsListRequest {
    /**
     * The maximum number of returned documents. Accepts 1-100 with a default of 20.
     */
    n?: number;
    /**
     * Only documents with names that contain the filter string will be returned in the results.
     */
    filter?: string;
    /**
     * The document attribute that will be used to sort the results.
     */
    sort?: GroundX.Sort;
    /**
     * The order in which to sort the results. A value for sort must also be set.
     */
    sortOrder?: GroundX.SortOrder;
    /**
     * A status filter on the get documents query. If this value is set, then only documents with this status will be returned in the results.
     */
    status?: GroundX.ProcessingStatus;
    /**
     * A token for pagination. If the number of documents for a given query is larger than n, the response will include a "nextToken" value. That token can be included in this field to retrieve the next batch of n documents.
     */
    nextToken?: string;
}
