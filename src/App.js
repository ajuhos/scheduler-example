import React, { Component } from 'react';
import SchedulingTimeline from './components/SchedulingTimeline';
import Select from 'react-select';
// Be sure to include styles at some point, probably during your bootstrapping
import 'react-select/dist/react-select.css';
import './App.css';

const scheduler = {
    calc: 0.2,
    period: 2,
    start: 0,
    protocol: 'RM'
}

const tasks = [
    { task: 1, grp: 1, period: 20, deadline: 18, calc: 6,  start: 0 },
    { task: 2, grp: 1, period: 40, deadline: 36, calc: 8,  start: 14 },
    { task: 3, grp: 1, period: 60, deadline: 54, calc: 24, start: 0 }
]

class App extends Component {
    state = { protocol: 'RM' }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Scheduler Example</h1>
                    <div>
                        <Select
                            options={[
                                { value: "RM", label: "Rate Monotonic" },
                                { value: "EDF", label: "Earliest Deadline First" },
                                { value: "LLF", label: "Least Laxity First" }
                            ]}
                            value={this.state.protocol}
                            onChange={(e) => this.setState({ protocol: e.value })} />
                    </div>
                </header>
                <div className="App-intro">
                    <div style={{ overflowX: 'auto' }} >
                        <SchedulingTimeline scheduler={{...scheduler, protocol: this.state.protocol}} tasks={tasks} />
                    </div>
                </div>
            </div>
        )
    }
}

export default App;
