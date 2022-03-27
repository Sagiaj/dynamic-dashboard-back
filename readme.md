
# **Installation Guide**
```

```

## **Install required dependencies**
- Install docker - Follow [**the guide**](https://docs.docker.com/engine/install/ubuntu/)

## **Install NodeJS Runtime**
* > `sudo apt update` 
    * *Optional*
* > `curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -`
    * *Mandatory*
* > `sudo apt -y install nodejs`
    * *Mandatory*
* > node  -v
    * Outputs
        > v14.19.0

## **Install PM2 Process Manager**
- `npm install -g pm2`

## **Provision a local MongoDB container**
* ### Run the following command:
    * > `docker run -d -p `**{LOCAL_DATABASE_PORT}**`:27017 -v `**{HOST_DATABASE_VOLUME_PATH}**`:/data/db --name dashboard-mongodb gutsagi/dashboard:base`
    * The docker image is based on the [dashboard DockerHub repository](https://hub.docker.com/r/gutsagi/dashboard) (The Docker image is customized for this project)
* **LOCAL_DATABASE_PORT** - *The port on your host that will be assigned to the MongoDB container*
* **HOST_DATABASE_VOLUME_PATH** - *A path in your host's system to persist data on. i.e: `home/vboard1/mongodb`*
* ### **Create MongoDB Indexes**
    * **Type the following commands**
    * *`docker exec -it dashboard-mongodb /bin/bash`*
    * *`mongo`*
    * **Paste the following lines into the MongoDB Console**
    * ```
        use dashboard;
        db.CartridgeLogs.createIndex({ start_ts: 1 });
        db.CartridgeLogs.createIndex({ end_ts: 1 });
        db.SystemLogs.createIndex({ "timestamp" : 1 });
        db.SystemLogs.createIndex({ "object_type_detections.type" : 1 });
        db.SystemLogs.createIndex({ "object_type_detections.min_size_ml" : 1 });
        db.SystemLogs.createIndex({ "object_type_detections.max_size_ml" : 1 });
        ```

## **Configure Applicative Behavior**
* Open `config.json` file. Change the following properties if necessary:
* `SERVER_WHITELIST` - Array of whitelisted origins/domains that can access the server.
* `SERVER_URL` - The backend service's url. (Default `http://localhost:3333/back`)
* `scheduled_tasks` - An array of pre-configured tasks and their respective cron expressions.
* `system_logs`
    * `base_path` - The system files' root path. (Default `/home/vbboard1`)
    * `log_types` - A list of file types and their location information
        * `path` - Relative path to the `base_path`. This path is used to indicate the file's location. (The `path` will be appended to `base_path`)
        * `filename_regex` - A regular expression to match the file's name. (E.g: `"^Log_\\d{2}-\\d{2}-\\d{4}\\.txt$"` will match `Log_18-02-2022.txt`)
    * `log_formats` - A list of string indications per file type. (E.g - "END" or "START" repsectively indicate a cartridge's end and start periods).

## **All-In-One command for application startup**
* `npm run prepare && npm run start` - Will compile backend code, build the frontend UI solution, run docker container, and serve on port 3333

## **Build the UI solution**
* Navigate to the `dynamic-dashboard-front` and follow [build instructions](https://github.com/Sagiaj/dynamic-dashboard-front/blob/master/README.md) - **Only npm install and npm run build**

## **Build the Backend solution**
* `npm run build`

## **Run the NodeJS application**
- `pm2 start`

## **Monitor the application**
* `pm2 monit`

## **Kill the NodeJS application**
- `pm2 kill`

## **View application logs**
- `pm2 logs all`
