
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
    * > `docker run -d -p `**{LOCAL_DATABASE_PORT}**`:27017 -v `**{HOST_DATABASE_VOLUME_PATH}**`:/data/db --name dashboard-mongodb mongo:latest`
* **LOCAL_DATABASE_PORT** - *The port on your host that will be assigned to the MongoDB container*
* **HOST_DATABASE_VOLUME_PATH** - *A path in your host's system to persist data on. i.e: `home/vboard1/mongodb`*

## **Run the NodeJS application**
- `pm2 start`

## **Monitor the application**
* `pm2 monit`
