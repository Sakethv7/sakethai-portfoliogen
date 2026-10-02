const e=`I'm building a system that watches industrial machines, spots a developing fault, and takes the first steps of the response by itself. This is a build log of the concepts behind it, how I got here, and what I am doing with it. I will also say plainly what I have not proven.

## How I came up with it

Two interests met. I wanted to build something physical. A mounted sensor on a real machine, on a bench, is a different kind of problem from software that only moves text around. I also work on telemetry triage and evaluation loops in my day job: take a stream of signals, decide which ones matter, explain why, and learn from corrections. I wanted to see whether that same loop works when the signals come from machines instead of an assistant.

Predictive maintenance looked like the clearest place to try it. A broken pump or motor has an obvious cost, and the physical signals are rich. I started it in late April 2026 as a learning project. I also keep a longer ambition in the background, which is agents that multiply what people can do around physical equipment. Maintenance is the entry point, not the end goal.

## The idea in one paragraph

An alarm tells you something is wrong. A person then has to look at it, gather context, open a ticket, schedule a fix, and later check the fix worked. That workflow is where much of the effort goes. My working belief is that the useful product is the agent that does the first steps of that workflow, with a person approving. I have not tested that belief against real practitioners, and I treat it as a hypothesis.

## The concepts, in order

**Vibration over temperature.** A rotating machine has a repeatable vibration pattern tied to its speed, load and shape. Faults change that pattern in known ways. The usual argument is that temperature is a lagging signal. By the time a bearing is hot, it has been failing for a while. Vibration changes earlier.

**Features, not raw samples.** An accelerometer produces tens of thousands of samples per second, and no model trains well on that directly. So I cut the signal into short windows and compute a few numbers per window and per axis. RMS measures overall energy. Crest factor is peak over average, which is high in early bearing wear. Kurtosis measures how spiky the signal is, so impacts show up as high values. Every data source has to produce the same record shape, so the rest of the system never cares where a reading came from.

**Two-layer detection.** A z-score check against normal readings catches obvious outliers directly. Anything less clear goes to an Isolation Forest. That model needs no labeled fault data. It learns what normal looks like and flags readings that are easy to separate from it. The z-score layer also tells me which feature drifted, so a flag is explainable.

**An agent is a bounded loop, not a chatbot.** For me, "agentic" means a control loop around machine state. It gathers context, forms a fault hypothesis, passes safety gates, asks an operator to approve, and records the outcome so I can replay it later. There are four of them:

| Agent | When it runs | What it does |
|---|---|---|
| Investigation | On every critical flag | Pulls recent readings and trends, checks peer machines on the same line, classifies the fault with a confidence, writes an incident report. A person approves or dismisses it. |
| Degradation watcher | Every 30 minutes | Fits trends and warns when a feature is projected to cross a threshold within a set number of hours. |
| Post-maintenance validator | When an incident is marked resolved | Watches the next readings against the pre-fault baseline, then confirms the fix or escalates again. |
| Shift summary | End of each shift | Writes a plain-language report for a floor supervisor. |

**Keep the model off the sensor.** The microcontroller on the machine only samples, computes cheap features and sends packets. The agents run on a gateway beside the line, such as a small computer. A plant-level layer would handle fleet memory and summaries. This is also why I use a small local model. My assumption is that a factory would not want its data leaving the building, and I haven't checked that either. A local model also removes per-query cost.

## What exists today

The stack is a sensor board, a gateway, a message broker, SQLite storage, scikit-learn for detection, LangGraph for the agents, a local model, and a Streamlit dashboard. For development I use a public dataset recorded from a real rotating machine, so I don't need hardware to build the pipeline.

Phase one is done: real data, anomaly detection, a dashboard, and a one-shot root-cause analysis. Phase two is in progress: the standard feature extractor and the four agents. The investigation agent now fires on a critical reading, an operator-approval step sits before an incident becomes actionable, and every incident leaves a trace. I also built a replay harness, so I can re-run past incidents against changed logic and compare. Connecting a real sensor to the same pipeline is blocked on hardware.

## What I have not proven

This is the important part.

- **No practitioner has used or seen it.** I have no evidence that a maintenance engineer would trust the output, or that anyone would pay for it.
- **The data is public.** The detector and agents run on recorded data. They have not met a noisy, real plant.
- **The evidence I do have is only about the problem.** A [2025 MaintainX survey](https://www.getmaintainx.com/newsroom/state-of-industrial-maintenance-report-2025) of 1,320 maintenance professionals in the US and Canada found that 58 percent spend more than half their time reacting to breakdowns. It also found that 71 percent call preventive maintenance a core strategy, yet fewer than 35 percent spend most of their time on it. That says the pain is real. It does not say my approach fixes it. MaintainX sells maintenance software, so I read the survey as direction and not proof.
- **Trust is the hard part.** An alerting system that cries wolf loses the people it serves. Whether my agents are right often enough is something I have not measured.

## What I'm doing next

The next step is talking to people who maintain machines, before I add anything else. I want to hear how they respond when an alert fires, how many alerts they get against how many matter, and where machine-specific knowledge lives. I will use what I hear to decide whether to keep going.
`;export{e as default};
