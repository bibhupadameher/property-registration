'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

const Request = require('./lib/models/request.js');
const User = require('./lib/models/user.js');
const Property = require('./lib/models/property.js');

const requestList = require('./lib/lists/requestlist.js');
const userList = require('./lib/lists/userlist.js');
const propertyList = require('./lib/lists/propertylist.js');

class UserContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.requestList = new requestList(this);
        this.userList = new userList(this);
        this.propertyList = new propertyList(this);

    }
}

class UserContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.registration-network.usercontract');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new UserContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('user Smart Contract Instantiated');
    }

	/**
	 * Create a new User request on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the User
	 * @param email - Email ID of the User
	 * @param phone - phone number  of the User
	 * @param aadhar - aadhar ID of the User
	 * @returns newRequestObject {Object}
	 */
    async requestNewUser(ctx, name, email, phone, aadhar) {
        // Verify the CLient is an user or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "usersMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the new User account
        const requestKey = Request.makeKey([name, aadhar]);

        // Fetch User Request with given name and aadhar from blockchain
        let existingRequest = await ctx.requestList
            .getRequest(requestKey)
            .catch(err => console.log('Provided User name and aadhar is unique!'));

        // Make sure User does not already exist.
        if (existingRequest !== undefined) {
            throw new Error('Invalid User aadhar ID: ' + aadhar + '. A User with this Aadhar ID already exists.');
        } else {
            // Create a User request object to be stored in blockchain
            let requestObject = {
                req: "88888888888888888",
                name: name,
                email: email,
                phone: phone,
                aadhar: aadhar,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Create a new instance of Request model and save it to blockchain
            let newRequestObject = Request.createInstance(requestObject, "user");
            await ctx.requestList.addRequest(newRequestObject);
            // Return value of new Request Object
            return newRequestObject;
        }


    }

    /**
	 * recharge Account on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the User
	 * @param aadhar - aadhar ID of the User
	 * @param bankTransactionId - Bank Transaction ID
	 * @returns
	 */
    async rechargeAccount(ctx, name, aadhar, bankTransactionId) {
        // Verify the CLient is an user or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "usersMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        // Create a new composite key for the  User account
        const userKey = User.makeKey([name, aadhar]);

        // Fetch User  with given name and aadhar from blockchain
        let existingUser = await ctx.userList
            .getUser(userKey)
            .catch(err => console.log('Provided User name and aadhar is not valid!'));

        // Make sure User  already exist.
        if (existingUser === undefined) {
            throw new Error('Invalid User aadhar ID: ' + aadhar + '. No User  with this Aadhar ID and name  exists.');
        } else {
            // Recharge account

            if (bankTransactionId === "upg100") {
                existingUser.upgradCoins = existingUser.upgradCoins + 100;
            } else if (bankTransactionId === "upg500") {
                existingUser.upgradCoins = existingUser.upgradCoins + 500;
            } else if (bankTransactionId === "upg1000") {
                existingUser.upgradCoins = existingUser.upgradCoins + 1000;
            } else {
                throw new Error('Invalid Bank Transaction ID');
            }
            existingUser.updatedAt = new Date();
            // Create a new instance of User model and save it to blockchain
            let newUserObject = User.createInstance(existingUser);
            await ctx.userList.updateUser(newUserObject);
            // Return value of new User created
            return newUserObject;
        }


    }

    /**
* view User Account on the network
* @param ctx - The transaction context object
* @param name - Name of the User
* @param aadhar - aadhar ID of the User
* @returns existingUser {Object}
*/
    async viewUser(ctx, name, aadhar) {
        // Create a new composite key for the  User account
        const userKey = User.makeKey([name, aadhar]);

        // Fetch User  with given name and aadhar from blockchain
        let existingUser = await ctx.userList
            .getUser(userKey)
            .catch(err => console.log('Provided User name and aadhar is not valid!'));

        // Make sure User  already exist.
        if (existingUser === undefined) {
            throw new Error('Invalid User aadhar ID: ' + aadhar + '. No User  with this Aadhar ID and name  exists.');
        } else {
            return existingUser;
        }
    }

	/**
	 * property Registration Request on the network
	 * @param ctx - The transaction context object
	 * @param propertyId - Property ID of property
	 * @param price - Price of Propery
	 * @param status - Status of property
	 * @param name - name of owner of property
	 * @param aadhar - aadhar of owner of property
	 * @returns
	 */
    async propertyRegistrationRequest(ctx, propertyId, price, status, name, aadhar) {
        // Verify the CLient is an user or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "usersMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the  User account
        const userKey = User.makeKey([name, aadhar]);

        // Fetch User  with given name and aadhar from blockchain
        let existingUser = await ctx.userList
            .getUser(userKey)
            .catch(err => console.log('Provided User name and aadhar is not valid!'));

        // Make sure User  already exist.
        if (existingUser === undefined) {
            throw new Error('Invalid User aadhar ID: ' + aadhar + '. No User  with this Aadhar ID and name  exists.');
        } else {

            // Create a new composite key for the Property Registration
            const requestKey = Request.makeKey([propertyId]);

            // Fetch Property Request with given PropertyID from blockchain
            let existingRequest = await ctx.requestList
                .getRequest(requestKey)
                .catch(err => console.log('Provided propertyId is unique!'));

            // Make sure property does not already exist.
            if (existingRequest !== undefined) {
                throw new Error('Invalid propertyId: ' + propertyId + '. A Request with this property ID already exists.');
            } else {

                //    let userCompositeKey = ctx.stub.createCompositeKey(userList.name, userKey.split(':'));
                var priceInNumber = Number(price);
                // Create a property request object to be stored in blockchain
                let requestObject = {
                    propertyId: propertyId,
                    //        owner: userCompositeKey,
                    owner: userKey,
                    price: priceInNumber,
                    status: status,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Create a new instance of Request model and save it to blockchain
                let newRequestObject = Request.createInstance(requestObject, "property");
                await ctx.requestList.addRequest(newRequestObject);
                // Return value of new Request Object
                return newRequestObject;
            }
        }


    }

	/**
	 * view Property on the network
	 * @param ctx - The transaction context object
	 * @param propertyId - Property ID
	 * @returns
	 */
    async viewProperty(ctx, propertyId) {
        // Create a new Property key for the  Property
        const propertyKey = Property.makeKey([propertyId]);

        // Fetch Property  with given Property IDfrom blockchain
        let existingProperty = await ctx.propertyList
            .getProperty(propertyKey)
            .catch(err => console.log('Provided property Id is not valid!'));

        // Make sure Property  already exist.
        if (existingProperty === undefined) {
            throw new Error('Invalid property Id: ' + propertyId + '. No property  with this  ID  exists.');
        } else {
            return existingProperty;
        }
    }

	/**
		 * update Property on the network
		 * @param ctx - The transaction context object
		 * @param propertyId - Property ID of property
		 * @param name - name of owner of property
		 * @param aadhar - aadhar of owner of property
		 * @param status - Status of property
		 * @returns
		 */
    async updateProperty(ctx, propertyId, name, aadhar, status) {
        // Verify the CLient is an user or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "usersMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the  property
        const propertyKey = Property.makeKey([propertyId]);

        // Fetch property  with given property ID from blockchain
        let existingProperty = await ctx.propertyList
            .getProperty(propertyKey)
            .catch(err => console.log('Provided Property ID is not valid!'));

        // Make sure Property  already exist.
        if (existingProperty === undefined) {
            throw new Error('Invalid Property ID: ' + propertyId + '. No Property with this  ID   exists.');
        } else {
            // Create a new composite key for the  User account
            const userKey = User.makeKey([name, aadhar]);

            // Fetch User  with given name and aadhar from blockchain
            let existingUser = await ctx.userList
                .getUser(userKey)
                .catch(err => console.log('Provided User name and aadhar is not valid!'));

            // Make sure User  already exist.
            if (existingUser === undefined) {
                throw new Error('Invalid User aadhar ID: ' + aadhar + '. No User  with this Aadhar ID and name  exists.');
            } else {

                //Make ownercompositeKey
                // let ownerCompositeKey = ctx.stub.createCompositeKey(userList.name, userKey.split(':'));
                // if (ownerCompositeKey !== existingProperty.owner) {
                if (userKey !== existingProperty.owner) {
                    throw new Error('The User is not the owner of property.');
                } else {
                    existingProperty.status = status;
                    existingProperty.updatedAt = new Date();
                    // Create a new instance of Property model and save it to blockchain
                    let newPropertyObject = Property.createInstance(existingProperty);
                    await ctx.propertyList.updateProperty(newPropertyObject);
                    // Return value of new Property Object
                    return newPropertyObject;
                }

            }
        }
    }

	/**
		 * purchase Property on the network
		 * @param ctx - The transaction context object
		 * @param propertyId - Property ID of property
		 * @param name - name of buyer of property
		 * @param aadhar - aadhar of buyer of property
		 * @returns
		 */
    async purchaseProperty(ctx, propertyId, name, aadhar) {
        // Verify the CLient is an user or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "usersMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the  property
        const propertyKey = Property.makeKey([propertyId]);

        // Fetch property  with given property ID from blockchain
        let existingProperty = await ctx.propertyList
            .getProperty(propertyKey)
            .catch(err => console.log('Provided Property ID is not valid!'));
        // Create a new composite key for the  User account
        const buyerKey = User.makeKey([name, aadhar]);
        // Fetch User  with given name and aadhar from blockchain
        let buyer = await ctx.userList
            .getUser(buyerKey)
            .catch(err => console.log('Provided User name and aadhar is not valid!'));

        //Make buyercompositeKey
        // let buyerCompositeKey = ctx.stub.createCompositeKey(userList.name, userKey.split(':'));

        // Make sure Property  already exist.
        if (existingProperty === undefined) {
            throw new Error('Invalid Property ID: ' + propertyId + '. No Property with this  ID   exists.');
        }
        // Make sure buyer  already exist.
        else if (buyer === undefined) {
            throw new Error('Invalid Buyer aadhar ID: ' + aadhar + '. No User  with this Aadhar ID and name  exists.');
            // } else if (buyerCompositeKey === existingProperty.owner) {
        } else if (buyerKey === existingProperty.owner) {
            throw new Error('The User is already owner of property.');
        } else if (existingProperty.status !== "onSale") {
            throw new Error('The property is not on Sale');
            // } else if (buyer.upgradCoins < existingProperty.price) {
            //     throw new Error('The buyer is not having sufficient balance');
        }
        else {
            let sellerkey = existingProperty.owner;

            // let userBuffer = await ctx.stub.getState(sellerkey);
            // let sellerObject = User.fromBuffer(userBuffer);
            let sellerObject = await ctx.userList
                .getUser(sellerkey)
                .catch(err => console.log('Provided User name and aadhar is not valid!'));
            sellerObject.upgradCoins = sellerObject.upgradCoins + existingProperty.price;
            sellerObject.updatedAt = new Date();
            // Create a new instance of User model and save it to blockchain
            let newUserObject = User.createInstance(sellerObject);
            await ctx.userList.updateUser(newUserObject);

            buyer.upgradCoins = buyer.upgradCoins - existingProperty.price;
            buyer.updatedAt = new Date();
            // Create a new instance of User model and save it to blockchain
            let newbuyerObject = User.createInstance(buyer);
            await ctx.userList.updateUser(newbuyerObject);


            existingProperty.owner = buyerKey;
            existingProperty.updatedAt = new Date();
            existingProperty.status = "registered";
            // Create a new instance of Property model and save it to blockchain
            let newPropertyObject = Property.createInstance(existingProperty);
            await ctx.propertyList.updateProperty(newPropertyObject);
            // Return value of new Property Object
            return newPropertyObject;
        }
    }


}



module.exports = UserContract;