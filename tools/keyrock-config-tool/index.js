const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs").promises;
const path = require("path");

const rootDirectoryPath = path.dirname(path.dirname(__dirname));

dotenv.config({ path: [rootDirectoryPath, ".env"].join(path.sep) });

const keyrockAPIConfig = {
    baseURL: `http://localhost:${process.env.KEYROCK_PORT}/v1`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
};

var keyrockAPI = axios.create(keyrockAPIConfig);

async function main() {
    let data, response;

    process.stdout.write("Obtaining access token...");

    data = {
        name: process.env.KEYROCK_ADMIN_EMAIL,
        password: process.env.KEYROCK_ADMIN_PASSWORD
    };

    response = await keyrockAPI.post("/auth/tokens", data);
    const accessToken = response.headers["x-subject-token"];

    keyrockAPIConfig.headers["X-Auth-Token"] = accessToken;
    keyrockAPI = axios.create(keyrockAPIConfig);

    process.stdout.write(" OK\n");

    process.stdout.write("Retrieving admin user...");

    response = await keyrockAPI.get("/users/admin");
    const user = response.data.user;

    process.stdout.write(" OK\n");

    const applications = [
        {
            name: "Context broker",
            description: "Context broker",
            url: "http://none",
            redirect_uri: "http://none"
        },
        {
            name: "Temporal API",
            description: "Temporal API",
            url: "http://none",
            redirect_uri: "http://none"
        }
    ];

    for (let [index, application] of applications.entries()) {
        process.stdout.write(`Creating "${application.name}" application...`);

        data = {
            application
        };

        response = await keyrockAPI.post("/applications", data);
        application = response.data.application;

        process.stdout.write(" OK\n");

        process.stdout.write("Creating pep proxy...");

        response = await keyrockAPI.post(`/applications/${application.id}/pep_proxies`);
        const pepProxy = response.data.pep_proxy;

        process.stdout.write(" OK\n");

        process.stdout.write("Creating permissions...");

        const permissions = [];
        const actions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

        for (const action of actions) {
            data = {
                permission: {
                    name: `Perform any ${action} request`,
                    description: `Perform any ${action} request`,
                    action,
                    resource: "*",
                    is_regex: true
                }
            }

            response = await keyrockAPI.post(`/applications/${application.id}/permissions`, data);
            permissions.push(response.data.permission);
        }

        process.stdout.write(" OK\n");

        process.stdout.write("Creating role...");

        data = {
            role: {
                name: "NGSI-LD admin"
            }
        };

        response = await keyrockAPI.post(`/applications/${application.id}/roles`, data);
        const role = response.data.role;

        process.stdout.write(" OK\n");

        process.stdout.write("Assigning permissions to role...");

        for (const permission of permissions) {
            await keyrockAPI.put(`/applications/${application.id}/roles/${role.id}/permissions/${permission.id}`);
        }

        process.stdout.write(" OK\n");

        process.stdout.write("Assigning role to admin user...");

        await keyrockAPI.put(`/applications/${application.id}/users/${user.id}/roles/${role.id}`);

        process.stdout.write(" OK\n");

        process.stdout.write("Writing variables to env file...");

        if (index === 0) {
            data = `\nWILMA_CONTEXT_BROKER_APP_ID="${application.id}"\n`;
            data += `WILMA_CONTEXT_BROKER_APP_USERNAME="${pepProxy.id}"\n`;
            data += `WILMA_CONTEXT_BROKER_APP_PASSWORD="${pepProxy.password}"\n`;
        } else {
            data = `\nWILMA_MINTAKA_APP_ID="${application.id}"\n`;
            data += `WILMA_MINTAKA_APP_USERNAME="${pepProxy.id}"\n`;
            data += `WILMA_MINTAKA_APP_PASSWORD="${pepProxy.password}"\n`;
        }

        await fs.appendFile([rootDirectoryPath, ".env"].join(path.sep), data, { encoding: "utf-8" })

        process.stdout.write(" OK\n");
    }
}

main();
