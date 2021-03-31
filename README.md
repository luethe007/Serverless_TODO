# Serverless TODO

I implemented a TODO application using AWS Lambda and Serverless framework. This project is part of the Udacity Cloud Developer Nanodegree Program.

# How to run the application

## Backend

To deploy the application run the following commands:

```
cd backend
npm install
sls deploy -v --aws-profile serverless --region eu-central-1
```

X-Ray visualization of the backend:  
![X-Ray Map](images/x-ray-map.png?raw=true "X-Ray Map")

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a local server (http://localhost:3000/) with the React application that will interact with the serverless backend on AWS.
