[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
  <a href="https://github.com/apache/age/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/apache/age-viewer"/>
  <a href="https://github.com/apache/age/stargazers">
    <img src="https://img.shields.io/github/stars/apache/age-viewer"/>
</p>

# What is Apache AGE Viewer
Apache AGE Viewer is a web based user interface that provides visualization of graph data stored in a PostgreSQL database with the Apache AGE extension. It lets you explore graphs (nodes, edges, properties) via Cypher queries and graphical layouts.

This is a sub-project of [the Apache AGE project](https://age.apache.org/#).

---
## Quick Overview
You need TWO things running:
1. A PostgreSQL + AGE server (the graph database engine)
2. The AGE Viewer web application (this repository) – frontend + backend

They are independent: the database image is NOT this viewer image. The viewer connects to an already running AGE-enabled Postgres.

---
## 1. Start a PostgreSQL + AGE Server (External Dependency)
If you do not already have an AGE-enabled Postgres running, start one with Docker:

```bash
docker run --name my-age-db -p 5455:5432 \
	-e POSTGRES_USER=postgresUser \
	-e POSTGRES_PASSWORD=postgresPW \
	-e POSTGRES_DB=postgresDB \
	-d apache/age
```

After it starts, create a graph (inside the container or via psql):
```bash
docker exec -it my-age-db psql -U postgresUser -d postgresDB -c "SELECT create_graph('demo_graph');"
```

You can verify connectivity:
```bash
PGPASSWORD=postgresPW psql -h localhost -p 5455 -U postgresUser -d postgresDB -c 'SELECT version();'
```

---
## 2. Run AGE Viewer (This Repo)

### Recommended Node Version

The project historically targeted Node 14, but dependencies now require newer JS syntax. Use **Node 18 LTS** (or newer) for local development.

### Local (non-Docker) Development
```bash
git clone <this-repo>
cd age-viewer
npm run setup      # installs root + backend + frontend deps
npm run start      # starts backend (3001) & CRA frontend dev server (3000)
```
Open: http://localhost:3000

Then connect to your AGE DB (see Connection section below).

### Docker Development (both processes inside one container)
We provide a simple Dockerfile that launches the dev processes. Build and run:
```bash
docker build -t age-viewer:dev .
docker run --name age-viewer -p 3000:3000 -p 3001:3001 --rm \
	-e NODE_OPTIONS=--openssl-legacy-provider \
	age-viewer:dev
```
Visit http://localhost:3000

Note: This image runs the frontend in development (hot reload) and installs all dev dependencies. For a slimmer production image you would build the frontend and serve static assets (future improvement).

---
## 3. Connect AGE Viewer to the AGE Database
Once the viewer UI is up, you must establish a session + DB connection before metadata and graph panels populate.

### Via UI
Use the connection panel form: supply the host, port, database, user, password, and graph name (e.g. `demo_graph`). Click *Connect*.

Typical values if you used the sample docker run above:
- Host: `localhost` (or `host.docker.internal` if the viewer runs in Docker and Postgres is on the host)
- Port: `5455`
- Database: `postgresDB`
- User: `postgresUser`
- Password: `postgresPW`
- Graph: `demo_graph`

### Via cURL (manual test)
If the UI connect button seems unresponsive, you can manually POST the connection:
```bash
curl -i -X POST http://localhost:3000/api/v1/db/connect \
	-H 'Content-Type: application/json' \
	-d '{
		"host": "localhost",
		"port": 5455,
		"database": "postgresDB",
		"user": "postgresUser",
		"password": "postgresPW",
		"graph": "demo_graph"
	}'
```
Then fetch status / metadata:
```bash
curl -i http://localhost:3000/api/v1/db
curl -i -X POST http://localhost:3000/api/v1/db/meta -H 'Content-Type: application/json' -d '{"currentGraph":"demo_graph"}'
```

If you receive `Not connected`, verify you created the graph and the host/port credentials are correct.

---
## 4. Production Mode (Optional)
To run with built frontend assets:
```bash
# Build frontend + backend
npm run build-front
npm run build-back

# (Future enhancement) Serve built frontend via backend or a static server
```
You can use `pm2` for process management:
```bash
pm2 start ecosystem.config.js
```

---
## Legacy Content (Original Instructions)
The original README mixed database container instructions with viewer steps. They are now separated above for clarity. Below is the historical section retained for reference.

# How to start using Age-Viewer
 - To start using Age-Viewer we need to have a running postgreSQL database server with Apache Age Extension 
	 ### Setting up the PostgreSQL server with AGE extension
	-  Easiest way  for Windows, Mac-OS and Linux Environment using **Docker**
  
	> Install docker in advance (https://www.docker.com/get-started), install the version compatible with your OS from the provided link.
	
	 **Run Using Docker** :
   
	- Build the docker image from main
	```docker build -t age-viewer:local .```
	
	- Create AGE docker container (be sure to set these env vars!)
	```bash
	docker run --name myPostgresDb -p 5455:5432 -e POSTGRES_USER=postgresUser \
	-e POSTGRES_PASSWORD=postgresPW -e POSTGRES_DB=postgresDB -d age-viewer:local
	```

## Recommend Node Module (Optional)
`pm2` is optional for supervising the backend in a production-like deployment:
```bash
npm i -g pm2
```

### Original Dev Commands
```bash
npm run setup
npm run start
```
Frontend: http://localhost:3000 (proxying to backend 3001)


### Build Commands
Frontend:
```bash
npm run build-front
```
Backend (transpile):
```bash
npm run build-back
```
PM2 lifecycle example:
```bash
pm2 stop ag-viewer-develop || true
pm2 delete ag-viewer-develop || true
pm2 start ecosystem.config.js
```

	
	| Docker variables| Description |
	|--|--|
	| ``--name`` | Assign a name to the container |
	|	`-p` |	Publish a container’s port(s) to the host|
	|	``-e``|	Set environment variables|
	|	``-d``|	Run container in background and print container ID|
- To Get the running log of the docker container created - 
`` docker logs --follow myPostgresDb``
- To Get into postgreSQL Shell (There are two ways this can be done) -
	- First get into docker shell using -	`` docker exec -it myPostgresDb bash`` 
	<br>Then get into postgreSQL shell using - `` psql -U postgresUser postgresDB``
	
	OR
	
	- Alternatively postgres shell can also be assessed directly (without getting into the docker shell) -
		`` psql -U postgresUser -d postgresDB -p 5455 -h localhost``
		and put in ``postgresPW`` when prompted for password.
- After logging into postgreSQL shell follow the [Post-Installation](https://github.com/apache/age#post-installation) instruction to create a graph in the database.
### Connect Apache Age-Viewer to PostgreSQL Database
**Initial Connection Layout**
![enter image description here](https://user-images.githubusercontent.com/69689387/211624181-9644f489-1a45-4eed-ac8e-7aaf156b97ea.png)
To Connect to postgreSQL server running from Docker Container
- Connect URL - localhost
- Connect Port - 5455 
- Database Name - postgresDB
- User Name - postgresUser
- Password - postgresPW
> The following field is same as used to make the docker container specified above as flags.



# License

Apache AGE Viewer is licensed under the Apache License, Version 2.0. See LICENSE for the full license text.
