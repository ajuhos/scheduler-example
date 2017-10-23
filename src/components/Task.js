import React, { Component } from 'react';

const tasks = [
    { task: 1, grp: 1, period: 20, deadline: 18, calc: 6,  start: 0 },
    { task: 2, grp: 1, period: 40, deadline: 36, calc: 8,  start: 14 },
    { task: 3, grp: 1, period: 60, deadline: 54, calc: 24, start: 0 }
]

class Task extends Component {
    state = { protocol: 'RM' }

    render() {
        return (
            <div className="Task">
                <label><input type="number" value={this.props.period} /></label>
            </div>
        )
    }
}

export default App;
