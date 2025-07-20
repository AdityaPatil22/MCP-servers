# Weather MCP Server

## Overview

This MCP (Model Context Protocol) server, `weather`, provides real-time weather data and solar information for US-based locations. It integrates with the National Weather Service (NWS) API for accurate weather forecasts and alerts, and the Sunrise-Sunset API for solar data, making it easy for AI tools and applications to access comprehensive weather information.

## Features

* **Weather Alerts**: Get active weather alerts and warnings for any US state
* **Detailed Forecasts**: Retrieve comprehensive weather forecasts including temperature, wind conditions, and short-term predictions
* **Solar Information**: Access sunrise and sunset times for any location worldwide
* **Multi-day Forecasts**: Get extended weather forecasts with multiple time periods
* **State-wide Coverage**: Monitor weather alerts across entire US states
* **Location-based Queries**: Support for latitude/longitude coordinate-based weather requests

## Tools

The server provides the following MCP tools:

* `get-alerts`: Get weather alerts for a US state using two-letter state codes
* `get-forecast`: Get detailed weather forecast for specific coordinates (latitude/longitude)
* `get-sunrise-sunset`: Get sunrise and sunset times for any location with optional date specification

## Data Sources

The server fetches data from two reliable APIs:

* **National Weather Service API**: `https://api.weather.gov` - Provides weather forecasts and alerts for US locations
* **Sunrise-Sunset API**: `https://api.sunrise-sunset.org` - Provides solar data for worldwide locations

## Setup

### Prerequisites

* Node.js
* Internet connection (for accessing weather APIs)
* An MCP client (e.g., a compatible AI tool or application)

### Installation

1. Clone this repository or navigate to the weather package.
2. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Server

1. Start the server:

   ```bash
   npm start
   ```

   The server will listen for MCP requests via standard input/output.

### Usage

To use the server, send MCP requests from a compatible client. Here are example requests for each tool:

* **Get weather alerts for a state:**

  ```json
  {
    "tool_name": "get-alerts",
    "input": {
      "state": "CA"
    }
  }
  ```

* **Get weather forecast for coordinates:**

  ```json
  {
    "tool_name": "get-forecast",
    "input": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
  ```

* **Get sunrise/sunset times:**

  ```json
  {
    "tool_name": "get-sunrise-sunset",
    "input": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "date": "2024-12-25"
    }
  }
  ```

Refer to the MCP client documentation for instructions on sending requests and handling responses.

## Tool Parameters

### get-alerts
* `state` (required): Two-letter US state code (e.g., "CA", "NY", "TX")

### get-forecast  
* `latitude` (required): Latitude coordinate (-90 to 90)
* `longitude` (required): Longitude coordinate (-180 to 180)

### get-sunrise-sunset
* `latitude` (required): Latitude coordinate (-90 to 90)  
* `longitude` (required): Longitude coordinate (-180 to 180)
* `date` (optional): Date in YYYY-MM-DD format, defaults to "today"

## Response Formats

### Weather Alerts
Returns formatted information including:
* **Event Type**: Type of weather event (e.g., Winter Storm Warning)
* **Area Description**: Geographic areas affected
* **Severity Level**: Severity of the alert
* **Status**: Current status of the alert
* **Headline**: Brief description of the alert

### Weather Forecast
Returns detailed forecast periods with:
* **Period Name**: Time period (e.g., "Tonight", "Tomorrow")
* **Temperature**: Temperature with unit (Fahrenheit)
* **Wind Information**: Wind speed and direction
* **Conditions**: Short forecast description

### Sunrise/Sunset
Returns formatted times in local timezone:
* **Sunrise Time**: Local sunrise time
* **Sunset Time**: Local sunset time

## Supported Locations

### Weather Data (NWS API)
* **Coverage**: United States only
* **Territories**: Includes US territories and possessions
* **Resolution**: High-resolution grid-based forecasts

### Solar Data (Sunrise-Sunset API)  
* **Coverage**: Worldwide
* **Accuracy**: Astronomical calculations for any location
* **Date Range**: Historical and future dates supported

## Error Handling

The server handles various error conditions gracefully:

* **Invalid coordinates**: Provides guidance on valid coordinate ranges
* **Unsupported locations**: Clear messaging for locations outside NWS coverage
* **API unavailability**: Informative error messages for service outages
* **Invalid state codes**: Validation for proper two-letter state code format
* **Network connectivity**: Timeout and connection error handling

## Rate Limits and Usage

The server respects API rate limits and includes:

* **User-Agent identification**: Proper identification to weather services
* **Appropriate headers**: Correct content-type requests for optimal API responses
* **Error retry logic**: Built-in handling for temporary service issues

## Use Cases

This weather server is ideal for:

* **Travel planning**: Get weather conditions for destinations
* **Outdoor activities**: Check alerts and forecasts for safety
* **Agricultural applications**: Monitor weather patterns for farming
* **Emergency preparedness**: Stay informed about severe weather alerts
* **Solar energy planning**: Calculate solar window times for installations
