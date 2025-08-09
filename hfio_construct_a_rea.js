// Import required libraries
const express = require('express');
const app = express();
const axios = require('axios');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Configure Express.js to handle JSON requests
app.use(express.json());

// Define constants for pipeline stages
const STAGES = {
  BUILD: 'build',
  TEST: 'test',
  DEPLOY: 'deploy'
};

// Define an array to store pipeline instances
let pipelineInstances = [];

// Define a function to create a new pipeline instance
function createPipelineInstance(pipelineName, stages) {
  return {
    name: pipelineName,
    stages: stages,
    stageStatus: {}
  };
}

// Define a function to update pipeline stage status
function updatePipelineStageStatus(pipelineInstance, stage, status) {
  pipelineInstance.stageStatus[stage] = status;
}

// Define a function to trigger pipeline execution
async function executePipeline(pipelineInstance) {
  for (const stage of pipelineInstance.stages) {
    switch (stage) {
      case STAGES.BUILD:
        await buildCode(pipelineInstance);
        break;
      case STAGES.TEST:
        await runTests(pipelineInstance);
        break;
      case STAGES.DEPLOY:
        await deployCode(pipelineInstance);
        break;
      default:
        console.log(`Unknown stage: ${stage}`);
        break;
    }
  }
}

// Define functions for each pipeline stage
async function buildCode(pipelineInstance) {
  console.log(`Building code for ${pipelineInstance.name}`);
  // Simulate a build process
  await new Promise(resolve => setTimeout(resolve, 2000));
  updatePipelineStageStatus(pipelineInstance, STAGES.BUILD, 'success');
}

async function runTests(pipelineInstance) {
  console.log(`Running tests for ${pipelineInstance.name}`);
  // Simulate a test process
  await new Promise(resolve => setTimeout(resolve, 2000));
  updatePipelineStageStatus(pipelineInstance, STAGES.TEST, 'success');
}

async function deployCode(pipelineInstance) {
  console.log(`Deploying code for ${pipelineInstance.name}`);
  // Simulate a deployment process
  await new Promise(resolve => setTimeout(resolve, 2000));
  updatePipelineStageStatus(pipelineInstance, STAGES.DEPLOY, 'success');
}

// Define API endpoints
app.post('/pipelines', (req, res) => {
  const pipelineName = req.body.pipelineName;
  const stages = req.body.stages;
  const pipelineInstance = createPipelineInstance(pipelineName, stages);
  pipelineInstances.push(pipelineInstance);
  res.send(`Pipeline ${pipelineName} created successfully!`);
});

app.post('/pipelines/:pipelineName/execute', (req, res) => {
  const pipelineName = req.params.pipelineName;
  const pipelineInstance = pipelineInstances.find(p => p.name === pipelineName);
  if (!pipelineInstance) {
    res.status(404).send(`Pipeline ${pipelineName} not found!`);
    return;
  }
  executePipeline(pipelineInstance);
  res.send(`Pipeline ${pipelineName} execution started!`);
});

app.get('/pipelines/:pipelineName/status', (req, res) => {
  const pipelineName = req.params.pipelineName;
  const pipelineInstance = pipelineInstances.find(p => p.name === pipelineName);
  if (!pipelineInstance) {
    res.status(404).send(`Pipeline ${pipelineName} not found!`);
    return;
  }
  res.send(pipelineInstance.stageStatus);
});

// Establish WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected!');

  // Send pipeline status updates to clients
  wss.clients.forEach(client => {
    pipelineInstances.forEach(pipelineInstance => {
      client.send(`Pipeline ${pipelineInstance.name} - ${JSON.stringify(pipelineInstance.stageStatus)}`);
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected!');
  });
});

// Start the Express.js server
app.listen(3000, () => {
  console.log('DevOps pipeline controller listening on port 3000...');
});