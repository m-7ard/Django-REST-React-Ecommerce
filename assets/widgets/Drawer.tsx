import React, {
    useState, createContext, useContext, useMemo
} from 'react'
import type { NormalizedData } from '../Utils'
import { type NormalizedDataItem } from '../Types'

interface DrawerNode {
    value: number
    label: string
}

interface DrawerContextInterface {
    onChoiceSelect: (value: number) => void
    name: string
    normalizedData: NormalizedData
    route: number[]
    generateChoices: (choices: NormalizedDataItem[]) => React.ReactNode
}

const DrawerContext = createContext<DrawerContextInterface | null>(null)

const useDrawerContext = (): DrawerContextInterface => {
    const drawerContextValue = useContext(DrawerContext)

    if (drawerContextValue == null) {
        throw new Error(
            'useDrawerContext has to be used within <DrawerContext.Provider>'
        )
    }

    return drawerContextValue
}

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

function Leaf ({ value, label }: DrawerNode): React.ReactNode {
    const { name, onChoiceSelect, route } = useDrawerContext()
    const checked = (route == null) ? false : route.includes(value)

    return (
        <button type="button" data-role="leaf" onClick={() => {
            onChoiceSelect(value)
        }}>
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

function Root ({ value, label }: DrawerNode): React.ReactNode {
    const drawerContextValue = useDrawerContext()
    const { onChoiceSelect } = drawerContextValue

    return (
        <button type="button" data-role="root" onClick={() => {
            onChoiceSelect(value)
        }}>
            {label}
            <div className="icon icon--small" data-role="marker">
                <i className="material-icons">
                    chevron_right
                </i>
            </div>
        </button>
    )
}

function Branch ({ root, choices }: { root: DrawerNode, choices: NormalizedDataItem[] }): React.ReactNode {
    const drawerContextValue = useDrawerContext()
    const { generateChoices, route } = drawerContextValue
    const active = route.includes(root.value)

    return (
        <div data-role="branch" data-active={active}>
            <Root {...root} />
            {active && generateChoices(choices)}
        </div>
    )
}
