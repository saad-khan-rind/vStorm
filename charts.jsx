import { useEffect, useState, useRef } from "react";
import FileBase64 from 'react-file-base64';
import { FormGroup, Input, Label, Form, FormText, Button, Card, CardImg, CardBody, CardTitle, CardText, Col, Row } from 'reactstrap';
import Back from './back.png';
import {useNavigate} from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';




export const Chart = () => {


    const [counte, setCounte] = useState([]);
    const [flag, setFlag] = useState(true);


    const getThrouput = async (eventC) => {
        const res = await fetch('http://localhost:8000/getThrouput1', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        
            const result = await res.json()
                // console.log(counte)


                const res2 = await fetch('http://localhost:8000/getThrouput2', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
        
            const result2 = await res2.json()

                var finalOutput = []
                for (let i = 0; i < 15; i++){
                    let newJson = {}
                    newJson.time = i + 1
                    newJson.VStorm = result[i]
                    newJson.Default = result2[i]
                    finalOutput.push(newJson)
                }

                setCounte(finalOutput)

                // const data1 = result.map((value, index) => ({
                //     time: `${index + 1}`,
                //     value,
                //   }));
                // console.log(data1)
                // setCounte(data1);
                // console.log("this : "+result)
                setFlag(false);
        }
    


    useEffect(() =>  {
        getThrouput()
       },[]);
     

     // const navigate = useNavigate(Home);
    // navigate('/vfbvxb')

    if (flag)
    return (
        <h1>Loading...</h1>
    )

    return (
        <>
        {/* <p>{counte[0]}</p> */}


        <Card className="Chart"
                    style={{
                        backgroundColor: '#FFFFFF',
                        marginTop: "100px",
                        marginLeft: "25%",
                        marginRight: "35%",
                        borderRadius: 10,
                        height:"fit-parent",
                        width: "fit-parent",
                    }}>

<                   CardTitle tag="h5"
                        style={{
                            backgroundColor: '#FFFFFF',
                            marginLeft: 235,
                            marginTop:15,
                            fontSize: 30
                        }}>
                        Default Vs VStorm
                    </CardTitle>


                    <LineChart width={800} height={600} data={counte}
                    style={{
                       
                        marginTop: "3%",
                        marginRight:"5",
                        borderRadius: 10,
                        
                    }}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="VStorm" stroke="#8884d8" />
                        <Line type="monotone" dataKey="Default" stroke="#8884d8" />
                    </LineChart>

        </Card>
       

                </>
    )
}