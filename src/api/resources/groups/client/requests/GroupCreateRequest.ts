/**
 * This file was auto-generated by Fern from our API Definition.
 */

/**
 * @example
 *     {
 *         name: "your_group_name"
 *     }
 */
export interface GroupCreateRequest {
    /** The name of the group being created. */
    name: string;
    /** Specify bucketName to automatically create a bucket, by the name specified, and add it to the created group. */
    bucketName?: string;
}