const path = require("path");
const iShareToolsForI4Trust = require("ishare-tools-for-i4trust");

require("dotenv").config({ path: __dirname + path.sep + ".env" });

const activationDate = new Date();
const expirationDate = new Date();

expirationDate.setFullYear(activationDate.getFullYear() + 10);

const activationTime = Math.floor(activationDate.getTime() / 1000);
const expirationTime = Math.floor(expirationDate.getTime() / 1000);

const DELEGATION_EVIDENCE = {
    delegationEvidence: {
        notBefore: activationTime,
        notOnOrAfter: expirationTime,
        policyIssuer: process.env.AR_IDENTIFIER,
        target: {
            accessSubject: process.env.MARKETPLACE_IDENTIFIER
        },
        policySets: [
            {
                target: {
                    environment: {
                        licenses: [
                            "ISHARE.0001"
                        ]
                    }
                },
                policies: [
                    {
                        target: {
                            resource: {
                                type: "delegationEvidence",
                                identifiers: [
                                    "*"
                                ],
                                attributes: [
                                    "*"
                                ]
                            },
                            actions: [
                                "POST"
                            ]
                        },
                        rules: [
                            {
                                effect: "Permit"
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

async function main() {
    console.log("Generating iShare JWT...");

    var config = {
        issuer: process.env.AR_IDENTIFIER,
        subject: process.env.AR_IDENTIFIER,
        audience: process.env.AR_IDENTIFIER,
        x5c: [process.env.AR_X5C_1, process.env.AR_X5C_2, process.env.AR_X5C_3],
        privateKey: process.env.AR_PRIVATE_KEY
    };

    const iShareJWT = iShareToolsForI4Trust.generateIShareJWT(config);

    console.log("OK\n");

    console.log("Requesting access token...");

    var config = {
        arTokenURL: process.env.AR_TOKEN_URL,
        clientId: process.env.AR_IDENTIFIER,
        iShareJWT: iShareJWT
    };

    const accessToken = await iShareToolsForI4Trust.getAccessToken(config);

    console.log("OK\n");

    console.log("Creating initial policy...");

    var config = {
        arPolicyURL: process.env.AR_POLICY_URL,
        delegationEvidence: DELEGATION_EVIDENCE,
        accessToken: accessToken
    };

    await iShareToolsForI4Trust.createPolicy(config);

    console.log("OK\n");
}

main().catch(error => {
    console.log("Failed\n");
    if (error.response && error.response.data) {
        console.log(error.response.data);
    }
});
