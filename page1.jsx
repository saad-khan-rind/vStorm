import { useEffect, useState, useRef } from "react";
import FileBase64 from 'react-file-base64';
import { FormGroup, Input, Label, Form, FormText, Button, Card, CardImg, CardBody, CardTitle, CardText, Col, Row } from 'reactstrap';
import Back from './back.png';
import {useNavigate} from 'react-router-dom';

export const Home = () => {

    // const navigate = useNavigate(Home);
    // navigate('/vfbvxb')
    const [javaClassName, setJavaClassName] = useState('');
    const [javaClassPath, setJavaClassPath] = useState('');
    const [jarFile, setJarFile] = useState('');
    const [scheduler, setScheduler] = useState('');
    const allProfessions = ['Default', 'ResourceAware', 'VStorm', 'TopologyAware'];
    const [counter, setCounter] = useState(0);
   
    const counterValid = counter < 5;

    var throuput_data = [];

    var check = new Boolean(false);



    const SetSchedul = async (eventC) => {
        const res2 = await fetch('http://localhost:8000/setScheduler', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "Scheduler": scheduler,
            })
        });

        if (res2.status === 404) {
            alert('Error from API!');
        }
        else {
            // alert('Success!');
        }


    }
    


    const handleSubmit = async (eventC) => {
        console.log(check)
        console.log(scheduler)
       


        const res = await fetch('http://localhost:8000/runtopology', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "javaClassName": javaClassName,
                "javaClassPath": javaClassPath,
                "jarFile": jarFile
            })
        });



        if (res.status === 404) {
            alert('Error from API!');
        }
        else {
            var callCount = 0;
            // alert('Success!');
            console.log(check)
            setTimeout(() => {
            var repeater = setInterval(function () {
            if (callCount < 16) {
                console.log(callCount)
                GetData();
                callCount += 1;
            } else {
                clearInterval(repeater);
            }
            }, 60000);
        }, 30000);
        }



    }

    const StartCluster = async (eventC) => {
        const res = await fetch('http://localhost:8000/start_cluster', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        if (res.status === 404) {
            alert('Error from API!');
        }
        else {
            
   
        
            alert('Success!');
            
        }
    }


   

    const GetData = async (eventC) => {
        const res = await fetch('http://localhost:8000/getData', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const dataF = await res;
        if (res.status === 404) {
            alert('Error from API!');
        }
        else {
            res.json().then((result) => {
                console.log("First")
                
                throuput_data.push(result.value);
                console.log(throuput_data)
            })
            .catch((err) => {
                console.log(err)
                // Error
            })
        }
    }

    



    // if(check === true)
    // {
    //     console.log(check)
    //     setTimeout(() => {
    //         var repeater = setInterval(function () {
    //         if (callCount < 15) {
    //             console.log(callCount)
    //             GetData();
    //             callCount += 1;
    //         } else {
    //             clearInterval(repeater);
    //         }
    //         }, 1 * 60 * 1000);
    //     }, 3 * 60 * 1000);
    // }
   

    

  

    return (
        <>

            <div
                style={{
                    marginTop: "80px",
                    backgroundColor: '#757980',
                    width: '100%',
                    height: 'fit-parent'
                }}>

                <Card className="Posts Card"
                    style={{
                        backgroundColor: '#FFFFFF',
                        marginLeft: "5%",
                        marginRight: "5%",
                        marginTop: 30,
                        borderRadius: 10,
                        width: "fit-parent",
                        height: "fit-parent",

                    }}

                >
                    <CardImg
                        alt="Card Cover cap"
                        src={Back}
                        style={{
                            backgroundColor: '#757980',
                            borderRadius: 10,
                            marginTop: 10,
                            marginLeft: 8,
                            marginRight: 5,
                            marginBottom: 5,
                            height: 250,
                            width: "99%",
                            objectFit: "scale-down"
                        }}

                    />



                </Card>


                <Button
                    onClick={StartCluster}
                    style={{
                        width: "20%",
                        height: 50,
                        marginTop: 30,
                        borderRadius: 20,
                        marginLeft: "40%",
                        backgroundColor: '#D0D3D4',


                    }}

                >
                    Start Custer
                </Button>
               

                <Card className="Posts Card"
                    style={{
                        backgroundColor: '#FFFFFF',
                        marginLeft: "5%",
                        marginRight: "5%",
                        marginTop: 20,
                        borderRadius: 10,
                        padding: 20,
                        width: "fit-parent",
                        height: "fit-parent",

                    }}

                >
                    <Form>
                        <FormGroup>
                            <Label for="exampleEmail">
                                Class Name
                            </Label>
                            <br></br>

                            <input type="text" value={javaClassName}
                                placeholder="Enter Main Class Name"
                                onChange={(e) =>
                                    setJavaClassName(e.target.value)}
                                style={{
                                    backgroundColor: '#F3F2EF',
                                    marginTop: 5,
                                    width: '95%',
                                    height: 10,
                                    padding: 20,
                                    border: '0px solid ',
                                    borderRadius: 15,
                                }}>

                            </input>
                            <br></br><br></br>
                        </FormGroup>
                        <FormGroup>
                            <Label for="examplePassword">
                                Class Path
                            </Label>
                            <br></br>
                            <input type="text" value={javaClassPath}
                                placeholder="Enter Main Class Path"
                                onChange={(e) =>
                                    setJavaClassPath(e.target.value)}
                                style={{
                                    backgroundColor: '#F3F2EF',
                                    marginTop: 5,
                                    width: '95%',
                                    height: 10,
                                    padding: 20,
                                    border: '0px solid ',
                                    borderRadius: 15,
                                }}>
                            </input>
                        </FormGroup>
                        <br></br>
                        <FormGroup>
                            <Label for="exampleSelect">
                                Select
                            </Label>
                            <br></br>
                            <select value={scheduler}
                                onChange={(e) => setScheduler(e.target.value)}
                                style={{
                                    backgroundColor: '#F3F2EF',
                                    marginTop: 5,
                                    width: '55%',
                                    height: 60,
                                    padding: 20,
                                    border: '0px solid ',
                                    borderRadius: 15,
                                }}>
                                {allProfessions.map((option, index) => {
                                    return <option key={index} >
                                        {option}
                                    </option>
                                })}
                            </select>

                            <Button
                                onClick={SetSchedul}
                                style={{
                                    backgroundColor: '#D0D3D4',
                                    width: "20%",
                                    height: 50,
                                    marginTop: -90,
                                    borderRadius: 20,
                                    marginLeft: "70%",


                                }}

                            >
                                set Scheduler
                            </Button>


                        </FormGroup>
                        <br></br>
                        <FormGroup>
                            <Label for="exampleFile">
                                Upload Tropology
                            </Label>
                            <br></br>

                            <FileBase64
                                type="File"
                                multiple={false}
                                onDone={({ base64 }) => setJarFile(base64)}
                            >

                            </FileBase64>

                        </FormGroup>
                        <div>
                            <Button
                                onClick={handleSubmit}
                                style={{
                                    backgroundColor: '#D0D3D4',
                                    width: "20%",
                                    height: 50,
                                    marginTop: 10,
                                    borderRadius: 20,
                                    marginLeft: "40%",




                                }}

                            >
                                Submit Topology
                            </Button>


                            <Button
                                onClick={GetData}
                                style={{
                                    backgroundColor: '#D0D3D4',
                                    width: "20%",
                                    height: 50,
                                    marginTop: 10,
                                    borderRadius: 20,
                                    marginLeft: "40%",




                                }}

                            >
                                GetData
                            </Button>



                        </div>
                    </Form>


                </Card>






            </div>






            {/* <input type="text" value={javaClassName} onChange={(e) => setJavaClassName(e.target.value)} />
            <br />
            <input type="text" value={javaClassPath} onChange={(e) => setJavaClassPath(e.target.value)} />
            <br />
            <FileBase64
                type="File"
                multiple={false}
                onDone={({ base64 }) => setJarFile(base64)}
            />
            <br />
            <button onClick={handleSubmit}>Submit</button> */}
        </>
    )
}