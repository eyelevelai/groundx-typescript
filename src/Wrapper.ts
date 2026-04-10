import fs from "fs";
import os from "os";

import { GroundXClient as FernClient } from "./Client";

import * as GroundX from "./api/index";
import * as core from "./core";
import * as environments from "./environments";
import * as errors from "./errors/index";
import * as path from "path";

import urlJoin from "url-join";

export class GroundXClient extends FernClient {
  
    public async ingest(
        documents: GroundX.Document[],
        callbackUrl?: string,
        callbackData?: string,
        requestOptions?: FernClient.RequestOptions,
        uploadApi: string = "https://api.eyelevel.ai/upload/file"
    ): Promise<GroundX.IngestResponse> {
        if (documents.length === 0) {
            throw new Error("No documents provided for ingestion.");
        }

        const localDocuments: GroundX.Document[] = [];
        const remoteDocuments: GroundX.IngestRemoteDocument[] = [];

        for (const document of documents) {
            if (!document.filePath) {
                throw new Error("Each document must have a 'filePath' attribute.");
            }

            if (this.isUrl(document.filePath)) {
                remoteDocuments.push({
                    bucketId: document.bucketId,
                    fileName: document.fileName,
                    fileType: document.fileType,
                    filter: document.filter,
                    processLevel: document.processLevel,
                    searchData: document.searchData,
                    sourceUrl: document.filePath,
                });
            } else if (this.isValidLocalPath(document.filePath)) {
                localDocuments.push(document);
            } else {
                throw new Error(`Invalid file path: ${document.filePath}`);
            }
        }

        const uploadedLocalDocuments = await this.processLocalDocuments(localDocuments, uploadApi);
        remoteDocuments.push(...uploadedLocalDocuments);

        return this.documents.ingestRemote(
            {
                documents: remoteDocuments,
                callbackData,
                callbackUrl,
            },
            requestOptions
        );
    }

    private async getPresignedUrl(
        endpoint: string,
        fileName: string,
        fileExtension: string
    ): Promise<Record<string, any>> {
        const url = new URL(endpoint);
        url.searchParams.set("name", fileName);
        url.searchParams.set("type", fileExtension);

        const response = await (this._options.fetcher ?? core.fetcher)({
            url: url.toString(),
            method: "GET",
            headers: {
                ...(await this._getCustomAuthorizationHeaders()),
            },
        });

        if (!response.ok) {
            if (response.error.reason === "status-code") {
                throw new Error(`Failed to get presigned URL: ${response.error.statusCode}`);
            }
            if (response.error.reason === "non-json") {
                throw new Error(`Failed to get presigned URL: ${response.error.rawBody}`);
            }
            if (response.error.reason === "timeout") {
                throw new Error("Timeout exceeded when requesting presigned URL.");
            }
            if (response.error.reason === "unknown") {
                throw new Error(response.error.errorMessage);
            }
            throw new Error("Failed to get presigned URL.");
        }

        return response.body as Record<string, any>;
    }

    private stripQueryParams(inputUrl: string): string {
        const parsed = new URL(inputUrl);
        parsed.search = "";
        parsed.hash = "";
        return parsed.toString();
    }

    private getFileExtension(fileName: string): string {
        const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
        return DOCUMENT_TYPE_ALIASES[extension] ?? extension;
    }

    private async uploadFile(endpoint: string, filePath: string): Promise<string> {
        const expandedPath = this.expandedPath(filePath);
        const fileName = this.getFileName(expandedPath);
        if (!fileName) {
            throw new Error(`Invalid file path: ${filePath}`);
        }

        const fileExtension = this.getFileExtension(fileName);
        const presignedInfo = await this.getPresignedUrl(endpoint, fileName, fileExtension);

        const uploadUrl = presignedInfo["URL"];
        const headerData = presignedInfo["Header"] ?? {};
        const method = String(presignedInfo["Method"] ?? "PUT").toUpperCase();

        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(headerData)) {
            if (Array.isArray(value) && value.length > 0) {
                headers[key.toUpperCase()] = String(value[0]);
            } else if (typeof value === "string") {
                headers[key.toUpperCase()] = value;
            }
        }

        if (method !== "PUT") {
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers,
            body: new Uint8Array(this.readFile(filePath)),
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} - ${await uploadResponse.text()}`);
        }

        if (headers["GX-HOSTED-URL"]) {
            return headers["GX-HOSTED-URL"];
        }

        return this.stripQueryParams(uploadUrl);
    }

    private async processLocalDocuments(
        localDocuments: GroundX.Document[],
        uploadApi: string
    ): Promise<GroundX.IngestRemoteDocument[]> {
        const remoteDocuments: GroundX.IngestRemoteDocument[] = [];

        for (const document of localDocuments) {
            const expandedPath = this.expandedPath(document.filePath);
            let fileName = this.getFileName(expandedPath);
            if (!fileName) {
                throw new Error(`Invalid file path: ${document.filePath}`);
            }

            const sourceUrl = await this.uploadFile(uploadApi, document.filePath);

            if (document.fileName) {
                fileName = document.fileName;
            }

            let fileType = document.fileType;
            if (!fileType) {
                const extension = this.getFileExtension(fileName);
                fileType = this.getDocumentTypeFromMimeType(
                    this.getMimeTypeFromDocumentType(extension)
                );
            }

            remoteDocuments.push({
                bucketId: document.bucketId,
                fileName,
                fileType,
                filter: document.filter,
                processLevel: document.processLevel,
                searchData: document.searchData,
                sourceUrl,
            });
        }

        return remoteDocuments;
    }

    private expandedPath(filePath: string): string {
        return filePath.startsWith("~")
        ? filePath.replace("~", os.homedir())
        : path.resolve(filePath);
    }

    private getDocumentTypeFromMimeType(mimeType: string): GroundX.DocumentType {
        return (MIME_TO_DOCUMENT_TYPE[mimeType] || "txt") as GroundX.DocumentType;
    }

    private getMimeTypeFromDocumentType(documentType: GroundX.DocumentType | string): string {
        return DOCUMENT_TYPE_TO_MIME[documentType] || "application/octet-stream";
    }

    private isUrl(filePath: string): boolean {
        try {
            const url = new URL(filePath);
            return !!url.protocol && !!url.hostname;
        } catch {
            return false;
        }
    }

    private isValidLocalPath(filePath: string): boolean {
        try {
            const expandedPath = this.expandedPath(filePath);

            const stats = fs.statSync(expandedPath);
            return stats.isFile();
        } catch {
            return false;
        }
    }

    private getFileName(filePath: string): string | null {
        return filePath.split("/").pop() || null;
    }

    private readFile(filePath: string): Buffer {
        const expandedPath = this.expandedPath(filePath);

        return fs.readFileSync(expandedPath);
    }

    protected async _getCustomAuthorizationHeaders(): Promise<Record<string, string>> {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue || "" };
    }

}

const DOCUMENT_TYPE_ALIASES: Record<string, string> = {
    jfi: "jpg",
    jfif: "jpg",
    jpe: "jpg",
    jpeg: "jpg",
    heic: "heif",
    tif: "tiff",
    md: "txt",
};


const DOCUMENT_TYPE_TO_MIME: Record<string, string> = {
    bmp: "image/bmp",
    gif: "image/gif",
    heif: "image/heif",
    hwp: "application/x-hwp",
    ico: "image/vnd.microsoft.icon",
    svg: "image/svg",
    tiff: "image/tiff",
    webp: "image/webp",
    txt: "text/plain",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    json: "application/json",
};

const MIME_TO_DOCUMENT_TYPE: Record<string, GroundX.DocumentType> = Object.fromEntries(
    Object.entries(DOCUMENT_TYPE_TO_MIME).map(([key, value]) => [value, key as GroundX.DocumentType])
) as Record<string, GroundX.DocumentType>;