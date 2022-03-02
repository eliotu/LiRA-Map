import { FC, useEffect, useState } from "react";
import { PathProps } from "../../assets/models";

import MapWrapper from "../Map/MapWrapper";
import Checkbox from "../Checkbox";

import "../../css/ml.css";
import Path from "../Map/Path";

const brokerURL = "ws://localhost:3001/ws"

type PathsMap = {[key: string]: PathProps}

const range = (n: number): boolean[] => { 
    return Array.from( {length: n}, (elt, i) => true);
}

const ML: FC = () => {
    const [paths, setPaths] = useState<PathsMap>({});
    const [selectedPaths, setSelectedPaths] = useState<boolean[]>([])

    useEffect(() => {
        const ws = new WebSocket(brokerURL);

        ws.onopen =  () => {
            console.log('open');
            ws.send('something');
        };

        ws.onmessage = payload => {
            const { type, filename, data } = JSON.parse(payload.data);
            console.log('received:', type, filename, data);
            
            if ( type === 'rename' || type === 'change' )
            {
                console.log(typeof data);
                
                // const pathProps = typeof data === 'string' ? JSON.parse(data) : data
                const tripName = filename.replace('.json', '')
                
                const temp = { ...paths, [tripName]: data }
                console.log(paths);
                
                console.log(temp)
                setPaths(temp);
            }
            else if ( type === 'deleted' )
            {
                const temp = { ...paths }
                const tripName = filename.replace('.json', '')
                delete temp[tripName];
                setPaths(temp)
            }
            else if ( type === 'CONNECTED' )
            {
                const temp: any = {}
                for ( const file of data )
                {
                    const tripName = file.filename.replace('.json', '')
                    temp[tripName] = file.data;
                }
                setPaths(temp);
                console.log(temp);
                setSelectedPaths(range(data.length))
            }
        };
    }, [])

    const onClick = (i: number) => () => {
        const temp = [...selectedPaths]
        temp[i] = !temp[i]
        setSelectedPaths(temp)
    }

    return (
        <div className="ml-wrapper">
            <MapWrapper>
                { Object.values(paths)
                    .filter((elt, i) => selectedPaths[i])
                    .map( p => <Path 
                        key={`MLPath${Math.random()}`} 
                        path={p.path} 
                        properties={p.properties} 
                        metadata={p.metadata} />) 
                }
            </MapWrapper>
            <div className="ml-checkboxes">
                { Object.keys(paths).map( (filename, i) => 
                    <Checkbox 
                        key={`ml-${Math.random()}`} 
                        forceState={selectedPaths[i]}
                        className="btn ml-checkbox" 
                        html={<div>{filename}</div>} 
                        onClick={onClick(i)}/>
                ) }
            </div>
        </div>
    );
}

export default ML;