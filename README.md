# Spoiler-Blocker
The spoiler blocker is a browser-based tool designed to block and blur spoilers in web content. It leverages a combination of keyword-based detection and AI-powered contextual filtering to identify and manage potential spoilers effectively.

Key Features:
• AI-Powered Contextual Filtering: Beyond simple keyword matches, machine learning models
examine the context of the content to identify sophisticated spoilers.
• Real-Time Spoiler Blocking: This feature quickly blurs spoiler-containing content so that users
can browse without interruption.
• Personalization: By adding particular phrases, allowing voice commands for hands-free
operation, and configuring time-based blocking, users can personalize their experience.
• Toggle to ON/OFF: Users may easily turn the spoiler blocker on or off as needed thanks to the
tool's seamless browser extension integration.
• Security and Privacy: The system puts user privacy first, processing data safely on the backend
or locally without jeopardizing user data.
• Voice Command Support: Enable hands-free interaction to control the spoiler blocker.
• Blur Content and View Option: Automatically blur spoiler content while allowing users to reveal it with a "View" button.

1.Frontend
o Spoiler Blocking: This feature allows users to define specific keywords or phrases they want the system to monitor. Once these keywords are input through the interface, the extension actively scans webpage content (e.g., text, titles, or subtitles) to detect and mask spoilers in real time. The system dynamically blurs or hides elements containing the identified spoilers, ensuring users can browse without unintended content exposure.
o Toggle ON/OFF: This feature allows the user to directly on and off the Spoiler blocker extension
o Remove Option :To remove a keyword from storage directly.
o Advance Spoiler Option: This gives user more features such as to block images ,videos and time (to block spoiler for particular time period) and voice command.
o Voice Command: It provides hands-free control for convenience and accessibility. Users can activate this feature to issue verbal instructions to Add keyword

2.Backend (Python, FastAPI, Machine Learning):
o FastAPI Setup: The backend is built using FastAPI, a high-performance Python framework, to manage communication between the frontend and the machine learning model.
o Model Loading: The backend loads a pre-trained machine learning model (e.g., Transformer-based) to perform text classification. This model analyzes the provided text to detect spoilers and makes predictions in real-time.
o API Routes: Endpoints like /predict are defined to handle incoming requests from the frontend. Users’ text data is sent to these routes for processing, and the response indicates whether the text contains spoilers, along with its probability.
o Real-Time Inference: The system ensures that predictions are generated instantly, enabling the browser extension to blur or unmask content dynamically without noticeable delays, enhancing user experience.

3.Development
o Frontend Development:This step involves designing the user interface with tools like HTML, CSS, and JavaScript. Interactive elements, such as keyword input forms and voice commands, are created, and APIs are integrated to send user inputs to the backend.
o Backend Development: The backend is built using FastAPI, where the machine learning model is integrated to process text. Prediction endpoints like /predict are created to handle requests and return spoiler detection results to the frontend.
o Testing & Debugging:Both frontend and backend components are tested to ensure seamless communication. Bugs are fixed, and performance is optimized to provide a smooth and reliable user experience.
o Deployment: Hosting the FastAPI server and deploying the browser extension locally.
o Iterate & Improve: This includes refining the machine learning model, improving the UI, and adding new features based on user need.
