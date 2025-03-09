/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as GroundX from "../index";

export interface Document {
    /** The bucketId of the bucket which this file will be ingested into. */
    bucketId: number;
    /** The name of the file being ingested. */
    fileName?: string;
    /** The local file path or remote URL of the document being ingested by GroundX. */
    filePath: string;
    fileType?: GroundX.DocumentType;
    processLevel?: GroundX.ProcessLevel;
    /** Custom metadata which can be used to influence GroundX's search functionality. This data can be used to further hone GroundX search. */
    searchData?: Record<string, unknown>;
}
