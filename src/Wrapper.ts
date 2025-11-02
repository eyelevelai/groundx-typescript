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
        requestOptions?: FernClient.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        if (documents.length === 0) {
            throw new Error("No documents provided for ingestion.");
        }

        const localDocuments = [];
        const remoteDocuments: GroundX.IngestRemoteDocument[] = [];

        for (const document of documents) {
            if (!document.filePath) {
                throw new Error("Each document must have a 'filePath' attribute.");
            }

            if (this.isUrl(document.filePath)) {
                remoteDocuments.push(
                    {
                        bucketId: document.bucketId,
                        fileName: document.fileName,
                        fileType: document.fileType,
                        filter: document.filter,
                        processLevel: document.processLevel,
                        searchData: document.searchData,
                        sourceUrl: document.filePath,
                    }
                );
            } else if (this.isValidLocalPath(document.filePath)) {
                const expandedPath = this.expandedPath(document.filePath)
                let fileName = this.getFileName(expandedPath);
                if (!fileName) {
                    throw new Error(`Invalid file path: ${document.filePath}`);
                }

                let mimeType = this.guessMimeType(fileName);
                let fileType = this.getDocumentTypeFromMimeType(mimeType);
                if (document.fileType) {
                    fileType = document.fileType
                    mimeType = this.getMimeTypeFromDocumentType(fileType);
                }

                if (document.fileName) {
                    fileName = document.fileName;
                }

                const meta: Record<string, any> = {
                    bucketId: document.bucketId,
                    fileName,
                    fileType: fileType,
                };
                if (document.processLevel) {
                    meta.processLevel = document.processLevel;
                }
                if (document.searchData) {
                    meta.searchData = document.searchData;
                }
                if (document.filter) {
                    meta.filter = document.filter;
                }

                localDocuments.push({
                    fileName,
                    filePath: document.filePath,
                    mimeType,
                    metadata: meta,
                });
            } else {
                throw new Error(`Invalid file path: ${document.filePath}`);
            }
        }

        if (localDocuments.length > 0 && remoteDocuments.length > 0) {
            throw new Error("Documents must all be either local or remote, not a mix.");
        }

        if (remoteDocuments.length > 0) {
            // Handle remote documents
            return this.documents.ingestRemote({ documents: remoteDocuments, callbackData: callbackData, callbackUrl: callbackUrl }, requestOptions);
        }

        // Handle local documents
        const formData = new FormData();
        for (const { fileName, filePath, mimeType, metadata } of localDocuments) {
            formData.append(
                "blob",
                new Blob([new Uint8Array(this.readFile(filePath))], { type: mimeType }),
                fileName
            );
            formData.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], { type: "application/json" }),
                "data.json"
            );
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents/local"
            ),
            method: "POST",
            headers: {
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            body: formData,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });

        if (_response.ok) {
            return _response.body as GroundX.IngestResponse;
        }

        if (_response.error.reason === "status-code") {
            switch (_response.error.statusCode) {
                case 400:
                    throw new GroundX.BadRequestError(_response.error.body as unknown);
                case 401:
                    throw new GroundX.UnauthorizedError(_response.error.body as unknown);
                default:
                    throw new errors.GroundXError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.body,
                    });
            }
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.GroundXError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/ingest/documents/local.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    private expandedPath(filePath: string): string {
        return filePath.startsWith("~")
        ? filePath.replace("~", os.homedir())
        : path.resolve(filePath);
    }

    private getDocumentTypeFromMimeType(mimeType: string): string {
        return MIME_TO_DOCUMENT_TYPE[mimeType] || "txt";
    }

    private getMimeTypeFromDocumentType(documentType: string): string {
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


    private guessMimeType(fileName: string): string {
        const extension = fileName.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "txt":
                return "text/plain";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "pdf":
                return "application/pdf";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "csv":
                return "text/csv";
            case "tsv":
                return "text/tab-separated-values";
            case "json":
                return "application/json";
        }

        return "application/octet-stream";
    }

    private readFile(filePath: string): Buffer {
        const expandedPath = this.expandedPath(filePath);

        return fs.readFileSync(expandedPath);
    }

    protected async _getCustomAuthorizationHeaders(): Promise<Record<string, string>> {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue };
    }

}

const DOCUMENT_TYPE_TO_MIME: Record<string, string> = {
    txt: "text/plain",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    json: "application/json",
};

const MIME_TO_DOCUMENT_TYPE: Record<string, string> = Object.fromEntries(
    Object.entries(DOCUMENT_TYPE_TO_MIME).map(([key, value]) => [value, key])
);