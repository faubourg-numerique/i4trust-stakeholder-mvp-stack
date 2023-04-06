# i4Trust stakeholder MVP stack

## Getting Started

### Prerequisites

* [Docker](https://docs.docker.com/engine/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Git](https://git-scm.com/)

### Installation

Clone the repository

```
git clone https://github.com/faubourg-numerique/i4trust-stakeholder-mvp-stack.git
```

Access the cloned repository

```
cd i4trust-stakeholder-mvp-stack
```

### Configuration

Create the environment file

```
cp ./.env.example ./.env
```

Create the kong config file

```
cp ./kong-config/kong.yaml.example ./kong-config/kong.yaml
```

## Usage

Start the services

```
docker compose up -d
```

Stop the services

```
docker compose down
```
