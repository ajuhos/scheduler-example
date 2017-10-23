import React, { Component } from 'react';

class SchedulingTimeline extends Component {

    schedule(scheduler, tasks) {
        const data = []
        let ok = true

        function wannaStart(task, T) {
            return (T - task.start) % task.period === 0
        }

        function deadline(run) {
            return run.arrival + run.deadline
        }

        function laxity(run) {
            return deadline(run) - run.remaining
        }

        const protocol = {
            RM: (run, otherRun) => run.period < otherRun.period,
            EDF: (run, otherRun) => deadline(run) < deadline(otherRun),
            LLF: (run, otherRun) => laxity(run) < laxity(otherRun)
        }

        function isMoreImportant(task, otherTask) {
            return !otherTask || protocol[scheduler.protocol](task, otherTask)
        }

        function isMoreImportantSorter(task, otherTask) {
            return protocol[scheduler.protocol](task, otherTask) ? -1 : 1
        }

        function wcrti(task, Rn, l) {
            const sumHP = tasks
                .filter(t => isMoreImportant(t, task))
                .reduce((a,k) => a + Math.ceil(Rn / k.period) * k.calc, 0)

            const sch = Math.ceil(Rn / scheduler.period) * scheduler.calc

            const Rn1 = task.calc + sumHP + sch;

            if(Rn1 === Rn) return Rn;
            else return wcrti(task, Rn1, l+1)
        }

        function wcrt(task) {
            return { task, r: wcrti(task, task.calc) }
        }

        function maxProcessor(tasks) {
            if(scheduler.protocol === 'RM') {
                const N = tasks.length + (scheduler.calc > 0 ? 1 : 0)
                return N * (Math.pow(2, 1 / N) - 1)
            }
            else {
                return 1
            }
        }

        function isEnded(run, T) {
            return run && (run.lastUpdate + run.remaining) <= T
        }

        function hasFailed(run, T) {
            if(scheduler.protocol === "RM") {
                return T > (run.arrival + run.period)
            }
            else {
                return T > deadline(run)
            }
        }

        console.log('scheduling with ' + scheduler.protocol + "...")

        let currentRun = null;
        let startedRuns = [];
        schedule: for(let T = 0; T < 200; T++) {
            if(wannaStart(scheduler, T)) {
                console.log('T='+T)

                //0. Check for failure
                for(let run of startedRuns) {
                    if (hasFailed(run, T)) {
                        console.error('Cannot schedule due to ', run)
                        ok = false
                        currentRun = null;
                        break schedule;
                    }
                }
                //1. Check for completion
                if(isEnded(currentRun, T)) {
                    currentRun.to = currentRun.lastUpdate + currentRun.remaining;
                    currentRun.remaining = 0;
                    data.push(JSON.parse(JSON.stringify(currentRun)))
                    console.log('ended', currentRun)

                    //We have no running task right now.
                    startedRuns.splice(startedRuns.indexOf(currentRun), 1)
                    currentRun = null;
                }
                else if(currentRun) {
                    currentRun.remaining = currentRun.remaining - (T-currentRun.lastUpdate);
                    currentRun.lastUpdate = T;
                }

                let ready = [];

                //2. Check for resumable tasks
                for(let run of startedRuns) {
                    if(run !== currentRun && isMoreImportant(run, currentRun)) {
                        ready.push(run)
                    }
                }

                //3. Check for new tasks
                for (let task of tasks) {
                    if(wannaStart(task, T)) {
                        console.log(task.task + " wanna start!")
                        const run = {
                            ...task,
                            arrival: T,
                            from: -1,
                            to: -1,
                            remaining: task.calc
                        }

                        task.grp++

                        startedRuns.push(run)

                        if(isMoreImportant(run, currentRun)) {
                            console.log('ready', run)
                            ready.push(run)
                        }
                    }
                }

                //4. Choose one
                const readyByPriority = ready.sort(isMoreImportantSorter);
                const toBeCurrentRun = readyByPriority[0];

                if(currentRun) {
                    //Preemptiv stop
                    currentRun.to = T;
                    data.push(JSON.parse(JSON.stringify(currentRun)));
                    console.log('stopped', currentRun)

                    startedRuns.splice(startedRuns.indexOf(currentRun), 1)
                }

                if(toBeCurrentRun) {
                    if(currentRun) {
                        startedRuns.push({
                            ...currentRun,
                            from: -1,
                            to: -1,
                            remaining: currentRun.remaining - (currentRun.to-currentRun.lastUpdate)
                        })
                    }

                    currentRun = toBeCurrentRun;
                    console.log('starting', currentRun)

                    if (currentRun) {
                        currentRun.from = T + scheduler.calc;
                        currentRun.lastUpdate = currentRun.from;
                    }
                }
                else if(currentRun) {
                    startedRuns.push(currentRun = {
                        ...currentRun,
                        from: T + scheduler.calc,
                        lastUpdate: T + scheduler.calc,
                        to: -1,
                        remaining: currentRun.remaining - (currentRun.to-currentRun.lastUpdate)
                    })
                }
            }
        }

        if(currentRun) {
            currentRun.to = 200;
            data.push(currentRun);
            currentRun = null;
        }

        return {
            data,
            ok,
            n: [ scheduler, ...tasks ].reduce((a,t) => a + t.calc / t.period, 0),
            max: maxProcessor(tasks),
            //wcrt: tasks.map(t => wcrt(t))
            wcrt: []
        }
    }

    constructor(props) {
        super(props)
        this.state = this.schedule(props.scheduler, props.tasks)
    }

    componentWillReceiveProps({ scheduler, tasks }) {
        this.setState(this.schedule(scheduler, tasks))
    }

    render() {
        const zoom = 20;
        const tickFrequency = 1;
        const primary = 5;

        const ticks = [];
        for(let i = 0; i <= Math.max(...this.state.data.map(d => d.to)) + tickFrequency; i += tickFrequency) {
            ticks.push({ i, p: i % primary === 0 })
        }

        return (
            <div style={{ margin: 50 }}>
                <div className="timeline">
                    {this.state.data.map(({ task, from, to, grp }, i) => (
                        <div key={i}
                             className={"entry entry-" + task + (this.state.task === task && this.state.grp === grp ? ' active' : '')}
                             style={{ width: (to-from)*zoom, left: from*zoom }}
                             onMouseOver={() => this.setState({ task, grp })}
                             onMouseOut={() => this.setState({ task: null })}
                        >
                            {task}
                        </div>
                    ))}
                    <div className="ticks">
                        <div className="line" />
                        {ticks.map(({i,p}) => (
                            <div className="tick" key={i} style={{ left: i*zoom }}>
                                {p && <span>{i}</span>}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    {!this.state.ok && <h3>Failed to schedule. <span role="img" aria-label="Broken Heart Emoji">💔</span></h3>}
                    {this.state.ok && <h3>Scheduling done. <span role="img" aria-label="Heart Emoji">❤️</span></h3>}
                </div>
            </div>
        );
    }
}

export default SchedulingTimeline;
