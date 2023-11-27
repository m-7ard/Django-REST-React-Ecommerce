import React from "react";
import Ad from "./Ad";

export default function Gallery({title, initial, isHighlight}) {


    return (
        <div className='frontpage__gallery'>
            <div className='frontpage__gallery-header'>
                <div className='frontpage__gallery-title'>
                    {title}
                </div> 
                <div className='frontpage__gallery-control'>
                    <div className='icon icon--small'>
                        <i className="material-icons">
                            chevron_left
                        </i>
                    </div>
                </div>
                <div className='frontpage__gallery-control'>
                    <div className='icon icon--small'>
                        <i className="material-icons">
                            chevron_right
                        </i>
                    </div>
                </div>
            </div>
            <hr className='frontpage__gallery-divider'/> 
            <div className='frontpage__gallery-content'>
                {
                    initial.length && (
                        initial.map((data) => {
                            return (
                                <Ad 
                                    isHighlight={isHighlight} 
                                    data={data}
                                />
                            )
                        })
                    ) || (
                        <div className="frontpage__gallery-placeholder">
                            'Nothing Here Yet'
                        </div>
                    )
                }
            </div>
        </div>
    )
}