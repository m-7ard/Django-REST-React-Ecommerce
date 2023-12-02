import React, {
    useState, createContext, useContext, useMemo
} from 'react'
import type { NormalizedData } from '../Utils'
import { type NormalizedDataItem } from '../Types'

const DrawerContext = createContext(null)

interface DrawerInterface {
    name: string
    className: string
    normalizedData: NormalizedData
    topLevelChoices: NormalizedDataItem[]
    initialChoice?: number
    parentChoiceHandle?: (value: number) => void
}

export default function Drawer ({
    name, className, normalizedData, topLevelChoices, initialChoice, parentChoiceHandle
}: DrawerInterface): React.ReactNode {
    const [route, setRoute] = useState(
        (initialChoice == null) ? [] : normalizedData.getRoute(initialChoice)
    )
    const onChoiceSelect = (value: number): void => {
        setRoute(normalizedData.getRoute(value))

        if (parentChoiceHandle !== undefined && parentChoiceHandle !== null) {
            parentChoiceHandle(value)
        }
    }

    const generateChoices = (choices: NormalizedDataItem[]): React.ReactNode => (
        <div data-role="choices">
            {choices.map((choice) => {
                const subchoices = normalizedData.getSubChoices(choice.value)
                if (subchoices.length > 0) {
                    return (
                        <Branch choices={subchoices} root={choice} key={choice.value} />
                    )
                }

                return (
                    <Leaf {...choice} key={choice.value} />
                )
            })}
        </div>
    )

    const drawerContextValue = useMemo(() => ({
        onChoiceSelect,
        name,
        normalizedData,
        route,
        generateChoices
    }), [route])

    return (
        <DrawerContext.Provider value={drawerContextValue}>
            <div className={className} data-role="drawer">
                {generateChoices(topLevelChoices)}
            </div>
        </DrawerContext.Provider>

    )
}

function Leaf ({ value, label }) {
    const { name, onChoiceSelect, route } = useContext(DrawerContext)
    const checked = route.includes(value)

    return (
        <button type="button" data-role="leaf" onClick={() => onChoiceSelect(value)}>
            {label}
            <div className="icon icon--small" data-role="check">
                <i className="material-icons">
                    check_circle
                </i>
            </div>
            <input
                type="radio"
                name={name}
                defaultChecked={checked}
                value={value}
            />
        </button>
    )
}

function Root ({ value, label }) {
    const { onChoiceSelect } = useContext(DrawerContext)

    return (
        <button type="button" data-role="root" onClick={() => onChoiceSelect(value)}>
            {label}
            <div className="icon icon--small" data-role="marker">
                <i className="material-icons">
                    chevron_right
                </i>
            </div>
        </button>
    )
}

function Branch ({ root, choices }) {
    const { generateChoices, route } = useContext(DrawerContext)
    const active = route.includes(root.value)

    return (
        <div data-role="branch" data-active={active}>
            <Root {...root} />
            {active && generateChoices(choices)}
        </div>
    )
}
