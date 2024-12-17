import React, { useState } from 'react'

interface AdBoostSelectProps {
    name: string
}

export default function AdBoostSelect ({ name }: AdBoostSelectProps): React.ReactNode {
    function Option ({ value, label, price, description }: {
        value: string
        label: string
        price: number
        description: string
    }): React.ReactNode {
        return (
            <div className="prop ad-boost-select@form" onClick={() => {
                if (selectedOptions.includes(value)) {
                    setSelectedOptions((previous) => previous.filter((other) => other !== value))
                }
                else {
                    setSelectedOptions((previous) => [...previous, value])
                }
            }}>
                <input type="checkbox" name={name} defaultValue={value} defaultChecked={selectedOptions.includes(value)} />
                <div className="prop__label">
                    {label}
                </div>
                <div className="prop__detail ad-boost-select@form__price">
                    {price}€
                </div>
                <div className="prop__detail ad-boost-select@form__description">
                    {description}
                </div>
            </div>
        )
    }

    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    return (
        <div className='prop prop--vertical'>
            <Option value="push" label="Renew Ad" price={2.95} description="Pushes the ad to the top of the search's 1st page anew together with the new ads." />
            <Option value="highlight" label="Highlight Ad" price={3.95} description="Pins the ad to the top of the search of whatever page the ad is on." />
            <Option value="top" label="Top Ad" price={15.95} description="Pins the ad to the top of the search of any page, will rotate with other Top Ads." />
            <Option value="gallery" label="Gallery Ad" price={25.95} description="Highlights the ad on the frontpage gallery, will rotate with other Gallery Ads." />
        </div>
    )
}

export function AdBoostSelectWidget (props: Omit<AdBoostSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => AdBoostSelect({ name, ...props })
}
