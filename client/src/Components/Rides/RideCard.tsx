import { FC, useState } from "react";

import { Ride } from '../../assets/models'

import '../../css/ridecard.css'

interface Props {
    ride: Ride,
    index: number,
    onClick: (i: number) => void
}

const Rides: FC<Props> = ( { ride, index, onClick } ) => {
    // FIXME: replace ride with rideMeta as props
    return (
        <div className="btn ride-card-container" onClick={() => onClick(index)}>
            {ride.meta.source}<br/>-<br/>{ride.meta.destination}
        </div>
    
  )
}

export default Rides;
