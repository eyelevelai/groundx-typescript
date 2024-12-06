/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as EyeLevel from "../../../index";

export interface DocumentRemoteIngestRequestDocumentsItem {
    /** the bucketId of the bucket which this remote file will be ingested to. */
    bucketId: number;
    /** The name of the file being ingested */
    fileName?: string;
    fileType?: EyeLevel.DocumentType;
    /** Custom metadata which can be used to influence GroundX's search functionality. This data can be used to further hone GroundX search. */
    searchData?: Record<string, unknown>;
    /** The URL of the document being ingested by GroundX. */
    sourceUrl: string;
}
