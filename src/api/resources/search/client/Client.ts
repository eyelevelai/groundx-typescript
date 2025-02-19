/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as GroundX from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Search {
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

export class Search {
    constructor(protected readonly _options: Search.Options) {}

    /**
     * Search documents on GroundX for the most relevant information to a given query.
     * The result of this query is typically used in one of two ways; `result.search.text` can be used to provide context to a language model, facilitating RAG, or `result.search.results` can be used to observe chunks of text which are relevant to the query, facilitating citation.
     *
     * @param {GroundX.SearchContentRequestId} id - The bucketId, groupId, projectId, or documentId to be searched. The document or documents within the specified container will be compared to the query, and relevant information will be extracted.
     * @param {GroundX.SearchRequest} request
     * @param {Search.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.search.content(1, {
     *         nextToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
     *         query: "my search query"
     *     })
     */
    public async content(
        id: GroundX.SearchContentRequestId,
        request: GroundX.SearchRequest,
        requestOptions?: Search.RequestOptions
    ): Promise<GroundX.SearchResponse> {
        const { n, nextToken, verbosity, ..._body } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (n != null) {
            _queryParams["n"] = n.toString();
        }

        if (nextToken != null) {
            _queryParams["nextToken"] = nextToken;
        }

        if (verbosity != null) {
            _queryParams["verbosity"] = verbosity.toString();
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/search/${encodeURIComponent(id)}`
            ),
            method: "POST",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.1",
                "User-Agent": "groundx/2.2.1",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            body: _body,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.SearchResponse;
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/search/{id}.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Search documents on GroundX for the most relevant information to a given query by documentId(s).
     * The result of this query is typically used in one of two ways; `result.search.text` can be used to provide context to a language model, facilitating RAG, or `result.search.results` can be used to observe chunks of text which are relevant to the query, facilitating citation.
     *
     * @param {GroundX.SearchDocumentsRequest} request
     * @param {Search.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.search.documents({
     *         nextToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
     *         query: "my search query",
     *         documentIds: ["docUUID1", "docUUID2"]
     *     })
     */
    public async documents(
        request: GroundX.SearchDocumentsRequest,
        requestOptions?: Search.RequestOptions
    ): Promise<GroundX.SearchResponse> {
        const { n, nextToken, verbosity, ..._body } = request;
        const _queryParams: Record<string, string | string[] | object | object[]> = {};
        if (n != null) {
            _queryParams["n"] = n.toString();
        }

        if (nextToken != null) {
            _queryParams["nextToken"] = nextToken;
        }

        if (verbosity != null) {
            _queryParams["verbosity"] = verbosity.toString();
        }

        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/search/documents"
            ),
            method: "POST",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.2.1",
                "User-Agent": "groundx/2.2.1",
                "X-Fern-Runtime": core.RUNTIME.type,
                "X-Fern-Runtime-Version": core.RUNTIME.version,
                ...(await this._getCustomAuthorizationHeaders()),
                ...requestOptions?.headers,
            },
            contentType: "application/json",
            queryParameters: _queryParams,
            requestType: "json",
            body: _body,
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return _response.body as GroundX.SearchResponse;
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/search/documents.");
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
