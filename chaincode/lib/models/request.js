'use strict';

class Request {
	
	/**
	 * Constructor function
	 * @param requestObject {Object}
	 * @param requestType {string}
	 */
	constructor(requestObject,requestType) {
		if(requestType === "property"){
			this.key = Request.makeKey([requestObject.propertyId]);
		}else if(requestType === "user"){
			this.key = Request.makeKey([requestObject.name,requestObject.aadhar]);
		}
		
		Object.assign(this, requestObject);
	}
	
	/**
	 * Get class of this model
	 * @returns {string}
	 */
	static getClass() {
		return 'org.registration-network.regnet.models.request';
	}
	
	/**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */
	static fromBuffer(buffer) {
		let json = JSON.parse(buffer.toString());
		return new Request(json);
	}
	
	/**
	 * Convert the object of this model to a buffer stream
	 * @returns {Buffer}
	 */
	toBuffer() {
		return Buffer.from(JSON.stringify(this));
	}
	
	/**
	 * Create a key string joined from different key parts
	 * @param keyParts {Array}
	 * @returns {*}
	 */
	static makeKey(keyParts) {
		return keyParts.map(part => JSON.stringify(part)).join(":");
	}
	
	/**
	 * Create an array of key parts for this model instance
	 * @returns {Array}
	 */
	getKeyArray() {
		return this.key.split(":");
	}
	
	/**
	 * Create a new instance of this model
	 * @returns {Request}
	 * @param requestObject {Object}
	 * @param requestType {String}
	 */
	static createInstance(requestObject,requestType) {
		return new Request(requestObject,requestType);
	}
	
}

module.exports = Request;