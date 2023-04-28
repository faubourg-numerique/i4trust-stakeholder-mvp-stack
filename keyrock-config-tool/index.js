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

    const pepProxies = [];

    for (const [index, application] of applications) {
        process.stdout.write(`Creating "${application.name}" application...`);

        data = {
            application
        };

        response = await keyrockAPI.post("/applications", data);
        applications[index] = response.data.application;

        process.stdout.write(" OK\n");

        process.stdout.write("Creating pep proxy...");

        response = await keyrockAPI.post(`/applications/${applications[index].id}/pep_proxies`);
        pepProxies.push(response.data.pep_proxy);

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

            response = await keyrockAPI.post(`/applications/${applications[index].id}/permissions`, data);
            permissions.push(response.data.permission);
        }

        process.stdout.write(" OK\n");

        process.stdout.write("Creating role...");

        data = {
            role: {
                name: "NGSI-LD admin"
            }
        };

        response = await keyrockAPI.post(`/applications/${applications[index].id}/roles`, data);
        const role = response.data.role;

        process.stdout.write(" OK\n");

        process.stdout.write("Assigning permissions to role...");

        for (const permission of permissions) {
            await keyrockAPI.put(`/applications/${applications[index].id}/roles/${role.id}/permissions/${permission.id}`);
        }

        process.stdout.write(" OK\n");

        process.stdout.write("Assigning role to admin user...");

        await keyrockAPI.put(`/applications/${applications[index].id}/users/${user.id}/roles/${role.id}`);

        process.stdout.write(" OK\n\n");
    }

    process.stdout.write("Update the .env file with the following values:\n\n");
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_ID="${applications[0].id}"\n`);
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_USERNAME="${pepProxies[0].id}"\n`);
    process.stdout.write(`WILMA_CONTEXT_BROKER_APP_PASSWORD="${pepProxies[0].password}"\n\n`);
    process.stdout.write(`WILMA_MINTAKA_APP_ID="${applications[1].id}"\n`);
    process.stdout.write(`WILMA_MINTAKA_APP_USERNAME="${pepProxies[1].id}"\n`);
    process.stdout.write(`WILMA_MINTAKA_APP_PASSWORD="${pepProxies[1].password}"\n\n`);
    process.stdout.write("Then restart the docker compose script:\n\n");
    process.stdout.write("sudo docker compose down\n");
    process.stdout.write("sudo docker compose up -d\n");
}

main();
