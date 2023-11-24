import React from "react";
import { getAdData } from "../Fetchers";
import { useLoaderData } from "react-router-dom";


export async function loader({params}) {
    const ad = await getAdData(params.pk);
    return { ad };
};


export default function AdDetails() {
    const { ad } = useLoaderData();

    return (
        <div className="ad">
            <div className="ad__header">

            </div>
            <div className="ad__imagebox">
                <div>
                    
                </div>
                {ad.images.map((filename) => {
                    return (
                        <div data-role="select-image">
    
                        </div>
                    )
                })}
                <div data-role="active-image">
                
                </div>
            </div>

            <div className="ad__main">
                <div className="ad__title">
                    {ad.title}
                </div>
            </div>

        </div>
    );
};