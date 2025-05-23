/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as GroundX from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Health {
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

export class Health {
    constructor(protected readonly _options: Health.Options) {}

    /**
     * List the current health status of all services. Statuses update every 5 minutes.
     *
     * @param {Health.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.health.list()
     */
    public async list(requestOptions?: Health.RequestOptions): Promise<GroundX.HealthResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                "v1/health"
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.3.1",
                "User-Agent": "groundx/2.3.1",
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
            return _response.body as GroundX.HealthResponse;
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/health.");
            case "unknown":
                throw new errors.GroundXError({
                    message: _response.error.errorMessage,
                });
        }
    }

    /**
     * Look up the current health status of a specific service. Statuses update every 5 minutes.
     *
     * @param {string} service - The name of the service to look up.
     * @param {Health.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     *
     * @example
     *     await client.health.get("search")
     */
    public async get(service: string, requestOptions?: Health.RequestOptions): Promise<GroundX.HealthResponse> {
        const _response = await (this._options.fetcher ?? core.fetcher)({
            url: urlJoin(
                (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                `v1/health/${encodeURIComponent(service)}`
            ),
            method: "GET",
            headers: {
                "X-Fern-Language": "JavaScript",
                "X-Fern-SDK-Name": "groundx",
                "X-Fern-SDK-Version": "2.3.1",
                "User-Agent": "groundx/2.3.1",
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
            return _response.body as GroundX.HealthResponse;
        }

        if (_response.error.reason === "status-code") {
            switch (_response.error.statusCode) {
                case 400:
                    throw new GroundX.BadRequestError(_response.error.body as unknown);
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
                throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/health/{service}.");
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
