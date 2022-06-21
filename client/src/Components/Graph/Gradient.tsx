import { FC, useEffect } from "react"
import { DEFAULT_PALETTE } from "../../assets/properties";

import { useGraph } from "../../context/GraphContext";
import { Axis, Palette, PaletteColor, SVG } from "../../models/graph"

export interface IGradient {
    svg: SVG | undefined;
    axis: [Axis, Axis] | undefined;
    palette: Palette | undefined;
}

const gradientId = "line-gradient";

const Gradient: FC<IGradient> = ( { svg, axis, palette } ) => {

    const { minY, maxY } = useGraph()

    const p = palette || DEFAULT_PALETTE

    useEffect( () => {

        if ( svg === undefined || axis === undefined ) return;

        svg
            .append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0)
            .attr("y1", axis[1](minY)) 
            .attr("x2", 0)
            .attr("y2", axis[1](maxY))
            .selectAll("stop")
            .data(p)
            .enter().append("stop")
            .attr("offset", (c: PaletteColor) => (c.t * 100).toString() + '%' )
            .attr("stop-color", (c: PaletteColor) => `rgb(${c.r}, ${c.g}, ${c.b})` )

        return () => { 
            svg.select('#' + gradientId).remove() 
        }

    }, [svg, axis, minY, maxY, p])

    return null
}


export default Gradient