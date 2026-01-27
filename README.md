# Pet Vital Signs Monitor - Web Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg) ![Status](https://img.shields.io/badge/status-active-success.svg)

## Description
This project is a **Single Page Application (SPA)** designed to visualize real-time biometric data (Temperature, Pulse, and Oxygen saturation). It acts as the frontend interface for an IoT monitoring system, fetching data directly from the **Adafruit IO Cloud**.

The dashboard is built to be lightweight and responsive, featuring an advanced data processing layer that filters sensor noise and "artifacts" before rendering the information on interactive charts.

## Key Features

* **Real-Time Visualization:** Fetches and updates sensor data every 10 seconds without page reloads using the Adafruit IO REST API.
* **Intelligent Data Filtering:** Includes a custom JavaScript algorithm to clean incoming signals:
    * Removes sensor errors (values < -999).
    * Filters biological inconsistencies (e.g., SpO2 < 60% or sudden drops in pulse) to ensure accurate readings.
* **Interactive Charts:** Utilizes **Chart.js** to render detailed time-series graphs with tooltips and dynamic axes.
* **Master-Detail Interface:**
    * **Overview:** Summary cards with current values and sparkline graphs.
    * **Detail View:** Modal windows with high-resolution historical data.
* **Responsive Design:** Built with CSS Grid and Flexbox to adapt seamlessly to desktop and mobile screens.

## Technologies Used

* **HTML5:** Semantic structure.
* **CSS3:** Custom styling with CSS Variables for theming (Red/Temperature, Pink/Pulse, Blue/Oxygen).
* **JavaScript (ES6+):** Asynchronous logic (Fetch API) and data processing.
* **Chart.js:** Data visualization library.
* **Adafruit IO:** IoT Cloud Platform (REST API).

## Getting Started

Since this is a client-side application, you don't need a complex backend setup.

### Prerequisites
* A modern web browser (Chrome, Firefox, Edge).
* An active **Adafruit IO** account with the corresponding feeds created.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/RocioVL99/dilucVet.git](https://github.com/RocioVL99/dilucVet.git)
    ```

2.  **Configure your Credentials:**
    Open the main JavaScript file (e.g., `script.js` or inside `index.html`) and locate the configuration section. Update it with your specific Adafruit IO Username and Key:

    ```javascript
    const AIO_USERNAME = "your_username";
    const AIO_KEY = "your_aio_key";
    ```

    > **Note:** For better security in production, consider using environment variables or a proxy server to hide your API Key.

3.  **Run the Dashboard:**
    Simply open the `index.html` file in your browser.
    * *Recommended:* Use a local server (like Live Server in VS Code) to avoid CORS issues with some browsers.

## Usage

Once opened, the dashboard will automatically start fetching data:
* **Cards:** View the latest readings instantly.
* **Modals:** Click on any card (Temperature, Pulse, or Oxygen) to open the detailed graph view.
* **Status:** If a sensor is disconnected or sending error codes, the filtering logic will hold the last valid value to prevent graph crashes.
