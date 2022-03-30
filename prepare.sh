cd ../dynamic-dashboard-front
npm install
npm run build
cd ../dynamic-dashboard-back
docker start dashboard-mongodb || docker run -d -p 27017:27017 -v /home/vbboard1/mongodb/:/data/db --name dashboard-mongodb gutsagi/dashboard:base
