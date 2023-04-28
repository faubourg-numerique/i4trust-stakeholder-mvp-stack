const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.dirname(__dirname) + path.sep + ".env" });

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

    process.stdout.write("Creating application...");

    data = {
        application: {
            name: "Context broker",
            description: "Context broker",
            url: "http://none",
            redirect_uri: "http://none"
        }
    };

    response = await keyrockAPI.post("/applications", data);
    const application = response.data.application;

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
                name: `Perform any NGSI-LD ${action} request`,
                description: `Perform any NGSI-LD ${action} request`,
                action,
                resource: "/ngsi-ld/v1/*",
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

    process.stdout.write(" OK\n\n");

    process.stdout.write("Update the .env file with the following values:\n\n");
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_ID="${application.id}"\n`);
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_USERNAME="${pepProxy.id}"\n`);
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_PASSWORD="${pepProxy.password}"\n\n`);
    process.stdout.write("Then restart the docker compose script:\n\n");
    process.stdout.write("sudo docker compose down\n");
    process.stdout.write("sudo docker compose up -d\n");
}

main();
