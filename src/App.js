import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SchedulingTimeline from './components/SchedulingTimeline';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import AppBar from 'material-ui/AppBar';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import './App.css';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
    return class SelectableList extends Component {
        static propTypes = {
            children: PropTypes.node.isRequired,
            defaultValue: PropTypes.number.isRequired,
            onChange: PropTypes.function
        };

        componentWillMount() {
            this.setState({
                selectedIndex: this.props.defaultValue,
            });
        }

        handleRequestChange = (event, index) => {
            this.props.onChange(index);
            this.setState({
                selectedIndex: index,
            });
        };

        render() {
            return (
                <ComposedComponent
                    value={this.state.selectedIndex}
                    onChange={this.handleRequestChange}
                >
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

SelectableList = wrapState(SelectableList);

class App extends Component {
    state = {
        protocol: 'LLF',
        scheduler: {
            calc: 0.2,
            period: 2,
            start: 0
        },
        tasks: [
            { task: 1, grp: 1, period: 20, deadline: 18, calc: 6,  start: 0 },
            { task: 2, grp: 1, period: 40, deadline: 36, calc: 8,  start: 14 },
            { task: 3, grp: 1, period: 60, deadline: 54, calc: 24, start: 0 }
        ],
        task: -1
    }

    updateTask = (key, value) => {
        this.setState({
            tasks: this.state.tasks.map((t,i) => i === this.state.task ? {
                ...t,
                [key]: +value
            } : t)
        })
    }

    addTask = () => {
        this.setState({
            tasks: [ ...this.state.tasks, {
                task: this.state.tasks.length+1,
                grp: 1,
                period: 10,
                deadline: 10,
                calc: 5,
                start: 0
            } ]
        })
    }

    render() {
        return (
            <MuiThemeProvider>
                <div style={{ margin: 20 }}>
                    <AppBar
                        title="Scheduler Example"
                    />
                    <Card style={{ margin: 10 }}>
                        <div style={{ overflowX: 'auto' }} >
                            <SchedulingTimeline
                                scheduler={{...this.state.scheduler, protocol: this.state.protocol}}
                                tasks={this.state.tasks}
                            />
                        </div>
                    </Card>
                    <div style={{ display: 'flex' }}>
                        <Card style={{ margin: 10, padding: 10, flex: 1}}>
                            <CardHeader
                                title="Tasks"
                                subtitle="Add more tasks if you wish..."
                            />
                            <CardText>
                                <SelectableList
                                    defaultValue={-1}
                                    onChange={i => this.setState({ task: i })}
                                >
                                    <ListItem value={-1} primaryText="Scheduler" />
                                    {this.state.tasks.map((t,i) => (
                                        <ListItem primaryText={`Task ${t.task}`} value={i} key={i} />
                                    ))}
                                </SelectableList>
                            </CardText>
                            <CardActions>
                                <RaisedButton
                                    label="Add Task"
                                    primary={true}
                                    onClick={this.addTask}
                                />
                            </CardActions>
                        </Card>
                        <Card style={{ margin: 10, padding: 10, flex: 2}}>
                            <CardHeader
                                title={this.state.task === -1 ? "Scheduler" : `Task ${this.state.tasks[this.state.task].task}`}
                                subtitle="Configure your task..."
                            />
                            <CardText>
                                {this.state.task >= 0 && <div>
                                   <TextField
                                        floatingLabelText="Period (ms)"
                                        value={this.state.tasks[this.state.task].period}
                                        onChange={(e,v) => this.updateTask("period", v)}
                                    /><br/>
                                    <TextField
                                        floatingLabelText="Deadline (ms)"
                                        value={this.state.tasks[this.state.task].deadline}
                                        onChange={(e,v) => this.updateTask("deadline", v)}
                                    /><br/>
                                    <TextField
                                        floatingLabelText="Calculation (ms)"
                                        value={this.state.tasks[this.state.task].calc}
                                        onChange={(e,v) => this.updateTask("calc", v)}
                                    /><br/>
                                    <TextField
                                        floatingLabelText="Start Time (ms)"
                                        value={this.state.tasks[this.state.task].start}
                                        onChange={(e,v) => this.updateTask("start", v)}
                                    />
                                </div>}
                                {this.state.task === -1 && <div>
                                    <SelectField
                                        floatingLabelText="Algorithm"
                                        value={this.state.protocol}
                                        onChange={(e,i,v) => this.setState({ protocol: v })}
                                    >
                                        <MenuItem value="RM" primaryText="Rate Monotonic" />
                                        <MenuItem value="EDF" primaryText="Earliest Deadline First" />
                                        <MenuItem value="LLF" primaryText="Least Laxity First" />
                                    </SelectField><br/>
                                    <TextField
                                        floatingLabelText="Period (ms)"
                                        value={this.state.scheduler.period}
                                        onChange={(e,v) => this.setState({ scheduler: { ...this.state.scheduler, period: +v } })}
                                    /><br/>
                                    <TextField
                                        floatingLabelText="Calculation (ms)"
                                        value={this.state.scheduler.calc}
                                        onChange={(e,v) => this.setState({ scheduler: { ...this.state.scheduler, calc: +v } })}
                                    />
                                </div>}
                            </CardText>
                        </Card>
                    </div>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default App;
