/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as GroundX from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Documents {
    interface Options {
        environment?: core.Supplier<environments.GroundXEnvironment | string>;
        apiKey: core.Supplier<string>;
        fetcher?: core.FetchFunction;
    }

    interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Additional headers to include in the request. */
        headers?: Record<string, string>;
    }
}

export class Documents {
    constructor(protected readonly _options: Documents.Options) {}

    /**
     * Ingest documents hosted on public URLs into a GroundX bucket.
     *
     * @param {GroundX.DocumentRemoteIngestRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.ingestRemote({
     *         documents: [{
     *                 bucketId: 1234,
     *                 fileName: "my_file1.txt",
     *                 fileType: "txt",
     *                 sourceUrl: "https://my.source.url.com/file1.txt"
     *             }]
     *     })
     */
    public async ingestRemote(
        request: GroundX.DocumentRemoteIngestRequest,
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents/remote"
            ),
            method: "POST",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/ingest/documents/remote.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Upload documents hosted on a local file system into a GroundX bucket.
     *
     * @param {GroundX.DocumentLocalIngestRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.ingestLocal([{
     *             blob: "blob",
     *             metadata: {
     *                 bucketId: 1234,
     *                 fileName: "my_file1.txt",
     *                 fileType: "txt"
     *             }
     *         }])
     */
    public async ingestLocal(
        request: GroundX.DocumentLocalIngestRequest,
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents/local"
            ),
            method: "POST",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
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

    /**
     * Upload the content of a publicly accessible website for ingestion into a GroundX bucket. This is done by following links within a specified URL, recursively, up to a specified depth or number of pages.
     * Note1: This endpoint is currently not supported for on-prem deployments.
     * Note2: The `source_url` must include the protocol, http:// or https://.
     *
     * @param {GroundX.WebsiteCrawlRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.crawlWebsite({
     *         websites: [{
     *                 bucketId: 1234,
     *                 cap: 10,
     *                 depth: 2,
     *                 searchData: {
     *                     "key": "value"
     *                 },
     *                 sourceUrl: "https://my.website.com"
     *             }]
     *     })
     */
    public async crawlWebsite(
        request: GroundX.WebsiteCrawlRequest,
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents/website"
            ),
            method: "POST",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            body: request,
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
                throw new errors.GroundXTimeoutError(
                    "Timeout exceeded when calling POST /v1/ingest/documents/website."
                );
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * lookup all documents across all resources which are currently on GroundX
     *
     * @param {GroundX.DocumentsListRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.documents.list()
     */
    public async list(
        request: GroundX.DocumentsListRequest = {},
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.DocumentListResponse> {
        const { n, filter, sort, sortOrder, status, nextToken } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (n != null) {
            _queryParams["n"] = n.toString();
        }

        if (filter != null) {
            _queryParams["filter"] = filter;
        }

        if (sort != null) {
            _queryParams["sort"] = sort;
        }

        if (sortOrder != null) {
            _queryParams["sortOrder"] = sortOrder;
        }

        if (status != null) {
            _queryParams["status"] = status;
        }

        if (nextToken != null) {
            _queryParams["nextToken"] = nextToken;
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents"
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.DocumentListResponse;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.GroundXError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.GroundXError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/ingest/documents.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Delete multiple documents hosted on GroundX
     *
     * @param {GroundX.DocumentsDeleteRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.delete({
     *         documentIds: "123e4567-e89b-12d3-a456-426614174000,9f7c11a6-24b8-4d52-a9f3-90a7e70a9e49"
     *     })
     */
    public async delete(
        request: GroundX.DocumentsDeleteRequest = {},
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        const { documentIds } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (documentIds != null) {
            if (Array.isArray(documentIds)) {
                _queryParams["documentIds"] = documentIds.map((item) => item);
            } else {
                _queryParams["documentIds"] = documentIds;
            }
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest/documents"
            ),
            method: "DELETE",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling DELETE /v1/ingest/documents.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Get the current status of an ingest, initiated with documents.ingest_remote, documents.ingest_local, or documents.crawl_website, by specifying the processId (the processId is included in the response of the documents.ingest functions).
     *
     * @param {string} processId - the processId for the ingest process being checked
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.getProcessingStatusById("processId")
     */
    public async getProcessingStatusById(
        processId: string,
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.ProcessStatusResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/ingest/${encodeURIComponent(processId)}`
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.ProcessStatusResponse;
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/ingest/{processId}.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * lookup the document(s) associated with a processId, bucketId, groupId, or projectId.
     *
     * @param {number} id - a processId, bucketId, groupId, or projectId
     * @param {GroundX.DocumentsLookupRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.lookup(1)
     */
    public async lookup(
        id: number,
        request: GroundX.DocumentsLookupRequest = {},
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.DocumentLookupResponse> {
        const { n, filter, sort, sortOrder, status, nextToken } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (n != null) {
            _queryParams["n"] = n.toString();
        }

        if (filter != null) {
            _queryParams["filter"] = filter;
        }

        if (sort != null) {
            _queryParams["sort"] = sort;
        }

        if (sortOrder != null) {
            _queryParams["sortOrder"] = sortOrder;
        }

        if (status != null) {
            _queryParams["status"] = status;
        }

        if (nextToken != null) {
            _queryParams["nextToken"] = nextToken;
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/ingest/documents/${encodeURIComponent(id)}`
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.DocumentLookupResponse;
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/ingest/documents/{id}.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Look up an existing document by documentId.
     *
     * @param {string} documentId - The documentId of the document for which GroundX information will be provided.
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.get("documentId")
     */
    public async get(documentId: string, requestOptions?: Documents.RequestOptions): Promise<GroundX.DocumentResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/ingest/document/${encodeURIComponent(documentId)}`
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.DocumentResponse;
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
                throw new errors.GroundXTimeoutError(
                    "Timeout exceeded when calling GET /v1/ingest/document/{documentId}."
                );
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Delete a single document hosted on GroundX
     *
     * @param {string} documentId - A documentId which correspond to a document ingested by GroundX
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.documents.deleteById("documentId")
     */
    public async deleteById(
        documentId: string,
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.IngestResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/ingest/document/${encodeURIComponent(documentId)}`
            ),
            method: "DELETE",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            requestType: "json",
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
                throw new errors.GroundXTimeoutError(
                    "Timeout exceeded when calling DELETE /v1/ingest/document/{documentId}."
                );
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Get a list of ingest process requests, sorted from most recent to least.
     *
     * @param {GroundX.DocumentGetProcessesRequest} request
     * @param {Documents.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.documents.documentGetProcesses()
     */
    public async documentGetProcesses(
        request: GroundX.DocumentGetProcessesRequest = {},
        requestOptions?: Documents.RequestOptions
    ): Promise<GroundX.ProcessesStatusResponse> {
        const { n, status } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (n != null) {
            _queryParams["n"] = n.toString();
        }

        if (status != null) {
            _queryParams["status"] = status;
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/ingest"
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.2",
                "User-Agent": "groundx/2.2.2",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.ProcessesStatusResponse;
        }

        if (_response.error.reason === "status-code") {
            throw new errors.GroundXError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.GroundXError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                });
            case "timeout":
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/ingest.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    protected async _getCustomAuthorizationHeaders() {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue };
    }
}
