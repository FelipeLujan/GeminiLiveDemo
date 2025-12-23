this application is a proof of concept of a live negotiation coach that the user can wear while negotiating in person. It uses audio from a microphone to listen to the negotiation and provides real-time feedback also though audio.


## Methodology
the hidden negotiation coach uses the concepts of the book "never split the difference" by chris voss to provide feedback to the user. it listens for key phrases and tones in the negotiation and provides suggestions on how to respond effectively.

through active listening and real-time recommendation, the ai negotiation coach instructs the user on when to apply techniques such as mirroring, labeling, and tactical empathy to steer the negotiation toward a favorable outcome.


## function calling
the negotiation coach uses function calling to trigger specific action recommendations based on the audio input it receives. when certain keywords or phrases are detected, the application calls functions that generate appropriate responses or suggestions for the user to implement during the negotiation.

### functions
- `suggest_mirroring()`: suggests mirroring the last few words spoken by the counterpart to build rapport.
- `suggest_labeling()`: suggests labeling the counterpart's emotions to demonstrate understanding.
- `suggest_tactical_empathy()`: suggests using tactical empathy to acknowledge the counterpart's perspective and build trust.
- `suggest_calibrated_questions()`: suggests asking calibrated questions to guide the conversation and gather information.
- `suggest_effective_pauses()`: suggests using effective pauses to create a sense of urgency and encourage the counterpart to fill the silence with valuable information.
- `provide_real_time_feedback()`: provides real-time feedback on the negotiation dynamics and suggests adjustments to the user's approach.
- `summarize_negotiation()`: summarizes the key points and outcomes of the negotiation for post-negotiation analysis.

- function calling documentation:
https://ai.google.dev/gemini-api/docs/live-tools


## Technologies used
The ai coach uses `gemini live api` for real-time audio processing and feedback generation. 

The backend is build with python in the `server`folder and the frontend is build with `react` in the `web` folder.

## testing
To test the negotiation coach, run the `restart.sh`script to start both the backend and frontend servers. 

simulated negotiaition counterparts

* **Negotiation scenario 1 ** : negotiating a salary increase.
  Role: manager.
  Objective: convince the user to accept a lower salary increase than requested.
  Prompt: "You are a manager negotiating a salary increase with an employee. Your goal is to convince the employee to accept a lower salary increase than they requested. Use persuasive language and negotiation tactics to achieve your objective."


* **Scenario 2** : negotiating a car purchase.
  Role: car salesperson.
  Objective: convince the user to the set price of 40.000 dollars.
  Prompt: "You are a car salesperson negotiating the price of a car with a customer. Your goal is to convince the customer to agree to the set price of 40,000 dollars. Use persuasive language and negotiation tactics to achieve your objective."
