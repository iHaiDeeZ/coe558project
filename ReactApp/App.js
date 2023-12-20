import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
 
// App Component
function App() {
    const [data, setData] = useState([]);
    const [additionalData, setAdditionalData] = useState(null);
 
    // Function to fetch the main sensor data
    const fetchData = () => {
        fetch('https://apipr-kw5oqvy.uc.gateway.dev/getData')
            .then(res => res.json())
            .then(jsonArray => setData(jsonArray))
            .catch(err => console.error(err));
    };
 
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Fetch data every 3 seconds
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);
 
    // Function to determine the status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'caution':
                return 'orange';
            case 'normal':
                return 'green';
            case 'fire':
                return 'red';
            default:
                return 'black';
        }
    };
 
    // Function to fetch additional data when the button is pressed
    const fetchAdditionalData = () => {
        fetch('https://apipr-kw5oqvy.uc.gateway.dev/getStatus')
            .then(res => res.json())
            .then(json_data => setAdditionalData(json_data))
            .catch(err => console.error(err));
    };
 
    // Function to determine on/off status color
    const getOnOffStatusColor = (status) => {
        return status === 'On' ? 'red' : 'green';
    };
 
    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            <ul style={{ margin: '0', padding: '0' }}>
                {data.map(item => (
                    <li key={item._id} style={{ marginBottom: '10px', paddingLeft: '0' }}> {/* Remove padding here */}
                        <h2 style={{
                            color: 'navy',
                            borderBottom: '2px solid darkblue',
                            paddingBottom: '5px',
                            display: 'inline-block',
                            marginLeft: '0' // Ensure h2 starts at the very left
                        }}>Current Sensor Readings</h2>
                        <div>
                            Status: <span style={{ color: getStatusColor(item.sensor_001.status) }}>{item.sensor_001.status}</span>
                        </div>
                        <div>
                            Temperature Value: {item.sensor_001.temp_value}°C
                        </div>
                        <div>
                            Temperature Threshold: {item.sensor_001.temp_threshold}°C
                        </div>
                        <div>
                            Smoke Sensor: {item.sensor_001.smoke_sensor ? 'Active' : 'Inactive'}
                        </div>
                        <div>
                            LED Status: <span style={{ color: getOnOffStatusColor(item.sensor_001.led_status) }}>{item.sensor_001.led_status}</span>
                        </div>
                        <div>
                            Water Extinguisher Status: <span style={{ color: getOnOffStatusColor(item.sensor_001.water_extinguisher_status) }}>{item.sensor_001.water_extinguisher_status}</span>
                        </div>
                        <div>
                            Buzzer Status: <span style={{ color: getOnOffStatusColor(item.sensor_001.buzzer_status) }}>{item.sensor_001.buzzer_status}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', color: 'blue' }}>
                            DateTime: {item.sensor_001.datetime}
                        </div>
                    </li>
                ))}
            </ul>
            <button
                style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: '10px 0'
                }}
                onClick={fetchAdditionalData}
            >
                Sensor Status
            </button>
            {additionalData && (
                <div style={{ fontSize: 'smaller', fontStyle: 'italic' }}>
                    <div>Last Time Online: {additionalData['Last Time Online']}</div>
                    <div>Sensor Status: {additionalData['Sensor Status']}</div>
                    <div>Last Critical Condition: {additionalData['Last Critical Condition']}</div>
                </div>
            )}
        </div>
    );
}
// Navigation Bar Component
function NavBar() {
    const navBarStyle = {
      backgroundColor: '#000080', // Dark blue color
      color: '#fff',
      padding: '5px 0', // Reduced padding for smaller size
      display: 'flex',
      marginTop: '0',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: '15px',
      marginBottom: '5px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' // Soft box shadow for depth
    };
 
    const navLinkStyle = {
      color: '#fff',
      textDecoration: 'none',
      padding: '8px 12px', // Slightly reduced padding for smaller size
      fontWeight: 'bold', // Bold font weight
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Text shadow for legibility
      transition: 'background-color 0.2s',
    };
 
    const navItemStyle = {
      listStyleType: 'none',
      padding: '0 5px', // Slightly reduced padding for smaller size
    };
 
    return (
      <nav style={navBarStyle}>
        <ul style={{ margin: 0, padding: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
          <li style={navItemStyle}><Link to="/" style={navLinkStyle}>Current Status</Link></li>
          <li style={navItemStyle}><Link to="/graphql" style={navLinkStyle}>Real Time</Link></li>
        </ul>
      </nav>
    );
  }


// Error Page Component (Placeholder)
function RealTimePage() {
    const [selectedSensor, setSelectedSensor] = useState('All');
    const [sensorData, setSensorData] = useState([]);

    const queries = {
        All: `query { getAllSensorData { data { temp_sensor { value datetime } smoke_sensor { smoke_sensor datetime } buzzer { buzzer_status datetime } led { led_status datetime } } } }`,
        Temperature: `query { getAllSensorData { data { temp_sensor { value datetime } } } }`,
        Smoke: `query { getAllSensorData { data { smoke_sensor { smoke_sensor datetime } } } }`,
        LED: `query { getAllSensorData { data { led { led_status datetime } } } }`,
        Buzzer: `query { getAllSensorData { data { buzzer { buzzer_status datetime } } } }`,
    };

    const fetchData = () => {
        const query = queries[selectedSensor];
    
        fetch('https://apipr-kw5oqvy.uc.gateway.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`); // Improved error handling
            }
            return res.json();
        })
        .then(response => {
            setSensorData(response.data.getAllSensorData.data);
        })
        .catch(err => {
            console.error('Fetch error:', err); // Log detailed error
        });
    };

    useEffect(() => {
        fetchData(); // Initial data fetch
        const interval = setInterval(fetchData, 10000); // Set up an interval for fetching data every 10 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [selectedSensor]);

    const convertBoolean = value => value ? 1 : 0;

    // Reverted to original datetime format
    const formatDateTime = (datetime) => datetime;

    const generateChartData = (sensorType, label, valueKey, borderColor, isBooleanSensor = false) => {
        const chartData = sensorData.map(data => {
            const sensor = data[sensorType];
            if (!sensor) return null;

            let yValue = sensor[valueKey];
            if (typeof yValue === 'boolean') {
                yValue = convertBoolean(yValue);
            }

            return {
                x: formatDateTime(sensor.datetime),
                y: yValue
            };
        });

        return {
            labels: chartData.map(d => d ? d.x : ''),
            datasets: [{
                label: label,
                data: chartData,
                borderColor: borderColor,
                fill: false,
            }],
            options: {
                scales: {
                    x: {
                        type: 'category'
                    },
                    y: {
                        ticks: {
                            stepSize: isBooleanSensor ? 1 : undefined
                        }
                    }
                }
            }
        };
    };


    const chartContainerStyle = {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px', // Set a standard height for each chart
        maxWidth: '600px', // Set a standard width for each chart
        margin: 'auto', // Center the chart in the div
        padding: '10px', // Optional padding for visual spacing
        boxSizing: 'border-box' // Include padding and border in the width and height
    };

    const renderChart = () => {
        let chartData;
        switch (selectedSensor) {
            case 'All':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Chart type="line" data={generateChartData('temp_sensor', 'Temperature', 'value', 'red', false)} />
                        <Chart type="line" data={generateChartData('smoke_sensor', 'Smoke Sensor', 'smoke_sensor', 'gray', true)} />
                        <Chart type="line" data={generateChartData('led', 'LED Status', 'led_status', 'blue', true)} />
                        <Chart type="line" data={generateChartData('buzzer', 'Buzzer Status', 'buzzer_status', 'green', true)} />
                    </div>
                );
            case 'Temperature':
                chartData = generateChartData('temp_sensor', 'Temperature', 'value', 'red', false);
                break;
            case 'Smoke':
                chartData = generateChartData('smoke_sensor', 'Smoke Sensor', 'smoke_sensor', 'gray', true);
                break;
            case 'LED':
                chartData = generateChartData('led', 'LED Status', 'led_status', 'blue', true);
                break;
            case 'Buzzer':
                chartData = generateChartData('buzzer', 'Buzzer Status', 'buzzer_status', 'green', true);
                break;
            default:
                chartData = { labels: [], datasets: [] };
        }

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '1000px',
                maxWidth: '5000px'
            }}>
                <Chart type="line" data={chartData} options={chartData.options} />
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px' }}>
            <select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
                <option value="All">All</option>
                <option value="Temperature">Temperature Sensor</option>
                <option value="Smoke">Smoke Sensor</option>
                <option value="LED">LED Status</option>
                <option value="Buzzer">Buzzer Status</option>
            </select>
            {renderChart()}
        </div>
    );
}

export default RealTimePage;


function ErrorPage() {
    return <div>Error: Page not found</div>;
}
 
// Router Configuration
const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <NavBar />
                <App />
            </>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: "/graphql",
        element: (
            <>
                <NavBar />
                <RealTimePage />
            </>
        ),
    }
]);
 
// Render the application
ReactDOM.render(<RouterProvider router={router} />, document.getElementById('root'));
