import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Link, Navigate, createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { UserContext, useUserContext } from './Context'
import { type NormalizedDataValue, type NormalizedDataItem, type UnnormalizedData, type PickerValue, PickerControls } from './Types'

export function useLoginRequired (): void {
    const { user } = useUserContext()
    const location = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (!user.is_authenticated) {
            navigate({
                pathname: '/login/',
                search: createSearchParams({
                    next: location.pathname
                }).toString()
            })
        }
    }, [])
}

export function getCookie (name: string): string | null | undefined {
    let cookieValue = null
    if ((document.cookie != null) && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

export function CSRFToken () {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={getCookie('csrftoken')} />
    )
}

export function normalizeData ({
    data, valueKey, labelKey, parentKey
}) {
    return data.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
        parent: item[parentKey]
    }))
}

export async function fileListToBase64 (fileList) {
    async function getBase64 (file) {
        const reader = new FileReader()
        return await new Promise((resolve) => {
            reader.onload = (ev) => {
                resolve(ev.target.result)
            }
            reader.readAsDataURL(file)
        })
    }
    const promises = []

    for (let i = 0; i < fileList.length; i++) {
        promises.push(getBase64(fileList[i]))
    }

    return await Promise.all(promises)
}

export class NormalizedData {
    data: NormalizedDataItem[]

    constructor ({ data, valueKey, labelKey, parentKey }: UnnormalizedData) {
        this.data = this.normalizeData({ data, valueKey, labelKey, parentKey })
    }

    normalizeData ({ data, valueKey, labelKey, parentKey }: UnnormalizedData): NormalizedDataItem[] {
        return data.map((item) => ({
            value: item[valueKey],
            label: item[labelKey],
            parent: parentKey == null ? null : item[parentKey]
        }))
    }

    getRoute (value: NormalizedDataValue): NormalizedDataValue[] {
        const choice = this.getChoice(value)
        const parent = choice?.parent

        if (parent == null) {
            return [value]
        }
        else {
            return [...this.getRoute(parent), value]
        }
    }

    getSubChoices (value: NormalizedDataValue): NormalizedDataItem[] {
        return this.data.filter((choice) => choice.parent === value)
    }

    getChoice (value: NormalizedDataValue): NormalizedDataItem {
        const choice = this.data.find((choice) => choice.value === value)

        if (choice == null) {
            throw Error(`Not a valid choice. Caused by: ${value} (${typeof value})`)
        }

        return choice
    }

    getRouteString (value: NormalizedDataValue): string {
        const choice = this.getChoice(value)

        const parent = choice.parent
        if (parent == null) {
            return choice.label
        }
        else {
            return `${this.getRouteString(parent)} > ${choice.label}`
        }
    }
}

export function addDotsToNumber (number) {
    let numStr = number.toString()
    const groups = []
    while (numStr.length > 0) {
        groups.unshift(numStr.slice(-3))
        numStr = numStr.slice(0, -3)
    }

    return groups.join('.')
}

export function LoginRequired ({ children }: React.PropsWithChildren): null | React.ReactNode {
    const { user } = useUserContext()
    const location = useLocation()

    if (!user.is_authenticated) {
        const next = createSearchParams({
            next: location.pathname
        }).toString()
        return <Navigate to={`/login?${next}`} />
    }

    return children
}

export const listOfCountries = [
    {
        code: 'AF',
        name: 'Afghanistan'
    },
    {
        code: 'AL',
        name: 'Albania'
    },
    {
        code: 'DZ',
        name: 'Algeria'
    },
    {
        code: 'AD',
        name: 'Andorra'
    },
    {
        code: 'AO',
        name: 'Angola'
    },
    {
        code: 'AG',
        name: 'Antigua and Barbuda'
    },
    {
        code: 'AR',
        name: 'Argentina'
    },
    {
        code: 'AM',
        name: 'Armenia'
    },
    {
        code: 'AU',
        name: 'Australia'
    },
    {
        code: 'AT',
        name: 'Austria'
    },
    {
        code: 'AZ',
        name: 'Azerbaijan'
    },
    {
        code: 'BS',
        name: 'Bahamas'
    },
    {
        code: 'BH',
        name: 'Bahrain'
    },
    {
        code: 'BD',
        name: 'Bangladesh'
    },
    {
        code: 'BB',
        name: 'Barbados'
    },
    {
        code: 'BY',
        name: 'Belarus'
    },
    {
        code: 'BE',
        name: 'Belgium'
    },
    {
        code: 'BZ',
        name: 'Belize'
    },
    {
        code: 'BJ',
        name: 'Benin'
    },
    {
        code: 'BT',
        name: 'Bhutan'
    },
    {
        code: 'BO',
        name: 'Bolivia'
    },
    {
        code: 'BA',
        name: 'Bosnia and Herzegovina'
    },
    {
        code: 'BW',
        name: 'Botswana'
    },
    {
        code: 'BR',
        name: 'Brazil'
    },
    {
        code: 'BN',
        name: 'Brunei'
    },
    {
        code: 'BG',
        name: 'Bulgaria'
    },
    {
        code: 'BF',
        name: 'Burkina Faso'
    },
    {
        code: 'BI',
        name: 'Burundi'
    },
    {
        code: 'CV',
        name: 'Cabo Verde'
    },
    {
        code: 'KH',
        name: 'Cambodia'
    },
    {
        code: 'CM',
        name: 'Cameroon'
    },
    {
        code: 'CA',
        name: 'Canada'
    },
    {
        code: 'CF',
        name: 'Central African Republic'
    },
    {
        code: 'TD',
        name: 'Chad'
    },
    {
        code: 'CL',
        name: 'Chile'
    },
    {
        code: 'CN',
        name: 'China'
    },
    {
        code: 'CO',
        name: 'Colombia'
    },
    {
        code: 'KM',
        name: 'Comoros'
    },
    {
        code: 'CG',
        name: 'Congo'
    },
    {
        code: 'CR',
        name: 'Costa Rica'
    },
    {
        code: 'HR',
        name: 'Croatia'
    },
    {
        code: 'CU',
        name: 'Cuba'
    },
    {
        code: 'CY',
        name: 'Cyprus'
    },
    {
        code: 'CZ',
        name: 'Czech Republic'
    },
    {
        code: 'DK',
        name: 'Denmark'
    },
    {
        code: 'DJ',
        name: 'Djibouti'
    },
    {
        code: 'DM',
        name: 'Dominica'
    },
    {
        code: 'DO',
        name: 'Dominican Republic'
    },
    {
        code: 'TL',
        name: 'East Timor (Timor-Leste)'
    },
    {
        code: 'EC',
        name: 'Ecuador'
    },
    {
        code: 'EG',
        name: 'Egypt'
    },
    {
        code: 'SV',
        name: 'El Salvador'
    },
    {
        code: 'GQ',
        name: 'Equatorial Guinea'
    },
    {
        code: 'ER',
        name: 'Eritrea'
    },
    {
        code: 'EE',
        name: 'Estonia'
    },
    {
        code: 'ET',
        name: 'Ethiopia'
    },
    {
        code: 'FJ',
        name: 'Fiji'
    },
    {
        code: 'FI',
        name: 'Finland'
    },
    {
        code: 'FR',
        name: 'France'
    },
    {
        code: 'GA',
        name: 'Gabon'
    },
    {
        code: 'GM',
        name: 'Gambia'
    },
    {
        code: 'GE',
        name: 'Georgia'
    },
    {
        code: 'DE',
        name: 'Germany'
    },
    {
        code: 'GH',
        name: 'Ghana'
    },
    {
        code: 'GR',
        name: 'Greece'
    },
    {
        code: 'GD',
        name: 'Grenada'
    },
    {
        code: 'GT',
        name: 'Guatemala'
    },
    {
        code: 'GN',
        name: 'Guinea'
    },
    {
        code: 'GW',
        name: 'Guinea-Bissau'
    },
    {
        code: 'GY',
        name: 'Guyana'
    },
    {
        code: 'HT',
        name: 'Haiti'
    },
    {
        code: 'HN',
        name: 'Honduras'
    },
    {
        code: 'HU',
        name: 'Hungary'
    },
    {
        code: 'IS',
        name: 'Iceland'
    },
    {
        code: 'IN',
        name: 'India'
    },
    {
        code: 'ID',
        name: 'Indonesia'
    },
    {
        code: 'IR',
        name: 'Iran'
    },
    {
        code: 'IQ',
        name: 'Iraq'
    },
    {
        code: 'IE',
        name: 'Ireland'
    },
    {
        code: 'IL',
        name: 'Israel'
    },
    {
        code: 'IT',
        name: 'Italy'
    },
    {
        code: 'CI',
        name: 'Ivory Coast'
    },
    {
        code: 'JM',
        name: 'Jamaica'
    },
    {
        code: 'JP',
        name: 'Japan'
    },
    {
        code: 'JO',
        name: 'Jordan'
    },
    {
        code: 'KZ',
        name: 'Kazakhstan'
    },
    {
        code: 'KE',
        name: 'Kenya'
    },
    {
        code: 'KI',
        name: 'Kiribati'
    },
    {
        code: 'KP',
        name: 'North Korea'
    },
    {
        code: 'KR',
        name: 'South Korea'
    },
    {
        code: 'KW',
        name: 'Kuwait'
    },
    {
        code: 'KG',
        name: 'Kyrgyzstan'
    },
    {
        code: 'LA',
        name: 'Laos'
    },
    {
        code: 'LV',
        name: 'Latvia'
    },
    {
        code: 'LB',
        name: 'Lebanon'
    },
    {
        code: 'LS',
        name: 'Lesotho'
    },
    {
        code: 'LR',
        name: 'Liberia'
    },
    {
        code: 'LY',
        name: 'Libya'
    },
    {
        code: 'LI',
        name: 'Liechtenstein'
    },
    {
        code: 'LT',
        name: 'Lithuania'
    },
    {
        code: 'LU',
        name: 'Luxembourg'
    },
    {
        code: 'MK',
        name: 'North Macedonia'
    },
    {
        code: 'MG',
        name: 'Madagascar'
    },
    {
        code: 'MW',
        name: 'Malawi'
    },
    {
        code: 'MY',
        name: 'Malaysia'
    },
    {
        code: 'MV',
        name: 'Maldives'
    },
    {
        code: 'ML',
        name: 'Mali'
    },
    {
        code: 'MT',
        name: 'Malta'
    },
    {
        code: 'MH',
        name: 'Marshall Islands'
    },
    {
        code: 'MR',
        name: 'Mauritania'
    },
    {
        code: 'MU',
        name: 'Mauritius'
    },
    {
        code: 'MX',
        name: 'Mexico'
    },
    {
        code: 'FM',
        name: 'Micronesia'
    },
    {
        code: 'MD',
        name: 'Moldova'
    },
    {
        code: 'MC',
        name: 'Monaco'
    },
    {
        code: 'MN',
        name: 'Mongolia'
    },
    {
        code: 'ME',
        name: 'Montenegro'
    },
    {
        code: 'MA',
        name: 'Morocco'
    },
    {
        code: 'MZ',
        name: 'Mozambique'
    },
    {
        code: 'MM',
        name: 'Myanmar (Burma)'
    },
    {
        code: 'NA',
        name: 'Namibia'
    },
    {
        code: 'NR',
        name: 'Nauru'
    },
    {
        code: 'NP',
        name: 'Nepal'
    },
    {
        code: 'NL',
        name: 'Netherlands'
    },
    {
        code: 'NZ',
        name: 'New Zealand'
    },
    {
        code: 'NI',
        name: 'Nicaragua'
    },
    {
        code: 'NE',
        name: 'Niger'
    },
    {
        code: 'NG',
        name: 'Nigeria'
    },
    {
        code: 'NO',
        name: 'Norway'
    },
    {
        code: 'OM',
        name: 'Oman'
    },
    {
        code: 'PK',
        name: 'Pakistan'
    },
    {
        code: 'PW',
        name: 'Palau'
    },
    {
        code: 'PA',
        name: 'Panama'
    },
    {
        code: 'PG',
        name: 'Papua New Guinea'
    },
    {
        code: 'PY',
        name: 'Paraguay'
    },
    {
        code: 'PE',
        name: 'Peru'
    },
    {
        code: 'PH',
        name: 'Philippines'
    },
    {
        code: 'PL',
        name: 'Poland'
    },
    {
        code: 'PT',
        name: 'Portugal'
    },
    {
        code: 'QA',
        name: 'Qatar'
    },
    {
        code: 'RO',
        name: 'Romania'
    },
    {
        code: 'RU',
        name: 'Russia'
    },
    {
        code: 'RW',
        name: 'Rwanda'
    },
    {
        code: 'KN',
        name: 'Saint Kitts and Nevis'
    },
    {
        code: 'LC',
        name: 'Saint Lucia'
    },
    {
        code: 'VC',
        name: 'Saint Vincent and the Grenadines'
    },
    {
        code: 'WS',
        name: 'Samoa'
    },
    {
        code: 'SM',
        name: 'San Marino'
    },
    {
        code: 'ST',
        name: 'Sao Tome and Principe'
    },
    {
        code: 'SA',
        name: 'Saudi Arabia'
    },
    {
        code: 'SN',
        name: 'Senegal'
    },
    {
        code: 'RS',
        name: 'Serbia'
    },
    {
        code: 'SC',
        name: 'Seychelles'
    },
    {
        code: 'SL',
        name: 'Sierra Leone'
    },
    {
        code: 'SG',
        name: 'Singapore'
    },
    {
        code: 'SK',
        name: 'Slovakia'
    },
    {
        code: 'SI',
        name: 'Slovenia'
    },
    {
        code: 'SB',
        name: 'Solomon Islands'
    },
    {
        code: 'SO',
        name: 'Somalia'
    },
    {
        code: 'ZA',
        name: 'South Africa'
    },
    {
        code: 'SS',
        name: 'South Sudan'
    },
    {
        code: 'ES',
        name: 'Spain'
    },
    {
        code: 'LK',
        name: 'Sri Lanka'
    },
    {
        code: 'SD',
        name: 'Sudan'
    },
    {
        code: 'SR',
        name: 'Suriname'
    },
    {
        code: 'SZ',
        name: 'Eswatini'
    },
    {
        code: 'SE',
        name: 'Sweden'
    },
    {
        code: 'CH',
        name: 'Switzerland'
    },
    {
        code: 'SY',
        name: 'Syria'
    },
    {
        code: 'TW',
        name: 'Taiwan'
    },
    {
        code: 'TJ',
        name: 'Tajikistan'
    },
    {
        code: 'TZ',
        name: 'Tanzania'
    },
    {
        code: 'TH',
        name: 'Thailand'
    },
    {
        code: 'TG',
        name: 'Togo'
    },
    {
        code: 'TO',
        name: 'Tonga'
    },
    {
        code: 'TT',
        name: 'Trinidad and Tobago'
    },
    {
        code: 'TN',
        name: 'Tunisia'
    },
    {
        code: 'TR',
        name: 'Turkey'
    },
    {
        code: 'TM',
        name: 'Turkmenistan'
    },
    {
        code: 'TV',
        name: 'Tuvalu'
    },
    {
        code: 'UG',
        name: 'Uganda'
    },
    {
        code: 'UA',
        name: 'Ukraine'
    },
    {
        code: 'AE',
        name: 'United Arab Emirates'
    },
    {
        code: 'GB',
        name: 'United Kingdom'
    },
    {
        code: 'US',
        name: 'United States'
    },
    {
        code: 'UY',
        name: 'Uruguay'
    },
    {
        code: 'UZ',
        name: 'Uzbekistan'
    },
    {
        code: 'VU',
        name: 'Vanuatu'
    },
    {
        code: 'VA',
        name: 'Vatican City'
    },
    {
        code: 'VE',
        name: 'Venezuela'
    },
    {
        code: 'VN',
        name: 'Vietnam'
    },
    {
        code: 'YE',
        name: 'Yemen'
    },
    {
        code: 'ZM',
        name: 'Zambia'
    },
    {
        code: 'ZW',
        name: 'Zimbabwe'
    }
]

export function usePicker <T> (initial?: T): {
    stagedValue?: T
    confirmedValue?: T
    setStagedValue: (arg0?: T) => void
    setConfirmedValue: (arg0?: T) => void
} {
    const [stagedValue, setStagedValue] = useState(initial)
    const [confirmedValue, setConfirmedValue] = useState(initial)

    return {
        stagedValue,
        confirmedValue,
        setStagedValue,
        setConfirmedValue
    }
}

export const AD_RETURN_POLICIES = [
    {
        value: '7_days',
        label: '7 Days Return Policy'
    },
    {
        value: '30_days',
        label: '30 Days Return Policy'
    },
    {
        value: 'warranty',
        label: 'Warranty Period Policy'
    }
]

export const AD_CONDITIONS = [
    {
        value: 'new',
        label: 'New'
    },
    {
        value: 'almost_new',
        label: 'Almost New'
    },
    {
        value: 'used',
        label: 'Used'
    },
    {
        value: 'damaged',
        label: 'Damaged'
    }
]

export function generatePageNumbers ({ currentPage, totalPages }: {
    currentPage: number
    totalPages: number
}): number[] {
    const maxVisiblePages = 10
    const pages = []

    // Ensure maxVisiblePages is an odd number for symmetric display
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2)

    // Calculate the range of page numbers to display
    let startPage = Math.max(currentPage - halfMaxVisiblePages, 1)
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

    // Adjust the startPage if the endPage is at the maximum limit
    startPage = Math.max(endPage - maxVisiblePages + 1, 1)

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
}

export const useNavigateToTop = (): ((to: string) => void) => {
    const navigate = useNavigate()

    const navigateAndReset = (to: string): void => {
        navigate(to, { replace: true })
        window.scrollTo(0, 0)
    }

    return navigateAndReset
}

export const LinkToTop = (props: {
    children: React.ReactNode
    className?: string
    to: string
}): React.ReactNode => {
    const navigateToTop = useNavigateToTop()

    const navigateAndReset: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
        event.preventDefault()
        navigateToTop(props.to)
    }

    return (
        <Link className={props.className} onClick={navigateAndReset} to={props.to}>
            {props.children}
        </Link>
    )
}
