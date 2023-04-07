# i4Trust stakeholder MVP stack

## Introduction

### An enabler to enter the data economy
The EU funded [i4Trust project](https://i4trust.org/) has delivered an operationnal technical architecture in order to enable the implementation of __DATA SPACES__ based on __OPEN SOURCE technologies__ . In the framework of this i4Trust project, the DIH Faubourg Numérique has been selected - and funded - to supoprt 4 experiments involving 23 SMEs from 13 different countries:
- [CO2-Mute](https://i4trust.org/experiments/co2-mute/) : a data space for public decision makers on sustainable mobility policies
- [CADS](https://i4trust.org/experiments/cads/) : a data space for the assessment of the carbon footprint of agricultural products and tools for sound agrotechnological and management decisions
- [CAST](https://i4trust.org/experiments/co2-mute/): a data space for Carbon Capture Supply Chain Trust
- [DTaaS4Aero](https://i4trust.org/experiments/DTaaS4aero/): a data space enabling Digital Twin as a service for aeronautical communications equipment and performance-based predictive maintenance

Thanks to this involvement in the i4Trust project our DIH team ran very fast through the learning curve towards concrete implementation of __DATA SPACES__ , re-inforced by the first deliverables of the [Data Spaces Support Center](https://dssc.eu/) (DSSC).
This "i4Trust stakeholder MVP stack" has been build by DIH Faubourg Numérique to assemble the technical i4Trust deliverables with the goal to ease their adoption by a wide variety of organizations, especially SMEs.
In complement to this "MVP stack", the SMEs had the opportunity to use the [ouranos-ws](https://ouranos-ws.com/en/) platform to facilitate their task in order to leverage their active participation in DATA SPACES:
- __DESIGN__ shared and harmonized data models leveraging the [Smart Data Models](https://smartdatamodels.org/) repository
- __NAVIGATE__ in the graphs of NGSI-LD entities representing their digitalized assets and those shared by other stakeholders, leveraging [FIWARE] components
- __CONTROL__ the access to their digitalized asset through the management of granular Access Policies, based on the [iShare](https://ishare.eu/) principles and services 

In [this video](https://youtu.be/YWpwInq5EOg), one can have an overview on the way the above tools have been concretly used by the CO2-Mute experiment. 

We hope this will help your organization to go faster and smoother towards an active participation in Data Spaces in order to leverage the opportunities related to the Data Economy! So please, use it, fork it, ... and contribute to improve it!! And maybe, all together, we can sustain an i4Trust community of (E)DIHs and SMEs beyond the end of the experimental phase ... ? 

### What's in it?
The "i4Trust stakeholder MVP stack" will allow you to rapidly deploy and configure the need components to implement the "standard" i4Trust architecture:
- Orion-LD 
- Keyrock + Authorization Registry plugin + Activation Service
- Kong + i4Trus plugin 
- Wilma, as alternate PEP proxy, to "internally" access Orion-LD outside the Data Space 

## Getting Started

### Prerequisites

* [Git](https://git-scm.com/)
* [Docker](https://docs.docker.com/engine/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Certbot](https://certbot.eff.org/)

### Configuration

Clone the repository

```
git clone https://github.com/faubourg-numerique/i4trust-stakeholder-mvp-stack.git
```

Access the cloned repository

```
cd i4trust-stakeholder-mvp-stack
```

Create and edit the configuration files

```
cp ./.env.example ./.env
cp ./config/kong.yaml.example ./config/kong.yaml
cp ./config/nginx.conf.example ./config/nginx.conf
```

Generate the HTTPS certificates

```
sudo certbot certonly --standalone -d keyrock.example.com
sudo certbot certonly --standalone -d kong.example.com
sudo certbot certonly --standalone -d wilma.example.com
```

## Usage

Start the services

```
sudo docker compose up -d
```

Stop the services

```
sudo docker compose down
```
