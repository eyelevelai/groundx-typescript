/**
 * This file was auto-generated by Fern from our API Definition.
 */

/**
 * @example
 *     {}
 */
export interface BucketsListRequest {
    /**
     * The maximum number of returned buckets. Accepts 1-100 with a default of 20.
     */
    n?: number;
    /**
     * A token for pagination. If the number of buckets for a given query is larger than n, the response will include a "nextToken" value. That token can be included in this field to retrieve the next batch of n buckets.
     */
    nextToken?: string;
}