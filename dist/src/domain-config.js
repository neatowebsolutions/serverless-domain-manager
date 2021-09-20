"use strict";
/**
 * Wrapper class for Custom Domain information
 */
const globals_1 = require("./globals");
class DomainConfig {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.enabled = this.evaluateEnabled(config.enabled);
        this.givenDomainName = config.domainName;
        this.hostedZonePrivate = config.hostedZonePrivate;
        this.certificateArn = config.certificateArn;
        this.certificateName = config.certificateName;
        this.createRoute53Record = config.createRoute53Record;
        this.hostedZoneId = config.hostedZoneId;
        this.hostedZonePrivate = config.hostedZonePrivate;
        this.allowPathMatching = config.allowPathMatching;
        this.autoDomain = config.autoDomain;
        this.autoDomainWaitFor = config.autoDomainWaitFor;
        let basePath = config.basePath;
        if (basePath == null || basePath.trim() === "") {
            basePath = "(none)";
        }
        this.basePath = basePath;
        let stage = config.stage;
        if (typeof stage === "undefined") {
            stage = globals_1.default.options.stage || globals_1.default.serverless.service.provider.stage;
        }
        this.stage = stage;
        const endpointTypeWithDefault = config.endpointType || globals_1.default.endpointTypes.edge;
        const endpointTypeToUse = globals_1.default.endpointTypes[endpointTypeWithDefault.toLowerCase()];
        if (!endpointTypeToUse) {
            throw new Error(`${endpointTypeWithDefault} is not supported endpointType, use edge or regional.`);
        }
        this.endpointType = endpointTypeToUse;
        const apiTypeWithDefault = config.apiType || globals_1.default.apiTypes.rest;
        const apiTypeToUse = globals_1.default.apiTypes[apiTypeWithDefault.toLowerCase()];
        if (!apiTypeToUse) {
            throw new Error(`${apiTypeWithDefault} is not supported api type, use REST, HTTP or WEBSOCKET.`);
        }
        this.apiType = apiTypeToUse;
        const securityPolicyDefault = config.securityPolicy || globals_1.default.tlsVersions.tls_1_2;
        const tlsVersionToUse = globals_1.default.tlsVersions[securityPolicyDefault.toLowerCase()];
        if (!tlsVersionToUse) {
            throw new Error(`${securityPolicyDefault} is not a supported securityPolicy, use tls_1_0 or tls_1_2.`);
        }
        this.securityPolicy = tlsVersionToUse;
        this.region = globals_1.default.defaultRegion;
        if (this.endpointType === globals_1.default.endpointTypes.regional) {
            this.region = globals_1.default.serverless.providers.aws.getRegion();
        }
        const acmCredentials = Object.assign({}, globals_1.default.serverless.providers.aws.getCredentials(), { region: this.region });
        this.acm = new globals_1.default.serverless.providers.aws.sdk.ACM(acmCredentials);
        const routingPolicy = (_c = (_b = (_a = config.route53Params) === null || _a === void 0 ? void 0 : _a.routingPolicy) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : 'simple';
        const routingPolicyToUse = globals_1.default.routingPolicies[routingPolicy];
        if (!routingPolicyToUse) {
            throw new Error(`${routingPolicy} is not a supported routing policy, use simple, latency, or weighted.`);
        }
        if (routingPolicyToUse !== globals_1.default.routingPolicies.simple
            && endpointTypeToUse === globals_1.default.endpointTypes.edge) {
            throw new Error(`${routingPolicy} routing is not intended to be used with edge endpoints. Use a regional endpoint instead.`);
        }
        this.route53Params = {
            routingPolicy: routingPolicyToUse,
            setIdentifier: (_d = config.route53Params) === null || _d === void 0 ? void 0 : _d.setIdentifier,
            weight: (_f = (_e = config.route53Params) === null || _e === void 0 ? void 0 : _e.weight) !== null && _f !== void 0 ? _f : 200,
            healthCheckId: (_g = config.route53Params) === null || _g === void 0 ? void 0 : _g.healthCheckId
        };
    }
    /**
     * Determines whether this plug-in is enabled.
     *
     * This method reads the customDomain property "enabled" to see if this plug-in should be enabled.
     * If the property's value is undefined, a default value of true is assumed (for backwards
     * compatibility).
     * If the property's value is provided, this should be boolean, otherwise an exception is thrown.
     * If no customDomain object exists, an exception is thrown.
     */
    evaluateEnabled(enabled) {
        if (enabled === undefined) {
            return true;
        }
        if (typeof enabled === "boolean") {
            return enabled;
        }
        else if (typeof enabled === "string" && enabled === "true") {
            return true;
        }
        else if (typeof enabled === "string" && enabled === "false") {
            return false;
        }
        throw new Error(`${globals_1.default.pluginName}: Ambiguous enablement boolean: "${enabled}"`);
    }
}
module.exports = DomainConfig;
