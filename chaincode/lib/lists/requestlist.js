'use strict';

const Request = require('../models/request.js');

class RequestList {
	
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.registration-network.regnet.lists.request';
	}
	
	/**
	 * Returns the Request model stored in blockchain identified by this key
	 * @param RequestKey
	 * @returns {Promise<Request>}
	 */
	async getRequest(requestKey) {
		let requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestKey.split(':'));
		let requestBuffer = await this.ctx.stub.getState(requestCompositeKey);
		return Request.fromBuffer(requestBuffer);
	}
	
	/**
	 * Adds a request model to the blockchain
	 * @param requestObject {Request}
	 * @returns {Promise<void>}
	 */
	async addRequest(requestObject) {
		let requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObject.getKeyArray());
		let requestBuffer = requestObject.toBuffer();
		await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
	}
	
	/**
	 * Updates a request model on the blockchain
	 * @param requestObject {Request}
	 * @returns {Promise<void>}
	 */
	async updateRequest(requestObject) {
		let requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObject.getKeyArray());
		let requestBuffer = requestObject.toBuffer();
		await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
	}
}

module.exports = RequestList;