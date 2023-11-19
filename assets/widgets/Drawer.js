import React, { memo, useState } from "react";


const Drawer = memo(function Drawer({ className, name, choices }) {
    const [selectedChoice, setSelectedChoice] = useState(null);
  
    const handleChoiceClick = (choice) => {
      setSelectedChoice(choice);
    };
  
    return (
        <div className={className} data-role="drawer">
            {choices.map((choice) => {
                let subdrawer;
                if ((choice === selectedChoice) && choice.subchoices.length) {
                    subdrawer = (
                        Drawer({
                            className: className,
                            name: name,
                            choices: choice.subchoices,
                        })
                    )
                }
                
                return (
                    <div key={choice.value} data-role="branch">
                        <div data-role="choice" onClick={() => handleChoiceClick(choice)}>
                            {choice.label}
                            {choice.subchoices.length ? (
                                <div className="icon icon--small" data-role="marker">
                                    <i className="material-icons">
                                        {choice === selectedChoice ? 'expand_more' : 'chevron_right'}
                                    </i>
                                </div>
                            ) : (
                                <input type="radio" name={name} defaultChecked={choice === selectedChoice} value={choice.value}/>
                            )}
                        </div>
                        {subdrawer}
                    </div>
                )
            })}
        </div>
    );
});


export default Drawer