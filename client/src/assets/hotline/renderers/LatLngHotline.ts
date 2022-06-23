
import { LatLngExpression } from 'leaflet'
import { LatLngData, LatLngPoint } from '../hotline';
import Hotline from './Hotline';


export default class LatLngHotline extends Hotline<LatLngData> {


    _drawHotline(): void 
    {
        for (let i = 0, dataLength = this._data.length; i < dataLength; i++) 
        {
            const path = this._data[i] as any;
            for (let j = 1, pathLength = path.length; j < pathLength; j++) 
            {
                const pointStart = path[j - 1];
                const pointEnd = path[j];

                if ( pointStart.i !== pointEnd.i )
                    this._addGradient(pointStart, pointEnd);
            }
        }
    }

    _addGradient(pointStart: LatLngPoint, pointEnd: LatLngPoint) 
    {

        if ( this._ctx === undefined ) return;

        const ctx = this._ctx;

        ctx.lineWidth = this._weight + (this.dotHover === undefined ? 0 : 4)

        // Create a gradient for each segment, pick start and end colors from palette gradient
        const gradient: CanvasGradient = ctx.createLinearGradient(pointStart.x, pointStart.y, pointEnd.x, pointEnd.y);

       this.computeGradient(gradient, pointStart, pointEnd)

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(pointStart.x, pointStart.y);
        ctx.lineTo(pointEnd.x, pointEnd.y);
        ctx.stroke();
    }

    computeGradient(gradient: CanvasGradient, pointStart: LatLngPoint, pointEnd: LatLngPoint) 
    {

        const deltaIndex = pointEnd.i - pointStart.i

        for ( let k = pointStart.i; k <= pointEnd.i; k++ )
        {
            const point = this.projectedData[0][k]
            const dist = (point.i - pointStart.i) / (deltaIndex !== 0 ? deltaIndex : 1)

            const rgb = this.getRGBForValue(point.z);

            // if ( this.dotHover )
            // {
            //     const hoverPoint = this.projectedData[0][this.isHover];
            //     const opacity = Math.max(1 - (Math.abs(this.isHover - k) / deltaIndex), 0)
            //     const color = this.getRGBForValue(hoverPoint.z);
            //     gradient.addColorStop(dist, 'rgba(' + color.get().join(',') + ',' + opacity + ')');
            // }
            // else
            this._addColorGradient(gradient, rgb, dist, "way_id")
        }
    }

    onProjected(): void {
        
    }
}



