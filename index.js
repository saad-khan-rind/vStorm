const express = require('express');
const MongoClient = require('mongodb').MongoClient
const Throuput = require('./Schemas/Schema.js');


const request = require('request');

const stormHost = 'http://localhost:8090';



const mongoose = require('mongoose');

const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const { execFile } = require('child_process');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '100mb', extended: true }));


mongoose.connect('mongodb://localhost:27017/FYP', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    

}).then(() => {
    console.log("Connect"
    )}).catch(
        err => console.log(err)
        )

// 

// MongoClient.connect(
//     url,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     },
//     (err, client) => {

//       if (err) {
//         return console.log(err)
//       }
  
//       // Specify the database you want to access
//       const db = client.db('FYP')
  
//       console.log(`MongoDB Connected: ${url}`)
//     }
//   )






// Calling Batch Script

// ./helloworld.sh storm-example-1.0-jar-with-dependencies.jar admicloud.storm.wordcount.WordCountTopology WordCount

// const child = execFile('./script.sh', ['storm-example-1.0-jar-with-dependencies.jar', 'admicloud.storm.wordcount.WordCountTopology', 'WordCount'], (error, stdout, stderr) => {
//     if (error) {
//         throw error;
//     }
//     console.log(stdout);
// })

// const fs = require('fs');

// fs.writeFile("/tmp/test", "Hey there!", function(err) {
//     if(err) {
//         return console.log(err);
//     }
//     console.log("The file was saved!");
// }); 

// // Or
// fs.writeFileSync('/tmp/test-sync', 'Hey there!');

// middleware

app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));

var Id = "";

app.post('/getData', (req, res) => {
    // Saving File
    request.get(`${stormHost}/api/v1/topology/summary`, (error, response, body) => {
        if (error) {
            console.log("error");
            res.status(404).send(error)
        }
        else
        {
            const jData = JSON.parse(body)
            const ID = jData.topologies[0].id;
            console.log(ID);

            request.get(`${stormHost}/api/v1/topology/${ID}`, (error, response, body) => {
                if (error) {
              
                    console.log("error");
                    res.status(404).send(error)
                }
                else
                {
                    const jdata = JSON.parse(body)
                    // console.log(jdata)
                    const emitted = jdata.bolts[0].emitted
                    const uptime = jdata.uptime
                    console.log(emitted);
                    console.log(uptime);
                    console.log(uptime.length);
                    var length = uptime.length
                    const time = uptime;
                    var hours = 0
                    if (length>7)
                    {
                        hours = parseInt(time.slice(0, time.indexOf('h')));
                        
                    }
                    
                    
                        const minutes = parseInt(time.slice(time.indexOf('h') + 1, time.indexOf('m')));
                        const seconds = parseInt(time.slice(time.indexOf('m') + 1, time.indexOf('s')));
                        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                        console.log(totalSeconds);
                   

                    const throuput_one = emitted/totalSeconds;
                    console.log(throuput_one)

                    const p = new Throuput({
                            Name: "VStorm Scheduler",
                            time: totalSeconds,
                            throuput: throuput_one
                        })
                        
                        p.save().then(() => {
                            console.log("Inserted")
                        }).catch(err => {
                            console.error(err)
                        });
                    
                    // console.log(jdata.bolts[0].emitted)
                    res.status(200).send('{"value":' +throuput_one+'}')

                }

            });
            
                    
            
        }
        
      });

})


app.post('/getThrouput1', (req, res) => {
Throuput.find({Name: "VStorm Scheduler"})
    .then((result) => {
        var data = []
        
        for (let i = 0; i < result.length; i++) {
            data.push(result[i].throuput)
        
        }
        console.log(data)
        res.status(200).send(data)
    })
    .catch((err) => {
        console.log(err)
    })
});

app.post('/getThrouput2', (req, res) => {
    Throuput.find  ({Name: "Default Scheduler"})
    .then((result) => {
        var data = []
        
        for (let i = 0; i < result.length; i++) {
            data.push(result[i].throuput)
        
        }
        console.log(data)
        res.status(200).send(data)
    })
    .catch((err) => {
        console.log(err)
    })
    });


    app.post('/getThrouput3', (req, res) => {
        Throuput.find  ({Name: "VStorm Scheduler"})
            .then((result) => {
                console.log(result)
            })
            .catch((err) => {
                console.log(err)
            })
        
        
        });

app.post('/runtopology', (req, res) => {
    ({ javaClassName, javaClassPath, jarFile } = req.body)
    // Saving File
    let base64File = jarFile.split(';base64,').pop();
    let fileName = "topology" + Date.now() + ".jar";
    fs.writeFile(fileName, jarFile, { encoding: 'base64' }, function (err) {
        if (err) {
            console.log("Error Encountered", err)
            res.status(404).send('{"msg": "!ok"}');
        }
        else {
            console.log("File Saved successfully")
            const child = execFile('./run_topology.sh', [fileName, javaClassPath, javaClassName], (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                console.log(stdout);
            })
            res.status(200).send('{"msg": "ok"}');
        }
    });



})

app.post('/setScheduler', (req, res) => {
    ({ Scheduler } = req.body)
    // Saving File
    
    const child = execFile('./scheduler.sh', [Scheduler], (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
        console.log("Scheduler Update Successful")
        res.status(200).send('{"msg": "ok"}');

    })



})



app.post('/start_cluster', (req, res) => {
    // Saving File



    const child = execFile('./run_cluster.sh', (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
        console.log("Cluster Setup Successful")
        res.status(200).send('{"msg": "ok"}');

    })




})



const port = 8000

// Listener
const server = app.listen(port, () => {
    console.log('Server is Running');
})