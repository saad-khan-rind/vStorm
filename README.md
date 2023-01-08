##### to run the scheduler independent of UI
##### install the apache storm setup
##### compile the maven and create a jar file of scheduler 
##### the jar file is created in the target folder of maven project
##### place the jar file in lib folder of apache storm 
##### rename the file to "vStorm"
##### add this line to storm.yaml file of apache storm
## storm.scheduler: "org.apache.storm.scheduler.vStorm"
#### run the commands on three respective terminals
#### command for terminal 1 
## zkServer.sh start
## storm nimbus
#### command for terminal 2
## vstorm supervisor
#### command for terminal 3
## storm ui
