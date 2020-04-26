'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

const Request = require('./lib/models/request.js');
const User = require('./lib/models/user.js');
const Property = require('./lib/models/property.js');



const requestList = require('./lib/lists/requestlist.js');
const userList = require('./lib/lists/userlist.js');
const propertyList = require('./lib/lists/propertylist.js');


class RegistrarContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.requestList = new requestList(this);
        this.userList = new userList(this);
        this.propertyList = new propertyList(this);

    }
}

class RegistrarContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.registration-network.registrarcontract');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new RegistrarContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('RegistrarContext Smart Contract Instantiated');
    }



	/**
	 * approve a New User on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the User
	 * @param aadhar - aadhar ID of the User
	 * @returns
	 */
    async approveNewUser(ctx, name, aadhar) {
        // Verify the CLient is an registar or not
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "registrarMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the new User account
        const requestKey = Request.makeKey([name, aadhar]);

        // Fetch User Request with given name and aadhar from blockchain
        let existingRequest = await ctx.requestList
            .getRequest(requestKey)
            .catch(err => console.log('Provided User name and aadhar is not valid!'));

        let existingUser = await ctx.userList
            .getUser(requestKey)
            .catch(err => console.log('Already this user exists'));

        // Make sure User does not already exist.
        if (existingRequest === undefined) {
            throw new Error('Invalid User aadhar ID: ' + aadhar + '. No request  with this Aadhar ID and name  exists.');
        } else if (existingUser !== undefined) {
            throw new Error(' User already exists with aadhar ID: ' + aadhar);
        }

        else {
            // Create a User  object to be stored in blockchain
            let UserObject = {
                name: name,
                email: existingRequest.email,
                phone: existingRequest.phone,
                aadhar: aadhar,
                upgradCoins: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Create a new instance of User model and save it to blockchain
            let newUserObject = User.createInstance(UserObject);
            await ctx.userList.addUser(newUserObject);
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
	 * approve Property Registration on the network
	 * @param ctx - The transaction context object
	 * @param propertyId - Property ID of property
	 * @returns
	 */
    async approvePropertyRegistration(ctx, propertyId) {
         // Verify the CLient is an registar or not
         let cid = new ClientIdentity(ctx.stub);
         let mspID = cid.getMSPID();
         if (mspID !== "registrarMSP") {
             throw new Error('You are not authorized to invoke this fuction');
         }
        // Create a new composite key for the  property Request
        const requestKey = Request.makeKey([propertyId]);

        // Fetch Request  with given propertyId from blockchain
        let existingRequest = await ctx.requestList
            .getRequest(requestKey)
            .catch(err => console.log('Provided property Id is not valid!'));

        // Make sure Property request  already exist.
        if (existingRequest === undefined) {
            throw new Error('Invalid property Id: ' + propertyId + '. No Property  with this  ID  exists.');
        } else {
            // Create a new composite key for the Property Registration
            const propertyKey = Property.makeKey([propertyId]);

            // Fetch Property  with given PropertyID from blockchain
            let existingProperty = await ctx.propertyList
                .getProperty(propertyKey)
                .catch(err => console.log('Provided propertyId is unique!'));

            // Make sure Property does not already exist.
            if (existingProperty !== undefined) {
                throw new Error('Invalid propertyId: ' + propertyId + '. A Property with this property ID already exists.');
            } else {

                // Create a Property object to be stored in blockchain
                let propertyObject = {
                    propertyId: propertyId,
                    owner: existingRequest.owner,
                    price: existingRequest.price,
                    status: existingRequest.status,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Create a new instance of Property model and save it to blockchain
                let newPropertyObject = Property.createInstance(propertyObject);
                await ctx.propertyList.addProperty(newPropertyObject);
                // Return value of new Property Object
                return newPropertyObject;
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


}


module.exports = RegistrarContract;