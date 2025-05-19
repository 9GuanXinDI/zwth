import {
	request
} from "./requestBase.js";

import {
	baseUrl
} from "../App.config.js"


export const GET = (url, params) => {
	return request(`${baseUrl}${url}`, params, "GET");
}

export const POST = (url, params,fireUrl) => {
	let domainUrl=fireUrl||baseUrl;
	return request(`${domainUrl}${url}`, params, "POST");
}

export const PUT = (url, params,isLoading) => {
	return request(`${baseUrl}${url}`, params, "PUT",isLoading);
}

export const DELETE = (url, params) => {
	return request(`${baseUrl}${url}`, params, "DELETE");
}

export const PATCH = (url, params) => {
	return request(`${baseUrl}${url}`, params, "PATCH");
}
